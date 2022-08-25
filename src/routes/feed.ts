import { Request, Router } from "express";
import { check, validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import verifyToken from "../middlewares";
import FeedSchema from "../schemas/Feed";

const feedRouter = Router();

interface CustomRequest extends Request {
  token: JwtPayload;
}

// POST /feed/create --> newFeed
feedRouter.post(
  "/create",
  verifyToken,
  check("rating").toInt(),
  check("caption").escape().trim(),
  check("imgSet").isArray(),
  async (req, res) => {
    const { rating, caption, location, imgSet } = req.body;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() })
    
    // compile new feed
    const newFeed = Object.assign({}, req.body, { userId: (req as CustomRequest).token.user })
    // save doc
    const saved = await FeedSchema.create(newFeed)
    if (saved) return res.status(201).send(saved)


    

  }
);

// GET /feed --> AllFeeds
feedRouter.get("/", verifyToken, async (req, res) => {
  const allFeeds = await FeedSchema.find({});

  res.send(allFeeds);
});

// GET /feed/user --> UserFeedList
feedRouter.get("/:userId", verifyToken, async (req, res) => {
    const feed = await FeedSchema.find({ userId: req.params.userId })
    return res.send(feed)


})
export default feedRouter;
