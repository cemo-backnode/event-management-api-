import multer from "multer";
import path from "path";

// Configuration de multer pour stocker les fichiers dans des dossiers spécifiques
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";
    if (req.uploadType === "profilePicture") {
      uploadPath += "profile-pictures/";
    } else if (req.uploadType === "eventVisual") {
      uploadPath += "event-visuals/";
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export default upload;
