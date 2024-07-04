// user.controller.js
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/async-Handler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';



const generateRefreshandAccessToken = async (userId) => {
    try{

        const findUser = await User.findById(userId)
        const refreshToken = findUser.generateRefreshToken();
        const accessToken = findUser.generateAccessToken();
    
        findUser.refreshToken = refreshToken
         await findUser.save({ validateBeforeSave: false});

        return { refreshToken, accessToken };

    }catch(error){
        throw new ApiError(500,`Somthing went wrong while generate
            the refresh and access token: ${error}`);
    }
}

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

const loginUser = asyncHandler( async (req,res)=>{
     // T extract the data fromt the requrest body
     let {email, username, password} = req.body;

     // To check the username and password
     if(!username || !email){
        throw new ApiError(400, "You have to give one of the following: email or username")
     }

     // To find the login email or username in db
     let user = await User.findOne({
        $or: [{ email },{ username }]
     });

     if(!user){
        throw new ApiError(400, "User dose not exit");
     }
     
     // To check the password is correct or not
    let isPasswordValid = await loginUser.isPasswordsCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Password is not correct");
    }

    // give the loginUser id to generate the refresh and access token
    const { refreshToken, accessToken } = await
     generateRefreshandAccessToken(user._id);

     // now find the user by id and select unwanted fields
     const logedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
     );

     // Now to be secure the cookie so that no one can modify that
     const options = {
        httpOnly: true,
        secure: true
     };

     // To set the cookie
     res.status(200)
     .cookie("refreshToken", refreshToken, options)
     .cookie("accessToken", accessToken, options)
     .json(
        new ApiResponse(200,
            {user:logedInUser, accessToken, refreshToken},
            "User logged in successfully"
        )
     )



    
    
})

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

export { registerUser, loginUser ,logoutUser };