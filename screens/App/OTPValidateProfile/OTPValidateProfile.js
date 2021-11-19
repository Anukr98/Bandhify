import React, { useEffect, useState } from 'react'
import { View, Text, BackHandler, Pressable, TouchableOpacity } from 'react-native'
import colors from '../../../constants/colors'
import styles from './styles'
import { Icon } from 'native-base'
import { useNavigation } from '@react-navigation/native'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import { showMessage } from 'react-native-flash-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ColorsText from '../../../constants/ColorsText'
import Loader from '../../Components/Loader/Loader'
import BackgroundTimer from 'react-native-background-timer'
import { useStateValue } from '../../../Utils/StateProvider'
import { AppConfig, ENVS } from '../../../constants/config'

const OTPValidateProfile = ({ route }) => {

    const [isLoading, setIsLoading] = useState(false)

    const { userDetails , email } = route.params
    const { phone, id, name, gender, birth_date, is_married, family_size } = userDetails
    const navigation = useNavigation()
    const [{firebaseFCMToken}, dispatch] = useStateValue()

    const [counter, setCounter] = useState(30)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        return () => backButtonAction.remove()
    },[])

    useEffect(() => {
        if(counter > 0)
            createInterval()
    },[counter])

    const createInterval = () => {
        let timerId = BackgroundTimer.setTimeout(() => {
            BackgroundTimer.clearTimeout(timerId)
            setCounter(prev => prev - 1)
        },1000)
    }

    const handleBackButtonClick = () => {
        navigation.replace('EditProfile' , { userDetails })
        return true
    }

    const verifyOTP = async code => {
        setIsLoading(true)
        let token = await AsyncStorage.getItem('token')
        let object = {
            method : 'POST',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                phone,
                'otp' : AppConfig === ENVS.PROD ? code : "1234",
                'device' : 'app',
                "device_token": firebaseFCMToken
            })
        }
        postMethod(urls.verifyOTP , object , (err,result) => {
            if(err)
                console.log(err)
            else if(result.status && result.code === 200) {
                showMessage({
                    type : 'success',
                    icon : 'success',
                    floating : true,
                    duration : 1400,
                    message : 'OTP verified successfully'
                })
                let verifyProfileObject = {
                    method : 'PATCH',
                    headers : {
                        Accept : 'application/json',
                        'Content-Type' : 'application/json',
                        Authorization : `Bearer ${token}`
                    },
                    body : JSON.stringify({
                        phone,
                        email,
                        name,
                        gender,
                        birth_date,
                        is_married,
                        family_size,
                    })
                }
                postMethod(`${urls.UPDATE_PROFILE}/${id}` , verifyProfileObject , (err,result) => {
                    setTimeout(() => {
                        setIsLoading(false)
                    },300)
                    if(err)
                        console.log(err)
                    else if(result.status && result.code === 204) {
                        showMessage({
                            icon : 'success',
                            type : 'success',
                            message : result.message,
                            floating : true,
                            duration : 1400
                        })
                        navigation.replace('EditProfile' , { userDetails : result.user })
                    }
                    else
                        showMessage({
                            icon : 'danger',
                            floating : true,
                            duration : 1400,
                            style : { backgroundColor : colors.BLACK },
                            message : 'Profile could not be updated'
                        })
                })
            }
            else {
                setTimeout(() => {
                    setIsLoading(false)  
                },300)
                showMessage({
                    icon : 'danger',
                    floating : true,
                    duration : 1400,
                    style : { backgroundColor : colors.BLACK },
                    message : 'Incorrect OTP'
                })
            }
        })
    }

    const resendOTP = () => {
        setCounter(30)
        let object = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone,
                "device": "app"
            })
        }
        postMethod(urls.sendOTP, object, (err,result) => {
            if(err) console.log(err)
            else if(result.status)
                showMessage({
                    type : 'success',
                    icon : 'success',
                    floating : true,
                    message : "OTP Resent successfully",
                })
            else
                showMessage({
                    message : result.message,
                    type : 'danger',
                    icon : 'danger',
                    floating : true,
                })
        })
    }

    return (
        <View style = {{ flex : 1 , backgroundColor : colors.WHITE }}>
            {
                isLoading && <Loader />
            }
            <View style = {styles.container}>
                <View style = {styles.header}>
                    <Pressable onPress = {() => navigation.replace('EditProfile' , { userDetails })} hitSlop = {10}><Icon active type = 'Ionicons' name = 'arrow-back' style = {{ color : colors.DUSKY_BLACK_TEXT }} /></Pressable>
                    <View style = {{ marginLeft : '3%' }}><Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 20 , color : colors.DUSKY_BLACK_TEXT }}>Validate your details</Text></View>
                </View>
                <View style = {styles.otpView}>
                    <View style = {{ alignItems : 'center' }}>
                        <Text style = {styles.titleText}>Please enter the OTP sent on your registered</Text>
                        <Text style = {styles.titleText}>mobile number XXXXXXX{phone?.toString().slice(7)}</Text>
                    </View>
                    <OTPInputView
                        pinCount = {4}
                        style = {{ width : '90%' , height : 100 }}
                        codeInputFieldStyle = {styles.inputField}
                        codeInputHighlightStyle = {styles.highlightedField}
                        onCodeFilled = {verifyOTP}
                    />
                </View>
                <View style = {{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style = {{ marginRight: '3%' }}><TouchableOpacity onPress = {resendOTP} disabled = {counter > 0 ? true : false}><Text style = {{ color: counter > 0 ? colors.GRAY_TEXT_NEW : colors.ROYAL_BLUE, fontFamily: ColorsText.Bold.fontFamily, fontSize: 16}}>Resend OTP</Text></TouchableOpacity></View>
                    <View style = {{ display: counter > 0 ? 'flex' : 'none' }}><Text style = {{ color: colors.MANGO_COLOR, fontFamily: ColorsText.regular.fontFamily }}>Resend in {counter}s</Text></View>
                </View>
            </View>
        </View>
    )
}

export default OTPValidateProfile