const axios = require('axios')
const config = require('./config')
let outlets = []

function initializeOutlets (database) {
  // MySQL---
  database.query(`SELECT * FROM ${config.DATABASE_OUTLETS_TABLE}`, function (err, result, fields) {
    if (err) {
      console.log('Failed to initialize outlets im razoorpay module')
    } else {
      outlets = result
    }
  })
}

function routePayment (data, outlet) {
  return new Promise((resolve, reject) => {
    const paymentData = data
    const headers = {
      'content-type': 'application/json'
    }
    axios.post(config.RAZORPAY_ORDER_URL, paymentData, {
      headers
    })
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log('Failure: Razorpay payment failure')
    })
  })
}

const RazorpayModule = {
  initializeOutlets,
  routePayment
}

module.exports = RazorpayModule