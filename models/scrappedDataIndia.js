const mongoose = require('mongoose');

const ScrappedDataIndia = mongoose.model('Scrapped Data India', {
    total : {type: Object},
    cityWise: [],
    date: {type: Date, default: Date.now()}
})

module.exports = ScrappedDataIndia;