const express = require('express');
const route = require('./routes/coronaCases');


const app = express();

app.use('/api/v1/corona', route)

app.listen('3001',() => {
    console.log('app is running');
})