/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect      = require('chai').expect;
var MongoClient = require('mongodb');
var mongoose    = require('mongoose');
var fetch       = require('node-fetch');

const stockSchema = require('../schema/stockSchema');
const Stock = mongoose.model('Stock', stockSchema);

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING);

function getStockPrice(stock){
  //returns a promis that will resolve with text representing the last price of the stock symbol.
  //bad symbols return 'Unknown symbol'
  const ENDPOINT = `https://api.iextrading.com/1.0/stock/${stock}/price`; 
  return fetch(ENDPOINT).then( (res)=>res.text() )
}

function handleDBResponse(res){
  if(res) return res;
  else return Stock
}

function getStockData(stock){
  return Stock.findOne({stock:stock})
    .exec().then((res)=>{
      if(res) return res;
      else return Stock({stock:stock});
    })
}

function getStockObject(stock){
  return Promise.all([getStockPrice(stock),getStockData(stock)])
    .then( (stockArray) => {
      const stockObject = {
        price : stockArray[0],
        model : stockArray[1],
      }
      return stockObject;
    })
};

function singleStockReturner(req,res){
  const stock       = req.query.stock;
  const ip          = req.ip;
  const likeString  = req.query.like || 'false';
  const like        = likeString === 'true' ? true : false;
  
  const stockData1 = getStockObject(stock)
  
  Promise.all([stockData1])
    .then((values)=>{
      const stock1 = values[0];
    
      if(like && !stock1.model.ips.includes(ip)) {
        stock1.model.likes = stock1.model.likes+1;
        stock1.model.ips.push(ip);
      }
      
      
      stock1.model.save();
      res.send({
        stockData:{
          stock : stock.toUpperCase(),
          price : Number(stock1.price),
          likes : Number(stock1.model.likes),
        }
      });
    })
  
};

function multiStockReturner(req,res){
  const stock       = req.query.stock;
  const ip          = req.ip;
  const likeString  = req.query.like || 'false';
  const like        = likeString === 'true' ? true : false;
  
  const stockData1 = getStockObject(stock[0])
  const stockData2 = getStockObject(stock[1])
  
  Promise.all([stockData1,stockData2])
    .then((values)=>{
      const stock1 = values[0];
      const stock2 = values[1];
    
      if(like && !stock1.model.ips.includes(ip)) {
        stock1.model.likes = stock1.model.likes+1;
        stock1.model.ips.push(ip);
      }
      stock1.model.save((err,res)=>{})
      res.send({
        stockData:[
          {
            stock : stock1.model.stock.toUpperCase(),
            price : Number(stock1.price),
            rel_likes : stock1.model.likes - stock2.model.likes,
          },
          {
            stock : stock2.model.stock.toUpperCase(),
            price : Number(stock2.price),
            rel_likes : stock2.model.likes - stock1.model.likes,
          }
        ]
      });
    })
};

module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      if(!req.query.stock) res.send('no stock requested');
      else if(Array.isArray(req.query.stock)) multiStockReturner(req, res);
      else singleStockReturner(req, res);
    })
  
    .delete(function (req, res){
      const stocks= Array.isArray(req.query.stock) ?
        req.query.stock : [req.query.stock];
      const errors = [];
      stocks.forEach(function(stock){
        Stock.deleteOne({stock:stock},err=>{if(err)errors.push(err)}).exec();
      });
      res.send('delete successful');
    });
}