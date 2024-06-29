import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/async-Handler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
    console.log('Request Body:', req.body); // Log the entire body
    

    // extract the data from the frontend
    const {fullname, username, email, password } = req.body;
     console.log(fullname, username, email, password );
    // To check for the emty fields from body request 
    if(
        [fullname,username,email,password].some((field) =>
             field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required"  )
    }

    // To check the username or email exit already ?
    const checkUser = await User.findOne(
        $or[{ username }, { email }]
    );
    if(checkUser){
        throw new ApiError(400, "username or email already exist"  );
    }

    // To get the localpath and upload on cloud to avater and coverImage
    const avaterPath = req.files?.avater[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if(!avaterPath){
        throw new ApiError(400, 'Avater is required for your profile' );
    }
        const avater = await uploadOnCloudinary(avaterPath);
        const coverImage = await uploadOnCloudinary(coverImagePath);
        console.log(avater, coverImage);
    
    // To check again the avater
    if(!avater){
        throw new ApiError(400, 'Avater is required for your profile' );
    }
    
});

export { registerUser };
