import { Router } from 'express';
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/logout.middleware.js';

let videoRoute = Router();
videoRoute.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

videoRoute
  .route('/')
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: 'videoFile',
        maxCount: 1,
      },
      {
        name: 'thumbnail',
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

  videoRoute
  .route('/:videoId')
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single('thumbnail'), updateVideo);

  videoRoute.route('/toggle/publish/:videoId').patch(togglePublishStatus);

export default videoRoute
