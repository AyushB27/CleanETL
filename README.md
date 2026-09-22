# CleanETL — Online Data Cleaning & Transformation Tool

CleanETL is a web-based **ETL (Extract, Transform, Load) tool** that allows users to upload raw CSV datasets, detect common data inconsistencies, clean and transform the data, and store the processed records in a relational database.

The project demonstrates a practical implementation of **data cleaning, data transformation, and database integration** through an easy-to-use web interface.

---

## Features

* 📂 Upload CSV datasets
* 🔍 Extract and preview raw data
* 🧹 Detect and clean inconsistent data
* 🔄 Transform data into a standardized format
* 🗑️ Remove duplicate records
* ⚠️ Detect missing and invalid values
* ✉️ Validate email fields
* 🔢 Validate numerical fields
* 🏷️ Standardize categorical values
* 📊 Generate a data-cleaning report
* 🗄️ Store cleaned data in MySQL
* 👀 View the final cleaned dataset
* 📈 Run SQL queries on processed data

---

## ETL Pipeline

```text
              Raw CSV Dataset
                     │
                     ▼
              ┌─────────────┐
              │   Extract   │
              │  Read CSV   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │    Clean    │
              │ Remove      │
              │ duplicates  │
              │ Handle nulls│
              │ Validate    │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  Transform  │
              │ Standardize │
              │ values      │
              │ Generate    │
              │ derived data│
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │    Load     │
              │   MySQL     │
              └──────┬──────┘
                     │
                     ▼
             Cleaned Database
```

---

## Example Dataset

The project includes a synthetic student dataset containing intentional inconsistencies for demonstration.

### Raw Data

| Student ID | Name             | Email                                     |  Age | Department           | Marks | City   |
| ---------: | ---------------- | ----------------------------------------- | ---: | -------------------- | ----: | ------ |
|       1001 | `Ayush Bhardwaj` | `AYUSH@GMAIL.COM`                         |   20 | IT                   |    85 | Mumbai |
|       1002 | Rahul Sharma     | `rahul@gmail.com`                         |   21 | it                   |    78 | mumbai |
|       1003 | Priya Patil      | [priya@gmail.com](mailto:priya@gmail.com) | NULL | Computer Engineering |    92 | Pune   |
|       1004 | Amit Shah        | [amit@gmail.com](mailto:amit@gmail.com)   |   20 | IT                   |   105 | Mumbai |
|       1005 | Neha Joshi       | [neha@gmail.com](mailto:neha@gmail.com)   |   19 | computer engineering |    88 | Pune   |

The dataset intentionally contains:

* Missing values
* Duplicate records
* Extra spaces
* Inconsistent capitalization
* Invalid email addresses
* Invalid ages
* Marks greater than 100
* Non-numeric marks
* Inconsistent department names
* Inconsistent city names

---

## Cleaning Operations

### Duplicate Removal

Duplicate records are identified using the student information and removed from the cleaned dataset.

### Missing Value Handling

Missing values are detected and handled according to predefined cleaning rules.

### Text Standardization

Values such as:

```text
IT
it
```

are converted into a consistent representation.

Similarly:

```text
Mumbai
mumbai
MUMBAI
```

are standardized to:

```text
Mumbai
```

### Data Validation

The system checks:

* Age ranges
* Marks between 0 and 100
* Email format
* Required fields
* Valid data types

---

## Transformation

After cleaning, the system can generate additional information such as student grades.

|    Marks | Grade |
| -------: | ----- |
|   90–100 | A+    |
|    80–89 | A     |
|    70–79 | B     |
|    60–69 | C     |
|    50–59 | D     |
| Below 50 | F     |

The transformed records are then prepared for database insertion.

---

## Database

The project uses **MySQL** to store the processed data.

### Raw Table

```sql
CREATE TABLE raw_students (
    student_id INT,
    name VARCHAR(100),
    email VARCHAR(100),
    age INT,
    department VARCHAR(100),
    marks INT,
    city VARCHAR(50)
);
```

### Cleaned Table

```sql
CREATE TABLE cleaned_students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    age INT,
    department VARCHAR(100),
    marks INT,
    city VARCHAR(50),
    grade VARCHAR(10)
);
```
## Example SQL Queries

### View cleaned data

```sql
SELECT * FROM cleaned_students;
```

### Find students with marks above 80

```sql
SELECT name, marks, grade
FROM cleaned_students
WHERE marks > 80;
```

### Count students by department

```sql
SELECT department, COUNT(*) AS total_students
FROM cleaned_students
GROUP BY department;
```

### Calculate average marks

```sql
SELECT AVG(marks) AS average_marks
FROM cleaned_students;
```

---

## Demonstration Flow

```text
Upload CSV
    ↓
Preview Raw Dataset
    ↓
Extract Data
    ↓
Detect Inconsistencies
    ↓
Clean Data
    ↓
Transform Data
    ↓
Generate Cleaning Report
    ↓
Load into MySQL
    ↓
View Cleaned Database
```

---

## Future Improvements

* Excel and JSON file support
* Automatic data-type detection
* Interactive data-quality dashboard
* Custom user-defined cleaning rules
* Export cleaned datasets
* Data-quality scoring
* Advanced anomaly detection
* Multiple database support
* User authentication
* Machine-learning-based data cleaning

---

## Learning Outcomes

This project demonstrates practical understanding of:

* ETL pipelines
* Data preprocessing
* Data cleaning
* Data validation
* Data transformation
* Relational databases
* SQL queries
* Flask backend development
* Pandas data processing
* Database integration

---

## License

This project is created for educational and demonstration purposes.

