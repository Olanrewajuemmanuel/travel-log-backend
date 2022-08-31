import express, { Express, Request, Response, NextFunction } from "express";
import morgan, { StreamOptions } from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "mongoose";
import userRouter from "./routes/auth";
import feedRouter from "./routes/feed";
import profileRouter from "./routes/profile";
import multer from "multer";
import cookieParser from "cookie-parser"
import {expressjwt} from "express-jwt"

dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 4000;



async function initializeApp(app: Express) {
  // middlewares
  app.use(morgan("dev"));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(express.json());

  app.use(cors());
  app.use(helmet());
  app.use(cookieParser())
  app.use(expressjwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
    getToken: (req: any) => {
      return req.cookies.accessToken
    },
  }).unless({ path: ['/user/login', '/user/register'] })
  )
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.json({
          message: "file is too large, max_size: 2MB"
        })
      }
    }
    res.status(500);
    res.send(err.stack);
  });

  //routes
  app.use("/user", userRouter);
  app.use("/feed", feedRouter);
  app.use("/profile", profileRouter);

  // connect to mongoDB
  const connection = await connect(process.env.MONGO_URI as string);
  if (connection) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
}

initializeApp(app)
  .then(() => {
    console.log("--- Mongo DB is connected ---");

    app.listen(PORT, () =>
      console.log(`Server is now running on port ${PORT}`)
    );
  })
  .catch((err) => console.log(err));
