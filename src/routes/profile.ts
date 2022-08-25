import { Router } from "express"
import { Document } from "mongoose"
import UserSchema from "../schemas/User"

const profileRouter = Router()

profileRouter.get("/:username", async (req, res) => {
    const doc = await UserSchema.findOne({ username: req.params.username })
    if (!doc) return res.status(404).send("Not Found")
    return res.send(doc)
})

export default profileRouter