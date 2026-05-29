import {v2 as cloudinary} from 'cloudinary'
import getDataUri from './dataUri'
import dotenv from 'dotenv'

dotenv.config({})

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET 
})

export default cloudinary

export function deleteItemFromCloudinary(itemUrl:string){
    const publicId = itemUrl.slice(itemUrl.lastIndexOf('/')+1,itemUrl.length-4)
    if(publicId){
        cloudinary.uploader.destroy(publicId)
    }
}


export const uploadImageOnCloundinary = async(file:Express.Multer.File)=>{
    try {
        const dataUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(dataUri as string);

        return cloudResponse.secure_url
    } catch (err) {
        throw new Error('Error occured while uploading file on cloudinary')
    }
}