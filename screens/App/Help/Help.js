import { Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import { View, Text, BackHandler, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native'
import colors from '../../../constants/colors'
import { strings } from '../../../constants/strings'
import styles from './styles'
import { Checkbox, TouchableRipple } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showMessage } from 'react-native-flash-message'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import RadioButton from '../../Components/RadioButton'

const Help = ({ route, navigation }) => {
    const { orderDetails } = route.params
    const { order_id, user } = orderDetails
    const { name, phone } = user

    const [issue, setIssue] = useState('')
    const [description, setDescription] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
        return () => backButtonAction.remove()
    },[])

    const handleBackButtonClick = () => {
        navigation.replace("OrderDetails", { orderDetails })
        return true
    }

    const getHelp = async () => {
        if(!description) {
            showMessage({
                icon: "info",
                message: "Please describe your issue for us!",
                style: {backgroundColor: colors.BLACK}
            })
            return
        }
        setLoading(true)
        let token = await AsyncStorage.getItem("token")
        let object = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                missingitems: issue === "missing",
                refund: issue === "refund",
                incorrectItems: issue === "incorrectitems",
                description,
                order_id
            })
        }
        postMethod(urls.HELP, object, (err,result) => {
            setTimeout(() => {
              setLoading(false)
            },800)
            if(err) console.log(err)
            else if(result.status && result.code === 201) {
                showMessage({
                    type: "success",
                    icon: "success",
                    duration: 2500,
                    message: `We've got your feedback. Please wait for some time while we process your request`
                })
                setTimeout(() => {
                    setLoading(false)
                  },820)
                setTimeout(() => {
                    handleBackButtonClick()
                },850)
            }
            else {
                alert("error")
            }
        })
    }

    return (
        <View style = {{ flex: 1, backgroundColor: colors.WHITE }}>
            <View style = {{ width: "93%", alignSelf: "center", flex: 1 }}>
                <View style = {styles.header}>
                    <Pressable onPress = {handleBackButtonClick}><Icon name = "arrow-back" style = {{ fontSize: 27, color: colors.DUSKY_BLACK_TEXT }} /></Pressable>
                    <Text style = {styles.headerText}>Help & Support</Text>
                </View>
                <View style = {{ marginTop: "8%" }}>
                    <ScrollView>
                        <View><Text style = {styles.helpTitle}>Hi {name}</Text></View>
                        <View><Text style = {styles.helpTitle}>{strings.HELP_TITLE}{order_id}</Text></View>
                        <View style = {{ marginVertical: "2%" }}><Text style = {[styles.helpSubtext]}>{strings.HELP_CONTACT}{` ${phone}`}</Text></View>
                        <View>
                            <View style = {[styles.checkboxRow, { marginBottom: "3%" }]}>
                                {/* <Checkbox
                                    status = {issue === "missing" ? "checked" : "unchecked"}
                                    onPress = {() => setIssue("missing")}
                                    color = {colors.MANGO_COLOR}
                                /> */}
                                <RadioButton 
                                checked={issue==='missing'}
                                    onPress = {() => setIssue("missing")}
                                />
                                <Pressable onPress = {() => setIssue("missing")} style = {{ width: "100%", paddingVertical: "2%",paddingHorizontal:"2%" }}><Text>Missing items</Text></Pressable>
                            </View>
                            <View style = {[styles.checkboxRow, { marginBottom: "3%" }]}>
                                {/* <Checkbox
                                    status = {issue === "refund" ? "checked" : "unchecked"}
                                    onPress = {() => setIssue("refund")}
                                    color = {colors.MANGO_COLOR}
                                /> */}
                                <RadioButton 
                                    checked={issue === 'refund'}
                                    onPress = {() => setIssue("refund")}
                                />
                                <Pressable  onPress = {() => setIssue("refund")} style = {{ width: "100%", paddingVertical: "2%",paddingHorizontal:"2%" }}><Text>Refund related issue</Text></Pressable>
                            </View>
                            <View style = {styles.checkboxRow}>
                                {/* <Checkbox
                                    status = {issue === "incorrectitems" ? "checked" : "unchecked"}
                                    onPress = {() => setIssue("incorrectitems")}
                                    color = {colors.MANGO_COLOR}
                                /> */}
                                <RadioButton 
                                checked={issue==='incorrectitems'}
                                    onPress = {() => setIssue("incorrectitems")}
                                />
                                <Pressable onPress = {() => setIssue("incorrectitems")} style = {{ width: "100%", paddingVertical: "2%",paddingHorizontal:"2%" }}><Text>Incorrect items received</Text></Pressable>
                            </View>
                            <View style = {{ marginTop: "5%", position: "relative" }}>
                                <TextInput
                                    onChangeText = {text => setDescription(text)}
                                    placeholder = {"Please describe your issue"}
                                    placeholderTextColor = {colors.DUSKY_BLACK_TEXT}
                                    style = {styles.descriptioninput}
                                    multiline
                                />
                                <View style = {{ position: "absolute", bottom: 2, right: 2, transform: [{rotateZ: "-45deg"}] }}>
                                    <Icon name = "filter-outline" style = {{ fontSize: 10, color: colors.GRAY_TEXT_NEW }} />
                                </View>
                            </View>
                            <View style = {{ marginTop: "10%" }}>
                                <TouchableRipple
                                    style = {styles.submitButton}
                                    onPress = {getHelp}
                                    rippleColor = {colors.RIPPLE_COLORS.WHITE}
                                >
                                    { loading ? <ActivityIndicator size = "small" color = {colors.WHITE} /> : <Text style = {styles.submitButtonText}>Submit</Text>}
                                </TouchableRipple>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    )
}

export default Help
