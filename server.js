'use strict'

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
server.get('/parks',parkHandler)
server.get('*', (req, res) => {
  res.status(500).send('Sorry, something went wrong');
})


function locationHandler(req,res){
  let cityName = req.query.city;
  let key =  process.env.LOCATION_KEY;
  let URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`

  let SQL = 'SELECT * FROM location WHERE search_query=$1 ';
  client.query(SQL,[cityName])
  .then(locData=>{
    if(locData.rowCount>0){
      res.send( locData.rows[0])
    }else {
      superagent.get(URL) 
      .then(geoData=>{
          let gData = geoData.body;
          console.log(gData)
          let locationData = new Location(cityName,gData);
        
          let search_query= cityName;
          let formatted_query= gData[0].display_name;
          let lon = gData[0].lon;
          let lat = gData[0].lat;
          let SQL = 'INSERT INTO location (search_query,formatted_query,longitude,latitude) VALUES ($1,$2,$3,$4);';
          let safeValues = [search_query,formatted_query,lon,lat];
          client.query(SQL,safeValues);
          res.send(locationData); 
      })
      
        .catch(error=>{
          res.send(error);
      })
    }
  })
}





 
function weatherHandler (request, response){
    let cityName = request.query.search_query;
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
    let cityName = req.query.search_query;
    let key = process.env.PARK_KEY;
    let pURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${key}`
    
    superagent.get(pURL) 
        .then(parkData=>{
            let pData = parkData.body.data;
            let dataPark=[];
            pData.forEach((item)=>{
                dataPark.push(new Park(cityName,item)); 
             })
             console.log(dataPark)
            res.send(dataPark);  
        })
        .catch(error=>{
            res.send(error);
        }) 
 };





let Location= function(cityName,locObj){
    this.search_query=cityName;
    this.formatted_query= locObj[0].display_name;
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


