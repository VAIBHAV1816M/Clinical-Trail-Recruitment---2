import json
from groq import Groq
from pydantic import ValidationError
from typing import List
from backend.config import settings
from backend.schemas.criterion_schema import CriterionCreate

def generate_extraction_prompt(text: str, retry_error: str = None) -> str:
    base_prompt = f"""
    You are a clinical trial extraction engine. Extract the eligibility criteria from the following text and output ONLY a raw JSON array.
    
    The JSON array must exactly match this specification:
    - field: string
    - data_type: "NUMERIC", "CATEGORICAL", or "BOOLEAN"
    - classification: "HARD" (strict requirement) or "SOFT" (preferential scoring)
    - operator: string (e.g., ">=", "INCLUDES", "BETWEEN", "==")
    
    RULES:
    1. If HARD + NUMERIC -> you MUST provide 'numeric_min' and 'numeric_max'.
    2. If SOFT + NUMERIC -> you MUST provide 'numeric_ideal' and 'numeric_tolerance'.
    3. If CATEGORICAL -> you MUST provide 'categorical_ideal'.
    4. If BOOLEAN -> you MUST provide 'boolean_ideal'.
    
    TEXT:
    {text}
    """
    
    if retry_error:
        base_prompt += f"\n\nYOUR LAST ATTEMPT FAILED WITH THIS ERROR: {retry_error}\nFix the JSON schema mismatch and try again."
        
    return base_prompt

def extract_criteria(text: str, retry_error: str = None) -> List[CriterionCreate]:
    client = Groq(api_key=settings.LLM_API_KEY)
    
    # Groq uses the standard OpenAI chat.completions format
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,  # Make sure config.py defaults to 'llama3-70b-8192'
        temperature=0.0,
        messages=[{"role": "user", "content": generate_extraction_prompt(text, retry_error)}]
    )
    
    raw_json_str = response.choices[0].message.content
    
    try:
        data = json.loads(raw_json_str)
        
        # Gracefully unwrap object if LLM provided {"criteria": [...]}
        if isinstance(data, dict) and "criteria" in data:
            data = data["criteria"]
            
        if not isinstance(data, list):
            raise TypeError("Expected a JSON array of criteria.")
            
        return [CriterionCreate(**item) for item in data]
        
    except (json.JSONDecodeError, ValidationError, TypeError) as e:
        # If it failed and we haven't retried yet, feed the error back to the LLM
        if not retry_error:
            return extract_criteria(text, retry_error=str(e))
            
        # If it fails twice, bubble the error up to the UI
        raise ValueError(f"LLM failed to produce valid criteria schema: {str(e)}")