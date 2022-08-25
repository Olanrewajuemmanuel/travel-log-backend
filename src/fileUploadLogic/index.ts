import multer from "multer";
import { v4 as uuid } from "uuid"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid()

      cb(null, file.fieldname + '-' + uniqueSuffix);
    },
  });
  const fileFilter = (req: any, file: any, cb: any) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true)
    } else {
      cb(new Error("File must be of type jpg, jpeg or png"), false)
    }
  };
  
export const upload = multer({ storage, fileFilter })