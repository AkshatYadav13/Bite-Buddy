import { NextFunction, Request,Response } from "express"
import jwt from 'jsonwebtoken';

declare global{
    namespace Express{
        interface Request{
            id:string
            file?:Express.Multer.File
        }
    }
}

export const isAuthenticated = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {token} = req.cookies

        if(!token){
            res.status(400).json({
                message:'User not authenticated',
                success:false
            })   
            return
        }

        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY!) as jwt.JwtPayload

        if(!decode){
            res.status(400).json({
                message:'User not authenticated',
                success:false
            })   
            return
        }

        req.id = decode.userId
        next()
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Interal server error',
            success:false
        })   
    }
}