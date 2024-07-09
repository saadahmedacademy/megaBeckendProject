import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        // Step 1: Split the URL by '/' and get the last segment
        const lastSegment = imageUrl.split('/').pop();
        
        // Step 2: Split the last segment by '.' to get the publicId
        const [publicId] = lastSegment.split('.');

        // Step 3: Use the publicId to delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            throw new Error(`Failed to delete image: ${result.result}`);
        }

        console.log(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};

export default deleteImageFromCloudinary;
