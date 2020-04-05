const express = require('express');
require('./db/mongoose');
const route = require('./routes/coronaCases');
const cron = require('node-cron');
const coronaCasesIndiaController = require('./controllers/coronaCases');



const app = express();

app.use('/api/v1/corona', route);
app.use('/api/v1/corona', route);
cron.schedule("*/15 * * * *", () => {
    console.log("cron");
    coronaCasesIndiaController.saveCasesToDb().then((res)=>{
        console.log('SAVED BY CRON');
    }).catch(error => {
        console.log(error, 'CRON ERROR')
    });
})

app.listen('3000',() => {
    console.log('app is running');
})