import React, { useEffect , useState } from 'react'
import { View, Text, BackHandler, FlatList , Image, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Icon } from 'native-base'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import styles from './styles'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import GIFLoading from '../../Components/GIFLoading/GIFLoading'
import { width } from '../../../constants/dimensions'
import Application from '../../../Utils/db/Application'
import Geolocation from 'react-native-geolocation-service'
import Modal from 'react-native-modal'
import { strings } from '../../../constants/strings'
import { showMessage } from 'react-native-flash-message'
import moment from 'moment'

const Orders = () => {

    const [orders, setOrders] = useState([])
    const [isGettingData, setIsGettingData] = useState(true)
    const [token, setToken] = useState('')
    const [discrepencyFlag, setDiscrepencyFlag] = useState('')
    const [isDiscrepencyModalAvailable, setIsDiscrepencyModalAvailable] = useState(false)
    const [isDifferentShopModalVisible, setIsDifferentShopModalVisible] = useState(false)
    const [tempItem, setTempItem] = useState(undefined)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus' , async () => {
            setToken(await AsyncStorage.getItem('token'))
            getOrders('onFocus')
        })
        return () => {
            unsubscribe()
            backButtonAction.remove()
        }
    },[])

    const navigation = useNavigation()

    const handleBackButtonClick = () => {
        navigation.navigate('ProfileScreen')
        return true
    }

    const getOrders = async direction => {
        setIsGettingData(true)
        let bearerToken = await AsyncStorage.getItem('token')
        let userId = await AsyncStorage.getItem('user_id')

        let object = {
            method : 'GET',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${bearerToken}`
            }
        }
        postMethod(`${urls.GET_ALL_ORDERS}?user_id=${userId}&with_order_reviews=true&order_by=desc` , object , (err,result) => {
            setIsGettingData(false)
            if(err)
                console.log(err)

            else if(result.status && result.code === 200)
                setOrders(result.orders)
            else {
                showMessage({
                    icon : 'danger',
                    style : { backgroundColor : colors.BLACK },
                    message : 'Could not load your orders',
                    duration : 1400,
                    floating : true
                })
                setOrders([])
            }
        })
    }

    const getShops = async (position , shop_id) => {
        const { latitude , longitude } = position.coords
        let returnValue = {}
        let object = {
            method : 'GET',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${token}`
            }
        }

        let x = await fetch(`${urls.GET_SHOPS}?latitude=${latitude}&longitude=${longitude}` , object)
            .then(res => res.json())
            .then(result => {
                return new Promise((resolve,reject) => {
                    if(result.status && result.code === 200) {
                        result.shop.forEach(element => {
                            if(element.id === shop_id) {
                                returnValue.rating = element.review_avg_rating
                                returnValue.distance = element.address.distance
                                returnValue.banner = element.shop_banner
                                returnValue.range = element.shop_delivery_range
                                returnValue.latitude = element.address.latitude
                                returnValue.longitude = element.address.longitude
                                resolve(1)
                            }
                        })
                    }
                    else
                        reject(0)
            })
        })

        if(x === 1)
            return returnValue
    }

    const reorder = async orderDetails => {
        setTempItem(orderDetails)
        setIsGettingData(true)
        const { order_products , shop_id , is_subscription_order } = orderDetails

        const geoSuccess = async position => {
            let returnObject = await getShops(position,shop_id)
            let shopProductIds = [] , insertFlag = false

            //GET SHOP PRODUCT IDS , QUANTITY , AND PRICE OF PREVIOSULY ORDERED PRODUCTS
            order_products.forEach(product => {
                shopProductIds.push({
                    id : product.shop_product_id,
                    quantity : product.product_quantity,
                    price : product.product_total_amount,
                    priceFlag : false,
                    quantityFlag : false,
                })
            })
            //GET PRODUCTS OF THE SHOP FROM WHICH IT WAS PREVIOUSLY ORDERED TO TALLY AVAILIBILITY AND CHANGE IN PRICE
            let object = {
                method : 'GET',
                headers : {
                    Accept : 'application/json',
                    'Content-Type' : 'application/json',
                    Authorization : `Bearer ${token}`
                }
            }
            postMethod(`${urls.GET_PRODUCTS}?selling_products=true&shop_id=${shop_id}` , object , async (err,result) => {
                if(err)
                    console.log(err)

                else if(result.status && result.code === 200) {
                    result.products.selling_products.map(liveProduct => {
                        shopProductIds.map(orderedProduct => {
                            let priceChangeFlag = false
                            let quantityUnavailableFlag = false

                            //MATCH PRODUCT IDS
                            if(orderedProduct.id === liveProduct.id) {
                                //CHECK WHETHER ITEM IS IN STOCK OR NOT
                                if(orderedProduct.quantity > liveProduct.product_daily_stock_remaining)
                                    quantityUnavailableFlag = true
                                //CHECK WHETHER PRICE HAS CHANGED OR NOT
                                if(orderedProduct.price !== liveProduct.product_price)
                                    priceChangeFlag = true

                                const { product_price , product_discount , product_daily_stock_remaining , product_commission } = liveProduct
                                const { product_name , product_image , base_unit } = liveProduct.product
                                const { shop_name } = result.shop

                                orderedProduct.priceFlag = priceChangeFlag
                                orderedProduct.quantityFlag = quantityUnavailableFlag
                                orderedProduct.price = product_price
                                orderedProduct.discount = product_discount
                                orderedProduct.stock = product_daily_stock_remaining
                                orderedProduct.name = product_name
                                orderedProduct.shop_id = shop_id
                                orderedProduct.product_image = product_image
                                orderedProduct.base_unit = base_unit
                                orderedProduct.banner = returnObject.banner
                                orderedProduct.shop_name = shop_name
                                orderedProduct.shop_distance = returnObject.distance
                                orderedProduct.rating = returnObject.rating,
                                orderedProduct.range = returnObject.range
                                orderedProduct.commission = product_commission
                                orderedProduct.latitude = returnObject.latitude,
                                orderedProduct.longitude = returnObject.longitude
                            }
                        })
                    })

                    //ENSURE THAT ALL PRODUCTS CAN BE SAFELY ADDED TO CART
                    for(let i = 0 ; i < shopProductIds.length ; i++) {
                        let item = shopProductIds[i]
                        if(item.quantityFlag) {
                            insertFlag = false
                            setDiscrepencyFlag('quantity')
                            setIsDiscrepencyModalAvailable(true)
                            break
                        }
                        else if(item.priceFlag) {
                            insertFlag = false
                            setDiscrepencyFlag('price')
                            setIsDiscrepencyModalAvailable(true)
                            break
                        }
                        else
                            insertFlag = true
                    }

                    setIsGettingData(false)

                    if(insertFlag) {
                        let cart = await Application.executeQuery(`SELECT * FROM CART`)
                        if(cart.length == 0) {
                            let flag = false
                            shopProductIds.forEach(product => {
                                //ENSURE THAT ALL DETAILS OF A PRODUCT ARE THERE OTHERWISE TREAT IT AS ONE THAT CANNOT BE ADDED IE UNAVAILABLE
                                if(product.name === undefined) {
                                    setDiscrepencyFlag('unavailable')
                                    setIsDiscrepencyModalAvailable(true)
                                    flag = true
                                }
                                // else
                                //     await Application.executeQuery(`INSERT INTO CART(product_id , product_name , shop_id , product_image , product_price , discount , quantity , base_unit , stock , shop_banner , shop_name , shop_distance , rating) VALUES('${product.id}' , '${product.name}' , ${product.shop_id} , '${product.product_image}' , '${product.price}' , '${product.discount}' , ${product.quantity} , '${product.base_unit}' , ${product.stock} , '${product.banner}' , '${product.shop_name}' , '${product.shop_distance}' , '${product.rating}')`)
                            })
                            if(!flag) {
                                shopProductIds.forEach(async product => {
                                    await Application.executeQuery(`INSERT INTO CART(product_id , product_name , shop_id , product_image , product_price , discount , quantity , base_unit , stock , shop_banner , shop_name , shop_distance , rating , is_subscribable , commission , delivery_range , latitude , longitude) VALUES('${product.id}' , '${product.name}' , ${product.shop_id} , '${product.product_image}' , '${product.price}' , '${product.discount}' , ${product.quantity} , '${product.base_unit}' , ${product.stock} , '${product.banner}' , '${product.shop_name}' , '${product.shop_distance}' , '${product.rating}' , '${is_subscription_order}' , ${product.commission} , '${product.range}' , '${product.latitude}' , '${product.longitude}')`)
                                })
                                navigation.navigate('CartScreen')
                            }
                        }
                        else {
                            let flag = false
                            if(cart.item(0).shop_id === shopProductIds[0].shop_id) {
                                await Application.clearCart()
                                shopProductIds.forEach(product => {
                                    if(product.name === undefined) {
                                        setDiscrepencyFlag('unavailable')
                                        setIsDiscrepencyModalAvailable(true)
                                        flag = true
                                    }
                                })

                                if(!flag) {
                                    shopProductIds.forEach(async product => {
                                        await Application.executeQuery(`INSERT INTO CART(product_id , product_name , shop_id , product_image , product_price , discount , quantity , base_unit , stock , shop_banner , shop_name , shop_distance , rating , is_subscribable , commission , delivery_range, latitude, longitude) VALUES('${product.id}' , '${product.name}' , ${product.shop_id} , '${product.product_image}' , '${product.price}' , '${product.discount}' , ${product.quantity} , '${product.base_unit}' , ${product.stock} , '${product.banner}' , '${product.shop_name}' , '${product.shop_distance}' , '${product.rating}' , '${is_subscription_order}' , ${product.commission} , '${product.range}' , '${product.latitude}' , '${product.longitude}')`)
                                    })
                                    navigation.navigate('CartScreen')
                                }
                            }
                            else
                                setIsDifferentShopModalVisible(true)
                        }
                    }
                }

                else {
                    showMessage({
                        icon: "info",
                        message: "Could not add products",
                        floating: true,
                        style: {backgroundColor: colors.BLACK}
                    })
                    setIsGettingData(true)
                }
            })
        }

        const geoFailure = () => {
            alert('problem getting location')
        }

        Geolocation.getCurrentPosition(geoSuccess , geoFailure , {
            enableHighAccuracy : true,
            forceRequestLocation : true,
            showLocationDialog : true
        })
    }

    const renderItem = ({ item }) => {
        const { is_subscription_order, shop, order_products, order_net_amount, created_at, delivered_at, order_status, slot } = item
        const { address, shop_profile } = shop
        const deliveryTime = `${slot.slice(0,2)}-${slot.slice(14,16)} ${slot.slice(-2)}`
        return (
            <TouchableWithoutFeedback style = {styles.listItemContainer} onPress = {() => navigation.replace('OrderDetails' , {orderDetails : item})}>
                <View style = {styles.listItemInnerContainer}>
                    <View style = {styles.listItemHeader}>
                        <View style = {styles.listItemImageArea}>
                            <View style = {styles.listItemImageContainer}>
                                <Image
                                    source = {{ uri: shop_profile }}
                                    style = {{ width : '100%' , height : 50 }}
                                    resizeMode = 'contain'
                                />
                            </View>
                            <View style = {styles.listItemAddressContainer}>
                                <Text style = {styles.listItemShopName}>{item.shop.shop_name}</Text>
                                <Text style = {styles.listItemShopLocation} numberOfLines = {2}>{address?.address_line_1}, {address?.address_line_2}, {address?.city?.city}, {address?.state}, {address?.pincode}</Text>
                            </View>
                        </View>
                        <View style = {styles.listItemSubtotalArea}>
                            <Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 15 , fontWeight : '600' }}>₹ {order_net_amount}</Text>
                        </View>
                    </View>

                    <View style = {[styles.listItemDetails , { position : 'relative' }]}>
                        {
                            is_subscription_order === 1 && <View style = {styles.subscriptionOrder}>
                                <Text style = {{ color : colors.DUSKY_BLACK_TEXT , fontFamily : ColorsText.regular.fontFamily , fontSize : 16 }}>SUBSCRIPTION ORDER</Text>
                            </View>
                        }
                        <View style = {styles.listItemItems}>
                            <Text style = {styles.titleText}>Items</Text>
                            <View style = {{ flexDirection : 'row' , alignItems : 'center' }}>
                                {
                                    order_products.map((orderItem, index) => <Text key = {orderItem.id} style = {styles.orderParticulars}>{orderItem.product_quantity}x {orderItem?.shop_product?.product?.product_name}{index < order_products.length-1 && ', '}</Text>)
                                }
                            </View>
                        </View>
                        <View style = {styles.listItemOrderDateContainer}>
                            <Text style = {styles.titleText}>Ordered On</Text>
                            <Text style = {styles.descriptionText}>{moment(created_at).format('DD MMM YYYY')}</Text>
                        </View>
                        <View style = {styles.listItemOrderDateContainer}>
                            <Text style = {styles.titleText}>Delivered On</Text>
                            <Text style = {styles.descriptionText}>{delivered_at ? item?.delivery_date : `Your order will be delivered by ${moment(item.delivery_date, 'DD-MM-YYYY').format('DD MMM')} between ${deliveryTime}`}</Text>
                        </View>
                        <View style = {styles.listItemOrderDateContainer}>
                            <Text style = {styles.titleText}>Order Status</Text>
                            <Text style = {styles.descriptionText}>{order_status}</Text>
                        </View>
                    </View>

                    <View style = {styles.reorderContainer}>
                        <Pressable
                            style = {styles.reorderButton}
                            hitSlop = {20}
                            onPress = {() => reorder(item)}
                        >
                            <Icon
                                active
                                type = 'Ionicons'
                                name = 'ios-reload-outline'
                                style = {{ fontSize : 14 , color : colors.ROYAL_BLUE , marginRight : '4%' }}
                            />
                            <Text style = {{ fontSize : 14, color : colors.ROYAL_BLUE }}>Reorder</Text>
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    const EmptyComponent = () => <View>
        <View style = {{ position : 'relative' }}>
            <Image
                source = {require('../../../assets/Images/no_orders.png')}
                style = {{ width , height : 350 }}
                resizeMode = 'contain'
            />
            <View style = {styles.emptyListTextContainer}>
                <View style = {styles.emptyListInnerTextContainer}><Text style = {styles.emptyListText}>NO ORDERS YET</Text></View>
                <View style = {[styles.emptyListInnerTextContainer, { marginBottom: '4%' }]}><Text style = {styles.emptyListSubText}>{strings.NO_ORDERS}</Text></View>

                <View style = {styles.startOrderButtonContainer}>
                    <Pressable
                        style = {styles.startOrderingButton}
                        onPress = {() => navigation.navigate('HomeScreen')}
                        hitSlop = {20}
                        android_ripple = {{
                            color: colors.RIPPLE_COLORS.BLACK
                        }}
                    >
                        <Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 14 , color : colors.ROYAL_BLUE }}>Start Ordering</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    </View>

    if(isGettingData)
        return <GIFLoading />

    else
        return <View style = {{ flex : 1 , backgroundColor : colors.WHITE }}>
            <>
                <View style = {styles.innerHeader}>

                    <Modal
                        isVisible = {isDiscrepencyModalAvailable}
                        animationIn = 'tada'
                        animationInTiming = {700}
                        animationOut = 'zoomOut'
                        animationOutTiming = {500}
                        onBackdropPress = {() => setIsDiscrepencyModalAvailable(false)}
                    >
                        <View style = {[styles.modalContainer]}>
                            <View style = {styles.modalInnerContainer}>
                                <View style = {{ paddingTop : '6%' }}><Text style = {styles.alertText}>Alert</Text></View>
                                <View style = {{ marginTop : '3%' }}>
                                    <Text style = {styles.modalText}>{discrepencyFlag === 'quantity' ? strings.QUANTITY_UNAVAILABLE : discrepencyFlag === 'price' ? strings.PRICE_CHANGED : strings.UNAVAILIBILITY}</Text>
                                </View>
                            </View>
                            <View style = {styles.dismissModalContainer}>
                                <Pressable
                                    hitSlop = {25}
                                    style = {styles.dismissModalButton}
                                    onPress = {() => {
                                        setDiscrepencyFlag('')
                                        setIsDiscrepencyModalAvailable(false)
                                    }}
                                >
                                    <Text style = {{ fontFamily : ColorsText.regular.fontFamily , color : colors.MANGO_COLOR }}>OK</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        isVisible = {isDifferentShopModalVisible}
                        animationIn = 'tada'
                        animationInTiming = {700}
                        animationOut = 'zoomOut'
                        animationOutTiming = {500}
                        onBackdropPress = {() => setIsDifferentShopModalVisible(false)}
                    >
                        <View style = {[styles.modalContainer]}>
                            <View style = {{ marginBottom : '3%' , width : '100%' , paddingTop : '2%' }}><Text style = {[ColorsText.Bold , { fontSize : 18 , color : colors.MANGO_COLOR }]}>Replace cart items?</Text></View>
                            <View style = {{ marginBottom : '15%' , width : '100%' }}><Text style = {[ColorsText.regular , { color : '#999' , fontSize : 13 , letterSpacing : .3 }]}>{strings.DIFFERENT_SHOP_PRODUCTS}</Text></View>
                            <View style = {{ flexDirection : 'row' , position : 'absolute' , bottom : 10 , right : 20 , width : '100%' , alignItems : "center", justifyContent : 'flex-end' }}>
                                <View style = {[styles.modalButtonContainer , { marginRight : '3%' }]}>
                                    <Pressable
                                        onPress = {() => setIsDifferentShopModalVisible(false)}
                                        style = {styles.modalButton}
                                        hitSlop = {25}
                                    >
                                        <Text style = {styles.modalButtonText}>NO</Text>
                                    </Pressable>
                                </View>
                                <View style = {styles.modalButtonContainer}>
                                    <Pressable
                                        onPress = {async () => {
                                            await Application.clearCart().then(() => {
                                                setIsDifferentShopModalVisible(false)
                                                reorder(tempItem)
                                            })
                                        }}
                                        style = {styles.modalButton}
                                        hitSlop = {25}
                                    >
                                        <Text style = {styles.modalButtonText}>YES</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <View style = {styles.header}>
                        <Pressable onPress = {() => navigation.navigate('ProfileScreen')}>
                            <Icon
                                active
                                type = 'Ionicons'
                                name = 'arrow-back'
                                style = {{ marginRight : '2%' , color : colors.DUSKY_BLACK_TEXT }}
                            />
                        </Pressable>
                        <View><Text style = {styles.headerTitle}>YOUR ORDERS</Text></View>
                    </View>
                </View>

                <View style = {{ flex : 1 , width : '94%' , alignSelf : 'center' }}>
                    <FlatList
                        data = {orders}
                        renderItem = {renderItem}
                        ListEmptyComponent = {EmptyComponent}
                        showsVerticalScrollIndicator = {false}
                        onRefresh = {() => getOrders()}
                        refreshing = {isGettingData}
                    />
                </View>
            </>
        </View>
}

export default Orders