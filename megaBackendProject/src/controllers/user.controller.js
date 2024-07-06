// user.controller.js
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/async-Handler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';



const generateRefreshandAccessToken = async (userId) => {
    try {
      const findUser = await User.findById(userId);
  
      const refreshToken = findUser.generateRefreshToken();
      const accessToken = findUser.generateAccessToken();

      findUser.refreshToken = refreshToken;
      await findUser.save({ validateBeforeSave: false });
  
      return { refreshToken, accessToken };
    } catch (error) {
      throw new ApiError(500, `Something went wrong while generating the refresh and access token: ${error}`);
    }
  };
  

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
        avatar: avatar.url,
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


const loginUser = asyncHandler(async (req, res) => {
    // Extract data from the request body
    let { email, username, password } = req.body;
  
    // Check the username and password
    if (!(username || email)) {
      throw new ApiError(400, "You have to give one of the following: email or username");
    }
  
    // Find the login email or username in db
    let user = await User.findOne({
      $or: [{ email }, { username }]
    });
  
    if (!user) {
      throw new ApiError(400, "User does not exist");
    }
  
    // Check if the password is correct
    let isPasswordValid = await user.isPasswordCorrect(password);
  
    if (!isPasswordValid) {
      throw new ApiError(401, "Password is not correct");
    }
  
    // Generate refresh and access tokens
    let { refreshToken, accessToken } = await generateRefreshandAccessToken(user._id);
  
    // Find the user by id and exclude unwanted fields
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
    // Secure the cookies so that no one can modify them
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };
  
    // Set the cookies
    res.status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(200, {
          user: loggedInUser,
          accessToken,
          refreshToken
        }, "User logged in successfully")
      );
  
    // Log the cookies for debugging
    console.log('Access Token Set:', accessToken);
    console.log('Refresh Token Set:', refreshToken);
  });
  

const logoutUser = asyncHandler( async (req, res) =>{
  await User.findOneAndUpdate(

    // To find the user by id and update the refresh token
    req.user._id,
    {
        $set: {refreshToken: undefined}
    },
    {new: true}
  )

  // To delete the cookie
  const options = {
    httpOnly: true,
    secure: true
 };

 res.status(200)
 .cookie("refreshToken", options)
 .cookie("accessToken", options)
 .json(
    new ApiResponse(200, {},
        "User logged out done"
    )
 )
 return res

})

// To referesh the access token after expiry of access token 
const refreshAccessToken = asyncHandler(async (req,res)=>{
try {
  
    // To get the refresh token
   const getToken = req.cookies.refreshToken || req.body.refreshToken || req.headers.authorization;
   
   // To check if refresh token is there
   if(!getToken){
    throw new ApiError(401,"Unauthorized request");
   }
  
   // To verify the refresh token
   const decodedToken = jwt.verify(getToken, process.env.REFRESH_TOKEN_SECRET);
  
   // To check the decoded token
   if(!decodedToken){
    throw new ApiError(401,"Unauthorized request");
   }
  
   // To find the user by id
   const user = await User.findById(user._id).select("-password ");
  
  
   if(!user){
    throw new ApiError(401,"Invalid Access Token: User not found")
   };
  
   // To check if the refresh token is same
   if(user.refreshToken !== refreshToken){
    throw new ApiError(401, 'RefreshToken has expired or invalid')
   };
    let {refreshToken, accessToken} = await generateRefreshandAccessToken(user);
  
     // Secure the cookies so that no one can modify them
     const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };
   
       // Set the cookies
       res.status(200)
       .cookie("refreshToken", refreshToken, options)
       .cookie("accessToken", accessToken, options)
       .json(
         new ApiResponse(200, {
           accessToken,
           refreshToken
         }, "Access Token refeshed8 successfully")
       );
} catch (error) {
  throw new ApiError(500, `Something went wrong while refreshing the access token: ${error}`);
}

 })

export { 
registerUser,
 loginUser ,
 logoutUser ,
 refreshAccessToken};