import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from etl_processor import process_csv_file

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from React

# Ensure an upload folder exists
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/etl/process', methods=['POST'])
def process_etl():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.csv'):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Parse rules from form data
        import json
        rules = {}
        if 'rules' in request.form:
            try:
                rules = json.loads(request.form['rules'])
            except:
                pass
        
        try:
            # Note: Update credentials based on your local MySQL setup
            db_uri = 'mysql+pymysql://root:password@localhost/cleanetl'
            
            result = process_csv_file(filepath, db_uri, rules)
            
            return jsonify(result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file format. Please upload a CSV.'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
