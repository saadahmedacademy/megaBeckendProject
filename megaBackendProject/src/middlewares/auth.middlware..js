import { ApiError } from "../utils/apiErrors";
import { asyncHandler } from "../utils/async-Handler";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model";

 const verifyJWT = asyncHandler(async (req, res, next) =>{

try {
      // To get the token
     const token = req.cookies?.accessToken ||req.header
     ("Authorization").replace("Bearer ", "");
    
      if(!token){
      throw new ApiError(400, "Unauthorized request");
    }
     // To match the token with the secret
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      
     const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken")

      if(!user){
          throw new ApiError(401,"Unvalid Access Token")
    }
    
      req.user = user;
       next();

    }
    
catch(error) {
    throw new ApiError(400, error?.message || `Somthing went wrong while verify the access token: ${error}`);
}

})

export default verifyJWT;