// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const { spawn } = require("child_process");
// const fs = require("fs");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve files from backend2/uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, path.join(__dirname, "uploads"));
//     },
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       cb(null, `${Date.now()}${ext}`);
//     }
//   })
// });

// // ---------- IMAGE DETECTION ----------
// app.post("/detect", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res
//       .status(400)
//       .json({ success: false, message: "No image uploaded" });
//   }

//   const imagePath = req.file.path;

//   const py = spawn("python", [
//     path.join(__dirname, "python", "detect_image.py"),
//     imagePath
//   ]);

//   let data = "";
//   let errorData = "";

//   py.stdout.on("data", chunk => (data += chunk.toString()));
//   py.stderr.on("data", chunk => (errorData += chunk.toString()));

//   py.on("close", code => {
//     if (code !== 0) {
//       console.error("PYTHON ERROR:", errorData);
//       return res.status(500).json({ success: false, error: errorData });
//     }

//     try {
//       const parsed = JSON.parse(data.trim());
//       return res.json({
//         success: true,
//         image: `/uploads/${parsed.output_image}`,
//         total: parsed.total,
//         classes: parsed.classes
//       });
//     } catch (e) {
//       console.error("JSON PARSE ERROR:", e, "DATA:", data);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to parse Python output" });
//     }
//   });
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log("Server running on port", PORT));

// //--camera detection --//
// app.get("/camera", (req, res) => {
//   const py = spawn("python", [
//   path.join(__dirname, "python", "detect_camera.py")
// ]);

//   let errorData = "";
//   py.stderr.on("data", chunk => (errorData += chunk.toString()));

//   py.on("close", code => {
//     if (code !== 0) {
//       console.error("PYTHON CAMERA ERROR:", errorData);
//     }
//   });

//   res.json({ success: true, message: "Camera started" });
// });

// // const PORT = 5000;
// app.listen(PORT, () => console.log("Server running on port", PORT));

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
});

// ---------- IMAGE DETECTION ----------
app.post("/detect", upload.single("image"), (req, res) => {
  const imagePath = req.file.path;

  const py = spawn("python", [
    path.join(__dirname, "python", "detect_image.py"),
    imagePath
  ]);

  let data = "";
  let errorData = "";

  py.stdout.on("data", d => data += d.toString());
  py.stderr.on("data", d => errorData += d.toString());

  py.on("close", () => {
    if (errorData) {
      console.error(errorData);
      return res.json({ success: false });
    }

    try {
      const result = JSON.parse(data);
      res.json({
        success: true,
        image: `/uploads/${result.output_image}`,
        total: result.total,
        classes: result.classes
      });
    } catch {
      res.json({ success: false });
    }
  });
});

// ---------- CAMERA ----------
app.get("/camera", (req, res) => {
  spawn("python", [
    path.join(__dirname, "python", "detect_camera.py")
  ]);
  res.json({ success: true });
});

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);