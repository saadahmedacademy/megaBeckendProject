import { Playlist } from '../models/playlist.model.js';
import { ApiError } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Video } from '../models/video.model.js';

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videoIds } = req.body;

  // Validate the required fields
  if (!name || !description) {
    throw new ApiError(400, 'name and description are required');
  }

  // Get the user ID from the authenticated user

  const videoOwner = req.user._id;

  // Save the playlist to the database
  const playlist = new Playlist({
    name,
    description,
    videos: videoIds,
    owner: videoOwner,
  });

  await playlist.save();

  // Return the created playlist in the response
  res
    .status(201)
    .json(new ApiResponse(201, 'Playlist created successfully', playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  // Find playlists by userId
  const playlists = await Playlist.find({ owner: userId }).populate('videos');

  // Handle case where no playlists are found
  if (playlists.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, 'No playlists found for this user'));
  }

  // Respond with the found playlists
  res
    .status(200)
    .json(new ApiResponse(200, 'Playlists retrieved successfully', playlists));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate playlistId and videoId
  if (!playlistId || !videoId) {
    throw new ApiError(400, 'Playlist ID and video ID are required to add video in playlist');
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found to add to the playlist');
  }

  // Add the video to the playlist if it's not already there
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId }, // Prevent duplicates
      $set: { updatedAt: Date.now() }, // Update the timestamp
    },
    { new: true } // Return the updated document
  ).populate('videos'); // Populate videos to return the full video data

  // Check if the playlist update was successful
  if (!updatedPlaylist) {
    throw new ApiError(400, 'Something went wrong while adding video to playlist');
  }

  // Respond with the updated playlist
  res.status(200).json(new ApiResponse(200, 'Video added to playlist successfully', updatedPlaylist));
});

export { createPlaylist, getUserPlaylists ,addVideoToPlaylist};
