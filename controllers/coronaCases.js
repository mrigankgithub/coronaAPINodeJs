const request = require("request");
const cheerio = require("cheerio");
const ScrappedDataIndia = require('../models/scrappedDataIndia');
const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'openstreetmap',
  // Optional depending on the providers
  // fetch: customFetchImplementation,
  // apiKey: 'AIzaSyAQAm_7N_IQ8ItgJFiAFuHOnRnnNRP4P4w', // for Mapquest, OpenCage, Google Premier
  // formatter: null 
};

const geocoder =  NodeGeocoder(options);

exports.getCorona = (req, res) => {
  let data = [];
  request(
    "https://www.worldometers.info/coronavirus/",
    (error, response, html) => {
      let scrappedDataCountryWise = [];
      let scrappedDataOverall = [];
      let returnedData;
      console.log(req.params, req.body);
      if (!error) {
        const $ = cheerio.load(html);
        console.log($);
        $("#main_table_countries_today > tbody > tr").each((index, element) => {
          if (
            req.query &&
            Object.keys(req.query).length !== 0 &&
            req.query.country
          ) {
            const tds = $(element).find("td");
            const country = $(tds[0]).text();
            if (country.toLowerCase() === req.query.country.toLowerCase()) {
              const country = $(tds[0]).text();
              const totalCase = $(tds[1]).text();
              const newCase = $(tds[2]).text();
              const totalDeaths = $(tds[3]).text();
              const newDeaths = $(tds[4]).text();
              const totalRecovered = $(tds[5]).text();
              const activeCases = $(tds[6]).text();
              const seriousCritical = $(tds[7]).text();
              const totCases = $(tds[8]).text();
              const tableRow = {
                country,
                totalCase,
                newCase,
                totalDeaths,
                newDeaths,
                totalRecovered,
                activeCases,
                seriousCritical,
                totCases
              };
              returnedData = scrappedDataCountryWise.push(tableRow);
            }
          } 
          else {
            const tds = $(element).find("td");
            const country = $(tds[0]).text();
            const totalCase = $(tds[1]).text();
            const newCase = $(tds[2]).text();
            const totalDeaths = $(tds[3]).text();
            const newDeaths = $(tds[4]).text();
            const totalRecovered = $(tds[5]).text();
            const activeCases = $(tds[6]).text();
            const seriousCritical = $(tds[7]).text();
            const totCases = $(tds[8]).text();
            if (country !== "Total:") {
              const tableRow = {
                country,
                totalCase,
                newCase,
                totalDeaths,
                newDeaths,
                totalRecovered,
                activeCases,
                seriousCritical,
                totCases
              };
              scrappedDataCountryWise.push(tableRow);
            } else {
              const tableRow = {
                totalCase,
                newCase,
                totalDeaths,
                newDeaths,
                totalRecovered,
                activeCases,
                seriousCritical,
                totCases
              };
              scrappedDataOverall.push(tableRow);
            }
          }
        });
        if (scrappedDataOverall.length === 0 && scrappedDataCountryWise.length === 1) {
          returnedData = scrappedDataCountryWise
        } else {
          returnedData = {
            overall: scrappedDataOverall,
            countryWise: scrappedDataCountryWise
          }
        }     
        return res.json(returnedData);
      }
      if (error) {
        return  ;
      }
    }
  );
};

