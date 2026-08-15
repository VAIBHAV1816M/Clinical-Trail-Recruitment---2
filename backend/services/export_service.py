import pandas as pd
from io import StringIO, BytesIO
from sqlalchemy.orm import Session
from reportlab.pdfgen import canvas
from backend.services.dashboard_service import get_dashboard_stats
from backend.models.screening import ScreeningResult

def export_candidates_csv(db: Session, trial_id: str) -> str:
    screenings = db.query(ScreeningResult).filter_by(trial_id=trial_id).all()
    
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
    c = canvas.Canvas(pdf_buffer)
    c.setFont("Helvetica-Bold", 16)
    
    c.drawString(50, 800, f"Trial Recruitment Report: {trial_id}")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 770, f"Target Recruitment: {stats['target']}")
    c.drawString(50, 750, f"Currently Enrolled: {stats['enrolled']} ({stats['progress']}%)")
    c.drawString(50, 730, f"Total Screened: {stats['screened']}")
    
    c.drawString(50, 700, f"Approved: {stats['approved']}")
    c.drawString(50, 680, f"Needs Review: {stats['needs_review']}")
    c.drawString(50, 660, f"Rejected: {stats['rejected']}")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 630, "Top Exclusion Reasons:")
    c.setFont("Helvetica", 12)
    
    y = 610
    for reason in stats['top_exclusion_reasons']:
        c.drawString(70, y, f"- {reason['reason']}: {reason['count']} occurrences")
        y -= 20
        
    c.save()
    return pdf_buffer.getvalue()