const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/coronaLocalDatabase',{
    useNewUrlParser: true,
    useCreateIndex: true
}).then(res => {
    console.log('CONNECTED SUCCESSFULLY')
}).catch(err => {
    console.log(error);
})