exports.getCoronaIndia = (req, res) => {
  const dataCityWise = [];
  let overAll;
  let returnedData ;
  request('https://economictimes.indiatimes.com/news/politics-and-nation/coronavirus-crisis-heres-total-number-of-confirmed-cases-in-india-as-per-health-ministry/articleshow/74589499.cms?from=mdr',
  (error, response, html) => {
    if (error) {
      console.log(error);
    }
    const $ = cheerio.load(html);
    // console.log($.text());
    $("#table_box_native > table > tbody > tr ").each((index, element) => {
      const tds = $(element).find("td");
      const states = $(tds[0]).text();
      if (states === 'Number of confirmed cases in India') {
        let confirmedCases = $(tds[1]).text();
        confirmedCases = confirmedCases.split("*");
        confirmedCases = parseInt(confirmedCases[0], 10);
        let curedCases = $(tds[1]).text();
        curedCases = curedCases.split("*");
        curedCases = parseInt(curedCases[0], 10);
        let deathCases = $(tds[2]).text();
        deathCases = parseInt(deathCases, 10)
        const objTotal = { confirmedCases, curedCases, deathCases };
        overAll = objTotal;
      } else {
        geocoder.geocode(states).then((res)=>{
          if(res) {
          const location = res;
          console.log(location);
          let confirmedCases = $(tds[1]).text();
          confirmedCases = parseInt(confirmedCases[0], 10);
          let curedCases = $(tds[1]).text();
          curedCases = parseInt(curedCases[0], 10);
          let deathCases = $(tds[2]).text();
          deathCases = parseInt(deathCases, 10)
          const latitude = location[0].latitude;
          const longitude = location[0].longitude;
          const objCityWise = { states, latitude, longitude, confirmedCases, curedCases, deathCases }
          dataCityWise.push(objCityWise);
          console.log(dataCityWise, 'DATA CITY WISE');
          } 
        }).catch(err => {
          console.log(err, 'LOCATION ERROR');
        });
      }
    })
    dataCityWise.shift();
    ScrappedDataIndia.findOne().sort({date: -1}).exec((error, cases)=> {console.log(cases, 'CASES')
    const lastRecordedCounting = cases;
      if (lastRecordedCounting && lastRecordedCounting.total.confirmedCases === overAll.confirmedCases && lastRecordedCounting.total.curedCases === overAll.curedCases && lastRecordedCounting.total.deathCases === overAll.deathCases ) {
        console.log('Same Data');
      } else {
      const scrappedDataIndia = new ScrappedDataIndia({
        total: overAll,
        cityWise: dataCityWise,
      })  
      scrappedDataIndia.save().then(() => {
        console.log('SAVED');
        }).catch((error) => {
          console.log(error)
        })
      } 
    })
    returnedData = {total: overAll, cityWise: dataCityWise};
    return res.json(returnedData);
  })
}

exports.saveCasesToDb = () => {
  return new Promise((resolve , reject)=>{
    if (resolve) {
      const dataCityWise = [];
      let overAll;
      let returnedData ;
      request('https://economictimes.indiatimes.com/news/politics-and-nation/coronavirus-crisis-heres-total-number-of-confirmed-cases-in-india-as-per-health-ministry/articleshow/74589499.cms?from=mdr',
      (error, response, html) => {
        if (error) {
          console.log(error);
        }
        const $ = cheerio.load(html);
        console.log($.text());
        $("#table_box_native > table > tbody > tr ").each((index, element) => {
          const tds = $(element).find("td");
          const states = $(tds[0]).text();
          if (states === 'Number of confirmed cases in India') {
            const confirmedCases = $(tds[1]).text();
            const curedCases = $(tds[1]).text();
            const deathCases = $(tds[2]).text();
            const objTotal = { confirmedCases, curedCases, deathCases };
            overAll = objTotal;
          } else {
            const confirmedCases = $(tds[1]).text();
            const curedCases = $(tds[1]).text();
            const deathCases = $(tds[2]).text();
            const objCityWise = { states, confirmedCases, curedCases, deathCases }
            dataCityWise.push(objCityWise);
          }
        })
        dataCityWise.shift();
        ScrappedDataIndia.findOne().sort({date: -1}).exec((error, cases)=> {console.log(cases, 'CASES')
        const lastRecordedCounting = cases;
          if (lastRecordedCounting && lastRecordedCounting.total.confirmedCases === overAll.confirmedCases && lastRecordedCounting.total.curedCases === overAll.curedCases && lastRecordedCounting.total.deathCases === overAll.deathCases ) {
            console.log('Same Data');
          } else {
          const scrappedDataIndia = new ScrappedDataIndia({
            total: overAll,
            cityWise: dataCityWise,
          })  
          scrappedDataIndia.save().then(() => {
            console.log('SAVED');
            }).catch((error) => {
              console.log(error)
            })
          } 
        })
        returnedData = {total: overAll, cityWise: dataCityWise};
      })
    }
  }) 
}



//     $("#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(1) > td").each(
//         (index , element) => {
//             data.push($(element).text());
//         }
//     )
//     console.log(data, 'data')
//    const mappedData = Object.keys(casesModel).forEach((key, index) => {
//        Object.assign(casesModel, {[key]:data[index]})
//    });
//    console.log(casesModel);
