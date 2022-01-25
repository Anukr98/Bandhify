import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { Icon } from 'native-base'
import React, { useEffect , useState } from 'react'
import { View, Text, BackHandler, TouchableWithoutFeedback, FlatList } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { TouchableRipple } from 'react-native-paper'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { width } from '../../../constants/dimensions'
import urls from '../../../constants/urls'
import { postMethod } from '../../../Utils/CommonFunctions'
import Loader from '../../Components/Loader/Loader'
import styles from './styles'
import Geocode from 'react-native-geocoding'
import keys from '../../../constants/keys'

const SavedAddresses = ({ route }) => {

    const { latitude , longitude } = route.params
    const navigation = useNavigation()

    const [addresses, setAddresses] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress' , handleBackButtonClick)
        const unsubscribe = navigation.addListener('focus' , async () => {
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
                if(err)
                    console.log(err)
                else if (result.status && result.code === 200)
                    setAddresses(result.user.address)
                else {
                    showMessage({
                        icon : 'danger',
                        style : { backgroundColor : colors.BLACK },
                        floating : true,
                        duration : 1300,
                        message : 'Problem while getting your addresses'
                    })
                    setTimeout(() => {
                       navigation.navigate('Home')
                    }, 1400);
                }
            })
        })

        return () => {
            backButtonAction.remove()
            unsubscribe()
        }
    },[])

    const handleBackButtonClick = () => {
        navigation.navigate('Home')
        return true
    }

    const changeAddress = async address => {
        const { latitude, longitude } = address
        setIsLoading(true)
        let str = address.address_line_2 + ', ' + address.address_line_3 + address?.locality?.locality
        Geocode.init(keys.GOOGLE_MAPS_API)
        Geocode.from(str)
        .then(async res => {
            await AsyncStorage.setItem('location',res.results[0].formatted_address)
            await AsyncStorage.setItem('addressLatitude', latitude.toString())
            await AsyncStorage.setItem('addressLongitude', longitude.toString())
            setTimeout(() => {
                setIsLoading(false)
            }, 1000)
            setTimeout(() => {
                navigation.navigate('Home')
            }, 1200)
        })
        .catch(err => {
            setIsLoading(false)
            if(err?.code === 4) {
                setIsLoading(false)
                showMessage({
                    type: 'info',
                    message: 'We could not locate a precise location for this address. Please try editing the same',
                    duration: 2500,
                    position: 'top',
                    style: {
                        backgroundColor: colors.BLACK
                    }
                })
            }
        })
    }

    const renderItem = ({ item }) => (
        <TouchableRipple
            style = {styles.address}
            onPress = {() => changeAddress(item)}

        >
            <View style = {{ flexDirection : 'row' , alignItems : 'center' }}>
                <View style = {styles.iconContainer}>
                    <Icon
                        active
                        type = {item?.address_type.toLowerCase() === 'home' ? 'AntDesign' : item?.address_type.toLowerCase() === 'office' ? 'Ionicons' : 'EvilIcons'}
                        name = {item?.address_type.toLowerCase() === 'home' ? 'home' : item?.address_type.toLowerCase() === 'office' ? 'briefcase-outline' : 'location'}
                        style = {styles.listItemIcon}
                    />
                </View>
                <View style = {styles.addressDetails}>
                    <Text style= {styles.addressType}>{item?.address_type}</Text>
                    <Text numberOfLines = {1} style = {styles.addressText}>{item?.address_line_1}, {item?.address_line_2}, {item?.address_line_3}, {item?.state}</Text>
                </View>
            </View>
        </TouchableRipple>
    )

    const headerComponent = () => (
        <View style = {{ flexDirection : 'row' , alignItems : "center" , marginBottom : '1%' }}>
            <View style = {{ flex : .13 }}><Text></Text></View>
            <View style = {{ flex : .87 }}><Text style = {{ fontFamily : ColorsText.regular.fontFamily , color : colors.ROYAL_BLUE }}>Your saved addresses</Text></View>
        </View>
    )

    return (
        <View style = {{ flex : 1 , backgroundColor : colors.WHITE }}>
            {
                isLoading && <Loader />
            }
            <View style = {styles.header}>
                <View style = {styles.innerHeader}>
                    <View>
                        <TouchableWithoutFeedback
                            onPress = {() => navigation.navigate('Home')}
                        >
                            <Icon
                                active
                                type = 'Entypo'
                                name = 'chevron-left'
                                style = {styles.backButton}
                            />
                        </TouchableWithoutFeedback>
                    </View>

                    <View style = {styles.locationContainer}>
                        <TouchableWithoutFeedback
                            onPress = {() => navigation.navigate('SearchLocation' , {
                                latitude,
                                longitude
                            })}
                        >
                            <View style = {styles.locationInnerContainer}>
                                <View style = {{ flex : .12 }}>
                                    <Icon
                                        active
                                        type = 'MaterialIcons'
                                        name = 'my-location'
                                        style = {{ color : colors.ROYAL_BLUE }}
                                    />
                                </View>
                                <View style = {{ flex : .88 }}><Text style = {styles.locationText}>Search Using GPS</Text></View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>

                <View style = {{ height : 10 , backgroundColor : colors.LIGHT_GRAY_BG_COLOR , width , marginTop : '4%' }}><Text></Text></View>
            </View>

            <View style = {styles.addresses}>
                <View style = {styles.innerAddressContainer}>
                    <FlatList
                        data = {addresses}
                        renderItem = {renderItem}
                        ListHeaderComponent = {headerComponent}
                    />
                </View>
            </View>
        </View>
    )
}

export default SavedAddresses