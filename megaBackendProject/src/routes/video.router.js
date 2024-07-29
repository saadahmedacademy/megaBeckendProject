import { Router } from 'express';
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/logout.middleware.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
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

router
  .route('/:videoId')
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single('thumbnail'), updateVideo);

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);

export default videoRouter;
