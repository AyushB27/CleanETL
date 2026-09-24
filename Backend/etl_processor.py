import pandas as pd
import numpy as np
import re
from sqlalchemy import create_engine

def get_grade(marks):
    if pd.isna(marks):
        return 'F'
    try:
        m = float(marks)
        if m >= 90: return 'A+'
        elif m >= 80: return 'A'
        elif m >= 70: return 'B'
        elif m >= 60: return 'C'
        elif m >= 50: return 'D'
        else: return 'F'
    except:
        return 'F'

def is_valid_email(email):
    if pd.isna(email):
        return False
    # basic regex for email validation
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, str(email)))

def process_csv_file(filepath, db_uri, rules):
    # 1. EXTRACT
    df = pd.read_csv(filepath)
    
    # Track stats for the report
    duplicates_removed = 0
    nulls_handled = 0
    invalid_data_corrected = 0

    # 2. CLEAN & TRANSFORM
    
    # Standardize column names (Always run to ensure code stability)
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    
    # Find ID column (e.g., student_id, employee_id, id)
    id_col = next((col for col in df.columns if col.endswith('_id') or col == 'id'), None)
    
    # Rule: Remove duplicates
    if rules.get('removeDuplicates', True):
        before_drop_dup = len(df)
        if id_col:
            df = df.drop_duplicates(subset=[id_col])
        else:
            df = df.drop_duplicates()
        duplicates_removed = before_drop_dup - len(df)
    
    # Rule: Handle Missing Values
    if rules.get('handleMissing', True):
        # Drop rows missing the primary ID
        before_drop_null = len(df)
        if id_col:
            df = df.dropna(subset=[id_col])
        nulls_handled += (before_drop_null - len(df))
        
        # Fill missing numeric values (e.g. age, marks, salary)
        if 'age' in df.columns:
            missing_age_mask = df['age'].isna()
            nulls_handled += missing_age_mask.sum()
            median_age = df['age'].median()
            df['age'] = df['age'].fillna(median_age if not pd.isna(median_age) else 20)
            
        if 'marks' in df.columns:
            missing_marks = df['marks'].isna()
            nulls_handled += missing_marks.sum()
            df['marks'] = df['marks'].fillna(0)
            
        if 'salary' in df.columns:
            missing_salary = df['salary'].isna()
            nulls_handled += missing_salary.sum()
            df['salary'] = df['salary'].fillna(0)
    
    # Rule: Standardize Text
    if rules.get('standardizeText', True):
        text_cols = [col for col in df.columns if 'name' in col or 'department' in col or 'city' in col or 'region' in col or 'status' in col]
        for col in text_cols:
            df[col] = df[col].astype(str).str.strip().str.title()
            
        if 'email' in df.columns:
            def clean_email(x):
                x = str(x)
                match = re.search(r'([\w\.-]+@[\w\.-]+\.\w+)', x)
                return match.group(1) if match else x
            df['email'] = df['email'].apply(clean_email).str.strip().str.lower()
            
            # Note: The email format validation is considered 'invalidData', not 'standardizeText', 
            # but we run it here if standardizing text, or better, move it to validation!

    # Rule: Validate Ranges & Formats
    if rules.get('validateRanges', True):
        # Validate Emails
        if 'email' in df.columns:
            valid_email_mask = df['email'].apply(is_valid_email)
            invalid_data_corrected += (~valid_email_mask).sum()
            df.loc[~valid_email_mask, 'email'] = 'invalid@example.com'

        if 'marks' in df.columns:
            df['marks'] = pd.to_numeric(df['marks'], errors='coerce')
            invalid_marks_mask = (df['marks'] > 100) | (df['marks'] < 0)
            invalid_data_corrected += invalid_marks_mask.sum()
            df.loc[df['marks'] > 100, 'marks'] = 100
            df.loc[df['marks'] < 0, 'marks'] = 0
            
        if 'salary' in df.columns:
            df['salary'] = pd.to_numeric(df['salary'], errors='coerce')
            invalid_salary_mask = (df['salary'] < 0)
            invalid_data_corrected += invalid_salary_mask.sum()
            df.loc[df['salary'] < 0, 'salary'] = 0
            
        if 'age' in df.columns:
            df['age'] = pd.to_numeric(df['age'], errors='coerce')
            invalid_age_mask = (df['age'] > 100) | (df['age'] < 10)
            invalid_data_corrected += invalid_age_mask.sum()
            # If invalid, cap or just leave as NaN. We'll set them to median if we want to fix, 
            # but handling nulls is done in handleMissing.
            df.loc[df['age'] > 100, 'age'] = 100
            df.loc[df['age'] < 10, 'age'] = 10

    # Always generate Grade if marks exist
    if 'marks' in df.columns:
        df['grade'] = pd.to_numeric(df['marks'], errors='coerce').apply(get_grade)

    # 3. LOAD
    try:
        engine = create_engine(db_uri)
        df.to_sql('cleaned_students', con=engine, index=False, if_exists='replace')
    except Exception as e:
        print(f"Database insertion error: {e}")

    # Prepare return data
    preview = df.head(10).replace({np.nan: None}).to_dict(orient='records')
    csv_string = df.to_csv(index=False)
    
    return {
        'report': {
            'totalRows': len(df),
            'duplicatesRemoved': int(duplicates_removed),
            'nullsHandled': int(nulls_handled),
            'invalidDataCorrected': int(invalid_data_corrected),
        },
        'preview': preview,
        'csvData': csv_string
    }
