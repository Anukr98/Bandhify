import { useNavigation } from '@react-navigation/native'
import React, { useEffect , useState } from 'react'
import { View, Text, BackHandler, TouchableWithoutFeedback, FlatList, Pressable, TouchableOpacity, Image } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import styles from './styles'
import Application from '../../../Utils/db/Application'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showMessage } from 'react-native-flash-message'
import { Icon } from 'native-base'
import { TouchableRipple } from 'react-native-paper'
import GIFLoading from '../../Components/GIFLoading/GIFLoading'
import moment from 'moment'
import Loader from '../../Components/Loader/Loader'
import Tooltip from 'react-native-walkthrough-tooltip';
import { strings } from '../../../constants/strings'
import { useStateValue } from '../../../Utils/StateProvider'
import Paytm from 'paytm_allinone_react-native'

const SUBSCRIPTION_SLOTS = [
    { value : 1 , label : '1 day'},
    { value : 7 , label : '1 week'},
    { value : 15 , label : 'Fortnight'},
    { value : 30 , label : '1 month'},
]

const SlotSelection = ({ route }) => {

    const { item } = route.params
    const { address_line_1, address_line_2, address_line_3, locality, city, state, pincode } = item
    const { id } = item
    const [{payable, deliveryFee, discount, cutOffValue}, dispatch] = useStateValue()

    const [slots, setSlots] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [orderCreating, setOrderCreating] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState({
        id : 'abcd1111'
    })
    const [showTooltip, setShowTooltip] = useState(false)
    const [showSubscriptionMenu, setShowSubscriptionMenu] = useState(false)
    const [token, setToken] = useState('')
    const [subscriptionSlot, setSubscriptionSlot] = useState(0)
    const [payingAmount, setPayingAmount] = useState(parseFloat(payable).toFixed(2))

    const navigation = useNavigation()

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus' , async () => {
            setIsLoading(true)
            // setSlots([])
            let res = await Application.executeQuery(`SELECT * FROM CART`) , flag = false
            for(let i = 0 ; i < res.length ; i++) {
                if(res.item(i).is_subscribable == 1)
                    flag = true
                else
                    flag = false
            }
            if(flag)
                setShowSubscriptionMenu(true)
                
            let token = await AsyncStorage.getItem('token')
            setToken(token)
            let object = {
                method : 'GET',
                headers : {
                    Accept : 'application/json',
                    'Content-Type' : 'application/json',
                    Authorization : `Bearer ${token}`
                }
            }
            postMethod(`${urls.GET_DELIVERY_SLOTS}?shop_id=${res.item(0).shop_id}` , object , (err,result) => {
                if(err)
                    console.log(err)
                else if(result.status && result.code === 200) {
                    setSlots(result.slots)
                    setTimeout(() => {
                        setIsLoading(false)
                    },500)
                }
                else {
                    setIsLoading(false)
                    showMessage({
                        icon : 'danger',
                        style : { backgroundColor : colors.BLACK },
                        message : 'Problem getting slots',
                        floating : true,
                        duration : 1200
                    })
                    setTimeout(() => {
                      navigation.replace('Checkout')  
                    },1000)
                }
            })
        })

        return () => {
            unsubscribe()
            backButtonAction.remove()
        }
    },[])

    const handleBackButtonClick = () => {
        navigation.replace('Checkout' , { focus : item.address_line_1 })
        return true
    }

    const renderItem = ({ item }) => {
        const selectSlot = item => {
            if(item.slot_disabled)
                showMessage({
                    message : 'This slot is unavailable',
                    floating : true,
                    duration : 1200,
                    icon : 'warning',
                    style : { backgroundColor : colors.BLACK }
                })
            else {
                if(selectedSlot.id !== 'abcd1111') {
                    if(selectedSlot.id !== item.id) {
                        // setIsSlotModalVisible(true)
                        setSelectedSlot(null)
                        setSelectedSlot(item)
                    }
                    else
                        setSelectedSlot({
                            id : 'abcd1111'
                        })
                }
                else {
                    setSelectedSlot(null)
                    setSelectedSlot(item)
                }
            }
        }

        return (
            <View style = {{ flex : 1 , margin : '.5%' , backgroundColor : selectedSlot.id === item.id ? colors.BUTTON_BACKGROUND_COLOR : colors.LIGHT_GRAY_BG_COLOR , paddingVertical : 5 , borderRadius : 4 , paddingHorizontal : 8 }}>
                <TouchableWithoutFeedback onPress = {() => selectSlot(item)}>
                    <View>
                        <Icon
                            active
                            type = 'Ionicons'
                            name = {item.slot_end.charAt(9).toLowerCase() === 'a' ? 'ios-sunny' : 'ios-moon'}
                            style = {{ fontSize : 20 , marginLeft : '3%' , color : selectedSlot.id === item.id ? colors.BUTTON_TEXT_COLOR : colors.BUTTON_TEXT_COLOR }}
                        />
                        <Text style = {{ color : colors.BUTTON_TEXT_COLOR , fontFamily : ColorsText.Medium.fontFamily }}>{item?.delivery_day}</Text>
                        <Text style = {{ color : colors.BUTTON_TEXT_COLOR , fontFamily : ColorsText.Medium.fontFamily }}>{moment(item?.delivery_date).format('D MMM, YYYY')}</Text>
                        <Text style = {{ color : colors.BUTTON_TEXT_COLOR , fontFamily : ColorsText.Bold.fontFamily }}>{item.slot_start.slice(0,5)} - {item.slot_end.slice(0,5)} {item.slot_end.slice(9)}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    const changeSubscriptionDays = item => {
        if(subscriptionSlot === item.value) {
            setPayingAmount(payable)
            setSubscriptionSlot(0)
        }

        else {
            setSubscriptionSlot(item.value)
            let amount = payable * item.value
            // if(amount > cutOffValue)
                setPayingAmount(amount)
            // else setPayingAmount(amount + deliveryFee)
        }
    }

    const HeaderComponent = () => <>
        <View style = {{ borderBottomColor : colors.LIGHT_GRAY_BG_COLOR , borderBottomWidth : 1.5 }}>
            <View style = {styles.details}>
                <View style = {{ flex : .2 }}>
                    <Text style = {{ color : colors.ROYAL_BLUE , fontFamily : ColorsText.Medium.fontFamily , fontSize : 15 }}>Deliver To</Text>
                </View>
                <View style = {{ flex : .8 , paddingLeft : '4%' }}>
                    <Text style = {{ fontFamily : ColorsText.Medium.fontFamily , fontSize : 16 }}>{item.name}</Text>
                    <Text style = {{ fontSize : 12 , color : colors.DUSKY_BLACK_TEXT , fontFamily : ColorsText.light.fontFamily , letterSpacing : .3 }}>{address_line_1}, {address_line_2}, {address_line_3}, {locality.locality}, {city.city}, {state}, {pincode} IN</Text>
                </View>
            </View>
        </View>

        <View style = {{ marginVertical : '4%' }}>
            <Text style = {styles.titleText}>Please choose a delivery slot:</Text>
        </View>
    </>

    const FooterComponent = () => <View style = {styles.paymentModeContainer}>
        <View style = {styles.innerPaymentModeContainer}>
            <View style = {{ display : showSubscriptionMenu ? 'flex' : 'none'}}>
                <View style = {styles.subscriptionContainer}>
                    <Text style = {styles.titleText}>Please select your preferred subscription</Text>
                    <View style = {{ flexDirection : 'row' , alignItems : 'center' }}>
                        <Text style = {styles.titleText}>duration:</Text>
                        <View>
                            <Tooltip
                                isVisible = {showTooltip}
                                content = {<View style = {{ paddingTop : '4%' , paddingHorizontal : '3%' }}>
                                    <Text style = {styles.tootltipTitle}>Why am I seeing this?</Text>
                                    <View style = {{ marginTop : '2%' , paddingBottom : '2%' }}>
                                        <Text style = {styles.tooltipText}>{strings.SUBSCRIBABLE_ORDER}</Text>
                                    </View>
                                </View>}
                                onClose = {() => setShowTooltip(false)}
                                placement = 'bottom'
                            >
                                <Pressable
                                    onPress = {() => setShowTooltip(true)}
                                >
                                    <Icon
                                        active
                                        type = 'AntDesign'
                                        name = 'questioncircle'
                                        style = {{ color : colors.ROYAL_BLUE , fontSize : 13 , marginLeft : '10%' }}
                                    />
                                </Pressable>
                            </Tooltip>
                        </View>
                    </View>
                </View>
                <View style = {styles.subscriptionSlotsContainer}>
                    {
                        SUBSCRIPTION_SLOTS.map((item,index) => <View key = {index} style = {[styles.subscriptionSlot , { backgroundColor : subscriptionSlot === item.value ? colors.BUTTON_BACKGROUND_COLOR : colors.LIGHT_GRAY_BG_COLOR }]}>
                            <Pressable
                                onPress = {() => changeSubscriptionDays(item)}
                                style = {styles.slotButton}
                            >
                                <Text style = {{ color : colors.BUTTON_TEXT_COLOR , fontFamily : ColorsText.Medium.fontFamily }}>{item.label}</Text>
                            </Pressable>
                        </View>)
                    }
                </View>
            </View>
        </View>
    </View>

    const createPaymentToken = () => {
        if(selectedSlot.id === 'abcd1111')
            showMessage({
                icon : 'info',
                style : { backgroundColor : colors.BLACK },
                message : "Please select a delivery slot",
                floating : true
            })
        else {
            setOrderCreating(true)
            let object = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    'address_id': id,
                    "callbackUrl": "https://merchant-website.com/callback",
                    "txnAmount": {
                        "value": payingAmount > cutOffValue ? parseFloat(payingAmount).toFixed(2) : parseFloat(+payingAmount + +deliveryFee).toFixed(2),
                        "currency": "INR"
                    }
                })
            }
            postMethod(urls.GENERATE_PAYMENT_TOKEN, object, (err,result) => {
                if(err) console.log(err)
                else if(result.status && result.code === 200) {
                    const { orderId, mid, tranxToken, callbackUrl, isStaging } = result
                    Paytm.startTransaction(orderId, mid, tranxToken, payingAmount.toString(), callbackUrl, isStaging, false).then(res => {
                        const { ORDERID, STATUS, RESPMSG, TXNID } = res
                        console.log(res)
                        if(STATUS === strings.PAYMENT_STATUS.SUCCESS)
                            createOrder(ORDERID, RESPMSG, TXNID)
                        if(STATUS === strings.PAYMENT_STATUS.FAILURE) {
                            setOrderCreating(false)
                            showMessage({
                                icon: 'info',
                                floating: true,
                                message: RESPMSG,
                                style: {backgroundColor: colors.BLACK},
                                duration: 5000
                            })
                        }
                        if(STATUS === strings.PAYMENT_STATUS.PENDING) {
                            setOrderCreating(false)
                            showMessage({
                                icon: "info",
                                floating: true,
                                message: RESPMSG,
                                style: {backgroundColor: colors.BLACK},
                                duration: 5000
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        setTimeout(() => {
                          setOrderCreating(false)
                        },400)
                        showMessage({
                            floating: true,
                            icon: 'info',
                            style: {backgroundColor: colors.BLACK},
                            message: strings.TRANSACTION_FAILED
                        })
                    })
                }
                else {
                    setOrderCreating(false)
                    showMessage({
                        message: strings.PAYMENT_INITIATION_FAIL,
                        icon: 'info',
                        style: {backgroundColor: colors.BLACK},
                        floating: true
                    })
                }
            })
        }
    }

    const createOrder = async (orderid, transaction_message, transaction_token) => {
        setOrderCreating(true)
        let order_total_amount = 0 , cart = [] , order_commission = 0 , coupon_code = '' , coupon_id
        let cartItems = await Application.executeQuery(`SELECT * FROM CART`)
        let couponDetails = await Application.executeQuery(`SELECT * FROM COUPON`)

        for(let i = 0 ; i < cartItems.length ; i++) {
            const { product_id , quantity , product_price , discount , commission } = cartItems.item(i)
            order_total_amount = order_total_amount + (quantity * product_price)
            order_commission = order_commission + (quantity * commission)
            cart.push({
                'shop_product_id' : product_id,
                'product_quantity' : quantity,
                'product_total_amount' : product_price,
                'product_discount' : discount,
                'product_net_amount' : (parseFloat(product_price))*parseFloat(quantity),
                'product_commission' : commission
            })
        }
        console.log(cart)


        if(couponDetails.length > 0) {
            coupon_code = couponDetails.item(0).coupon_code
            coupon_id = couponDetails.item(0).coupon_id
        }
        // console.log("order comm",parseFloat(order_commission).toFixed(2) - +discount)
        let object = {
            method : 'POST',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${token}`
            },
            body : {
                "order_id": orderid,
                'shop_id' : cartItems.item(0).shop_id,
                'address_id' : item.id,
                'slot' : `${selectedSlot.slot_start} - ${selectedSlot.slot_end}`,
                'slot_key': selectedSlot.key ,
                'delivery_date' : selectedSlot.delivery_date,
                'number_of_days' : subscriptionSlot > 1 ? subscriptionSlot : 1,
                order_total_amount: subscriptionSlot > 1 ? (order_total_amount * subscriptionSlot) : order_total_amount,
                'order_discount': discount,
                order_commission: subscriptionSlot > 1 ? ((parseFloat(order_commission).toFixed(2) - +discount)*subscriptionSlot) : parseFloat(order_commission).toFixed(2) - +discount,
                'order_net_amount' : parseFloat(payingAmount) > cutOffValue ? parseFloat(payingAmount).toFixed(2) : parseFloat(+payingAmount + +deliveryFee).toFixed(2),
                cart,
                'delivery_charge' : payingAmount > cutOffValue ? 0 : deliveryFee,
                transaction_message,
                transaction_token
            }
        }
        if(coupon_code)
            object.body['coupon_id'] = coupon_id
        object.body = JSON.stringify(object.body)

        postMethod(urls.CREATE_ORDER , object , async (err,result) => {
            if(err) console.log(err)
            else if(result.status && result.code === 201) {
                await Application.clearCart()
                await Application.executeQuery(`DELETE FROM COUPON`)
                await AsyncStorage.setItem("addressLatitude", item.latitude.toString())
                await AsyncStorage.setItem("addressLongitude", item.longitude.toString())
                await AsyncStorage.setItem("location", item.address_line_1 + "," + item.address_line_2 + "," + item.address_line_3 + "," + item.locality.locality + "," + item.city.city + "," + item.state + "," + item.pincode + "," + item.country)
                showMessage({
                    icon : "success",
                    type : 'success',
                    duration : 1400,
                    floating : true,
                    message : result.message
                })
                setTimeout(() => {
                    setOrderCreating(false)
                    navigation.navigate('Orders')
                },1200)
            }
            else {
                setOrderCreating(false)
                alert('something went wrong')
                console.log(result)
            }
        })
    }

    if(isLoading)
        return <GIFLoading />

    else return <View style = {{ flex : 1 }}>
        <View style = {styles.innerContainer}>
            <View style = {{ paddingLeft : 12 , paddingTop : 8 }}><TouchableWithoutFeedback onPress = {() => navigation.replace('Checkout' , { focus : item.address_line_1 })}><Icon active type = 'Ionicons' name = 'arrow-back' style = {{ color : colors.DUSKY_BLACK_TEXT }} /></TouchableWithoutFeedback></View>
            <View style = {styles.logoArea}>
                <View style = {styles.logoInnerContainer}>
                    <TouchableOpacity style = {{ width: '70%' }} activeOpacity = {.6} onPress = {() => navigation.replace('Home')}>
                        <Image
                            source = {require('../../../assets/Images/logo2.png')}
                            style = {{ width: '60%', height: 80 }}
                            resizeMode = 'cover'
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {
                orderCreating && <Loader />
            }
            <View style = {{ width : '93%' , alignSelf : 'center' , marginVertical : '4%', flex: 1 }}>
                <FlatList
                    data = {slots}
                    renderItem = {renderItem}
                    numColumns = {3}
                    ListHeaderComponent = {HeaderComponent}
                    ListFooterComponent = {FooterComponent}
                />
            </View>

            <View style = {styles.proceedButtonContainer}>
                <View style = {{ flex : .5 , justifyContent : 'center' , alignItems : 'center' }}>
                    <Text style = {{ fontFamily : ColorsText.light.fontFamily , fontSize : 14 }}>Net payable Amount</Text>
                    <Text style = {{ fontFamily : ColorsText.Bold.fontFamily , fontSize : 17 , marginVertical : '1%' }}>₹{payingAmount > cutOffValue ? parseFloat(payingAmount).toFixed(2) : parseFloat(+payingAmount + +deliveryFee).toFixed(2)}</Text>
                </View>
                <View style = {{ flex : .5 }}>
                    <TouchableRipple
                        style = {styles.proceedButton}
                        onPress = {createPaymentToken}
                        rippleColor = {colors.RIPPLE_COLORS.BLACK}
                    >
                        <Text style = {styles.proceedButtonText}>Proceed to pay</Text>
                    </TouchableRipple>
                </View>
            </View>
        </View>
    </View>
}

export default SlotSelection