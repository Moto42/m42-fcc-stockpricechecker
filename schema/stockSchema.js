const Schema = require('mongoose').Schema;

module.exports = new Schema({
  stock: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  ips: {
    type:[String],
    default:[],
  }
});