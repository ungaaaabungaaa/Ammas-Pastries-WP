const AppConfig = {
  // App details
  PORT: 2023,
  // Database details
  DATABASE_ADDRESS: 'mongodb://localhost:27017/',
  DATABASE_NAME: 'ammas',
  MYSQL_DATABASE_HOST: 'localhost',
  MYSQL_DATABASE_PORT: '3306',
  MYSQL_DATABASE_USER: 'mysql_user',
  MYSQL_DATABASE_PASSWORD: 'test',
  DATABASE_OUTLETS_TABLE: 'outlets',
  DATABASE_UPDATETIME: 2 * 3600000,
  // Rishta details
  RISHTA_SALE_URL: 'https://api.ristaapps.com/v1/sale',
  RISHTA_API_KEY: '',
  RISHTA_SECRET_KEY: '',
  RISHTA_SUCCESS_CALLBACK_URL: '',
  SECURITY_KEY: 'Nk]Zo>{pcF0nG d54*k{C9J4!ku3)HL %z}/~tX^&8})B+}x9<',
  UAE_DEFAULT_OUTLET: {
    storeId: '',
    name: ''
  },
  INDIA_DEFAULT_OUTLET: {
    storeId: '',
    name: ''
  },
  // Geolocation details
  GOOGLE_MAP_API_KEY: 'FBza4I8uvSyCfYd6D5PQbx8reQAIqnguPKWut9p',
  // Delivery details
  DELIVERY_LOGIN_URL: 'https://api.pidge.in/v1.0/store/channel/vendor/login',
  DELIVERY_CREATEORDER_URL: 'https://api.pidge.in/v1.0/store/channel/vendor/order',
  DELIVERY_USERNAME: '9606450122',
  DELIVERY_PASSWORD: 'Ammas@123',
  DELIVERY_RELOGIN_TIMEOUT: 8 * 3600000,
  DELIVERY_SUCCESS_CALLBACK_URL: '',
  // Razorpay details
  RAZORPAY_ORDER_URL: 'https://api.razorpay.com/v1/orders',
  RAZORPAY_PAYMENT_URL: 'https://api.razorpay.com/v1/payments/',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: ''
}

module.exports = AppConfig