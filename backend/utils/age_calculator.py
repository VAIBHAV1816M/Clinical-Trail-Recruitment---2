from datetime import date

def calculate_age(dob: date) -> int:
    """
    Calculates current age based on DOB, correctly accounting for 
    whether the birthday has happened yet this year.
    """
    today = date.today()
    
    # Evaluates to 1 if the birthday is later this year, else 0
    birthday_not_yet_passed = ((today.month, today.day) < (dob.month, dob.day))
    
    return today.year - dob.year - birthday_not_yet_passed