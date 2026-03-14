from ultralytics import YOLO
import cv2

# Load YOLOv10 model
model = YOLO("yolov8n.pt")

# Path to image
image_path = "img.jpg"

# Run prediction
results = model.predict(image_path, show=True)

# Get class names
class_names = model.model.names

# Count detected objects
counts = {}

# Access first (and only) result
res = results[0]

for c in res.boxes.cls.cpu().numpy().astype(int):
    label = class_names[c]
    counts[label] = counts.get(label, 0) + 1

# Print count of each object
print("\nObject Counts:")
for obj, count in counts.items():
    print(f"{obj}: {count}")

# Optionally display the image with detections
annotated_image = res.plot()
cv2.imshow("Detected Objects", annotated_image)
cv2.waitKey(0)
cv2.destroyAllWindows()