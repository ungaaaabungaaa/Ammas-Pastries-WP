const express = require("express");
const axios = require('axios')
const config = require('./config')
const RishtaModule = require('./RishtaModule')
// const DeliveryModule = require('./DeliveryModule')
const GeolocationModule = require('./GeolocationModule')
const MongoClient = require('mongodb').MongoClient
const MySQL = require('mysql')

const app = express()
app.use(express.json())
let database = null

// Database connection ----------
// Mongo DB--
// MongoClient.connect(config.DATABASE_ADDRESS, function(err, db) {
//   if (err) {
//     console.log('Failure: MongoDB database connection failed')
//     throw err
//   }
//   console.log('Success: MongoDB Database created!')
//   database = db
//   GeolocationModule.initializeOutlets(database)
// })
// // MYSQL DB--
// database = MySQL.createConnection({
//   host     : config.MYSQL_DATABASE_HOST,
//   port     : config.MYSQL_DATABASE_PORT,
//   user     : config.MYSQL_DATABASE_USER,
//   password : config.MYSQL_DATABASE_PASSWORD,
//   database : config.DATABASE_NAME
// })
// database.connect(function(err) {
//   if (err) {
//     console.log('Failure: MySQL data base commection failed')
//   } else {
//     console.log("Success: MYSQL database connected!")
//     GeolocationModule.initializeOutlets(database)
//   }
// })
// setInterval(() => {
//   if (database) {
//     GeolocationModule.initializeOutlets(database)
//   }
// }, config.DATABASE_UPDATETIME)
// ---------------------------------

// Delivery login
/*
DeliveryModule.login()
setInterval(() => {
  DeliveryModule.login()
}, config.DELIVERY_RELOGIN_TIMEOUT)
*/

app.get("/", async (req, res) => {
  return res.json({ message: "Hello, World ✌️" });
});

app.post("/", async (req, res) => {
  console.log('POST type: ',req.query.callback)
  return res.json({ message: "Hello, World post response ✌️" });
});

// create order 
app.post('/rishtaorder', (req, res) => {
  if (req.headers && req.headers['x-custom-secret'] === config.SECURITY_KEY) {
    // 1. Get the outlet based on address
    GeolocationModule.getOutletDetails(req.body)
      .then(outlet => {
        // 2. Rishta order
        RishtaModule.createOrder(req.body, outlet)
        .then(result => {
          res.send({ status: '200', message: result });
        })
        .catch(error => {
          console.log(error)
        res.send({ status: '409', message: 'Failed to send order to rishta', errorMessage: error })
      })
    })
    .catch(error => {
      axios.post(config.RISHTA_SUCCESS_CALLBACK_URL, {
        success: false,
        invoiceNumber: req.body && req.body.id,
        reason: 'Failed to resolve address'
      })
      res.send({status: '409', message: 'Failed to create order', errorMessage: error})
    })
  } else {
    res.send({status: '403', message: 'Forbidden' })
  }
})

const start = async () => {
  try {
    app.listen(config.PORT, () => console.log("Start: Server started on port ", config.PORT));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

app.on('close', function() {
  console.log('Stop: Stopping node server...', new Date());
  start();
});

start();