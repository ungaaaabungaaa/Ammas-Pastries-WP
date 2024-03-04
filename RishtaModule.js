const jwt = require('jsonwebtoken')
const axios = require('axios')
const config = require('./config')
const moment = require("moment-timezone")

function getShippingInfo (data, storeName, storeId, invoiceNumber, initDeliveryDate, totalAmount) {
  const billing = data.billing
  const shipping = data.shipping
  const shippingMode = data.shipping_lines && data.shipping_lines[0] && data.shipping_lines[0].method_id === 'local_pickup' ? 'Pickup' : 'Delivery'
   
  let deliveryDate = initDeliveryDate
  if (data.meta_data) {
    let date = '', time = ''
    data.meta_data.forEach((element = {}) => {
      if (element.key === '_shopengine_Preferred_Delivery_Date') {
        date = element.value
      }
      if (element.key === '_shopengine_Preferred_Delivery_Time') {
        time = element.value
      }
    })
    deliveryDate = date && time ? `${date}T${time}:00.000` : date ? `${date}T00:00:00.000` : deliveryDate
  }

  const orderInfo = {
    "branchName": storeName,
    "branchCode": storeId,
    "invoice": invoiceNumber,
    "invoiceNumber": invoiceNumber,
    "orderNumber": invoiceNumber,
    "statementNumber": invoiceNumber,
    "invoiceDate": data.date_created && data.date_created.date,
    "invoiceType": "Sale",
    "status": "Open",
    "fulfillmentStatus": "Confirmed",
    // source info
    "sourceInfo": {
      "companyName": "Amma's Website",
      "invoiceNumber": invoiceNumber,
      "invoiceDate": data.date_created && data.date_created.date,
      "source": storeId,
      "sourceOutletId": storeId,
      "outletId": storeId,
      "isEditable": true,
      "isEcomOrder": true
    },
    "originalSaleInfo": {
      "invoiceNumber": invoiceNumber
    },
    // customer
    "customer": {
        "id": `${data.customer_id}`,
        "title": "",
        "name": `${billing.first_name} ${billing.last_name}`,
        "email": billing.email,
        "phoneNumber": billing.phone
    },
    // delivery
    "delivery": {
        "name": `${shipping.first_name} ${shipping.last_name}`,
        "email": shipping.email,
        "phoneNumber": shipping.phone,
        "mode": shippingMode,
        "address": {
          "label": shipping.company,
          "addressLine": `${shipping.address_1}, ${shipping.address_2}`,
          "city": shipping.city,
          "state": shipping.state,
          "country":shipping.country,
          "zip": shipping.postcode,
          "landmark": "",
          "latitude": 0,
          "longitude": 0
        },
        "deliveryDate": deliveryDate
    },
    // total amount
    "itemTotalAmount": parseFloat(totalAmount),
    "billAmount": parseFloat(totalAmount),
    "billRoundedAmount": parseFloat(totalAmount),
    "saleBy": "Amma's website",
    "saleByUserId": data.customer_id,
    "channel": "Amma's Website",
    "currency": data.currency || "INR",
    "payments": [{
      "mode": data.payment_method,
      "amount": data.payment_method === 'cod' ? 0 : parseFloat(totalAmount),
      "note": data.payment_method_title,
      "postedDate": data.date_created
    }]
  } 
  return orderInfo
}

