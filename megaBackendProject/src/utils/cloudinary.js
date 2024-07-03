

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        throw new Error('Could not find filepath');
    }

    if (!fs.existsSync(localFilePath)) {
        throw new Error('File does not exist at provided path');
    }

    try {
        // Upload the files on Cloudinary
        const responseResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        // File has been uploaded successfully
        console.log(`File has been uploaded on Cloudinary: ${responseResult.url}`);
        fs.unlinkSync(localFilePath);
        return responseResult;
    } catch (err) {
        // remove the localfilePath if the cloudinary upload process failed
        fs.unlinkSync(localFilePath);
        console.error(`Cloudinary uploading Error: ${err}`);
        return null;
    }
};

export { uploadOnCloudinary };

