import { Icon } from 'native-base'
import React, { useState , useEffect } from 'react'
import { View, Text, TouchableWithoutFeedback, FlatList, BackHandler, Pressable, Image } from 'react-native'
import styles from './styles'
import { useNavigation } from '@react-navigation/native'
import { TouchableRipple } from 'react-native-paper'
import ColorsText from '../../../constants/ColorsText'
import colors from '../../../constants/colors'
import Modal from 'react-native-modal'
import { width , height } from '../../../constants/dimensions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { postMethod } from '../../../Utils/CommonFunctions'
import urls from '../../../constants/urls'
import { showMessage } from 'react-native-flash-message'
import GIFLoading from '../../Components/GIFLoading/GIFLoading'
import { strings } from '../../../constants/strings'

const Addresses = () => {

    const navigation = useNavigation()

    const [addresses, setAddresses] = useState([])
    const [isAlertModalVisible, setIsAlertModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [deletingAddress, setDeletingAddress] = useState(undefined)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress',handleBackButtonClick)
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
            postMethod(`${urls.GET_ALL_ADDRESSES}?with_address=true` , object , (err,result) => {
                setTimeout(() => {
                    setIsLoading(false)
                },1000)
                if(err)
                    console.log(err)

                else if(result.status && result.code === 200)
                    setAddresses(result.user.address)
                else {
                    showMessage({
                        icon : 'danger',
                        style : { backgroundColor : colors.BLACK },
                        floating : true,
                        duration : 1300,
                        message : 'Problem while getting your addresses'
                    })
                    setAddresses([])
                }
            })
        })
        return () => {
            backButtonAction.remove()
            unsubsribe()
        }
    },[])

    const handleBackButtonClick = () => {
        navigation.navigate('ProfileScreen')
        return true
    }

    const deleteAddress = async () => {
        setIsLoading(true)
        setIsAlertModalVisible(false)
        let token = await AsyncStorage.getItem('token')
        let object = {
            method : 'DELETE',
            headers : {
                Accept : 'application/json',
                'Content-Type' : 'application/json',
                Authorization : `Bearer ${token}`
            }
        }
        postMethod(`${urls.DELETE_ADDRESS}/${deletingAddress.id}` , object , (err,result) => {
            if(err)
                console.log(err)
            else if(result.status && result.code === 200) {
                showMessage({
                    icon : "success",
                    type : 'success',
                    floating : true,
                    duration : 1400,
                    message : result.message
                })
                
                let getAddressObject = {
                    method : 'GET',
                    headers : {
                        Accept : 'application/json',
                        'Content-Type' : 'application/json',
                        Authorization : `Bearer ${token}`
                    }
                }
                postMethod(`${urls.GET_ALL_ADDRESSES}?with_address=true` , getAddressObject , (error,res) => {
                    if(error)
                        console.log(error)
    
                    else if(res.status && res.code === 200) {
                        setAddresses(res.user.address)
                        setTimeout(() => {
                            setIsLoading(false)
                        },1000)
                    }
                    else {
                        showMessage({
                            icon : 'danger',
                            style : { backgroundColor : colors.BLACK },
                            floating : true,
                            duration : 1300,
                            message : 'Problem while getting your addresses'
                        })
                        setTimeout(() => {
                            navigation.navigate('ProfileScreen')
                        }, 1400)
                    }
                })
            }
        })
    }

    const renderItem = ({ item , index }) => <View style = {styles.listItem}>
        <View style = {styles.listItemIconContainer}>
            <Icon
                active
                type = {item.address_type.toLowerCase() === 'home' ? 'AntDesign' : item.address_type.toLowerCase() === 'office' ? 'Ionicons' : 'EvilIcons'}
                name = {item.address_type.toLowerCase() === 'home' ? 'home' : item.address_type.toLowerCase() === 'office' ? 'briefcase-outline' : 'location'}
                style = {styles.listItemIcon}
            />
        </View>
        <View style = {[styles.listItemAddress , { borderBottomColor : index === addresses.length-1 ? 'white' : colors.GRAY_BORDER_COLOR , borderBottomWidth : index === addresses.length-1 ? 0 : .7 }]}>
            <View><Text style = {{ fontFamily : ColorsText.Medium.fontFamily , fontSize : 18 , color : colors.MANGO_COLOR }}>{item.address_type}</Text></View>
            <View style = {{ marginTop : '3%' }}>
                <Text style = {{ color : colors.ROYAL_BLUE , fontFamily : ColorsText.light.fontFamily , fontSize : 12 , letterSpacing : .3 }}>{item.address_line_1}, {item.address_line_2}, {item.address_line_3}, {item.pincode}, {item.state}, {item.country}</Text>
            </View>
            <View style = {styles.listButtonArea}>
                <View style = {styles.listButtonContainer}>
                    <TouchableRipple
                        style = {styles.listButton}
                        onPress = {() => navigation.replace('VerifyLocation' , { direction : 'Edit' , item })}
                        rippleColor = {colors.RIPPLE_COLORS.BLACK}
                    >
                        <Text style = {styles.buttonText}>EDIT</Text>
                    </TouchableRipple>
                </View>
                <View style = {styles.listButtonContainer}>
                    <TouchableRipple
                        style = {styles.listButton}
                        onPress = {() => {
                            setDeletingAddress(item)
                            setIsAlertModalVisible(true)
                        }}
                        rippleColor = {colors.RIPPLE_COLORS.BLACK}
                    >
                        <Text style = {styles.buttonText}>DELETE</Text>
                    </TouchableRipple>
                </View>
            </View>
        </View>
    </View>

    const EmptyList = () => <View>
        <View style = {{ alignItems : 'center' }}>
            <Image
                source = {require('../../../assets/Images/no_address.png')}
                style = {{ width , height : 350 }}
                resizeMode = 'contain'
            />
        </View>
        <View style = {{ alignItems : "center" }}>
            <Text style = {styles.emptyListText}>You do not have any saved addresses</Text>
        </View>
    </View>

    if(isLoading)
        return <GIFLoading />

    else
        return <View style = {{ flex : 1 , backgroundColor : colors.WHITE }}>
            <Modal
                isVisible = {isAlertModalVisible}
                onBackdropPress = {() => setIsAlertModalVisible(false)}
                animationIn = 'tada'
                animationInTiming = {500}
                animationOut = 'zoomOut'
                animationOutTiming = {500}
            >
                <View style = {{ backgroundColor : '#fff' , padding : '7%' , width : width * 0.8 , alignSelf : 'center' , position : 'relative' , borderRadius : 6 }}>
                    <View style = {{ marginBottom : '2%' }}><Text style = {[ColorsText.Medium , { fontSize : 18 , color : colors.MANGO_COLOR }]}>Delete address?</Text></View>
                    <View style = {{ marginBottom : '13%' }}><Text style = {[ColorsText.regular , { color : '#999' , fontSize : 13 }]}>{strings.DELETE_ADDRESS_CONFIRMATION}</Text></View>
                    <View style = {{ flexDirection : 'row' , position : 'absolute' , bottom : 10 , right : 20 , width : '100%' , alignItems : "center", justifyContent : 'flex-end' }}>
                        <View style = {[styles.modalButtonContainer , { marginRight : '3%' }]}>
                            <TouchableRipple
                                onPress = {() => setIsAlertModalVisible(false)}
                                rippleColor = '#ffffff'
                                style = {styles.modalButton}
                            >
                                <Text style = {{ color : colors.MANGO_COLOR }}>NO</Text>
                            </TouchableRipple>
                        </View>
                        <View style = {styles.modalButtonContainer}>
                            <TouchableRipple
                                onPress = {deleteAddress}
                                rippleColor = '#ffffff'
                                style = {styles.modalButton}
                            >
                                <Text style = {{ color : colors.MANGO_COLOR }}>YES</Text>
                            </TouchableRipple>
                        </View>
                    </View>
                </View>
            </Modal>

            <>
                <View style = {styles.headerView}>
                    <View style = {styles.innerHeaderView}>
                        <View>
                            <TouchableWithoutFeedback onPress = { () => navigation.navigate('ProfileScreen') }>
                                <Icon active type = 'Ionicons' name = 'arrow-back-outline' style = {styles.headerIcon} />
                            </TouchableWithoutFeedback>
                        </View>
                        <View><Text style = {styles.headerText}>Manage your addresses</Text></View>
                    </View>
                </View>

                <View style = {[styles.addressContainer , { paddingTop : addresses.length > 0 ? '10%' : 0 }]}>
                    <View style = {[styles.innerContainer , { display : addresses.length > 0 ? 'flex' : 'none' }]}>
                        <View style = {{ marginBottom : '7%' }}><Text style = {styles.title}>Your saved addresses</Text></View>
                    </View>

                    <View style = {styles.listContainer}>
                        <FlatList
                            data = {addresses}
                            renderItem = {renderItem}
                            keyExtractor = { item => item.id }
                            showsVerticalScrollIndicator = {false}
                            ListEmptyComponent = {EmptyList}
                        />
                    </View>

                    <View style = {styles.addAddressArea}>
                        <View style = {styles.addAddressButtonContainer}>
                            <Pressable style = {styles.addAddressButton} onPress = {() => navigation.replace('VerifyLocation' , { direction : 'Add' })}>
                                <Text style = {styles.addAddressText}>ADD NEW ADDRESS</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </>
        </View>
}

export default Addresses
