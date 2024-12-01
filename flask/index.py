from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
from datetime import datetime
import csv
from pyngrok import ngrok, conf


# session name=my_flask_app
#detach = ctrl+B, then D
#tmux attach -t my_flask_app

from dotenv import load_dotenv

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow Cross-Origin requests

conf.get_default().auth_token = os.getenv("NGROK_AUTH_TOKEN")
def process_image(image):
    # Replace with your actual image processing function
    processed_image =np.expand_dims(cv2.resize(image, dsize=(224,224)),axis=0) # Dummy resize
    return processed_image

@app.route('/process', methods=['POST'])
def process_frame():
    try:
        
        # print("Request data:", request.data)
        # print("Request json:", request.json)
        print("Request files:", request.json)
        data = request.json.get('frame')
        num=request.json.get('num')
        id=request.json.get('id')
        if not data:
            return "No frame received", 400

        # # Decode the Base64 image
        # print(data)
        header, encoded = data.split(",", 1)  # Remove the "data:image/jpeg;base64," prefix
        decoded = base64.b64decode(encoded)

        # # Convert bytes to NumPy array
        np_data = np.frombuffer(decoded, np.uint8)

        # # # Convert to OpenCV image
        image = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        # #image= cv2.imread('image.png')
        # #image = Image.open(image_file).convert('RGB')
        # #image_np = np.array(image)
        os.makedirs(str(id), exist_ok=True)
        cv2.imwrite(f'{id}/{num}.png',image)
        # # Process the image
        # result = process_image(image)
        # pr=get_predictions(result)
        # pr=0
        # print(result.shape)
        # Example of returning a simple response'
        # image=cv2.imread('k0.png')
        # result = process_image(image)
        # image= cv2.imread('image.png')
        
        return jsonify({"message": "Processed successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Directory to store log files
LOG_DIR = "logs"

# Ensure the log directory exists
os.makedirs(LOG_DIR, exist_ok=True)

@app.route('/log', methods=['POST'])
def store_log():
    try:
        # Retrieve the logs from the request
        logs = request.get_json()
        
        if not logs:
            return jsonify({"error": "No logs received"}), 400
        service=request.json.get('service')
        logdata=request.json.get('data') 
        for log in logdata:
            data = log['data']  # Assuming `frame` is already base64 encoded
            log_id = log['id']
            timestamp = log['timestamp']

            # File path for the specific ID
            log_file_path = os.path.join(LOG_DIR, f"{log_id}_logs.csv")

            # Check if the file already exists
            file_exists = os.path.isfile(log_file_path)

            # Write log entries to the CSV file
            with open(log_file_path, 'a', newline='') as csvfile:
                fieldnames = ['timestamp', 'id', 'data','service']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                # Write header only if the file is new
                if not file_exists:
                    writer.writeheader()

                # Write the log entry
                writer.writerow({
                    'timestamp': timestamp,
                    'id': log_id,
                    'data': data,
                    'service':service   
                })
        

        return jsonify({"message": "Logs received and stored successfully"}), 200

    except Exception as e:
        print(f"Error processing logs: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/status', methods=['GET'])
def status():
    return {"status": "Server is running"}, 200

if __name__ == "__main__":
    public_url = ngrok.connect(8000, hostname=os.getenv("NGROK_STATIC_DOMAIN"))
    print(f"Ngrok public URL: {public_url}")
    app.run(port=8000)