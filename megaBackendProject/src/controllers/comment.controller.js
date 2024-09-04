import { Comment } from '../models/comment.model';
import { asyncHandler, ApiError, ApiResponse } from '../utils/async-Handler.js';

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId, userId } = req.params;

  if (!content) {
    throw new ApiError(400, 'content is required');
  }

  const newComment = new Comment({
    content,
    video: videoId,
    owner: userId,
  });

  await newComment.save();

  if (!newComment) {
    throw new ApiError(
      500,
      'Something went wrong while commenting on the video'
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, 'Comment created successfully', newComment));
});

export { addComment };
