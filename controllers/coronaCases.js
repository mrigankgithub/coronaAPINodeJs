const request = require("request");
const cheerio = require("cheerio");

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
