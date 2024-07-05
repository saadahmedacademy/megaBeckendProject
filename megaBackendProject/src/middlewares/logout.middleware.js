import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/async-Handler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // To get the token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     console.log(token)
    if (!token) {
      throw new ApiError(400, "Unauthorized request: No token provided");
    }

    // To match the token with the secret
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, "Invalid Access Token");
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, error.message || `Something went wrong while verifying the access token: ${error}`);
  }
});

export { verifyJWT };
