const postMethod = async (link , object , callback) => {
    fetch(link , object)
    .then(res => res.json())
    .then(response => {
        callback(null , response)
    })
    .catch(err => {
        console.log("inside catch",err)
    })
}

const filterTopRatedAndRegularProducts = (products , topRatedProducts) => {
    topRatedProducts.map(topProduct => {
        products.map(product => {
            if(topProduct.id === product.id) {
                products = products.filter(item => item.id !== topProduct.id)
            }
        })
    })
    topRatedProducts = topRatedProducts.map(item => {
        item.topSelling = true
        return item
    })
    return [products, topRatedProducts]
}

const distanceBetweenCoordinates = (coords1, coords2) => {
    const R = 6371e3
    const coords1LatitudeRad = coords1.latitude * Math.PI/180
    const coords2LatitudeRad = coords2.latitude * Math.PI/180
    const latDifferenceRad = (coords2.latitude - coords1.latitude) * Math.PI/180
    const longDifferenceRad = (coords2.longitude - coords1.longitude) * Math.PI/180
    const a = Math.sin(latDifferenceRad/2) * Math.sin(latDifferenceRad/2) + Math.cos(coords1LatitudeRad)*Math.cos(coords2LatitudeRad)*Math.sin(longDifferenceRad/2)*Math.sin(longDifferenceRad/2)
    const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    let d = (R*c)/1000
    d = Math.round(d).toFixed(2)
    return d
}

const updateCartQuery = async newProduct => `UPDATE CART SET product_name = '${newProduct?.product?.product_name}', shop_id = ${newProduct?.shop_id}, product_image = '${newProduct?.product?.product_image}', product_price = '${newProduct?.product_price}', discount = '${newProduct?.product_discount}', base_unit = '${newProduct?.product?.base_unit}', stock = ${newProduct?.product_daily_stock_remaining}, is_subscribable = '${newProduct?.product?.is_subscribable_product}', commission = ${newProduct?.product_commission}  WHERE product_id = '${newProduct.id}'`

export { postMethod , filterTopRatedAndRegularProducts, distanceBetweenCoordinates, updateCartQuery }