function createOrderObject (data, storeName, storeId) {
  if (data) {
    const backOrders = []
    const normalOrders = []
    let lineItems = data.line_items || []
    let totalAmount = 0
    const items = lineItems.map(item => {
      // Theme cake, india price item data update ------------------
      const metaData = item.meta_data || []
      let skuCode = item.sku
      if (String(item.sku).includes('-')) {
        const sku = String(item.sku).split('-')
        skuCode = data.currency === 'INR' ? sku[1] : sku[0]
      }
      let itemName = '', price = parseFloat(item.price)
      metaData.forEach(({key, display_value, value}) => {
        if (key.includes('pa_') && display_value) {
          itemName += (display_value || value) + ' | '
        }
        if (key === '_india_regular_price' && data.currency === 'INR') {
          price = parseFloat(value)
        }
      })
      itemName = itemName.replace(/\|\s*$/, "")
      // THeme cake---------------
      let itemData = {
        "shortName": item.name,
        "longName": item.name,
        "variants": item.variantId || '',
        "skuCode": skuCode || '',
        "brandName": "Amma's Pastries",
        "accountName": "Amma's Website",
        "itemNature": "Goods",
        "quantity": parseInt(item.quantity),
        "unitPrice": price,
        "measuringUnit": "KG",
        "total": item.total,
        "note": data.customer_note || ''
      }
      totalAmount += (price * parseInt(item.quantity))
      if (item.variation_id) {
        let variantSkuCode = item.variation_id
        if (String(item.variation_id).includes('-')) {
          const sku = String(item.variation_id).split('-')
          variantSkuCode = data.currency === 'INR' ? sku[1] : sku[0]
        }
        itemData.options = [
          {
            "type": "Option",
            "name": itemName || item.name,
            "itemName": itemName || item.name,
            "variants": itemName || item.name,
            "skuCode": variantSkuCode || '',
            "quantity": parseInt(item.quantity),
            "unitPrice": 0,// TODO for Theme cake - parseFloat(item.price),
            "brandName": "Amma's Pastries",
            "accountName": "Amma's Website"
          }
        ]
      } else {
        itemData.options = []
      }
      // Backorder is seperated from normal order ---
      // let isBackOrder = false
      // metaData.forEach(({key, value}) => {
      //   if (key === 'shopengine_is_backordered' && value === 'yes') {
      //     isBackOrder = true
      //   }
      // })
      // isBackOrder ? backOrders.push(itemData) : normalOrders.push(itemData)
      // Back order -------------
      normalOrders.push(itemData)
      return itemData
    })

    const orders = []
    const invoiceNumber = `APW${data.id}`
    let deliveryDate = data.currency === 'AED' ? moment.tz('Asia/Dubai') : moment.tz('Asia/Kolkata')
    deliveryDate = deliveryDate.add(1, 'hours') // 1 hour later delivery
    if (backOrders.length && normalOrders.length) {
      let normalOrdersTotal = 0, backOrdersTotal = 0
      normalOrders.forEach(({total}) => normalOrdersTotal += parseFloat(total))
      backOrders.forEach(({total}) => backOrdersTotal += parseFloat(total))
      
      const normalOrderInfo = getShippingInfo(data, storeName, storeId, `${invoiceNumber}_1`, deliveryDate.format('YYYY-MM-DDTHH:mm:00.000'), normalOrdersTotal)
      normalOrderInfo.items = normalOrders
      orders.push(normalOrderInfo)

      let backOrderDeliveryDate = data.currency === 'AED' ? moment.tz('Asia/Dubai') : moment.tz('Asia/Kolkata')
      backOrderDeliveryDate = backOrderDeliveryDate.add(1, 'hours')
      backOrderDeliveryDate = backOrderDeliveryDate.add(1, 'days')
      const backOrderInfo = getShippingInfo(data, storeName, storeId, `${invoiceNumber}_2`, backOrderDeliveryDate.format('YYYY-MM-DDTHH:mm:00.000'), backOrdersTotal)
      backOrderInfo.items = backOrders
      orders.push(backOrderInfo)
    } else if (backOrders.length) {
      deliveryDate = deliveryDate.add(1, 'days') // 1 day later delivery
      deliveryDate = deliveryDate.format('YYYY-MM-DDTHH:mm:00.000')
      const orderInfo = getShippingInfo(data, storeName, storeId, invoiceNumber, deliveryDate, totalAmount)
      orderInfo.items = backOrders
      orders.push(orderInfo)
    } else {
      deliveryDate = deliveryDate.format('YYYY-MM-DDTHH:mm:00.000')
      const orderInfo = getShippingInfo(data, storeName, storeId, invoiceNumber, deliveryDate, totalAmount)
      orderInfo.items = normalOrders
      orders.push(orderInfo)
    }

    return orders
  } else {
    return null
  }
}

function postOrder (structuredData) {
  return new Promise((resolve, reject) => {
    // Send order to rishta system
    const tokenCreationTime = Math.floor(Date.now() / 1000);
    const jwtId = `${Math.ceil(Math.random() * 100000)}${Date.now()}`
    const payload = { iss: config.RISHTA_API_KEY, iat: tokenCreationTime, jti:  jwtId};
    const token = jwt.sign(payload, config.RISHTA_SECRET_KEY); //jwt library uses HS256 as default.
    // create headers
    const headers = {
      'x-api-key': config.RISHTA_API_KEY,
      'x-api-token': token,
      'content-type': 'application/json'
    }
    // Post request
    axios.post(config.RISHTA_SALE_URL, structuredData, { headers })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        console.log('Created order in Rishta: ', structuredData.invoiceNumber)
        // razorpay request
        resolve(true, response.statusText)
      } else {
        const error = response && response.response
        console.log('Failure: ', response.statusText)
        if (error) {
          axios.post(config.RISHTA_SUCCESS_CALLBACK_URL, {
            success: false,
            invoiceNumber: structuredData.invoiceNumber,
            reason: 'Failed to update order in the Rishta system'
          })
          resolve(false, `${error.status} ${error.statusText} ${error.data}`)
        }
      }
    })
    .catch(error => {
      console.log('Failure: ')
      if (error && error.response) {
        console.log(error.response.status, error.response.statusText, error.response.data)
        axios.post(config.RISHTA_SUCCESS_CALLBACK_URL, {
          success: false,
          invoiceNumber: structuredData.invoiceNumber,
          reason: 'Failed to update order in the Rishta system'
        })
        resolve(false, `${error.response.status} ${error.response.statusText} ${error.response.data}`)
      }
    })
  })
}

function createOrder (data, outlet) {
  return new Promise((resolve, reject) => {
    if (data.status === 'completed' || (data.currency === 'AED' && data.payment_method === 'cod')) {
      // 1. Create order data object
      const storeName = outlet.name,
            storeId   = outlet.storeId
      const structuredDataList = createOrderObject(data, storeName, storeId)

      // Multiple orders based on normal or backorder
      Promise.all(structuredDataList.map(structuredData => postOrder(structuredData)))
      .then((values) => {
        axios.post(config.RISHTA_SUCCESS_CALLBACK_URL, {
          success: true,
          invoiceNumber: data.id
        })
        resolve(values)
      });
    } else {
      reject('Order status is prohibited to be sent to rishta')
      return
    }
  })
}

const RishtaModule = {
  createOrder
}

module.exports = RishtaModule