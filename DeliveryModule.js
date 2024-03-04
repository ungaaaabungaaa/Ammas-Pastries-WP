const axios = require('axios')
const config = require('./config')
let token = ''

function login () {
  axios.post(config.DELIVERY_LOGIN_URL, {
    "username": config.DELIVERY_USERNAME,
    "password": config.DELIVERY_PASSWORD
  }, { 
    headers: {
      'content-type': 'application/json'
    }
  })
  .then(response => {
    const data = response && response.data
    if (data) {
      console.log(response)
      token = data.token
    }
  }).catch(error => {
    console.log('Failed: Delivery login failed')
  })
}

function createDelivery (data) {
  return new Promise((resolve, reject) => {
    const structuredData = {
      "channel":"zomato",
      "sender_detail": {
        "address": {
          "address_line_1": "Sender Address line 1",
          "address_line_2": "Sender address line 2",
          "label": "Sender label",
          "landmark": "Sender landmark",
          "city": "Delhi",
          "state": "Delhi",
          "country": "India",
          "pincode": "110022",
          "latitude": 28.549235, // sender latitude
          "longitude": 77.126043, // sender longitude
          "instructions_to_reach": "Use Sender GPS"
        },
        "name": "Sender Name",
        "mobile": "0000000000",
        "email": "sender@email.com"
      },
      "poc_detail": {
        "name": "POC name",
        "mobile": "0000000000",
        "email": "poc@email.com"
      },
      "trips": [
        {
          "receiver_detail": {
            "address": {
              "address_line_1": "Receiver address line 1",
              "address_line_2": "Receiver address line 2",
              "label": "Receiver label",
              "landmark": "Receiver landmark",
              "city": "Delhi",
              "state": "Delhi",
              "country": "India",
              "pincode": "110022",
              "latitude": 28.600902, // receiver latitude
              "longitude": 77.1241621, // receiver longitude
              "instructions_to_reach": "Receiver GPS"
            },
            "name": "Receiver Name",
            "mobile": "0000000000",
            "email": "receiver@email.com"
          },
          "packages": [
            {
              "label": "package label",
              "quantity": 1,
              "dead_weight": 0,
              "volumetric_weight": 450,
              "length": 2,
              "breadth": 2,
              "height": 2
            }
          ],
          "source_order_id": "PP1010",
          "reference_id": "ref_1010",
          "cod_amount": 10,
          "bill_amount": 100,
          "products": [
            {
              "name": "Utility Box",
              "sku": "200",
              "price": 450,
              "dimension": {
                  "dead_weight": 100
              },
              "image_url": "https://play-lh.googleusercontent.com/1-hPxafOxdYpYZEOKzNIkSP43HXCNftVJVttoo4ucl7rsMASXW3Xr6GlXURCubE1tA=w3840-h2160-rw"
            }
          ],
          "notes": [
            {
              "name": "test key 1",
              "value": "test value 1"
            }
          ],
          "delivery_date": "2022-02-17",
          "delivery_slot": "14:00-15:00"
        },
        {
          "receiver_detail": {
            "address": {
              "address_line_1": "Receiver address line 1",
              "address_line_2": "Receiver address line 2",
              "label": "Receiver label",
              "landmark": "Receiver landmark",
              "city": "Delhi",
              "state": "Delhi",
              "country": "India",
              "pincode": "110022",
              "latitude": 28.600902, // receiver latitude
              "longitude": 77.1241621, // receiver longitude
              "instructions_to_reach": "Receiver GPS"
            },
            "name": "Receiver Name",
            "mobile": "0000000000",
            "email": "receiver@email.com"
          },
          "packages": [
            {
              "label": "package label",
              "quantity": 1,
              "dead_weight": 0,
              "volumetric_weight": 450,
              "length": 2,
              "breadth": 2,
              "height": 2
            }
          ],
          "source_order_id": "PP101111",
          "reference_id": "ref_10111110",
          "cod_amount": 10,
          "bill_amount": 100,
          "products": [
            {
              "name": "Utility Box",
              "sku": "200",
              "price": 450,
              "dimension": {
                  "dead_weight": 100
              },
              "image_url": "https://play-lh.googleusercontent.com/1-hPxafOxdYpYZEOKzNIkSP43HXCNftVJVttoo4ucl7rsMASXW3Xr6GlXURCubE1tA=w3840-h2160-rw"
            }
          ],
          "notes": [
            {
              "name": "test key 1",
              "value": "test value 1"
            }
          ],
          "delivery_date": "2022-02-17",
          "delivery_slot": "14:00-15:00"
        }
      ]
    }

    const headers = {
      'Authorization': token,
      'content-type': 'application/json'
    }
    axios.post(config.DELIVERY_CREATEORDER_URL, structuredData, { headers })
    .then(response => {
      axios.post(config.DELIVERY_SUCCESS_CALLBACK_URL, {
        success: true,
        details: response.data && response.data
      })
    })
    .catch(error => {
      console.log('Failure: Delivery order create failure')
    })
  })
}

const DeliveryModule = {
  login,
  createDelivery
}

module.exports = DeliveryModule