from ultralytics import YOLO
import cv2
import time

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(0)

cv2.namedWindow("YOLO Real-Time Detection", cv2.WINDOW_NORMAL)
cv2.setWindowProperty("YOLO Real-Time Detection",
                      cv2.WND_PROP_FULLSCREEN,
                      cv2.WINDOW_FULLSCREEN)

# ---------- helper methods ----------
def calc_fps(prev_time):
    now = time.time()
    fps = 1 / (now - prev_time) if prev_time != 0 else 0
    return fps, now

def calc_latency(start_time):
    return (time.time() - start_time) * 1000   # ms
# ------------------------------------

prev_time = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # start time for latency
    t0 = time.time()

    results = model(frame, conf=0.5)
    annotated = results[0].plot()

    # calculate metrics
    fps, prev_time = calc_fps(prev_time)
    latency_ms = calc_latency(t0)

    # show on screen
    cv2.putText(annotated, f"FPS: {fps:.1f}",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 255, 0), 2)

    cv2.putText(annotated, f"Latency: {latency_ms:.1f} ms",
                (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 255, 255), 2)

    cv2.imshow("YOLO Real-Time Detection", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()