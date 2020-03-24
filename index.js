const express = require('express');
const route = require('./routes/coronaCases');


const app = express();

app.use('/api/v1/corona', route)

app.listen('3000',() => {
    console.log('app is running');
})