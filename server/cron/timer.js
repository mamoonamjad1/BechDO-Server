var cron = require('node-cron');
let {productCrone} = require('./productCrone');

module.exports = () => {
  cron.schedule('*/5 * * * * *', () => {
    //console.log('running every 5 seconds');
    productCrone()
  });
};
