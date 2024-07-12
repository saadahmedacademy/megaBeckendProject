import { Video } from "../models/video.model";
import { ApiError } from "../utils/apiErrors";
import { asyncHandler } from "../utils/async-Handler";
import { uploadOnCloudinary } from "../utils/cloudinary";

const uploadVidoe = asyncHandler(async (req, res)=>{
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files); 

    // To get video file and it's data
    const {  videoFile, title,thumbnail ,description} = req.body;

    // To check all fields 
    if([  videoFile,title,thumbnail ,description].some(fields => fields?.trim() === "")
    ){
       throw new ApiError(400, "All Video Filed are required")
    };

    // To get the video local path 
    const videoPath = req.files?.videoFile?.[0]?.path;

    // To check the video path
    console.log('Video Path:', videoPath);
    if (!videoPath) {
      throw new ApiError(400, 'videoFile is required to uploa the video');
    }

    // To upload on cloudinary
    let video = await uploadOnCloudinary(videoPath);

    // To get the video url and save in db
    console.log(`video Path ${video.url}`)

    // To create the video document

    const uploadVideo = await Video.create({
        videoFile : video?.url || "",
        title,
        thumbnail ,
        description
    })


    const uploadedVideo = await User.findById(userData._id)

    if(!uploadedVideo){
        throw new ApiError(400, "Something went wrong while uploading the Video");
    }
    




})