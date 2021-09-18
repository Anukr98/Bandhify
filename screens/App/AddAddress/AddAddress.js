import { useNavigation } from '@react-navigation/native'
import { Icon } from 'native-base'
import React, { useEffect, useState , useRef } from 'react'
import { View, Text, ScrollView, BackHandler, TextInput, TouchableWithoutFeedback, FlatList, Platform, TouchableOpacity, Image } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import colors from '../../../constants/colors'
import urls from '../../../constants/urls'
import { distanceBetweenCoordinates, postMethod } from '../../../Utils/CommonFunctions'
import styles from './styles'
import Modal from 'react-native-modal'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LinearGradient from 'react-native-linear-gradient'
import Loader from '../../Components/Loader/Loader'
import ColorsText from '../../../constants/ColorsText'
import { showMessage } from 'react-native-flash-message'
import Geolocation from 'react-native-geolocation-service'
import Geocoder from 'react-native-geocoding'
import keys from '../../../constants/keys'

const ANIMATION_IN_DURATION = 700
const ANIMATION_OUT_DURATION = 500

const AddAddress = ({ route }) => {

    const navigation = useNavigation()
    const nameRef = useRef(null)
    const pinRef = useRef(null)
    const address1Ref = useRef(null)
    const address2Ref = useRef(null)
    const address3Ref = useRef(null)
    const { direction } = route.params

    const [isLoading, setIsLoading] = useState(false)
    const [shouldLocalitiesShow, setShouldLocalitiesShow] = useState(false)
    const [token, setToken] = useState('')
    const [name, setName] = useState('')
    const [pincode, setPincode] = useState('')
    const [addressLine1, setAddressLine1] = useState('')
    const [addressLine2, setAddressLine2] = useState('')
    const [addressLine3, setAddressLine3] = useState('')
    const [city, setCity] = useState({
        name : '',
        code : null,
        id : null
    })
    const [cities, setCities] = useState([])
    const [locality, setLocality] = useState({
        name : '',
        id : null
    })
    const [localities, setLocalities] = useState([])
    const [isCityModalVisible, setIsCityModalVisible] = useState(false)
    const [isLocalityModalVisible, setIsLocalityModalVisible] = useState(false)
    const [isAddressTypeModalVisible, setIsAddressTypeModalVisible] = useState(false)
    const [latitude, setLatitude] = useState(parseFloat(route.params.markerCoordinates.latitude).toFixed(4))
    const [longitude, setLongitude] = useState(parseFloat(route.params.markerCoordinates.longitude).toFixed(4))
    const [addressType, setAddressType] = useState('')

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus' , async () => {
            setIsLoading(true)

            let tokenValue = await AsyncStorage.getItem('token')
            setToken(tokenValue)

            //SET STATE VALUES DEPENDING ON ROUTE PARAMS
            setName(route.params.item ? route.params.item.name : '')
            setPincode(route.params.item ? route.params.item.pincode : '')
            setAddressLine1(route.params.item ? route.params.item.address_line_1 : '')
            setAddressLine2(route.params.item ? route.params.item.address_line_2 : '')
            setAddressLine3(route.params.item ? route.params.item.address_line_3 : '')
            if(route.params.item) {
                const { city, locality, address_type } = route.params.item
                setCity(() => ({
                    name: city.city,
                    code: city.id
                }))
                getLocalities(city)
                setLocality(() => ({
                    name: locality.locality,
                    id: locality.id
                }))
                setAddressType(() => address_type)
            }

            let object = {
                method : 'GET',
                headers : {
                    Accept : 'application/json',
                    'Content-Type' : 'application/json',
                    Authorization : `Bearer ${tokenValue}`
                }
            }
            postMethod(`${urls.GET_CITIES}?with_localities=1` , object , (err,result) => {
                setIsLoading(false)
                if(err)
                    console.log(err)

                else if(result.status && result.code === 200)
                    setCities(result.cities)

                else
                    alert('Something went wrong')
            })
        })

        return () => {
            backButtonAction.remove()
            unsubscribe()
        }
    },[])

    const handleBackButtonClick = () => {
        if(direction === 'Edit' || direction === 'Add') {
            navigation.replace('Address')
            return true
        }
        else if(direction === 'Checkout') {
            navigation.replace('Checkout' , { focus : '' })
            return true
        }
        else if(direction === 'EditFromCheckout') {
            navigation.replace('Checkout' , { focus : route.params.item.address_line_1 })
            return true
        }
        return true
    }

    const getLocalities = async item => {
        let tokenValue = await AsyncStorage.getItem('token')
        let object = {
            method : 'GET',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${tokenValue}`
            }
        }
        postMethod(`${urls.GET_LOCALITIES}?is_active=1&city_id=${item.id}` , object , (err,result) => {
            if(err)
                console.log(err)

            else if(result.status && result.code === 200) {
                setLocalities(result.localities)
                setIsLoading(false)
                setShouldLocalitiesShow(true)
            }
            else
                alert("Something went wrong!")
        })
    }

    const cityRenderItem = ({ item }) => {
        const changeCity = () => {
            setCity({
                name : item.city,
                code : item.id,
            })
            setIsLoading(true)
            getLocalities(item)
            setIsCityModalVisible(false)
        }
        
        return (
            <View style = {styles.cityListItem}>
                <TouchableWithoutFeedback
                    onPress = {changeCity}
                    style = {{ backgroundColor : 'yellow' }}
                >
                    <Text>{item.city}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    const localityRenderItem = ({ item }) => {
        const changeLocality = () => {
            setLocality({
                name : item.locality,
                id : item.id
            })
            setIsLocalityModalVisible(false)
        }

        return (
            <View style = {styles.cityListItem}>
                <TouchableWithoutFeedback
                    onPress = {changeLocality}
                    style = {{ backgroundColor : 'yellow' }}
                >
                    <Text>{item.locality}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    const validateErrors = () => {
        if(!name) {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please provide your name",
                duration : 1400,
            })
            return false
        }

        else if(!addressLine1) {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please provide address line 1",
                duration : 1400,
            })
            return false
        }
        
        else if(!addressLine2) {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please provide address line 2",
                duration : 1400,
            })
            return false
        }

        else if(!addressLine3) {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please provide address line 3",
                duration : 1400,
            })
            return false
        }

        else if(city.code === null) {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please select a city",
                duration : 1400,
            })
            return false
        }

        else if(locality.name === '') {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please select a locality",
                duration : 1400,
            })
            return false
        }

        else if(!addressType) {
            showMessage({
                icon : 'warning',
                floating : true,
                style : { backgroundColor : colors.BLACK },
                message : "Please select the type of this address",
                duration : 1400,
            })
            return false
        }
        return true
    }

    const addAddress = async () => {
        console.log(latitude, longitude)
        let id = await AsyncStorage.getItem('user_id')
        if(validateErrors()) {
            setIsLoading(true)
            let object = {
                method : 'POST',
                headers : {
                    Accept : 'application/json',
                    'Content-Type' : 'application/json',
                    Authorization : `Bearer ${token}`
                },
                body : JSON.stringify({
                    'addressable_id' : id,
                    'addressable_type' : 'User',
                    'name' : name,
                    'address_type' : addressType,
                    'address_line_1' : addressLine1,
                    'address_line_2' : addressLine2,
                    'address_line_3' : addressLine3,
                    'locality_id' : locality.id,
                    'city_id' : city.code,
                    'pincode' : pincode,
                    'state' : 'Madhya Pradesh',
                    'country' : 'India',
                    'latitude' : latitude,
                    'longitude' : longitude
                })
            }
    
            postMethod(urls.ADD_ADDRESS , object , (err,result) => {
                if(err)
                    console.log(err)
    
                else if(result.status && result.code === 201) {
                    setIsLoading(false)
                    showMessage({
                        type : 'success',
                        icon : 'success',
                        duration : 1400,
                        message : result.message,
                        floating : true,
                    })
                    setTimeout(() => {
                        if(direction === 'Edit' || direction === 'Add')
                            navigation.replace('Address')
                        else
                            navigation.replace('Checkout' , { focus : result.address.address_line_1 })
                    }, 1400)
                }
    
                else {
                    setIsLoading(false)
                    showMessage({
                        icon : 'danger',
                        duration : 1400,
                        message : result.error,
                        style : { backgroundColor : colors.BLACK },
                        floating : true
                    })
                }
            })
        }
    }

    const editAddress = async () => {
        if(validateErrors()) {
            let id = await AsyncStorage.getItem('user_id')
            setIsLoading(true)
            let object = {
                method : 'PATCH',
                headers : {
                    Accept : 'application/json',
                    'Content-Type' : 'application/json',
                    Authorization : `Bearer ${token}`
                },
                body : JSON.stringify({
                    'addressable_id' : id,
                    'addressable_type' : 'User',
                    'name' : name,
                    'address_type' : addressType,
                    'address_line_1' : addressLine1,
                    'address_line_2' : addressLine2,
                    'address_line_3' : addressLine3,
                    'locality_id' : locality.id,
                    'city_id' : city.code,
                    'pincode' : pincode,
                    'state' : 'Madhya Pradesh',
                    'country' : 'India',
                    'latitude' : latitude,
                    'longitude' : longitude
                })
            }

            postMethod(`${urls.UPDATE_ADDRESS}/${route.params.item.id}` , object , (err,result) => {
                if(err)
                    console.log(err)
                else if(result.status && result.code === 200) {
                    showMessage({
                        message : result.message,
                        duration : 1400,
                        floating : true,
                        type : 'success',
                        icon : 'success'
                    })
                    setTimeout(() => {
                        setIsLoading(false)
                        if(direction === 'Edit' || direction === 'Add')
                            navigation.replace('Address')
                        else
                            navigation.replace('Checkout' , { focus : result.address.address_line_1 })
                    },1200)
                }
                else {
                    setIsLoading(false)
                    showMessage({
                        message : 'Something went wrong while updating your address',
                        floating : true,
                        duration : 1400,
                        icon : 'warning',
                        style : { backgroundColor : colors.BLACK }
                    })
                }
            })
        }
    }

    const changeAddressType = type => {
        setAddressType(type)
        setIsAddressTypeModalVisible(false)
    }

    return (
        <View style = {{ flex : 1 , backgroundColor : colors.WHITE }}>
            <View style = {{ paddingLeft : 8 , paddingTop : 7 }}><TouchableWithoutFeedback onPress = {handleBackButtonClick}><Icon active type = 'Ionicons' name = 'arrow-back' style = {{ color : colors.DUSKY_BLACK_TEXT }} /></TouchableWithoutFeedback></View>
            {
                isLoading && <Loader />
            }
            <ScrollView
                showsVerticalScrollIndicator = {false}
            >
                <View style = {styles.innerHeader}>

                    <Modal
                        isVisible = {isCityModalVisible}
                        onBackdropPress = {() => setIsCityModalVisible(false) }
                        animationIn = 'bounceIn'
                        animationInTiming = {ANIMATION_IN_DURATION}
                        animationOut = 'bounceOut'
                        animationOutTiming = {ANIMATION_OUT_DURATION}
                    >
                        <View style = {styles.cityModalContainer}>
                            <View style = {styles.closeContainer}>
                                <LinearGradient
                                    colors = {[ '#F5F7FA' , '#B8C6DB']}
                                    style = {{ width : '100%' , alignItems : 'flex-end' }}
                                >
                                    <TouchableWithoutFeedback onPress = {() => setIsCityModalVisible(false)}>
                                        <Icon active type = 'Ionicons' name = 'close-outline' />
                                    </TouchableWithoutFeedback>
                                </LinearGradient>
                            </View>
                            <View>
                                <FlatList
                                    data = {cities}
                                    renderItem = {cityRenderItem}
                                    showsVerticalScrollIndicator = {false}
                                />
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        isVisible = {isLocalityModalVisible}
                        onBackdropPress = {() => setIsLocalityModalVisible(false) }
                        animationIn = 'bounceIn'
                        animationInTiming = {ANIMATION_IN_DURATION}
                        animationOut = 'bounceOut'
                        animationOutTiming = {ANIMATION_OUT_DURATION}
                    >
                        <View style = {styles.cityModalContainer}>
                            <View style = {styles.closeContainer}>
                                <LinearGradient
                                    colors = {[ '#F5F7FA' , '#B8C6DB']}
                                    style = {{ width : '100%' , alignItems : 'flex-end' }}
                                >
                                    <TouchableWithoutFeedback onPress = {() => setIsLocalityModalVisible(false)}>
                                        <Icon active type = 'Ionicons' name = 'close-outline' />
                                    </TouchableWithoutFeedback>
                                </LinearGradient>
                            </View>
                            <View>
                                <FlatList
                                    data = {localities}
                                    renderItem = {localityRenderItem}
                                    showsVerticalScrollIndicator = {false}
                                />
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        isVisible = {isAddressTypeModalVisible}
                        onBackdropPress = {() => setIsAddressTypeModalVisible(false) }
                        animationIn = 'bounceIn'
                        animationInTiming = {ANIMATION_IN_DURATION}
                        animationOutTiming = {ANIMATION_OUT_DURATION}
                        animationOut = 'bounceOut'
                    >
                        <View style = {styles.addressModalContainer}>
                            <View style = {styles.closeContainer}>
                                <LinearGradient
                                    colors = {[ '#F5F7FA' , '#B8C6DB']}
                                    style = {{ width : '100%' , alignItems : 'flex-end' }}
                                >
                                    <TouchableWithoutFeedback onPress = {() => setIsAddressTypeModalVisible(false)}>
                                        <Icon active type = 'Ionicons' name = 'close-outline' />
                                    </TouchableWithoutFeedback>
                                </LinearGradient>
                            </View>

                            <View style = {{ backgroundColor : addressType === 'Home' ? colors.LIGHT_GRAY_BG_COLOR : 'none' , borderLeftColor : addressType === 'Home' ? colors.MANGO_COLOR : "none" , borderLeftWidth : addressType === 'Home' ? 3.2 : 0 }}>
                                <TouchableWithoutFeedback onPress = {() => changeAddressType('Home')}>
                                    <View style = {styles.addressModalInnerContainer}>
                                        <View>
                                            <Icon
                                                active
                                                type = 'AntDesign'
                                                name = 'home'
                                                style = {styles.addressModalIcon}
                                            />
                                        </View>
                                        <View><Text style = {{ fontFamily : ColorsText.Medium.fontFamily }}>Home</Text></View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>

                            <View style = {{ backgroundColor : addressType === 'Office' ? colors.LIGHT_GRAY_BG_COLOR : 'none' , borderLeftColor : addressType === 'Office' ? colors.MANGO_COLOR : "none" , borderLeftWidth : addressType === 'Office' ? 3.2 : 0}}>
                                <TouchableWithoutFeedback onPress = {() => changeAddressType('Office')}>
                                    <View style = {styles.addressModalInnerContainer}>
                                        <View>
                                            <Icon
                                                active
                                                type = 'Ionicons'
                                                name = 'briefcase-outline'
                                                style = {styles.addressModalIcon}
                                            />
                                        </View>
                                        <View><Text style = {{ fontFamily : ColorsText.Medium.fontFamily }}>Office</Text></View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>

                            <View style = {{ backgroundColor : addressType === 'Other' ? colors.LIGHT_GRAY_BG_COLOR : 'none' , borderLeftColor : addressType === 'Other' ? colors.MANGO_COLOR : "none" , borderLeftWidth : addressType === 'Other' ? 3.2 : 0 }}>
                                <TouchableWithoutFeedback onPress = {() => changeAddressType('Other')}>
                                    <View style = {styles.addressModalInnerContainer}>
                                        <View>
                                            <Icon
                                                active
                                                type = 'EvilIcons'
                                                name = 'location'
                                                style = {styles.addressModalIcon}
                                            />
                                        </View>
                                        <View><Text style = {{ fontFamily : ColorsText.Medium.fontFamily }}>Other</Text></View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </Modal>

                    <View style = {styles.logoArea}>
                        <TouchableOpacity style = {{ width: '70%' }} activeOpacity = {.8} onPress = {() => navigation.replace('Home')}>
                            <Image
                                source = {require('../../../assets/Images/logo2.png')}
                                style = {{ width: '60%', height: 80 }}
                                resizeMode = 'cover'
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style = {styles.addAddressText}>{(direction === 'Edit' || direction === 'EditFromCheckout') ? 'Edit an Address' : "Add a new Address"}</Text>
                    </View>

                    <View style = {styles.formArea}>
                        <View style = {styles.inputContainer}>
                            <TextInput
                                placeholder = 'Full Name *'
                                onChangeText = {text => setName(text)}
                                style = {styles.input}
                                placeholderTextColor = {colors.GRAY_TEXT}
                                ref = {nameRef}
                                blurOnSubmit = {false}
                                onSubmitEditing = {() => pinRef.current.focus()}
                                value = {name.toString()}
                            />
                        </View>
                        <View style = {styles.inputContainer}>
                            <TextInput
                                placeholder = 'PIN Code'
                                onChangeText = {text => setPincode(text)}
                                style = {styles.input}
                                placeholderTextColor = {colors.GRAY_TEXT}
                                keyboardType = 'number-pad'
                                maxLength = {6}
                                ref = {pinRef}
                                blurOnSubmit = {false}
                                onSubmitEditing = {() => address1Ref.current.focus()}
                                value = {pincode.toString()}
                            />
                        </View>
                        <View style = {styles.inputContainer}>
                            <TextInput
                                placeholder = 'Address Line 1 *'
                                onChangeText = {text => setAddressLine1(text)}
                                style = {styles.input}
                                placeholderTextColor = {colors.GRAY_TEXT}
                                ref = {address1Ref}
                                blurOnSubmit = {false}
                                onSubmitEditing = {() => address2Ref.current.focus()}
                                value = {addressLine1}
                            />
                        </View>
                        <View style = {styles.inputContainer}>
                            <TextInput
                                placeholder = 'Address Line 2 *'
                                onChangeText = {text => setAddressLine2(text)}
                                style = {styles.input}
                                placeholderTextColor = {colors.GRAY_TEXT}
                                ref = {address2Ref}
                                blurOnSubmit = {false}
                                onSubmitEditing = {() => address3Ref.current.focus()}
                                value = {addressLine2}
                            />
                        </View>
                        <View style = {styles.inputContainer}>
                            <TextInput
                                placeholder = 'Address Line 3 *'
                                onChangeText = {text => setAddressLine3(text)}
                                style = {styles.input}
                                placeholderTextColor = {colors.GRAY_TEXT}
                                ref = {address3Ref}
                                value = {addressLine3}
                            />
                        </View>

                        <TouchableWithoutFeedback style = {styles.inputContainer}>
                            <View style = {{ marginBottom : '4%' }}>
                                <TextInput
                                    style = {styles.input}
                                    placeholderTextColor = {colors.GRAY_TEXT}
                                    editable = {false}
                                    value = {'Madhya Pradesh'}
                                />
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback style = {styles.inputContainer} onPress = {() => setIsCityModalVisible(true)}>
                            <View style = {{ marginBottom : '4%' }}>
                                <TextInput
                                    style = {styles.input}
                                    placeholderTextColor = {colors.GRAY_TEXT}
                                    placeholder = '--Select City-- *'
                                    editable = {false}
                                    value = {city.name}
                                />
                                <View style = {{ position : 'absolute' , right : 10 , top : '25%' }}>
                                    <Icon
                                        active
                                        type = 'EvilIcons'
                                        name = 'chevron-down'
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback style = {styles.inputContainer} onPress = {() => setIsLocalityModalVisible(true)}>
                            <View style = {{ display : shouldLocalitiesShow ? 'flex' : 'none' , marginBottom : '4%' }}>
                                <TextInput
                                    style = {styles.input}
                                    placeholderTextColor = {colors.GRAY_TEXT}
                                    placeholder = '--Select Locality-- *'
                                    editable = {false}
                                    value = {locality.name}
                                />
                                <View style = {{ position : 'absolute' , right : 10 , top : '25%' }}>
                                    <Icon
                                        active
                                        type = 'EvilIcons'
                                        name = 'chevron-down'
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback style = {styles.inputContainer} onPress = {() => setIsAddressTypeModalVisible(true)}>
                            <View style = {{ marginBottom : '4%' }}>
                                <TextInput
                                    style = {styles.input}
                                    placeholderTextColor = {colors.GRAY_TEXT}
                                    placeholder = '--Address Type-- *'
                                    editable = {false}
                                    value = {addressType}
                                />
                                <View style = {{ position : 'absolute' , right : 10 , top : '25%' }}>
                                    <Icon
                                        active
                                        type = 'EvilIcons'
                                        name = 'chevron-down'
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    <TouchableRipple style = {styles.deliverButton} onPress = { () => {
                        if(direction === 'Edit' || direction === 'EditFromCheckout')
                            editAddress()
                        else
                            addAddress()
                    }}>
                        <LinearGradient
                            colors = {[ colors.PRIMARY , '#CAC531' ]}
                            locations = {[0.5 , 1]}
                            start = {{ x : .5 , y : 0 }}
                            end = {{ x : .5 , y : 1 }}
                            style = {styles.deliverButton}
                        >
                            <Text style = {{ fontFamily : ColorsText.Medium.fontFamily }}>{(direction === 'Edit' || direction === 'EditFromCheckout') ? 'Save Changes' : 'Add Address'}</Text>
                        </LinearGradient>
                    </TouchableRipple>
                </View>
            </ScrollView>
        </View>
    )
}

export default AddAddress