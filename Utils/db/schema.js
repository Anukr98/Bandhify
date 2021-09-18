export default `
    create table if not exists cart(id INTEGER PRIMARY KEY AUTOINCREMENT , product_id INTEGER , product_name VARCHAR2(255) , shop_id INTEGER , product_image VARCHAR2(255) , product_price VARCHAR2(255) , discount VARCHAR2(255) , quantity INTEGER , base_unit VARCHAR2(255) , stock INTEGER , shop_banner VARCHAR2(255) , shop_name VARCHAR2(255) , shop_distance VARCHAR2(255) , rating VARCHAR2(255) , is_subscribable VARCHAR2(20) , commission INTEGER , delivery_range STRING , latitude VARCHAR2(255) , longitude VARCHAR2(255));#
    create table if not exists coupon(id INTEGER PRIMARY KEY AUTOINCREMENT , coupon_id INTEGER , coupon_code VARCHAR2(255) , coupon_name VARCHAR2(255) , free_shipping VARCHAR2(255) , discount_applied VARCHAR2(255) , expiry VARCHAR2(255) , min_spend VARCHAR2(255) , max_spend VARCHAR2(255) , coupon_value VARCHAR2(255));#
`;