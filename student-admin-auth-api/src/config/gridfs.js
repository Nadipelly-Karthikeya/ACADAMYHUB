const mongoose = require("mongoose");
const multer = require("multer");
const { env } = require("./env");

let gfsBucket;

// Initialize GridFSBucket once Mongo is connected
mongoose.connection.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("GridFS Bucket ready");
});

// Use Multer memoryStorage
const storage = multer.memoryStorage();

const uploadPdf = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"), false);
    }
    cb(null, true);
  },
});

// Upload function (manual GridFS upload)
async function savePdfToGridFS(req, res, next) {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Ensure GridFSBucket is initialized
  if (!gfsBucket) {
    console.error("GridFS Upload Error: gfsBucket is not initialized");
    return res.status(503).json({ message: "File storage not ready. Please try again later." });
  }

  const { originalname, mimetype, buffer } = req.file;

  const uploadStream = gfsBucket.openUploadStream(originalname, {
    contentType: mimetype,
    metadata: {
      uploadedBy: req.user ? req.user._id : null,
      courseId: req.params.courseId || null,
      fieldName: req.file.fieldname,
    },
  });

  const fileId = uploadStream.id;

  uploadStream.on("finish", () => {
    if (fileId) {
      req.fileId = fileId; // store file id for route handler
      return next();
    }

    console.error("GridFS Upload Finish Error: fileId is undefined.", { fileId });
    return res.status(500).json({ message: "File upload finished but fileId is missing." });
  });

  uploadStream.on("error", err => {
    console.error("GridFS Upload Error:", err);
    return res.status(500).json({ message: "File upload failed" });
  });

  uploadStream.end(buffer);
}

function getUploadsBucket() {
  return gfsBucket;
}

module.exports = { uploadPdf, savePdfToGridFS, getUploadsBucket };
