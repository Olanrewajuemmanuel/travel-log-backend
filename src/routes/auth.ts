import { Router } from "express";
import { body, validationResult, check } from "express-validator";
import UserSchema from "../schemas/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../config/type";

const userRouter = Router();
interface Register {
  username: string | undefined;
  password1: string | undefined;
  passwordVerify: string | undefined;
  phone: string | undefined;
  lastName: string | undefined;
  firstName: string | undefined;
  profile_pic: string | undefined;
  email: string | undefined;
}

userRouter.post(
  "/register",
  check("username").trim(),
  check("password1").isLength({ min: 8 }),
  check("passwordVerify").isLength({ min: 8 }),
  check("phone").isLength({ min: 9 }),
  check("lastName").trim().escape(),
  check("firstName").trim().escape(),
  check("email").trim().isEmail().normalizeEmail(),
  async (req, res) => {
    const { username, password1, passwordVerify, email }: Register = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    // no validation errors
    // check if user already exists in DB
    const user = await UserSchema.findOne({ username, email });

    if (user) return res.status(400).send("user already exists!");
    // if not, compare passwords and encrypt password
    if (!(password1 === passwordVerify))
      return res.status(400).send("Passwords do not match");
    const hashPassword = await bcrypt.hash(password1 as string, 10);
    // save info
    const newUser = new UserSchema(
      Object.assign(req.body, { password: hashPassword })
    );
    await newUser.save();

    // create token for user
    const token = jwt.sign(
      { user: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    const refreshtoken = jwt.sign(
      { user: newUser.id },
      process.env.JWT_REFRESH_TOKEN as string,
      { expiresIn: "3 days" }
    );

    // Registration success
    return res.status(201).json({
      token,
      refreshtoken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  }
);

userRouter.post(
  "/login",
  check("userOrEmail").trim(),
  check("password").isLength({ min: 8 }),
  async (req, res) => {
    const { userOrEmail, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });

    // check if user exists
    // check for phone or username
    const user = await UserSchema.findOne({
      $or: [{ username: userOrEmail }, { email: userOrEmail }],
    });
    if (!user) return res.status(404).send("User does not exist");
    // check and compare pass
    bcrypt.compare(password, user.password, (err, success) => {
      if (err) return res.status(400).send("Username or password is incorrect");
      //  send jwt token
      const token = jwt.sign(
        { user: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      const refreshtoken = jwt.sign(
        { user: user.id },
        process.env.JWT_REFRESH_TOKEN as string,
        { expiresIn: "3 days" }
      );

      // Login success
      return res.status(200).json({
        token,
        refreshtoken,
        user: {
          id: user.id,
          username: user.username,
          profile_pic: user.profile_pic,
          email: user.email,
        },
      });
    });
  }
);

userRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  // verify access token
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN as string);
    // pass
    if (decoded) {
      const newToken = jwt.sign({ user: (req as any).token.user }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
      return res.json({
        token: newToken
      })
    }
  } catch (e) {
    return res.status(400).send(e);
  }
});

export default userRouter;
