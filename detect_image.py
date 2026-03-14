from ultralytics import YOLO
import sys
import os
import json
import cv2
image_path = sys.argv[1]
if not os.path.exists(image_path):
    print(json.dumps({"error": "File not found"}))
    sys.exit(1)
model = YOLO("yolov8n.pt")
# results = model(image_path,verbose=False)
results = model(image_path,verbose=False)
boxes = results[0].boxes
total_objects = len(boxes)

# output in same uploads folder
output_path = os.path.join(
    os.path.dirname(image_path),
    f"output_{os.path.basename(image_path)}"
)

img = results[0].plot()
cv2.imwrite(output_path, img)

response = {
    "total": total_objects,
    "output_image": os.path.basename(output_path),
    "classes": {}
}
for box in boxes:
    cls = int(box.cls[0])
    label = results[0].names[cls]
    response["classes"][label] = response["classes"].get(label, 0) + 1

print(json.dumps(response))