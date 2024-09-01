import Router from 'express';
import { createPlaylist, getUserPlaylists } from '../controllers/playlist.controller';

const router = Router();
router.use(verifyJWT);

router.route('/').post(createPlaylist) ; // Apply verifyJWT middleware to all routes in this file
router.route('/:userId').get(getUserPlaylists);
export {router as playlistRoute}