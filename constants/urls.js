import Config from './config';

const urls = {
  sendOTP: Config + 'api/auth/send-otp',
  verifyOTP: Config + 'api/auth/verify-otp',
  signUp: Config + 'api/auth/signup',
  GET_SHOPS: Config + 'api/shop/active',
  GET_CAROUSEL_IMAGES: Config + 'api/admin/get-banner',
  GET_PRODUCTS: Config + 'api/shop/product/all',
  GET_CITIES: Config + 'api/address/city/all',
  GET_LOCALITIES: Config + 'api/address/locality/all',
  ADD_ADDRESS: Config + 'api/address/create',
  GET_ALL_ORDERS: Config + 'api/order/all',
  GET_ALL_ADDRESSES: Config + 'api/user/profile',
  GET_DELIVERY_SLOTS: Config + 'api/admin/get-delivery-slots',
  GET_UPDATED_PRICES: Config + 'api/shop/product/get',
  UPDATE_ADDRESS: Config + 'api/address/update',
  GET_COUPONS: Config + 'api/coupon/all',
  APPLY_COUPON: Config + 'api/coupon/apply',
  PLACES_API:
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?',
  CREATE_ORDER: Config + 'api/order/create',
  CREATE_REVIEW: Config + 'api/review/create',
  DELETE_ADDRESS: Config + 'api/address/delete',
  ADD_IMAGE: Config + 'api/image/upload',
  UPDATE_PROFILE: Config + 'api/user/update',
  PAUSE_SUCSCRIPTION: Config + 'api/order/update',
  GET_NOTIFICATIONS: Config + 'api/user/notifications/all',
  MARK_NOTIFICATIONS: Config + 'api/user/notifications/mark-read',
  GET_DELIVERY_CHARGE: Config + 'api/admin/get-delivery-charge',
  GENERATE_PAYMENT_TOKEN: Config + 'api/order/create/paytm-token',
  HELP: Config + 'api/user/support',
};

export default urls;
