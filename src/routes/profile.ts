import { Router } from "express";
import { CustomRequest } from "../config/type";
import { upload } from "../fileUploadLogic";
import verifyToken from "../middlewares";
import UserSchema from "../schemas/User";

const profileRouter = Router();

profileRouter.get("/:username", async (req, res) => {
  const doc = await UserSchema.findOne({ username: req.params.username });
  if (!doc) return res.status(404).json({
    message: "Not found"
  });
  return res.send(doc);
});

profileRouter.post(
  "/upload_pic",
  verifyToken,
  upload.single("profile_pic"),
  (req, res) => {
    if (!req.file) return res.status(204).end();
    // save to DB
    // get current user doc
    const userId = (req as any).token.user;
    const profilePicInfo = {
      file: req.file.filename,
    };
    UserSchema.findByIdAndUpdate(
      userId,
      { profile_pic: profilePicInfo },
      (err, doc) => {
        if (err) return res.status(404).send(err);
        return res.json({ ok: true, image: doc?.profile_pic });
      }
    );
  }
);


export default profileRouter;
