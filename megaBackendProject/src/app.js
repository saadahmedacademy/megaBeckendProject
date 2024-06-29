import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Import the routes 
import router from './routes/user.router.js';

// Declaration of routes
app.use('/api/v1/users', router);

// Our route will look like this 
// http://localhost:8000/api/v1/users/register



export { app };
