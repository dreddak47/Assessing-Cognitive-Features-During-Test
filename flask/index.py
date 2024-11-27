from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import base64

from run import get_predictions

app = Flask(__name__)
CORS(app)  # Allow Cross-Origin requests
ind=0

def process_image(image):
    # Replace with your actual image processing function
    processed_image =np.expand_dims(cv2.resize(image, dsize=(224,224)),axis=0) # Dummy resize
    return processed_image

@app.route('/process', methods=['POST'])
def process_frame():
    
    try:
        # ind+=1
        # print("Request data:", request.data)
        # print("Request json:", request.json)
        # data = request.json.get('frame')
        # if not data:
        #     return "No frame received", 400

        # # Decode the Base64 image
        # print(data)
        # header, encoded = data.split(",", 1)  # Remove the "data:image/jpeg;base64," prefix
        # decoded = base64.b64decode(encoded)

        # # Convert bytes to NumPy array
        # np_data = np.frombuffer(decoded, np.uint8)

        # # # Convert to OpenCV image
        # image = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        # #image= cv2.imread('image.png')
        # #image = Image.open(image_file).convert('RGB')
        # #image_np = np.array(image)
        # cv2.imwrite(f'k{ind}.png',image)
        # # Process the image
        # result = process_image(image)
        # pr=get_predictions(result)
        # pr=0
        # print(result.shape)
        # Example of returning a simple response'
        # image=cv2.imread('k0.png')
        # result = process_image(image)
        # image= cv2.imread('image.png')
        pr=get_predictions(0)
        return jsonify({"message": "Processed successfully!", "ans":pr})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/process1', methods=['POST'])
def process_framep():
    try:
        image= cv2.imread('image.png')
        #image = Image.open(image_file).convert('RGB')
        #image_np = np.array(image)

        # Process the image
        result = process_image(image)
        pr=get_predictions(result)
        print(pr)
        # Example of returning a simple response
        return jsonify({"message": "Processed successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run()