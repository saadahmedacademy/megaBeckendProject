const express = require('express');
require('dotenv').config()


const app = express()
const port = 4000;
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/twitter',(req,res) =>{
    res.send("Twitter");
})

app.get('/login',(req,res)=>{
    res.send('login')
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${port}`)})