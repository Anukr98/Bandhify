import { useNavigation } from '@react-navigation/native'
import { Icon } from 'native-base'
import React , { useEffect , useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, BackHandler, TextInput, FlatList , Pressable } from 'react-native'
import colors from '../../../constants/colors'
import styles from './styles'
import profileStyles from '../EditProfile/styles'
import Dash from 'react-native-dash'
import ColorsText from '../../../constants/ColorsText'
import { strings } from '../../../constants/strings'
import { TouchableRipple } from 'react-native-paper'
import Modal from 'react-native-modal'
import { Rating } from 'react-native-ratings'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showMessage } from 'react-native-flash-message'
import Loader from '../../Components/Loader/Loader'
import moment from 'moment'
import BottomSheet from 'react-native-raw-bottom-sheet'
import DatePicker from 'react-native-date-picker'

const OrderDetails = ({ route }) => {

    const { orderDetails } = route.params
    const { reviews , shop , order_products , order_id , created_at , is_subscription_order , number_of_days , delivery_till_date , delivery_pause_end_date , id, delivery_charge } = orderDetails
    const { address } = shop

    const navigation = useNavigation()
    const scrollViewRef = useRef()
    const sheetRef = useRef(null)
    const endDateSheetRef = useRef(null)

    const [subtotal, setSubtotal] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false)
    const [ratings, setRatings] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false)
    const [subscriptionPausedTillDate, setSubscriptionPausedTillDate] = useState(delivery_pause_end_date)
    const [subscriptionValidTill, setSubscriptionValidTill] = useState(delivery_till_date)
    const [subscriptionPauseStartDate, setSubscriptionPauseStartDate] = useState(null)
    const [subscriptionPauseEndDate, setSubscriptionPauseEndDate] = useState(null)
    const [date, setDate] = useState(new Date())
    const [pauseEndDate, setPauseEndDate] = useState(new Date())
    const [pauseConfirmationModal, setPauseConfirmationModal] = useState(false)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus' , () => {
            if(reviews.length > 0) {
                reviews.map(item => {
                    if(item?.reviewable_type == 'Modules\\Shop\\Entities\\Shop')
                        setFeedback(item?.review)
                })
            }
            let total = 0
            order_products.forEach(item => {
                total = total + (item.product_total_amount * item.product_quantity)
            })
            setSubtotal(total)
        })
        return () => {
            backButtonAction.remove()
            unsubscribe()
        }
    },[])

    const handleBackButtonClick = () => {
        navigation.replace('Orders')
        return true
    }

    const handleRatingChange = (rating,product) => {
        let temp = ratings
        temp.push({
            id : product.id,
            rating
        })
        setRatings(temp)
    }

    const renderItem = ({ item }) => {
        let initial = 1
        if(reviews.length > 0) {
            reviews.forEach(review => {
                if(review.reviewable_id === item.id)
                    initial = review.rating
            })
        }
        else {
            ratings.forEach(aa => {
                if(aa.id === item.id)
                    initial = aa.rating
            })
        }
        return <View style = {styles.modalItem}>
            <View style = {{ width : '20%' }}>
                <Text>{item.shop_product.product.product_name}</Text>
            </View>
            <View style = {{ width : '80%' , alignItems : 'flex-start' }}>
                <Rating
                    imageSize = {23}
                    startingValue = {initial}
                    fractions = {0}
                    onFinishRating = {rating => handleRatingChange(rating,item)}
                    minValue = {1}
                    readonly = {orderDetails.reviews.length > 0 ? true : false}
                />
            </View>
        </View>
    }

    const closeModal = () => {
        const output = Object.values(ratings.reduce((a , item) => {
            a[item.id] = item
            return a
        }, {}))

        setRatings(output)
        setIsRatingModalVisible(false)
    }

    const submitFeedback = async () => {
        setIsLoading(true)
        let review = []
        let token = await AsyncStorage.getItem('token')
        if(ratings.length == 0) {
            const { order_products } = orderDetails
            order_products.forEach(product => {
                review.push({
                    reviewable_id : product.id,
                    reviewable_type : 'ShopProduct',
                    rating : 1
                })
            })
        }
        else
            ratings.forEach(product => {
                review.push({
                    reviewable_id : product.id,
                    reviewable_type : "ShopProduct",
                    rating : product.rating
                })
            })
        review.push({
            reviewable_id : orderDetails.shop_id,
            reviewable_type : "Shop",
            review : feedback
        })

        let object = {
            method : 'POST',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${token}`
            },
            body : JSON.stringify({
                review,
                'order_id' : orderDetails.id
            })
        }
        
        postMethod(urls.CREATE_REVIEW , object , (err,result) => {
            if(err)
                console.log(err)
            else if(result.status && result.code === 201) {
                showMessage({
                    type : 'success',
                    icon : "success",
                    floating : true,
                    duration : 1400,
                    message : result.message
                })
                setTimeout(() => {
                    setIsLoading(false)
                    navigation.replace('Orders')
                },700)
            }
            else {
                showMessage({
                    icon : "warning",
                    floating : true,
                    duration : 1400,
                    message : result.message,
                    style : { backgroundColor : colors.BLACK }
                })
                setTimeout(() => {
                    setIsLoading(false)
                },700)
            }
        })
    }

    const MiscDetail = ({ descriptionText , detailText , changed }) => <View style = {styles.miscellaneousDetails}>
        <View style = {styles.miscDetail}>
            <View style = {styles.productParticulars}><Text style = {styles.productDetail}>{descriptionText}</Text></View>
            <View style = {styles.productPrice}>
                <TouchableOpacity
                    disabled = {!changed}
                    onPress = {showAffirmationMessage}
                >
                    <View style = {{ flexDirection : 'row' , alignItems : 'center' }}>
                        <Text style = {[styles.productDetail , { color : changed ? colors.ROYAL_BLUE : colors.DUSKY_BLACK_TEXT , fontFamily : changed ? ColorsText.Bold.fontFamily : ColorsText.regular.fontFamily }]}>{detailText}</Text>
                        { changed && <Icon active type = 'MaterialCommunityIcons' name = 'information-outline' style = {{ color : colors.ROYAL_BLUE , fontSize : 15 , marginLeft : 3 }} /> }
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    </View>

    const triggerRatingModal = () => {
        if(reviews.length > 0)
            showMessage({
                icon : "info",
                style : { backgroundColor : colors.BLACK },
                message : strings.ORDER_ALREADY_RATED,
            })
        else
            setIsRatingModalVisible(true)
    }

    const showAffirmationMessage = () => showMessage({
        icon : 'info',
        message : 'Remember to pause your subscription before you leave this page',
        style : { backgroundColor : colors.BLACK },
        duration : 2500
    })

    const changeSubscriptionPauseEndDate = endDate => {
        // console.log("start date",subscriptionPauseStartDate)
        // console.log("end date selected",endDate)
        // if(moment(endDate).diff(subscriptionPauseStartDate, "days") <= 0) {
        //     setSubscriptionPauseEndDate(new Date())
        //     endDateSheetRef.current.close()
        //     showMessage({
        //         icon: 'danger',
        //         floating: true,
        //         style : { backgroundColor: colors.BLACK },
        //         message: 'End date cannot be less than starting date'
        //     })
        //     return
        // }
        setSubscriptionPauseEndDate(moment(endDate).format("YYYY-MM-DD"))
        setPauseEndDate(endDate)

    }

    const changePauseDateForSubscription = selectedDate => {
        // if(moment().diff(selectedDate, 'days') > 0) {
            // setDate(new Date())
        //     showMessage({
        //         icon: 'danger',
        //         floating: true,
        //         style : { backgroundColor: colors.BLACK },
        //         message: 'Selected date cannot be less than today\'s date'
        //     })
        //     return
        // }
        setSubscriptionPauseStartDate(() => moment(selectedDate).format('YYYY-MM-DD'))
        setDate(selectedDate)
    }

    const pauseSubscription = async () => {
        // console.log('start date',date)
        // console.log('end date', pauseEndDate)
        // console.log('starting date',subscriptionPauseStartDate)
        // console.log('ending date',subscriptionPauseEndDate)
        // console.log("diff of start date and end date",moment(subscriptionPauseStartDate).diff(subscriptionPauseEndDate, "days"))
        if(moment().diff(date, "days") > 0) {
            setDate(new Date())
            endDateSheetRef.current.close()
            showMessage({
                icon: 'danger',
                floating: true,
                style : { backgroundColor: colors.BLACK },
                message: 'Selected date cannot be less than today\'s date',
                duration: 2500
            })
            return
        }
        if(moment(date).diff(pauseEndDate, "days") > 0) {
            setPauseEndDate(new Date())
            endDateSheetRef.current.close()
            showMessage({
                icon: 'danger',
                floating: true,
                style : { backgroundColor: colors.BLACK },
                message: 'End date cannot be less than start date',
                duration: 2500
            })
            return
        }
        endDateSheetRef.current.close()
        setPauseConfirmationModal(() => true)
    }

    const confirmPause = async () => {
        setIsLoading(true)
        let token = await AsyncStorage.getItem('token')
        let object = {
            method : 'PATCH',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${token}`
            },
            body : JSON.stringify({
                'delivery_pause_start_date' : moment(date).format('YYYY-MM-DD'),
                'delivery_pause_end_date' : moment(pauseEndDate).format("YYYY-MM-DD")
            })
        }
        setPauseConfirmationModal(() => false)
        postMethod(`${urls.PAUSE_SUCSCRIPTION}/${id}` , object , (err,result) => {
            console.log(result)
            setTimeout(() => {
                setIsLoading(false)
            },400)
            if(err) console.log(err)
            else if(result.status && result.code === 204) {
                showMessage({
                    type: 'success',
                    icon: 'success',
                    message: result.message,
                    floating: true
                })
                console.log(moment(result.delivery_till_date).format("DD MMM YY"))
                setSubscriptionValidTill(moment(result.order.delivery_till_date).format("DD MMM YY"))
                setSubscriptionPausedTillDate(moment(pauseEndDate).format("DD MMM' YY"))
            }
            else {
                showMessage({
                    icon: 'info',
                    style: {backgroundColor: colors.BLACK},
                    floating: true,
                    message: result.message
                })
                setSubscriptionPausedTillDate(delivery_pause_end_date)
            }
        })
    }

    const SubscriptionOrderView = () => <>
        <Modal
            isVisible = {isSubscriptionModalVisible}
            onBackdropPress = {() => setIsSubscriptionModalVisible(false)}
            animationIn = 'flipInX'
            animationInTiming = {500}
        >
            <View style = {styles.modalContainer}>
                <View style = {styles.innerModalContainer}>
                    <View style = {{ marginTop : '3%' }}><Text style = {styles.modalTitle}>Why am I seeing this?</Text></View>
                    <View style = {{ marginTop : '5%' , marginBottom : '8%' }}>
                        <Text style = {styles.modalText}>{strings.SUBSCRIPTION_ORDER}</Text>
                    </View>
                    <View style = {{ alignItems : 'flex-end' , width : "95%" }}>
                        <TouchableRipple onPress = {() => setIsSubscriptionModalVisible(false)}>
                            <Text style = {styles.closeModalText}>Gotcha</Text>
                        </TouchableRipple>
                    </View>
                </View>
            </View>
        </Modal>
        <Dash
            style = {{ width : '100%' , marginTop : '3%' , marginBottom : '5%' }}
            dashThickness = {1}
            dashLength = {5}
            dashColor = {colors.ROYAL_BLUE}
            dashGap = {3}
        />
        <View><TouchableOpacity onPress = {() => setIsSubscriptionModalVisible(true)}><Text style = {styles.modalDescriptionText}>What is this?</Text></TouchableOpacity></View>
        <MiscDetail descriptionText = {'Number of subscription days'} detailText = {number_of_days} />
        <MiscDetail descriptionText = {'Grand Total'} detailText = {`₹${subtotal * number_of_days}`} />
        <MiscDetail descriptionText = {'Subscription valid till'} detailText = {moment(subscriptionValidTill).format('DD MMM YY')} />
        <MiscDetail descriptionText = {'Subscription paused till'} detailText = {delivery_pause_end_date ? moment(delivery_pause_end_date).format("DD MMM' YY") : subscriptionPausedTillDate ? subscriptionPausedTillDate : 'Ongoing'} changed />
        <View style = {{ marginTop : '4%', display: delivery_pause_end_date ? 'none' : subscriptionPausedTillDate ? "none" : 'flex' }}>
            <TouchableRipple
                style = {[styles.rateProductsButton , { backgroundColor : colors.MANGO_COLOR }]}
                onPress = {() => sheetRef.current.open()}
                rippleColor = {colors.RIPPLE_COLORS.WHITE}
            >
                <Text style = {styles.rateProductsText}>STOP SUBSCRIPTION</Text>
            </TouchableRipple>
        </View>
        <Dash
            style = {{ width : '100%' , marginTop : '5%' }}
            dashThickness = {1}
            dashLength = {5}
            dashColor = {colors.ROYAL_BLUE}
            dashGap = {3}
        />
    </>

    return (
        <View style = {{ flex : 1 , backgroundColor : colors.WHITE }}>
            <ScrollView showsVerticalScrollIndicator = {false} ref = {scrollViewRef} keyboardShouldPersistTaps = 'always'>
                {
                    isLoading && <Loader />
                }
                <Modal
                    isVisible = {isRatingModalVisible}
                    onBackdropPress = {() => setIsRatingModalVisible(false)}
                    animationIn = 'zoomIn'
                    animationInTiming = {500}
                    animationOutTiming = {500}
                    animationOut = 'zoomOut'
                >
                    <View style = {styles.modalContainer}>
                        <View style = {styles.innerModalContainer}>
                            <FlatList
                                data = {orderDetails.order_products}
                                renderItem = {renderItem}
                                showsVerticalScrollIndicator = {false}
                            />
                            <View style = {{ alignItems : 'flex-end' , marginTop : '2%' }}>
                                <TouchableRipple
                                    style = {styles.closeModalButton}
                                    onPress = {closeModal}
                                >
                                    <Text style = {styles.closeModalText}>DONE</Text>
                                </TouchableRipple>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    isVisible = {pauseConfirmationModal}
                    animationIn = {"zoomIn"}
                    animationOut = {"zoomOutRight"}
                    onBackdropPress = {() => setPauseConfirmationModal(() => false)}
                    onBackButtonPress = {() => setPauseConfirmationModal(() => false)}
                    animationOutTiming = {500}
                    animationInTiming = {500}
                >
                    <View style = {{ backgroundColor: colors.WHITE, width: "90%", alignSelf: "center", paddingVertical: "5%", alignItems: "center", borderRadius: 7 }}>
                        <View style = {{ width: "93%" }}>
                            <Text style = {{ fontFamily: ColorsText.Bold.fontFamily, fontSize: 16, color: colors.DUSKY_BLACK_TEXT }}>{strings.CONFIRM_PAUSE_SUBSCRIPTION}</Text>
                            <View style = {{ marginTop: "8%" }}>
                                <View style = {{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                    <View style = {{ marginRight: "7%" }}><Pressable onPress = {() => setPauseConfirmationModal(() => false)}><Text style = {{ fontFamily: ColorsText.Medium.fontFamily, fontSize: 15, color: colors.MANGO_COLOR }}>Let me rethink</Text></Pressable></View>
                                    <View><Pressable onPress = {confirmPause}><Text style = {{ fontFamily: ColorsText.Medium.fontFamily, fontSize: 15, color: colors.MANGO_COLOR }}>Confirm</Text></Pressable></View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style = {styles.header}>
                    <View style = {styles.innerHeader}>
                        <View style = {styles.backIconContainer}>
                            <TouchableOpacity onPress = {() => navigation.replace('Orders')}>
                                <Icon
                                    active
                                    type = 'Ionicons'
                                    name = 'arrow-back'
                                    style = {{ color : colors.DUSKY_BLACK_TEXT }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.orderIdContainer}>
                            <View style = {{ width : '85%' }}>
                                <Text style = {[styles.regularFont , { fontSize : 16 , color : colors.DUSKY_BLACK_TEXT }]}>Order #{order_id}</Text>
                            </View>
                        </View>
                        <View style = {{ paddingRight: "2%" }}><TouchableOpacity onPress = {() => navigation.replace("Help", { orderDetails })}><Text style = {{ fontFamily: ColorsText.Bold.fontFamily, color: colors.ROYAL_BLUE, fontSize: 16 }}>HELP</Text></TouchableOpacity></View>
                    </View>
                    <Dash
                        style = {{ width : '97%' , height : 2 , marginTop : '1%' , marginBottom : '6%' }}
                        dashThickness = {1.5}
                        dashGap = {2}
                        dashLength = {1.5}
                        dashColor = {colors.GRAY_BORDER_COLOR}
                        dashStyle = {{
                            borderRadius : 999
                        }}
                    />
                </View>

                <View style = {styles.locationDetailsContainer}>
                    <View style = {styles.innerLocationDetailsContainer}>
                        <View style = {{ marginBottom : '3%' }}>
                            <Text style = {styles.orderedText}>Ordered on {moment(created_at).format('DD MMM YYYY')} @ {moment(created_at).format('hh:mm A')}</Text>
                        </View>
                        <View style = {styles.addressContainer}>
                            <View style = {{ width : '13%' }}>
                                <Image
                                    source = {require('../../../assets/Images/location2.png')}
                                    style = {{ height : 33 , width : 33 }}
                                />
                            </View>
                            <View style = {{ width : '84%' }}>
                                <Text style = {styles.shopName}>{orderDetails.shop.shop_name}</Text>
                                <Text style = {styles.shopAddress}>{address.address_line_1}, {address.address_line_2}, {address.city.city}, {address.state}, {address.pincode}</Text>
                            </View>
                        </View>
                        <View style = {styles.dotContainer}><Text>.</Text><Text style = {{ marginTop : '-20%' }}>.</Text><Text style = {{ marginTop : '-20%' }}>.</Text></View>
                        <View style = {styles.addressContainer}>
                            <View style = {{ width : '11%' , alignItems : 'center' }}>
                                <Icon
                                    active
                                    type = 'Octicons'
                                    name = 'location'
                                    style = {{ fontSize : 20 }}
                                />
                            </View>
                            <View style = {{ width : '84%' , paddingLeft : '2%' }}>
                                <Text style = {styles.shopName}>Delivery Location</Text>
                                <Text style = {styles.shopAddress}>{orderDetails?.address?.address_line_1}, {orderDetails?.address?.address_line_2}, {orderDetails?.address?.address_line_3}, {orderDetails?.address?.city.city}, {orderDetails?.address?.state}, {orderDetails?.address?.pincode}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style = {{ height : 70 , backgroundColor : colors.LIGHT_GRAY_BG_COLOR , justifyContent : 'flex-end' , paddingLeft : '6%' , paddingBottom : '1%' }}><Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 13 , color : colors.DUSKY_BLACK_TEXT , letterSpacing : .5 }}>Bill Details</Text></View>

                <View style = {styles.itemsContainer}>
                    <View style = {styles.innerItemsContainer}>
                        {
                            order_products.map(product => <View key = {product.id} style = {styles.product}>
                                <View style = {styles.productParticulars}>
                                    <Text style = {styles.productDetail}>{product.shop_product.product.product_name} {product.product_quantity}x ({product.shop_product.product.base_unit}) {product.is_product_amount_refunded === 1 && `(Amount Refunded)`}</Text>
                                </View>

                                <View style = {styles.productPrice}>
                                    <Text style = {styles.productDetail}>₹{product.product_total_amount * product.product_quantity}</Text>
                                </View>
                            </View>)
                        }
                        <View style = {styles.product}>
                            <View style = {styles.productParticulars}><Text style = {styles.productDetail}>Order Discount</Text></View>
                            <View style = {styles.productPrice}><Text style = {styles.productDetail}>{orderDetails?.order_discount}</Text></View>
                        </View>

                        <Dash
                            style = {{ width : '100%' , marginTop : '3%' }}
                            dashThickness = {1}
                            dashLength = {5}
                            dashColor = {colors.ROYAL_BLUE}
                            dashGap = {3}
                        />
                        <MiscDetail descriptionText = {'Items Total'} detailText = {`₹${parseFloat(subtotal).toFixed(2) - parseFloat(orderDetails?.order_discount).toFixed(2)}`} />
                        <MiscDetail descriptionText = {'Delivery Charge'} detailText = {delivery_charge} />

                        {
                            is_subscription_order == 1 && <SubscriptionOrderView />
                        }

                        <View style = {{ width : '100%' , marginTop : '4%' }}>
                            <View style = {styles.feedbackContainer}>
                                <TextInput
                                    onChangeText = {text => setFeedback(text)}
                                    value = {feedback}
                                    placeholder = {strings.FEEDBACK_PLACEHOLDER}
                                    style = {styles.feedback}
                                    editable = {reviews.length > 0 ? false : true}
                                    multiline
                                    placeholderTextColor = {colors.GRAY_TEXT}
                                    blurOnSubmit
                                />
                                <View style = {{ position : 'absolute' , bottom : 2 , right : 2 }}>
                                    <Icon
                                        active
                                        type = 'Ionicons'
                                        name = 'filter-outline'
                                        style = {styles.textareaIcon}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style = {styles.rateProducts}>
                            <TouchableRipple
                                style = {styles.rateProductsButton}
                                onPress = {triggerRatingModal}
                                rippleColor = {colors.RIPPLE_COLORS.BLACK}
                            >
                                <Text style = {styles.rateProductsText}>RATE PRODUCTS</Text>
                            </TouchableRipple>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style = {{ width : '100%' , display : reviews.length > 0 ? 'none' : 'flex' }}>
                <TouchableRipple
                    style = {[styles.rateProductsButton , { backgroundColor : colors.SUCCESS_GREEN , height : 40 }]}
                    onPress = {submitFeedback}
                    rippleColor = {colors.RIPPLE_COLORS.BLACK}
                >
                    <Text style = {[styles.rateProductsText , { fontSize : 15 }]}>SUBMIT FEEDBACK</Text>
                </TouchableRipple>
            </View>

            <BottomSheet
                ref = {sheetRef}
                height={400}
                closeOnDragDown
                customStyles={{
                    container: {
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20
                    }
                }}
            >
                <View style={[profileStyles.imageSheetContainer, { width: '87%' }]}>
                        <View style={{ alignItems: 'flex-end' }}><Pressable onPress={() => sheetRef.current.close()} style={{ backgroundColor: colors.ROYAL_BLUE, borderRadius: 999 }}><Icon active type='Entypo' name='cross' style={{ color: colors.WHITE, fontSize: 20 }} /></Pressable></View>
                        <View style={{ marginTop: '3%' }}><Text style={[profileStyles.sheetText, { fontFamily: ColorsText.Medium.fontFamily, fontSize: 16 }]}>{strings.SUBSCRIPTION_PAUSE_START}</Text></View>
                        <View style={{ marginTop: '4%' }}>
                            <DatePicker
                                mode = 'date'
                                date = {date}
                                androidVariant = 'iosClone'
                                onDateChange = {changePauseDateForSubscription}
                            />
                        </View>
                        <View style={[profileStyles.emailSubmitButtonContainer, { marginTop: '8%' }]}>
                            <Pressable
                                style={profileStyles.submitEmailButton}
                                onPress={() => {
                                    sheetRef.current.close()
                                    endDateSheetRef.current.open()
                                }}
                            >
                                <Text style={{ fontFamily: ColorsText.regular.fontFamily, color: colors.WHITE, fontSize: 16, letterSpacing: .4 }}>Confirm</Text>
                            </Pressable>
                        </View>
                    </View>
            </BottomSheet>

            <BottomSheet
                ref = {endDateSheetRef}
                height={400}
                closeOnDragDown
                customStyles={{
                    container: {
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20
                    }
                }}
            >
                <View style={[profileStyles.imageSheetContainer, { width: '87%' }]}>
                        <View style={{ alignItems: 'flex-end' }}><Pressable onPress={() => endDateSheetRef.current.close()} style={{ backgroundColor: colors.ROYAL_BLUE, borderRadius: 999 }}><Icon active type='Entypo' name='cross' style={{ color: colors.WHITE, fontSize: 20 }} /></Pressable></View>
                        <View style={{ marginTop: '3%' }}><Text style={[profileStyles.sheetText, { fontFamily: ColorsText.Medium.fontFamily, fontSize: 16 }]}>{strings.SUBSCRIPTION_PAUSE_END}</Text></View>
                        <View style={{ marginTop: '4%' }}>
                            <DatePicker
                                mode = 'date'
                                date = {pauseEndDate}
                                androidVariant = 'iosClone'
                                onDateChange = {changeSubscriptionPauseEndDate}
                            />
                        </View>
                        <View style={[profileStyles.emailSubmitButtonContainer, { marginTop: '8%' }]}>
                            <Pressable
                                style={profileStyles.submitEmailButton}
                                onPress={pauseSubscription}
                            >
                                <Text style={{ fontFamily: ColorsText.regular.fontFamily, color: colors.WHITE, fontSize: 16, letterSpacing: .4 }}>Confirm</Text>
                            </Pressable>
                        </View>
                    </View>
            </BottomSheet>
        </View>
    )
}

export default OrderDetails