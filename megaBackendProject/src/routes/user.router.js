import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Define the route for registration
router.route('/register').post(
    upload.fields([
    { name: 'avater',maxCount: 1  },
    {name: 'coverImage',maxCount: 1}
]),  registerUser);

export default router;
