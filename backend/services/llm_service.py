import json
from typing import List, Optional

from groq import Groq, GroqError
from pydantic import ValidationError

from backend.config import settings
from backend.schemas.criterion_schema import CriterionCreate


def generate_extraction_prompt(
    text: str,
    retry_error: Optional[str] = None,
) -> str:
    base_prompt = f"""
You are a clinical trial extraction engine.

Extract the eligibility criteria from the following clinical trial text.

Return ONLY a valid JSON object in exactly this format:

{{
    "criteria": [
        {{
            "field": "string",
            "data_type": "NUMERIC | CATEGORICAL | BOOLEAN",
            "classification": "HARD | SOFT",
            "operator": "string"
        }}
    ]
}}

RULES:
1. If classification is HARD and data_type is NUMERIC:
   - numeric_min is required
   - numeric_max is required

2. If classification is SOFT and data_type is NUMERIC:
   - numeric_ideal is required
   - numeric_tolerance is required

3. If data_type is CATEGORICAL:
   - categorical_ideal is required

4. If data_type is BOOLEAN:
   - boolean_ideal is required

5. Do not return Markdown.
6. Do not wrap the JSON in ```json or ``` blocks.
7. Do not add explanations outside the JSON object.
8. The top-level JSON object must contain only the "criteria" key.

TEXT:
{text}
"""

    if retry_error:
        base_prompt += f"""

YOUR PREVIOUS ATTEMPT FAILED.

Validation error:
{retry_error}

Return corrected JSON that strictly follows the required schema.
"""

    return base_prompt


def clean_json_string(raw_str: str) -> str:
    """
    Remove accidental Markdown code fences from the LLM response.
    """
    raw_str = raw_str.strip()

    if raw_str.startswith("```json"):
        raw_str = raw_str[7:].strip()
    elif raw_str.startswith("```"):
        raw_str = raw_str[3:].strip()

    if raw_str.endswith("```"):
        raw_str = raw_str[:-3].strip()

    return raw_str


def extract_criteria(
    text: str,
    retry_error: Optional[str] = None,
) -> List[CriterionCreate]:

    client = Groq(api_key=settings.LLM_API_KEY)

    try:
        response = client.chat.completions.create(
            model=settings.LLM_MODEL,
            temperature=0.0,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": generate_extraction_prompt(
                        text,
                        retry_error,
                    ),
                }
            ],
        )

        raw_json_str = response.choices[0].message.content

        if not raw_json_str:
            raise ValueError("LLM returned an empty response.")

        cleaned_json_str = clean_json_string(raw_json_str)

        # Parse JSON
        data = json.loads(cleaned_json_str)

        # Expected format:
        # {
        #     "criteria": [...]
        # }
        if not isinstance(data, dict):
            raise TypeError(
                "Expected a JSON object containing a 'criteria' key."
            )

        if "criteria" not in data:
            raise TypeError(
                "JSON response does not contain the required 'criteria' key."
            )

        criteria_data = data["criteria"]

        if not isinstance(criteria_data, list):
            raise TypeError(
                "The 'criteria' field must contain a JSON array."
            )

        # Validate each criterion using Pydantic
        return [
            CriterionCreate(**item)
            for item in criteria_data
        ]

    except GroqError as e:
        raise ValueError(
            f"Groq API Error: {str(e)}"
        ) from e

    except (json.JSONDecodeError, ValidationError, TypeError, ValueError) as e:

        # Retry once with the validation/parsing error
        if not retry_error:
            return extract_criteria(
                text,
                retry_error=str(e),
            )

        raise ValueError(
            f"LLM failed to produce valid criteria schema: {str(e)}"
        ) from e