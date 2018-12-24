/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      var googLikes, msftLikes;
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         assert(!err,'There was an error returned from the server');
         assert.property(res.body, 'stockData','response body does not include stockData object'); 
         const {stockData} = res.body;
         assert.isNotArray(stockData, 'stockData was an Array, expected single object');
         assert.equal(stockData.stock, 'GOOG', 'stockData.stock did not match stock supplied.');
         assert.isNumber(stockData.price,'stockData.price was not a Number');
         assert.isNumber(stockData.likes, 'stockData.likes was not a Number');
           googLikes = stockData.likes;
         done();
        });
      });
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({
           stock: 'goog',
           like : 'true',
         })
        .end(function(err, res){
         assert(!err,'There was an error returned from the server');
         assert.property(res.body, 'stockData','response body does not include stockData object'); 
         const {stockData} = res.body;
         assert.isNotArray(stockData, 'stockData was an Array, expected single object');
         assert.equal(stockData.stock, 'GOOG', 'stockData.stock did not match stock supplied.');
         assert.isNumber(stockData.price,'stockData.price was not a Number');
         assert.isNumber(stockData.likes, 'stockData.likes was not a Number');
         assert.equal(stockData.likes, googLikes + 1 ,'stockData.likes was not incrimented correctly');
           googLikes = stockData.likes;
         done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({
           stock: 'goog',
           like : 'true',
         })
        .end(function(err, res){
         assert(!err,'There was an error returned from the server');
         assert.property(res.body, 'stockData','response body does not include stockData object'); 
         const {stockData} = res.body;
         assert.isNotArray(stockData, 'stockData was an Array, expected single object');
         assert.equal(stockData.stock, 'GOOG', 'stockData.stock did not match stock supplied.');
         assert.isNumber(stockData.price,'stockData.price was not a Number');
         assert.isNumber(stockData.likes, 'stockData.likes was not a Number');
         assert.equal(stockData.likes, googLikes,'This IP was able to double-like a stock.');
         done();
        });
      });
      
      test('2 stocks', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
         assert(!err,'There was an error returned from the server');
         assert.property(res.body, 'stockData','response body does not include stockData object'); 
         const {stockData} = res.body;
         assert.isArray(stockData, 'stockData was not an Array, expected Array');
         stockData.forEach(function(stock){
           assert.include(['GOOG','MSFT'], stock.stock ,'stockData.stock did not match stock supplied.');  
           assert.isNumber(stock.price,'stock.price was not a Number');
           assert.isNumber(stock.rel_likes, 'stock.rel_likes was not a Number');
         });
         done();
        });
      });
      
      test('2 stocks with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
         assert(!err,'There was an error returned from the server');
         assert.property(res.body, 'stockData','response body does not include stockData object'); 
         const {stockData} = res.body;
         assert.isArray(stockData, 'stockData was not an Array, expected Array');
         stockData.forEach(function(stock){
           assert.include(['GOOG','MSFT'], stock.stock ,'stockData.stock did not match stock supplied.');  
           assert.isNumber(stock.price,'stock.price was not a Number');
           assert.isNumber(stock.rel_likes, 'stock.rel_likes was not a Number');
         });
         done();
        });
      });
      
    });
  
  suite('DELETE /api/stock-prices => stock ticker name', function() {
    //This is both to test the DELETE function and to clean up after the testing suite.
    //Please keep this test at the bottom, thankyou;
    test('DELETEing goog',function(done){
      chai.request(server)
        .delete('/api/stock-prices')
        .query({stock:'goog'})
        .end(function(err,res){
          assert(!err,'server returned an error');
          assert.equal(res.text,'delete successful');
          done()
        });
      });
    test('DELETEing msft',function(done){
      chai.request(server)
        .delete('/api/stock-prices')
        .query({stock:'msft'})
        .end(function(err,res){
          assert(!err,'server returned an error');
          assert.equal(res.text,'delete successful');
          done()
      });
    });
  });

});
