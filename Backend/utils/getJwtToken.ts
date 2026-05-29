import jwt from "jsonwebtoken";
import { Response } from "express";
import { Types } from "mongoose";

export const getJwtToken = (res: Response, userId:Types.ObjectId) => {
  const token = jwt.sign({ userId}, process.env.JWT_SECRET_KEY!, {
    expiresIn: "7d",
  });
  res.cookie("token",token, {
    secure:false,
    httpOnly: true,
    sameSite: "strict",
    maxAge:7* 24 * 60 * 60 * 1000,
  });
  return token
};
