// require('dotenv').config({path:'../.env'});
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import { app } from './app.js';

dotenv.config({
    path: '../.env'
});

const port = process.env.PORT || 8000;

connectDB().then(() => {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use`);
            process.exit(1);
        } else {
            throw err;
        }
    });
});

/* 
const app = express();

(async ()=>{
    try{
     const connect = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}` );
     app.on('error' ,(error) => {
        console.error(`Express_connection Error:  ${error.message}`);
        throw error
     })
    }catch(err){
        console.error(`DB_connection Error:  ${err.message}`)
        throw err
    }
})()

app.listen(process.env.PORT , ()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})
*/
