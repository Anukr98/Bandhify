import React, { useEffect, useState } from 'react'
import { View, Text, ImageBackground, StyleSheet, TextInput, Image, BackHandler } from 'react-native'
import ColorsText from '../../constants/ColorsText'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import urls from '../../constants/urls'
import { showMessage } from 'react-native-flash-message'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import colors from '../../constants/colors'
import BackgroundTimer from 'react-native-background-timer'
import { useStateValue } from '../../Utils/StateProvider'

const OTP = ({ route }) => {
    const { phoneNumber } = route.params
    const navigation = useNavigation();
    const [{firebaseFCMToken}, dispatch] = useStateValue()
    // console.log(firebaseFCMToken)

    const [otpValue, setOtpValue] = useState('');
    const [isForm, setIsForm] = useState(false);
    const [username, setUsername] = useState('');
    const [isError, setIsError] = useState(false);
    const [timerInterval, setTimerInterval] = useState(30)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
        return () => backButtonAction.remove()
    }, [])

    useEffect(() => {
        if(timerInterval > 0)
            createInterval()
        return () => {}
    },[timerInterval])

    const handleBackButtonClick = () => {
        navigation.replace('Registration')
        return true
    }

    const gettingOtpValue = value => {
        setOtpValue(value)
        setIsError(false)
        var formdata = new FormData()
        formdata.append("phone", phoneNumber)
        formdata.append("otp", "1234")
        formdata.append("device", "app")
        formdata.append("device_token", firebaseFCMToken)

        var requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
        };

        fetch(urls.verifyOTP, requestOptions)
        .then(response => response.json())
        .then(async result => {
            if (result.status) {
                showMessage({
                    message: 'OTP Verified..!!',
                    type: 'success',
                    icon: 'success',
                    floating: true,
                    textStyle: {
                        fontFamily: ColorsText.regular.fontFamily
                    }
                })

                if (result.accessToken == null)
                    setIsForm(true)

                else {
                    await AsyncStorage.setItem('token', result.accessToken)
                    await AsyncStorage.setItem('user_id', result.user_id.toString())
                    navigation.navigate('Home')
                }
            }

            else
                showMessage({
                    message: result.message,
                    type: 'danger',
                    icon: 'danger',
                    floating: true,
                    textStyle: {
                        fontFamily: ColorsText.regular.fontFamily
                    }
                })
        })
        .catch(error => console.log('error', error));
    }

    const handleChange = () => {
        setIsError(false);
        if (username.length > 0) {
            var formdata = new FormData();
            formdata.append("name", username)
            formdata.append("phone", phoneNumber);
            formdata.append("role_id", "3");
            formdata.append("device", "app");
            formdata.append("device_token", firebaseFCMToken)

            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };

            fetch(urls.signUp, requestOptions)
                .then(response => response.json())
                .then(result => {
                    if (result.status) {
                        AsyncStorage.setItem('token', result.accessToken)
                        AsyncStorage.setItem('user_id', result.user.id.toString())
                        showMessage({
                            message: result?.message,
                            type: 'success',
                            icon: 'success',
                            floating: true,
                            textStyle: {
                                fontFamily: ColorsText.regular.fontFamily
                            }
                        })
                        navigation.navigate('Home')
                    }

                    else
                        showMessage({
                            message: `${result?.message}`,
                            type: 'danger',
                            icon: 'danger',
                            floating: true,
                            textStyle: {
                                fontFamily: ColorsText.regular.fontFamily
                            }
                        })
                })
                .catch(error => console.log('error', error));
        }
        else {
            showMessage({
                message: `Username is must`,
                type: 'danger',
                icon: 'danger',
                floating: true,
                textStyle: {
                    fontFamily: ColorsText.regular.fontFamily
                }
            })
            setIsError(true);
        }
    }

    const createInterval = () => {
        let timerId = BackgroundTimer.setTimeout(() => {
            BackgroundTimer.clearTimeout(timerId)
            setTimerInterval(prev => prev - 1)
        },1000)
    }

    const resendOTP = () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({ "phone": phoneNumber, "device": "app" });
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
                    message : "OTP Resent successfully",
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

    const valdidateOTPResend = () => {
        setTimerInterval(30)
        resendOTP()
    }

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground source={require('../../assets/Images/OTP.png')} style={{ width: '100%', height: '100%' }} >
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.boxContainer}>
                        <View style={styles.innerboxContainer}>
                            <View style={styles.mainHeading}>
                                <Text style={styles.headingText}>Get your things</Text>
                                <Text style={styles.headingText}>with Delivery</Text>
                            </View>

                            <View style={styles.phoneNumber}>
                                <View style={styles.numberInputView}>
                                    <View style={{ flex: .2, alignItems: 'center', height: 40 }}>
                                        <TextInput
                                            editable={false}
                                            value='+91'
                                            style={{ color: colors.LIGHT_TEXT_COLOR, fontSize: 17 }}
                                        />
                                    </View>
                                    <View style={{ flex: .8, height: 40, justifyContent: "center" }}>
                                        <TextInput
                                            editable={false}
                                            value={phoneNumber}
                                            style={{ height: 40, color: colors.LIGHT_TEXT_COLOR, fontSize: 17 }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.otpView}>
                                <View style={styles.innerOtpView}>
                                    <View>
                                        <OTPInputView
                                            autoFocusOnLoad
                                            codeInputFieldStyle={styles.underlineStyleBase}
                                            codeInputHighlightStyle={styles.underlineStyleHighLighted}
                                            style={{ width: '80%', height: 100, }}
                                            pinCount={4}
                                            onCodeFilled={(code => {
                                                gettingOtpValue(code)
                                            })}
                                        />
                                    </View>
                                    <View></View>
                                </View>
                            </View>
                            {
                                isForm ? <View style={styles.resendOtpView}>
                                    <View style={[styles.innerResendOtpView, { flexDirection: 'row', alignItems: 'center' }]}>
                                        <View style={{ marginRight: 8 }}>
                                            <Image source={require('../../assets/Images/successCheck.png')} />
                                        </View>
                                        <View>
                                            <Text style={{ fontFamily: ColorsText.regular.fontFamily, color: 'green' }}>OTP Verified</Text>
                                        </View>
                                    </View>
                                </View> :
                                <View style={styles.resendOtpView}>
                                    <View style={styles.innerResendOtpView}>
                                        <TouchableOpacity
                                            style={styles.resendButton}
                                            onPress = {valdidateOTPResend}
                                            disabled = {timerInterval > 0 ? true : false}
                                        >
                                            <Text style={[styles.resendButtonText, { color: timerInterval > 0 ? colors.GRAY_TEXT_NEW : colors.ROYAL_BLUE }]}>Resend OTP</Text>
                                        </TouchableOpacity>
                                        <View style = {{ display: timerInterval > 0 ? 'flex' : 'none'}}><Text style = {{ color: colors.MANGO_COLOR, fontFamily: ColorsText.regular.fontFamily, fontSize: 15 }}>   {timerInterval}s</Text></View>
                                    </View>
                                </View>
                            }

                            {
                                isForm && <>
                                    <View style={styles.userName}>
                                        <View style={styles.innerUserName}>
                                            <TextInput
                                                onChangeText={(e) => setUsername(e)}
                                                style={[styles.nameInput, { borderWidth: 0.7, borderColor: isError ? '#CA0B00' : '#fff' }]}
                                                placeholder='Your name here'
                                                placeholderTextColor='gray'
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.savedBtn}>
                                        <View style={styles.innerSavedBtn}>
                                            <TouchableOpacity onPress={handleChange} style={styles.saveBtnMain}>
                                                <Text style={styles.saveText}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </>
                            }
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </View>
    )
}

