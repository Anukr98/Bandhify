import React, { useEffect, useState } from 'react'
import { View, Text, BackHandler, TextInput, FlatList, Pressable, ActivityIndicator, Image } from 'react-native'
import styles from './styles'
import { useNavigation } from '@react-navigation/native'
import colors from '../../../constants/colors'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showMessage } from 'react-native-flash-message'
import GIFLoading from '../../Components/GIFLoading/GIFLoading'
import { Icon } from 'native-base'
import Application from '../../../Utils/db/Application'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { TouchableRipple } from 'react-native-paper'
import Loader from '../../Components/Loader/Loader'
import Dash from 'react-native-dash'
import { strings } from '../../../constants/strings'
import ColorsText from '../../../constants/ColorsText'
import { height } from '../../../constants/dimensions'

const Coupons = () => {

    const navigation = useNavigation()

    const [isLoading, setIsLoading] = useState(true)
    const [availableCoupons, setAvailableCoupons] = useState([])
    const [subtotal, setSubtotal] = useState(0)
    const [token, setToken] = useState('')
    const [isCouponApplying, setIsCouponApplying] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState('')
    const [couponFilter, setCouponFilter] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [shopId, setShopId] = useState('')

    useEffect(() => {
        const backActionButton = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus', async () => {
            setIsLoading(true)
            let cart = await Application.executeQuery(`SELECT * FROM CART`), total = 0
            for (let i = 0; i < cart.length; ++i)
                total = total + (cart.item(i).quantity * cart.item(i).product_price)
            setSubtotal(parseFloat(total).toFixed(2))
            setShopId(cart.item(0).shop_id)
            getCoupons()
        })
        return () => {
            backActionButton.remove()
            unsubscribe()
        }
    }, [])

    const handleBackButtonClick = () => {
        navigation.navigate('CartScreen', {
            direction: 'Coupon'
        })
        return true
    }

    const getCoupons = async () => {
        let authToken = await AsyncStorage.getItem('token')
        setToken(authToken)
        const shopId = await Application.executeQuery(`SELECT shop_id FROM CART`)
        const { shop_id } = shopId.item(0)
        let object = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            }
        }
        postMethod(`${urls.GET_COUPONS}?is_active=1&valid_coupon=1&coupon_types=1,3&shop_id=${shop_id}`, object, (err, result) => {
            setTimeout(() => {
                setIsLoading(false)
            },400)
            if (err) console.log(err)
            else if (result.status && result.code === 200)
                setAvailableCoupons(result.coupons)
            else
                showMessage({
                    icon: 'danger',
                    floating: true,
                    duration: 1200,
                    message: result.message,
                    style: {backgroundColor: colors.BLACK}
                })
        })
    }

    const applyCoupon = (coupon,direction) => {
        setIsCouponApplying(true)
        let object = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                'coupon_code' : direction === 'typed' ? couponFilter : coupon.coupon_code,
                'cart_total': subtotal,
                'shop_id' : shopId
            })
        }
        postMethod(urls.APPLY_COUPON, object, async (err, result) => {
            if (err)
                console.log(err)

            else if (result.status && result.code === 200 && result.coupon.applied) {
                const { cart_total , cart_net_total , coupon_name , coupon_code , free_shipping , end_date , maximum_spend , minimum_spend , coupon_value , coupon_id } = result.coupon
                // console.log(result)
                let discount = cart_total - cart_net_total
                let couponDetails = await Application.executeQuery(`SELECT * FROM COUPON`)
                if (couponDetails.length == 0)
                    await Application.executeQuery(`INSERT INTO COUPON(coupon_id , coupon_code , coupon_name , free_shipping , discount_applied , expiry , min_spend , max_spend , coupon_value) VALUES(${coupon_id} , '${coupon_code}' , '${coupon_name}' , '${free_shipping}' , '${discount}' , '${end_date}' , '${minimum_spend}' , '${maximum_spend}' , '${coupon_value}')`)
                else {
                    if (couponDetails.item(0).coupon_code !== coupon_code)
                        await Application.executeQuery(`UPDATE COUPON SET coupon_id = ${coupon_id} coupon_code = '${coupon_code}' , coupon_name = '${coupon_name}' , free_shipping = '${free_shipping}' , discount_applied = '${discount}' , expiry = '${end_date}' , min_spend = '${minimum_spend}' , max_spend = '${maximum_spend}' , coupon_value = '${coupon_value}' WHERE coupon_code = '${couponDetails.item(0).coupon_code}'`)
                    setAppliedCoupon(coupon.coupon_code)
                }
                setTimeout(() => {
                    setIsCouponApplying(false)
                    navigation.navigate('CartScreen')
                },800)
                setTimeout(() => {
                    showMessage({
                        icon: 'success',
                        type: 'success',
                        message: result.message,
                        floating: true,
                        duration: 1000
                    })
                },1000)
            }
            else {
                setTimeout(() => {
                    setIsCouponApplying(false)
                }, 800)
                setTimeout(() => {
                    showMessage({
                        icon: 'warning',
                        floating: true,
                        duration: 1800,
                        message: result.message,
                        style: {backgroundColor: colors.BLACK}
                    })
                },1000)
            }
        })
    }

    const renderItem = ({ item }) => {
        return (
            <View style={styles.couponContainer}>
                <View style={styles.couponInnerContainer}>
                    <View style={styles.couponCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.couponName}>
                                <Text style={styles.nameOfCOupon}>{item.coupon_name}</Text>
                            </View>
                            <View>
                                <TouchableRipple
                                    onPress={() => applyCoupon(item , 'list')}
                                    rippleColor={colors.WHITE}
                                >
                                    <Text style={styles.applyText}>{appliedCoupon.coupon_code === item.coupon_code ? 'Applied' : 'Apply'}</Text>
                                </TouchableRipple>
                            </View>
                        </View>
                        <View style={styles.couponDescription}>
                            <Text>{item?.coupon_description}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const filterCoupons = async (text) => {
        setCouponFilter(text)
        setIsTyping(true)
        if (text.length == 0) {
            getCoupons()
            setTimeout(() => {
                setIsTyping(false)
            },600)
        }
        else {
            let authToken = await AsyncStorage.getItem('token')
            let object = {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                }
            }
            postMethod(`${urls.GET_COUPONS}?search=${text}`, object, (err, result) => {
                setTimeout(() => {
                    setIsTyping(false)
                },600)
                if (err) console.log(err)
                else if (result.status && result.code === 200)
                    setAvailableCoupons(result.coupons)
                else
                    setAvailableCoupons([])
            })
        }
    }

    const EmptyComponent = () => (
        <View style = {{ flex : 1 , alignItems : "center" }}>
            <Image
               style={{ width: '100%' , height : height * 0.5 }}
               source={require('../../../assets/Images/undraw_blank_canvas_3rbb.png')}
               resizeMode = 'contain'
            />
            <Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 17 , color : colors.ROYAL_BLUE}}>{couponFilter.length > 0 ? 'No coupons found based on your given criteria' : 'Search and start ordering now :D'}</Text>
        </View>
    )

    if(isLoading)
        return <GIFLoading />

    else
        return (
            <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
                <>
                    <View style={styles.headerContainer}>
                        {
                            isCouponApplying && <Loader />
                        }
                        <View style={styles.headerInner}>
                            <View style={{ flex: .1 }}>
                                <TouchableWithoutFeedback onPress={() => navigation.navigate('CartScreen')}>
                                    <Icon
                                        active
                                        type='Ionicons'
                                        name='arrow-back'
                                        style={{ fontSize: 30 , color : colors.DUSKY_BLACK_TEXT }}
                                    />
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={{ flex: .9, justifyContent: "center" }}><Text style={styles.headerText}>ALL COUPONS</Text></View>
                        </View>
                    </View>

                    <View style={styles.availableCouponsHeaderContainer}>
                        <View style={styles.availableCouponsHeaderInnerContainer}>
                            <Text style={styles.availableCouponsHeaderText}>AVAILABLE COUPONS</Text>
                        </View>
                        <View style={{ width: '97%', alignItems: 'center', marginTop: "1%" }}>
                            <Dash
                                dashLength={2}
                                dashThickness={1}
                                dashColor={colors.ROYAL_BLUE}
                                style={{
                                    width: '100%',
                                }}
                            />

                            <View style={styles.searchCouponsContainer}>
                                <TextInput
                                    onChangeText={filterCoupons}
                                    placeholder={strings.COUPON_PLACEHOLDER}
                                    style={styles.couponFilter}
                                    placeholderTextColor = {colors.DUSKY_BLACK_TEXT}
                                />
                                {
                                    isTyping
                                        ?
                                    <View style = {{ flex : .15 }}>
                                        <ActivityIndicator size = 'small' color = {colors.MANGO_COLOR} />
                                    </View>
                                        :
                                    <Pressable
                                        style = {{ flex : .15 , width : '100%' , alignItems : 'center' , display : couponFilter?.length > 0 ? 'flex' : 'none' }}
                                        onPress = {() => applyCoupon(null , 'typed')}
                                        disabled = {filterCoupons.length > 0 ? false : true}
                                    >
                                        <Text style = {{ color : colors.MANGO_COLOR , fontFamily : ColorsText.regular.fontFamily , fontSize : 11 }}>Apply</Text>
                                    </Pressable>
                                }
                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={availableCoupons}
                            renderItem={renderItem}
                            ListEmptyComponent = {EmptyComponent}
                        />
                    </View>
                </>
            </View>
    )
}

export default Coupons
