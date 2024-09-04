import Router from 'express';
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller';

const router = Router();
router.use(verifyJWT);

// To create the playlist
router.route('/').post(createPlaylist) ; // Apply verifyJWT middleware to all routes in this file

// To get the playlist
router.route('/:userId').get(getUserPlaylists);

// To add video to playlist
router.route('/:playlistId/:videoId').post(addVideoToPlaylist);

// To remove video from playlist
router.route('/:playlistId/:videoId').delete(removeVideoFromPlaylist);

// To delete the playlist
router.route('/:playlistId').delete(deletePlaylist);

// To update the playlist 
router.route('/:playlistId').patch(updatePlaylist);

export {router as playlistRoute}