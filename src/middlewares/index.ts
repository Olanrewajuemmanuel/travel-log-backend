import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

interface CustomRequest extends Request {
    token: string | JwtPayload
}

function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
     
        if (!token) {
          throw new Error("Authorization not provided");
        }
     
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as CustomRequest).token = decoded;
       
     
        next();
      } catch (err) {
        res.status(401).send(err);
      }
  
}

export default verifyToken;
