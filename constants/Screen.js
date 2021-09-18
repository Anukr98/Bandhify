import React, { useEffect } from 'react'
import { View, Text, ImageBackground, StyleSheet, Image, BackHandler } from 'react-native'

import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Registration from '../screens/Auth/Registration';
import ColorsText from './ColorsText';
import OTP from '../screens/Auth/OTP';
import HomeScreen from '../screens/App/Home/HomeScreen';
import Cart from '../screens/App/Cart/Cart';
import Profile from '../screens/App/Profile/Profile';
import SearchShops from '../screens/App/SearchShops/SearchShops'

import Application from '../Utils/db/Application'
import DairyDetail from '../screens/App/Home/DairyDetails/DairyDetail';

import Addresses from '../screens/App/Address/Addresses';
import Orders from '../screens/App/Orders/Orders';
import Checkout from '../screens/App/Checkout/Checkout';
import AddAddress from '../screens/App/AddAddress/AddAddress';
import SlotSelection from '../screens/App/Slot/SlotSelection'
import Coupons from '../screens/App/Coupons/Coupons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrderDetails from '../screens/App/OrderDetails/OrderDetails';
import SavedAddresses from '../screens/App/AddressBeforeLocation';
import EditProfile from '../screens/App/EditProfile/EditProfile';
import OTPValidateProfile from '../screens/App/OTPValidateProfile/OTPValidateProfile';
import { useStateValue } from '../Utils/StateProvider';
import actions from './actions';
import messaging from '@react-native-firebase/messaging'
import colors from './colors';
import VerifyLocation from '../screens/App/MapBeforeAddress';
import SearchLocation from '../screens/App/SearchLocation/SearchLocation'
import Help from '../screens/App/Help/Help';

const SplashScreen = () => {

    const navigation = useNavigation()
    const [state, dispatch] = useStateValue()

    const handleBackButtonClick = () => {
        BackHandler.exitApp()
        return true
    }

    useEffect(() => {
        const backButtonAction = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
        const db = async () => {
            let res = await messaging().getToken()
            dispatch({
                type: actions.SET_FIREBASE_TOKEN,
                payload: {
                    token: res
                }
            })
            let token = await AsyncStorage.getItem('token')
            if (token) {
                setTimeout(() => {
                    navigation.navigate('Home')
                }, 2000)
            }
            else
                setTimeout(() => {
                    navigation.navigate('Registration')
                }, 2000)
            let result = await Application.openDatabase()
        }
        db()

        return () => {
            backButtonAction.remove()
        }
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground style={{ width: '100%', height: '100%', resizeMode: 'cover' }} source={require('../assets/Images/Splash.png')}>
                <View style={styles.boxcontainer}>
                    {/* <View style={styles.mainHeading}>
                        <Text style={styles.headingText}>Welcome to</Text>
                    </View> */}
                    <View style = {styles.imageContainer}>
                        <Image source = {require('../assets/Images/logo2.png')} resizeMode = 'contain' style = {{ width: '100%', height: 180 }} />
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}

const Home = () => {

    const Tab = createBottomTabNavigator()

    return (
        <Tab.Navigator
            tabBarOptions={{
                tabStyle: { backgroundColor: ColorsText.primary_color.color },
                showLabel: false
            }}
        >
            <Tab.Screen
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => {
                        return (
                            focused ? <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTopWidth: 2 }}><Image source={require('../assets/Images/Home.png')} style={{ tintColor: '#000000', width: '20%', height: '50%', resizeMode: 'contain' }} /></View> : <Image source={require('../assets/Images/Home.png')} style={{ width: '20%', height: '50%', resizeMode: 'contain', tintColor: '#939393' }} />
                        )
                    },
                }}
                name="HomeScreen"
                component={HomeScreen}
            />

            <Tab.Screen
                options={{
                    title: 'Shops', tabBarIcon: ({ focused }) => {
                        return (
                            focused ? <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTopWidth: 2 }}><Image source={require('../assets/Images/Search.png')} style={{ tintColor: '#000000', width: '20%', height: '50%', resizeMode: 'contain' }} /></View> : <Image source={require('../assets/Images/Search.png')} style={{ width: '20%', height: '50%', resizeMode: 'contain', tintColor: '#939393' }} />
                        )
                    },
                    unmountOnBlur : true
                }}
                name="ShopsScreen"
                component={SearchShops}
            />

            <Tab.Screen
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ focused }) => {
                        return (
                            focused ? <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTopWidth: 2 }}><Image source={require('../assets/Images/Cart.png')} style={{ width: '20%', height: '50%', resizeMode: 'contain', tintColor: '#000000' }} /></View> : <Image source={require('../assets/Images/Cart.png')} style={{ width: '20%', height: '50%', resizeMode: 'contain', tintColor: '#939393' }} />
                        )
                    },
                    unmountOnBlur: true
                }}
                name="CartScreen"
                component={Cart}
                initialParams={{ direction: 'Other' }}
            />

            <Tab.Screen
                options={{
                    title: 'Profile', tabBarIcon: ({ focused }) => {
                        return (
                            focused ? <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderTopWidth: 2 }}><Image source={require('../assets/Images/Profile.png')} style={{ tintColor: '#000000', width: '20%', height: '50%', resizeMode: 'contain' }} /></View> : <Image source={require('../assets/Images/Profile.png')} style={{ width: '20%', height: '50%', resizeMode: 'contain', tintColor: '#939393' }} />
                        )
                    },
                }}
                name="ProfileScreen"
                component={Profile}
            />

        </Tab.Navigator>
    )
}


const Screen = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator
            headerMode='none'
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
            }}
        >
            <Stack.Screen initialParams name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="Registration" component={Registration} />
            <Stack.Screen name="OTP" component={OTP} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="DairyDetais" component={DairyDetail} />
            <Stack.Screen name='Address' component={Addresses} />
            <Stack.Screen name='Checkout' component={Checkout} />
            <Stack.Screen name='AddAddress' component={AddAddress} />
            <Stack.Screen name='SlotSelection' component={SlotSelection} />
            <Stack.Screen name='Coupons' component={Coupons} />
            <Stack.Screen name='Orders' component={Orders} />
            <Stack.Screen name='SavedAddressesBeforeLocationChange' component={SavedAddresses} />
            <Stack.Screen name='EditProfile' component={EditProfile} />
            <Stack.Screen name='OTPValidateProfile' component = {OTPValidateProfile} />
            <Stack.Screen name="VerifyLocation" component = {VerifyLocation} />
            <Stack.Screen name="SearchLocation" component = {SearchLocation} />
            <Stack.Screen name="Help" component = {Help}/>
        </Stack.Navigator>
    )
}

export default Screen

const styles = StyleSheet.create({
    boxcontainer: {
        width: '100%',
        justifyContent: 'center',
        flex: 1
    },
    mainHeading: {
        width: '100%',
        alignItems: 'center',
        marginTop: '50%',
    },
    headingText: {
        fontSize: 42,
        fontFamily: ColorsText.regular.fontFamily,
        color: colors.BLACK,
        transform: [{ translateX: 7 }]
    },

    imageContainer: {
        width: '100%',
        alignItems: 'center',
        transform: [{ translateY: 110 }]
    }
})