// user.controller.js
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/async-Handler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {

    // To check the request body
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    
    // To check if all the fields are filled
    const { fullname, username, email, password } = req.body;

    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
     
    // To check if the username or email already exists
    const checkUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    });
    if (checkUser) {
        throw new ApiError(400, "Username or email already exists");
    }
     

    // To get the localFilePath the avater and cover image 
    const avatarPath = req.files?.avatar?.[0]?.path;
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImagePath = req.files.coverImage[0].path        
    }

    console.log('Avatar Path:', avatarPath);
    console.log('Cover Image Path:', coverImagePath);
    if (!avatarPath) {
        throw new ApiError(400, 'Avatar is required for your profile');
    }
    
    if (!coverImagePath) {
        console.warn('Cover image not provided');
    }
    
    // To upload the path of avater and coverImage on cloudinary
    const avatar = await uploadOnCloudinary(avatarPath);
    const coverImage = await uploadOnCloudinary(coverImagePath) 

    console.log('Avatar URL:', avatar.url);
    console.log('Cover Image URL:', coverImage?.url);

    if (!avatar) {
        throw new ApiError(400, 'Avatar is required for your profile');
    }

    const userData = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avater.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(userData._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering the user');
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, 'User created successfully')
    );
});

export { registerUser };
