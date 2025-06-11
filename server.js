const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ILovePDF } = require("@ilovepdf/ilovepdf-nodejs");

const app = express();
const port = process.env.PORT || 3000;

const ilovepdf = new ILovePDF();
ilovepdf.publicKey = "project_public_30309b6f324ff5ac2a592fa610b80ff9__whO4c59e695d135fc9723c689545b20ff786";

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

app.post("/compress", upload.array("pdfs", 3), async (req, res) => {
  try {
    const files = req.files;
    const compressionLevel = req.body.compression || "recommended";
    const results = [];

    for (let file of files) {
      const task = ilovepdf.newTask("compress");
      await task.start();
      await task.addFile(file.path);
      task.setCompressionLevel(compressionLevel);
      await task.process();
      const outputPath = "downloads/" + Date.now() + "-" + file.originalname;
      await task.download(outputPath);
      results.push({ originalName: file.originalname, download: outputPath });
    }

    res.json({ success: true, files: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
