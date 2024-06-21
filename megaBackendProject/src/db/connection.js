import mongoose from 'mongoose';
import express from 'express'
import { DB_NAME } from '../constants.js';


const connectDB = async () =>{
    try{
    const DB_connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`\n The MongoDB connected successfully \n
            ${DB_connection.connection.host}`)

}
    catch(error){
        console.error(`DB_connection Error:  ${error}`)
        process.exit(1)
    }
}

export default connectDB;