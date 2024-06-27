import {v2 as cloudinary} from 'cloudinary';
import fs from 'node:fs'

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

    const uploadOnCloudinary = async (localFilePath) =>{
        try{
            if(!localFilePath) return 'could not find filepath'
        //  upload the files on cloudinary
       const responseResult = await cloudinary.uploader.upload(localFilePath,{
          resource_type:'auto'
        });
        // file has been uploaded successfully
        console.log(`file has been uploaded on cloudinary 
                ${responseResult.url}`)
             return responseResult;
        }
        catch(err){
         fs.unlinkSync(localFilePath)
         /*To remove the locally saved temporary file
            if it's uploading got failed */
         console.error(`Clodinary uploading Error ${err}`)
            
        }
    }
 export {uploadOnCloudinary};