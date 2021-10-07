import { Icon } from 'native-base'
import React , { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Pressable, Share, Linking } from 'react-native'
import ColorsText from '../../../constants/ColorsText'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import colors from '../../../constants/colors'
import { CommonActions } from '@react-navigation/routers'
import { useNavigation } from '@react-navigation/native'
import Application from '../../../Utils/db/Application'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import { showMessage } from 'react-native-flash-message'
import { strings } from '../../../constants/strings'
import GIFLoading from '../../Components/GIFLoading/GIFLoading'
import { links } from '../../../constants/externalLinks'
import Modal from 'react-native-modal'
import { width } from '../../../constants/dimensions'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'

const Profile = () => {

    const [userDetails, setUserDetails] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isModalVisible, setisModalVisible] = useState(false)

    const navigation = useNavigation()

    useEffect(() => {
        const unsubsribe = navigation.addListener('focus' , async () => {
            setIsLoading(true)
            let token = await AsyncStorage.getItem('token')
            let object = {
                method : 'GET',
                headers : {
                    Accept : 'application/json',
                    'Content-Type' : 'application/json',
                    Authorization : `Bearer ${token}`
                }
            }
            postMethod(urls.GET_ALL_ADDRESSES , object , (err,result) => {
                setTimeout(() => {
                  setIsLoading(false)
                },600)
                if(err)
                    console.log(err)
                else if(result.status && result.code === 200)
                    setUserDetails(result.user)
                else
                    showMessage({
                        icon : 'danger',
                        style : { backgroundColor : colors.BLACK },
                        floating : true,
                        duration : 1400,
                        message : strings.PROBLEM_GETTING_PROFILE_DETAILS
                    })
            })
        })

        return () => {
            unsubsribe()
        }
    },[])

    const logOut = async () => {
        setisModalVisible(false)
        await Application.clearCart()
        await Application.executeQuery(`DELETE FROM COUPON`)
        AsyncStorage.clear()
        .then(() => {
            navigation.dispatch(CommonActions.reset({
                index : 0,
                routes : [
                    { name : 'Registration' }
                ]
            }))
        })
    }

    const openLink = async url => {
        try {
            if(await InAppBrowser.isAvailable()) {
                const res = await InAppBrowser.open(url, {})
                console.log(JSON.stringify(res))
            }
            else
                Linking.openURL(url)
        }
        catch(err) {
            console.log(err)
        }
    }

    if(isLoading)
        return <GIFLoading />

    else
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator = {false}>
                    <View style={styles.profileInfo}>
                        <TouchableOpacity
                            style={styles.innerProfileInfo}
                            activeOpacity = {.5}
                            onPress = {() => userDetails.hasOwnProperty('birth_date') && navigation.navigate('EditProfile' , { userDetails })}
                        >
                            <View style={styles.userImage}>
                                {
                                    userDetails.profile_image ? <Image style={styles.userProfileImage} source={{ uri : userDetails.profile_image }} resizeMode = 'contain' /> : <Icon active type = 'SimpleLineIcons' name = 'user' style = {{ fontSize : 25 , color : colors.PRIMARY }} />
                                }
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.userName}>{userDetails.name}</Text>
                                <Text style={styles.userEmail}>{userDetails.phone}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style = {{ flex : .15 }}>
                            <Pressable
                                onPress = {() => userDetails.hasOwnProperty('birth_date') && navigation.navigate('EditProfile' , { userDetails })}
                                hitSlop = {25}
                            >
                                <View style = {{ flexDirection : 'row' , alignItems : 'center' , justifyContent : 'center' }}>
                                    <Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 12 , color : colors.ROYAL_BLUE , marginRight : '4%' , letterSpacing : .5 }}>Edit</Text>
                                    <Icon
                                        active
                                        type = 'MaterialIcons'
                                        name = 'edit'
                                        style = {{ fontSize : 12 , color : colors.ROYAL_BLUE , marginTop : '-7%' }}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    </View>

                    <View style = {{ flex : 1, marginBottom: 100 }}>

                        <Modal
                            isVisible = {isModalVisible}
                            onBackdropPress = {() => setisModalVisible(false)}
                            animationIn = 'tada'
                            animationInTiming = {700}
                            animationOut = 'fadeOut'
                            animationOutTiming = {300}
                        >
                            <View style = {styles.modalContainer}>
                                <View style = {{ marginBottom: '5%' , marginTop: '3%' }}><Text style = {styles.modalText}>{strings.CONFIRM_LOGOUT}</Text></View>
                                <View style = {styles.modalButtonsContainer}>
                                    <View style = {{ marginRight: '10%' }}><Pressable style = {styles.modalButton} onPress = {() => setisModalVisible(false)}><Text style = {styles.modalButtonText}>Cancel</Text></Pressable></View>
                                    <View><Pressable style = {styles.modalButton} onPress = {logOut}><Text style = {styles.modalButtonText}>Proceed</Text></Pressable></View>
                                </View>
                            </View>
                        </Modal>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => navigation.navigate('Orders')}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon active type = 'Entypo' name = 'shopping-bag' style = {styles.descriptiveIcon} />
                                            {/* <Image source={OrderIcon} /> */}
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>Orders</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => navigation.navigate('Address')} >
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon active type = 'Entypo' name = 'location-pin' style = {styles.descriptiveIcon} />
                                            {/* <Image source={DeliveryAddress} /> */}
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>Delivery Addresses</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => openLink(links.FAQS)}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon type = 'AntDesign' name = 'questioncircleo' style = {styles.descriptiveIcon} />
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>FAQ's</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => openLink(links.ABOUT_US)}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                        <Icon name = 'information-circle' style = {styles.descriptiveIcon} />
                                            {/* <Image source={AboutIcon} /> */}
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>About Us</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => openLink(links.CONTACT_US)}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon active type = 'MaterialCommunityIcons' name = 'phone-in-talk' style = {styles.descriptiveIcon} />
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>Contact Us</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => openLink(links.PRIVACY_POLICY)}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon active name = 'ios-shield-checkmark' style = {styles.descriptiveIcon} />
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>Privacy Policy</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => openLink(links.TnC)}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon active name = 'clipboard-pencil' type = 'Foundation' style = {styles.descriptiveIcon} />
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>Terms and Conditions</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={styles.iconSize} type = 'Entypo' name = 'chevron-right' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback
                                style={[styles.moreButton]}
                                onPress = {() => Share.share({
                                    title: strings.SHARE_COUPON_CODE,
                                    message: userDetails?.referral_code?.coupon_code,
                                })}
                            >
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style={styles.buttonIcon}>
                                            <Icon active name = 'ios-gift-outline' style = {styles.descriptiveIcon} />
                                        </View>
                                        <View style={styles.buttonType}>
                                            <Text style={styles.buttonText}>Invite friends, get rewards</Text>
                                            <View style = {{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[styles.buttonText, { fontSize: 12 }]}>Share your code</Text>
                                                <Text style={styles.buttonText}>{`  ${userDetails?.referral_code?.coupon_code}`}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style = {styles.itemRow}>
                            <TouchableWithoutFeedback style={[styles.moreButton]} onPress = {() => setisModalVisible(true)}>
                                <View style={styles.innerButton}>
                                    <View style={styles.buttonLeft}>
                                        <View style = {{ marginLeft: 5 }}>
                                            <Text style={{ fontFamily: ColorsText.Bold.fontFamily, fontSize: 18 }}>LOGOUT</Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Icon style={{ fontSize: 22 }} type = 'Ionicons' name = 'power-sharp' active />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </ScrollView>
                <View style = {styles.itemRow}>
                    <TouchableWithoutFeedback
                        style={[styles.moreButton, { borderBottomWidth: 0 }]}
                        onPress = {() => {}}
                    >
                        <View style={[styles.innerButton, { justifyContent: "center" }]}>
                            <Text style={[styles.buttonText, { fontSize: 13, color: colors.GRAY_TEXT_NEW }]}>App version 1.0.0 [1]</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative'
    },
    logoutBtn: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: '5%',
        zIndex : 10
    },
    profileInfo: {
        width: '100%',
        // justifyContent: 'center',
        alignItems: 'center',
        marginTop: '3%',
        marginBottom: '6%',
        flexDirection : 'row'
    },
    innerProfileInfo: {
        // width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        flex : .85,
        paddingLeft : '3%'
    },
    userImage: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        borderWidth: 2,
        marginRight: 10,
        borderColor: ColorsText.primary_color.color,
        position : 'relative'
    },
    userProfileImage: {
        resizeMode: 'contain',
        width : 50,
        height : 50,
        borderRadius : 40
    },
    userName: {
        fontFamily: ColorsText.regular.fontFamily,
        fontSize: 18,
        letterSpacing : .5
    },
    userEmail: {
        fontFamily: ColorsText.light.fontFamily,
        fontSize: 12,
        color: '#7c7c7c'
    },
    moreButton: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        // borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E2E2E2',
    },
    innerButton: {
        width: '93%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    buttonLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonType: {
        marginLeft: 15
    },
    buttonText: {
        fontFamily: ColorsText.regular.fontFamily,
        fontSize: 16
    },
    iconSize: {
        fontSize: 16
    },
    innerlogoutBtn: {
        width: '93%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EB5757',
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
    logoutText: {
        fontFamily: ColorsText.regular.fontFamily,
        fontSize: 17,
        color: '#fff'
    },

    itemRow : {
        marginBottom : '3%'
    },
    descriptiveIcon : {
        color : colors.ROYAL_BLUE,
        fontSize : 22
    },

    modalContainer : {
        width : width * 0.75,
        backgroundColor : colors.WHITE,
        borderRadius : 5,
        paddingTop : 20,
        paddingBottom: 10,
        paddingHorizontal : 15,
        alignSelf : 'center'
    },
    
    modalButtonsContainer : {
        flexDirection : 'row',
        justifyContent : "flex-end",
        alignItems : 'center'
    },

    modalTitle : {
        fontFamily : ColorsText.Bold.fontFamily,
        color : colors.MANGO_COLOR,
        fontSize : 20
    },

    modalText : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 16,
        color: colors.DUSKY_BLACK_TEXT
    },

    modalButton : {
        height : 30,
        justifyContent : 'center',
        paddingHorizontal : 4
    },

    modalButtonText : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 15,
        color : colors.MANGO_COLOR
    }
})