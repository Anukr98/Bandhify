import Config from './config'

const urls = {
    sendOTP: Config.BASE_URL + 'api/auth/send-otp',
    verifyOTP: Config.BASE_URL + 'api/auth/verify-otp',
    signUp: Config.BASE_URL + 'api/auth/signup',
    GET_SHOPS: Config.BASE_URL + 'api/shop/active',
    GET_CAROUSEL_IMAGES: Config.BASE_URL + 'api/admin/get-banner',
    GET_PRODUCTS: Config.BASE_URL + 'api/shop/product/all',
    GET_CITIES: Config.BASE_URL + 'api/address/city/all',
    GET_LOCALITIES: Config.BASE_URL + 'api/address/locality/all',
    ADD_ADDRESS: Config.BASE_URL + 'api/address/create',
    GET_ALL_ORDERS: Config.BASE_URL + 'api/order/all',
    GET_ALL_ADDRESSES: Config.BASE_URL + 'api/user/profile',
    GET_DELIVERY_SLOTS: Config.BASE_URL + 'api/admin/get-delivery-slots',
    GET_UPDATED_PRICES: Config.BASE_URL + 'api/shop/product/get',
    UPDATE_ADDRESS: Config.BASE_URL + 'api/address/update',
    GET_COUPONS: Config.BASE_URL + 'api/coupon/all',
    APPLY_COUPON: Config.BASE_URL + 'api/coupon/apply',
    PLACES_API: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?',
    CREATE_ORDER: Config.BASE_URL + 'api/order/create',
    CREATE_REVIEW: Config.BASE_URL + 'api/review/create',
    DELETE_ADDRESS: Config.BASE_URL + 'api/address/delete',
    ADD_IMAGE: Config.BASE_URL + 'api/image/upload',
    UPDATE_PROFILE: Config.BASE_URL + 'api/user/update',
    PAUSE_SUCSCRIPTION : Config.BASE_URL + 'api/order/update',
    GET_NOTIFICATIONS: Config.BASE_URL + 'api/user/notifications/all',
    MARK_NOTIFICATIONS: Config.BASE_URL + 'api/user/notifications/mark-read',
    GET_DELIVERY_CHARGE: Config.BASE_URL + 'api/admin/get-delivery-charge',
    GENERATE_PAYMENT_TOKEN: Config.BASE_URL + 'api/order/create/paytm-token',
    HELP: Config.BASE_URL + "api/user/support"
}

export default urls