export default OTP

const styles = StyleSheet.create({
    boxContainer: {
        // justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flex: 1
    },
    innerboxContainer: {
        width: '80%',
    },
    mainHeading: {
        marginTop: '30%',
        width: '100%',
    },
    headingText: {
        fontSize: 26,
        fontFamily: ColorsText.regular.fontFamily
    },
    phoneNumber: {
        marginTop: '10%',
        width: '100%',
        backgroundColor: '#fff',
        // height: 40,
        // justifyContent: 'center',
        borderRadius: 999,
        shadowColor: ColorsText.iosShadow.shadowColor,
        shadowOffset: {
            width: ColorsText.iosShadow.shadowOffset.width,
            height: ColorsText.iosShadow.shadowOffset.height,
        },
        shadowOpacity: ColorsText.iosShadow.shadowOpacity,
        shadowRadius: ColorsText.iosShadow.shadowRadius,

        elevation: ColorsText.iosShadow.elevation,
        overflow: 'hidden'
    },
    numberInputView: {
        flexDirection: 'row',
        fontFamily: ColorsText.regular.fontFamily
    },
    countryCode: {
        paddingLeft: 20,
        paddingRight: 10,
        borderRightWidth: 2,
        borderRightColor: '#f1f1f1'
    },
    countryCodeText: {
        fontSize: 18,
        fontFamily: ColorsText.regular.fontFamily
    },
    mainInput: {
        paddingLeft: 10,
        fontFamily: ColorsText.regular.fontFamily
    },
    inputValues: {
        fontSize: 18,
        fontWeight: '400',
        fontFamily: ColorsText.regular.fontFamily,
        color: 'black'
    },
    otpView: {
        width: '100%',
        justifyContent: 'center'
    },
    innerOtpView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    underlineStyleBase: {
        width: 50,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderColor: '#999',
        color: '#000',
        fontSize: 18
    },

    underlineStyleHighLighted: {
        borderColor: '#000',
    },
    resendOtpView: {
        width: '100%',
        justifyContent: 'center'
    },
    innerResendOtpView: {
        width: '100%',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    resendButtonText: {
        fontFamily: ColorsText.Bold.fontFamily,
        fontSize: 16
    },



    userName: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '8%',
        marginTop: '10%'
    },
    innerUserName: {
        width: '100%',
    },
    nameInput: {
        height: 40,
        backgroundColor: '#fff',
        paddingLeft: 10,
        fontSize: 15,
        fontFamily: ColorsText.regular.fontFamily,
        borderRadius: 6,
        shadowColor: ColorsText.iosShadow.shadowColor,
        shadowOffset: {
            width: ColorsText.iosShadow.shadowOffset.width,
            height: ColorsText.iosShadow.shadowOffset.height,
        },
        shadowOpacity: ColorsText.iosShadow.shadowOpacity,
        shadowRadius: ColorsText.iosShadow.shadowRadius,

        elevation: ColorsText.iosShadow.elevation,
        color: 'black'
    },
    savedBtn: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ColorsText.primary_color.color,
        // marginTop: '20%',
        borderRadius: 7,
        shadowColor: ColorsText.iosShadow.shadowColor,
        shadowOffset: {
            width: ColorsText.iosShadow.shadowOffset.width,
            height: ColorsText.iosShadow.shadowOffset.height,
        },
        shadowOpacity: ColorsText.iosShadow.shadowOpacity,
        shadowRadius: ColorsText.iosShadow.shadowRadius,

        elevation: ColorsText.iosShadow.elevation,
        marginBottom: 10
    },
    innerSavedBtn: {
        width: '100%',
        justifyContent: 'center',
        height: 40,
    },
    saveBtnMain: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: {
        fontFamily: ColorsText.Medium.fontFamily,
        fontSize: 16
    }
})
