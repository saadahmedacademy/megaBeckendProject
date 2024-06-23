// require('dotenv').config({path:'../.env'});
import dotenv from 'dotenv'
import connectDB from './db/connection.js';
import { app } from './app.js';

dotenv.config({
    path:'../.env'
})
const port = process.env.PORT || 8000;


connectDB().then(() =>{
    app.listen(port ,() => {
        console.log(`server is running on port ${port}`)
    } )
}).catch((err) => console.error(`Mongo DB connection Faild , ${err.message}`))













// import { DB_NAME } from './constants';

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