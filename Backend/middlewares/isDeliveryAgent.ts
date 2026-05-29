
import { NextFunction } from "express";
import { Request,Response } from "express";
import { User } from "../models/user.model";

export const isDeliveryAgent = async(req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.id)
    if(!user){
        res.status(400).json({ success:false, message: `User not found` });
        return
    }
    
    if (user?.role !== "Delivery_Agent") {
        res.status(400).json({ success:false, message: `${user?.role} not allowed to perform this action` });
        return
    }
    next();
};
