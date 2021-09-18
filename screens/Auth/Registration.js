import React, { useEffect, useState } from 'react'
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, TextInput, BackHandler } from 'react-native'
import ColorsText from '../../constants/ColorsText'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import urls from '../../constants/urls'
import { showMessage } from 'react-native-flash-message'
import colors from '../../constants/colors'
import { check, PERMISSIONS, request } from 'react-native-permissions'
import Geolocation from 'react-native-geolocation-service'
import { TouchableRipple } from 'react-native-paper'
import GIFLoading from '../Components/GIFLoading/GIFLoading'
import Modal from 'react-native-modal'
import { width } from '../../constants/dimensions'
import { strings } from '../../constants/strings'

const Registration = () => {
    const navigation = useNavigation();

    const [permissionDenied, setPermissionDenied] = useState(false);
    const [number, setNumber] = useState('')
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const geoSuccess = position => {}

    const geoFailure = err => console.log(err, 'here')

    const onStarted = async direction => {
        if(direction === 'button')
            setIsLoading(true)

        if(Platform.OS === 'android') {
            check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then(res => {
                if(res != 'granted') {
                    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                    .then(result => {
                        if(result == 'granted' || result == 'limited') {
                            setPermissionDenied(false)
                            setTimeout(() => {
                                setIsLoading(false)
                            },300)
                            Geolocation.getCurrentPosition(geoSuccess , geoFailure , {
                                enableHighAccuracy : true,
                                showLocationDialog : true,
                                forceRequestLocation : true
                            })
                        }
                        else {
                            // BackHandler.exitApp()
                            setPermissionDenied(true)
                            setIsModalVisible(true)
                            setTimeout(() => {
                                setIsLoading(false)  
                            },300)
                            // showMessage({
                            //     icon : 'warning',
                            //     floating : true,
                            //     duration : 1500,
                            //     style : { backgroundColor : 'black' },
                            //     message : 'Hold On!',
                            //     description : 'Please Allow Location'
                            // })
                        }
                    })
                }

                else {
                    setIsLoading(false)
                    Geolocation.getCurrentPosition(geoSuccess , geoFailure , {
                        enableHighAccuracy : true,
                        showLocationDialog : true,
                        forceRequestLocation : true
                    })
                }
            })
        }
        else {
            console.log('ios')
        }
    }

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus' , () => {
            onStarted('initial')
        })
        return () => {
            backButtonAction.remove()
            unsubscribe()
        }
    },[])

    const handleBackButtonClick = () => {
        BackHandler.exitApp()
        return true
    }

    const getNumber = () => {
        setIsError(false);
        setErrorMessage('');

        if (number.length == 10) {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            var raw = JSON.stringify({ "phone": number, "device": "app" });
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            fetch(urls.sendOTP, requestOptions)
                .then(response => response.json())
                .then(result => {
                    if(result.status) {
                        showMessage({
                            type : 'success',
                            icon : 'success',
                            floating : true,

                            textStyle : {
                                fontFamily : ColorsText.regular.fontFamily
                            },
                            message : "Success",
                            description : 'Number verified'
                        })
                        navigation.replace('OTP' , {
                            phoneNumber : number
                        })
                    }

                    else
                        showMessage({
                            message : result.message,
                            type : 'danger',
                            icon : 'danger',
                            floating : true,
                            textStyle : {
                                fontFamily : ColorsText.regular.fontFamily
                            }
                        })
                })
                .catch(error => console.log('error', error));

        }
        else {
            showMessage({
                message: `Digits should be 10`,
                type: 'danger',
                icon: 'danger',
                floating: true,
                textStyle: {
                    fontFamily: ColorsText.regular.fontFamily
                }
            })
            setIsError(true);
            setErrorMessage('Digits should be 10');
        }
    }

    const DeniedPermission = () => (
        <Modal
            isVisible = {isModalVisible}
            animationIn = 'zoomIn'
            animationInTiming = {700}
            animationOut = 'zoomOutRight'
        >
             <View style = {styles.permissionDeniedContainer}>
                <View style = {{ width : '88%' , alignSelf : 'center' }}>
                    <View><Text style = {styles.headerText}>We understand your concerns!</Text></View>
                    <View style = {{ marginTop : '3%' }}><Text style = {styles.subText}>{strings.LOCATION_DISALLOWED}</Text></View>
                    <View style = {{ marginTop : '8%' , alignItems : 'flex-end' , width : '90%' }}>
                        <TouchableRipple onPress = {() => {
                            setIsModalVisible(false)
                            setTimeout(() => BackHandler.exitApp(),300)
                        }}>
                            <Text style = {styles.locationButtonText}>OK</Text>
                        </TouchableRipple>
                    </View>
                </View>
            </View>
        </Modal>
    )

    if(isLoading)
        return <GIFLoading />

    else
        return (
            <ImageBackground style={{ height: '100%', resizeMode: 'cover' }} source={require('../../assets/Images/Splash.png')}>
                <View style={{ flex: 1 }}>
                    {
                        permissionDenied
                            ?
                        <DeniedPermission />
                            :
                        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
                            <View style={styles.boxcontainer}>
                                <View style={styles.mainHeading}>
                                    <Text style={styles.headingText}>Get your things</Text>
                                    <Text style={styles.headingText}>with Delivery</Text>
                                </View>
                                <View style={styles.paraHeading}>
                                    <View style={[styles.otpDummy, { borderWidth: 0.8, borderColor: isError ? '#CA0B00' : colors.WHITE }]}>
                                        <View style={styles.otpButton}>
                                            <View style = {{ flex : .2 , alignItems : 'center' }}>
                                                <TextInput
                                                    value = '+91'
                                                    editable = {false}
                                                    style = {{ color : colors.LIGHT_TEXT_COLOR }}                                            
                                                />
                                            </View>
                                            <View style = {{ flex : .8 }}>
                                                <TextInput
                                                    placeholder = 'Your number'
                                                    onChangeText = { text => setNumber(text) }
                                                    maxLength = {10}
                                                    onSubmitEditing = {getNumber}
                                                    placeholderTextColor = {colors.LIGHT_TEXT_COLOR}
                                                    style = {{ fontSize : 16 , color : colors.BLACK, height: 40 }}
                                                    keyboardType = 'number-pad'
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    {
                                        isError ? (
                                            <Text style={{
                                                position: 'absolute',
                                                right: '15%',
                                                bottom: -20,
                                                fontFamily: ColorsText.regular.fontFamily,
                                                color: '#CA0B00'
                                            }}>Digits should be 10</Text>
                                        ) : null
                                    }
                                </View>

                                <View style={[styles.buttonArea, { marginTop: '8%' }]}>
                                    <TouchableOpacity
                                        style = {styles.button}
                                        onPress = {getNumber}
                                    >
                                        <Text style={styles.buttonText}>Get Your Otp</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </KeyboardAwareScrollView>
                    }
                </View>
            </ImageBackground>   
    )
}

