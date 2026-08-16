import pandas as pd
from io import StringIO, BytesIO
from sqlalchemy.orm import Session
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from backend.services.dashboard_service import get_dashboard_stats, get_latest_screenings_per_patient


def export_candidates_csv(db: Session, trial_id: str) -> str:
    # BUG FIX: was querying ScreeningResult directly, which returns every
    # historical screening row (append-only table) - a patient screened 3
    # times would appear 3 times in the export. Reuse the same dedup used by
    # the dashboard so the CSV reflects current status per patient, not history.
    screenings = get_latest_screenings_per_patient(db, trial_id)

    data = []
    for s in screenings:
        data.append({
            "Patient ID": s.patient_id,
            "Match Percentage": s.match_percentage,
            "Verdict": s.verdict,
            "Eligible": s.eligible,
            "Screened At": s.screened_at.strftime("%Y-%m-%d %H:%M") if s.screened_at else "N/A"
        })

    df = pd.DataFrame(data)
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)
    return csv_buffer.getvalue()


def export_dashboard_pdf(db: Session, trial_id: str) -> bytes:
    stats = get_dashboard_stats(db, trial_id)

    pdf_buffer = BytesIO()
    # BUG FIX: ReportLab's default Canvas() page size is Letter (612x792pt),
    # origin at bottom-left. The title was drawn at y=800 - 8 points ABOVE
    # the top edge of a 792pt-tall page - so it was silently clipped and
    # never actually visible in the exported PDF. Explicit pagesize=letter
    # here for clarity, and every y-coordinate shifted to fit within it.
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    page_width, page_height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, page_height - 50, f"Trial Recruitment Report: {trial_id}")  # y = 742

    c.setFont("Helvetica", 12)
    c.drawString(50, page_height - 80, f"Target Recruitment: {stats['target']}")
    c.drawString(50, page_height - 100, f"Currently Enrolled: {stats['enrolled']} ({stats['progress']}%)")
    c.drawString(50, page_height - 120, f"Total Screened: {stats['screened']}")

    c.drawString(50, page_height - 150, f"Approved: {stats['approved']}")
    c.drawString(50, page_height - 170, f"Needs Review: {stats['needs_review']}")
    c.drawString(50, page_height - 190, f"Rejected: {stats['rejected']}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, page_height - 220, "Top Exclusion Reasons:")
    c.setFont("Helvetica", 12)

    y = page_height - 240
    for reason in stats['top_exclusion_reasons']:
        c.drawString(70, y, f"- {reason['reason']}: {reason['count']} occurrences")
        y -= 20

    c.save()
    return pdf_buffer.getvalue()