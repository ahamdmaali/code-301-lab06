'use strict'

require('dotenv').config();

const express = require('express');
const server = express();

const PORT = process.env.PORT || 4000;

server.get('/', (request, response) => {
 

 
  response.status(200).json();
  response.send('try another rout');
  
 });
 
server.listen(PORT,()=>{
  console.log(PORT)
})


let Location= function(locObj){
    this.search_query='Lynnwood';
    this.formatted_query= locObj[0].display_namey;
    this.latitude= locObj[0].lat;
    this.longitude= locObj[0].lon;
  };




server.get('/location', (request, response) => {
    let loc= require('./location.json');
  let locas = new Location(loc)
  response.status(200).json(locas);
  response.send(locas);
  
});
 


let Weather= function(waetherObj){
    
   this.forecast=waetherObj.weather.description;
   this.time=waetherObj.valid_date;
   
  };


server.get('/weather', (request, response) => {
   let weatherArr=[];
    let weath= require('./weather.json');
   
    weath.data.forEach((item,i)=>{
      let weathers = new Weather(item);
      weatherArr.push(weathers)
      
    })
    
    console.log(weatherArr);
 
  
  response.status(200).json(weatherArr);
  response.send(weatherArr);
  
});


