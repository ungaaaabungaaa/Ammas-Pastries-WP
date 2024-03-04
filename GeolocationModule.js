const axios = require('axios')
const config = require('./config')
let outlets = require('./outlets.json')


// Converts numeric degrees to radians
function toRad (Value) {
  return Value * Math.PI / 180;
}
//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function getDistance (lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

function getClosestOutlet (location) {
  if (location.lat && location.lng) {
    const outletsWithDistance = outlets.map(detail => {
      let distance = 0
      if (detail.latitude && detail.longitude) {
        distance = getDistance(detail.latitude, detail.longitude, location.lat, location.lng)
      }
      return {
        ...detail,
        distance
      }
    })
    return outletsWithDistance.sort((a,b) => a.distance - b.distance)[0]
  } else {
    return outlets[0]
  }
}

function getOutletDetails (data) {
  return new Promise((resolve, reject) => {
    let address = ''
    if (data.shipping) {
      const shipping = data.shipping
      address += `${shipping.company}+`
      address += `${shipping.address_1}+`
      address += `${shipping.address_2}+`
      address += `${shipping.city}+`
      address += `${shipping.state}+`
      address += `${shipping.country}+`
      address += `${shipping.postcode}`
    }

    const query = `address=${address}&key=${config.GOOGLE_MAP_API_KEY}`
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?${query}`)
    .then(response => {
      const result = response.data && response.data.results && response.data.results[0]
      if (result) {
        if (result.geometry && result.geometry.location) {
          const location = result.geometry.location
          const outlet = getClosestOutlet(location)
          resolve(outlet)
        }
      } else {
        if (config.UAE_DEFAULT_OUTLET.storeId && config.INDIA_DEFAULT_OUTLET.storeId) {
          if (data && data.currency === 'INR') {
            resolve(config.INDIA_DEFAULT_OUTLET)
          } else {
            resolve(config.UAE_DEFAULT_OUTLET)
          }
        } else {
          reject('Failed to resolve address')
        }
      }
    })
    .catch(error => {
      console.log('Failure: Fetch location failure')
      if (config.UAE_DEFAULT_OUTLET.storeId && config.INDIA_DEFAULT_OUTLET.storeId) {
        if (data && data.currency === 'INR') {
          resolve(config.INDIA_DEFAULT_OUTLET)
        } else {
          resolve(config.UAE_DEFAULT_OUTLET)
        }
      } else {
        reject('Failed to resolve address')
      }
    })
  })
}

const DeliveryModule = {
  getOutletDetails
}

module.exports = DeliveryModule