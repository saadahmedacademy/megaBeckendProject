import { Video } from '../models/video.model';
import { ApiError } from '../utils/apiErrors';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/async-Handler';
import { uploadOnCloudinary } from '../utils/cloudinary';

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = 'createdAt',
    sortType = 'desc',
    userId,
  } = req.query;

  // To construct the query
  let searchQuery = {};
  if (query) {
    searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    };
  }

  // If userId provided so add it to the search query
  if (userId) {
    searchQuery.owner = userId;
  }

  // Construct sort options
  const sortOption = {};
  sortOption[sortBy] = sortType === 'asc' ? 1 : -1;

  // Degine pagination options
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOption,
  };

  const videos = await Video.paginate(searchQuery, options);
});

const publishAVideo = asyncHandler(async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Request Files:', req.files);

  // Destructure necessary fields from request body
  const { title, thumbnail, description } = req.body;

  // Validate required fields
  if ([title, thumbnail, description].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All video fields are required');
  }

  // Get the video file path
  const videoPath = req.files?.videoFile?.[0]?.path;

  // Check if video file path exists
  console.log('Video Path:', videoPath);
  if (!videoPath) {
    throw new ApiError(400, 'videoFile is required to upload the video');
  }

  // Upload video to Cloudinary
  const video = await uploadOnCloudinary(videoPath);

  // Log video URL
  console.log(`Video URL: ${video.url}`);

  // Create video document in the database
  const uploadVideo = await Video.create({
    videoFile: video?.url || '',
    title,
    thumbnail,
    description,
  });

  // Find the user who uploaded the video
  const uploadedVideo = await User.findById(userData._id);

  // Check if user exists
  if (!uploadedVideo) {
    throw new ApiError(400, 'Something went wrong while uploading the video');
  }

  // Respond with the created video document
  throw new ApiResponse(201, 'Video uploaded successfully', uploadVideo);
});

const getVideoById = asyncHandler(async (req, res) => {
  // Destructure necessary fields from request params
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, 'Video ID is not found in the request params');
  }

  // Find the video by ID
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video is not found by the given ID');
  }

  // Respond with the found video
  res.status(200).json(new ApiResponse(200, 'Video found successfully', video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, 'Video ID is not found in the request params');
  }

  // Destructure the fields from the request body
  const { title, description } = req.body;
  let thumbnail;

  // If thumbnail is provided, handle its update
  if (req.file?.thumbnail) {
    const thumbnailPath = req.file.thumbnail[0].path;
    thumbnail = await uploadOnCloudinary(thumbnailPath);
    console.log(`Thumbnail URL: ${thumbnail.url}`);

    if (!thumbnail) {
      throw new ApiError(400, 'Something went wrong while uploading the thumbnail on Cloudinary');
    }
  }

  // Prepare the fields to be updated
  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (thumbnail) updateFields.thumbnail = thumbnail.url;

  // Find the video by ID and update the provided fields
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true } // Return the updated document
  );

  if (!video) {
    throw new ApiError(404, 'Video is not found by the given ID');
  }

  res.status(200).json(new ApiResponse(200, 'Video updated successfully', video));
});

export { publishAVideo, getAllVideos, getVideoById , updateVideo};
