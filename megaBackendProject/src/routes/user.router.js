// routes.js
import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changedPassword,
  updateAccount,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/logout.middleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route('/login').post(loginUser);

// sequre routes
router.route('/logout').post(verifyJWT, logoutUser);

router.route('/refresh-token').post(refreshAccessToken);

router.route('/change-password').post(verifyJWT, changedPassword);

router.route('/current-user').get(getCurrentUser);

router.route('/update-accoute').patch(verifyJWT, updateAccount);

// To update the avatar and coverImage
router
  .route('/update-avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar);

router
  .route('/update-coverimage')
  .patch(verifyJWT, upload.single('coverImage'),updateUserCoverImage);

// to get the channal name and subscriber

router.route('/channal/:username').get(verifyJWT, getUserChannelProfile);

router.route('/history').get(verifyJWT, getWatchHistory);

export default router;