export default Registration

const styles = StyleSheet.create({
    boxcontainer: {
        position: 'absolute',
        bottom: '22%',
        // left: '50%',
        // right: '50%',
        // transform: [{ translateX: '-50%' }],
        width: '100%',
        zIndex: 999,
        flex: 1
    },
    mainHeading: {
        width: '70%',
        alignSelf: 'center'
    },
    headingText: {
        fontSize: 28,
        fontWeight: '500',
        // fontFamily: 'SpaceGrotesk-Light'
        fontFamily: ColorsText.regular.fontFamily
    },
    paraHeading: {
        alignItems: 'center',
        marginTop: '5%',
    },
    paraText: {
        fontSize: 18,
        fontWeight: '300',
        fontFamily: ColorsText.light.fontFamily
    },
    otpDummy: {
        backgroundColor: '#fff',
        width: '70%',
        height: 40,
        // justifyContent: 'center',
        borderRadius: 999,
        overflow : 'hidden'
    },
    otpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        height : '100%',
        backgroundColor: colors.WHITE,
    },
    countryCode: {
        paddingLeft: 20,
        paddingRight: 10,
        borderRightWidth: 2,
        borderRightColor: '#f1f1f1'
    },
    countryCodeText: {
        fontSize: 18,
        fontFamily: ColorsText.light.fontFamily
    },
    buttonArea: {
        alignItems: 'center',
        marginTop: '15%'
    },
    phoneNumber: {
        paddingLeft: 10,
        backgroundColor : 'yellow',
        width : '60%'
    },
    inputValue: {
        fontSize: 18,
        color : '#000',
        backgroundColor : 'red'
    },
    moreOption: {
        width: '70%',
        alignSelf: 'center',
        marginTop: 20,
        alignItems: 'center'
    },
    moreText: {
        fontSize: 18,
        fontWeight: '300',
        fontFamily: ColorsText.light.fontFamily
    },
    button: {
        width: '70%',
        backgroundColor: ColorsText.primary_color.color,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 999,
        shadowColor: ColorsText.iosShadow.shadowColor,
        shadowOffset: {
            width: ColorsText.iosShadow.shadowOffset.width,
            height: ColorsText.iosShadow.shadowOffset.height,
        },
        shadowOpacity: ColorsText.iosShadow.shadowOpacity,
        shadowRadius: ColorsText.iosShadow.shadowRadius,

        elevation: ColorsText.iosShadow.elevation,

    },
    buttonText: {
        fontSize: 16,
        fontFamily: ColorsText.regular.fontFamily
    },

    permissionDeniedContainer : {
        backgroundColor : colors.WHITE,
        width : width * 0.9,
        alignSelf : 'center',
        borderRadius : 6,
        paddingVertical : 20
    },

    headerText : {
        fontFamily : ColorsText.Medium.fontFamily,
        color : colors.ROYAL_BLUE,
        fontSize : 20
    },

    subText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 15,
        color : colors.DUSKY_BLACK_TEXT
    },

    getLocationButtonContainer : {
        width : '100%',
        alignItems : 'center',
        marginTop : '10%'
    },

    locationButton : {
        backgroundColor : colors.ROYAL_BLUE,
        width : '75%',
        alignItems : 'center',
        justifyContent : 'center',
        height : 50,
        borderRadius : 6
    },

    locationButtonText : {
        color : colors.MANGO_COLOR,
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 17
    }
})