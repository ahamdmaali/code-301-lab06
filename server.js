'use strict'
// lab 07

require('dotenv').config();

const express = require('express');
const server = express();
const PORT = process.env.PORT || 4500;
const cors = require('cors');
const pg = require('pg')
server.use(cors());
 
server.listen(PORT,()=>{})

const superagent = require('superagent');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });




server.get('/location',locationHandler) 
server.get('/weather',weatherHandler)
server.get('/park',parkHandler)
server.get('*', (req, res) => {
  res.status(500).send('Sorry, something went wrong');
})


function locationHandler(req,res){
  let cityName = req.query.city;
  let locName = req.query.loc_name;
  let lon = req.query.longitude;
  let lat = req.query.latitude;
  let SQL = `INSERT INTO location (loc_name,longitude,latitude) VALUES ($1,$2,$3) RETURNING *;`;
  let safeValues = [locName,lon,lat];
  if(locName ===cityName ){
    client.query(SQL,safeValues)
    .then(result=>{
        res.send(result.rows); 
    })
    .catch(error=>{
      res.send(error);
  })
  }else{
    let key =  process.env.LOCATION_KEY;
    let URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`

    superagent.get(URL) 
        .then(geoData=>{
            let gData = geoData.body;
            let locationData = new Location(cityName,gData);
            res.send(locationData); 
        })
          .catch(error=>{
            res.send(error);
        })
  }   
}





 
function weatherHandler (request, response){
    let cityName = request.query.city;
    let key = process.env.WEATHER_KEY;
    let WURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}`
    superagent.get(WURL) 
        .then(weathData=>{
            let wData = weathData.body.data;
            let weatherData=[];
            wData.forEach((item)=>{
               weatherData.push(new Weather(item));
            })
            response.send(weatherData); 
        })
        .catch(error=>{
            response.send(error);
        }) 
 };



 function parkHandler(req,res){
    let cityName = req.query.city;
    let key = process.env.PARK_KEY;
    let pURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${key}`
    
    superagent.get(pURL) 
        .then(parkData=>{
            let pData = parkData.body.data;
            let dataPark=[];
            pData.forEach((item)=>{
                dataPark.push(new Park(cityName,item));
             })
             
            res.send(dataPark);  
        })
        .catch(error=>{
            res.send(error);
        }) 
 };





let Location= function(cityName,locObj){
    this.search_query=cityName;
    this.formatted_query= locObj[0].display_namey;
    this.latitude= locObj[0].lat;
    this.longitude= locObj[0].lon;
  };

let Weather= function(waetherObj){      
        this.forecast=waetherObj.weather.description;
        this.time=waetherObj.valid_date;
  };



let Park= function(cityName,parkObj){

    this.search_query=cityName;
    this.name=parkObj.name;
    this.address=parkObj.addresses;
    this.fee=parkObj.fees;
    this.description=parkObj.description;
    this.url=parkObj.directionsUrl;
};


// lab 06

// require('dotenv').config();

// const express = require('express');
// const server = express();

// const PORT = process.env.PORT || 4000;
// const cors = require('cors');
// server.use(cors());
 
// server.listen(PORT,()=>{})


// let Location= function(locObj){
//     this.search_query='Lynnwood';
//     this.formatted_query= locObj[0].display_namey;
//     this.latitude= locObj[0].lat;
//     this.longitude= locObj[0].lon;
//   };




// server.get('/location', (request, response) => {
//     let loc= require('./location.json');
//   let locas = new Location(loc)
//   response.status(200).json(locas);
//   response.send(locas);
  
// });
 


// let Weather= function(waetherObj){
    
//    this.forecast=waetherObj.weather.description;
//    this.time=waetherObj.valid_date;
   
//   };


// server.get('/weather', (request, response) => {
//    let weatherArr=[];
//     let weath= require('./weather.json');
   
//     weath.data.forEach((item,i)=>{
//       let weathers = new Weather(item);
//       weatherArr.push(weathers)
      
//     })
    
//     console.log(weatherArr);
 
  
//   response.status(200).json(weatherArr);
//   response.send(weatherArr);
  
// });

// server.get('*', (req, res) => {
//   res.status(500).send('Sorry, something went wrong');
// })