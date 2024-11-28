from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import base64

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
        
        # print("Request data:", request.data)
        # print("Request json:", request.json)
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
        cv2.imwrite(f'{str(id)}/{str(num)}.png',image)
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
    


if __name__ == "__main__":
    app.run()