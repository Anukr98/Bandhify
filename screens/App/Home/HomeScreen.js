import React from 'react'
import { View } from 'react-native'
import ShopsNear from './ShopsNear'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import Notifications from '../Notifications/Notifications'

const Stack = createStackNavigator()

const Home = () => <View style={{ flex: 1 }}>
    <ShopsNear />
</View>

const HomeScreen = () => {
    return (
        <Stack.Navigator
            headerMode = 'none'
            screenOptions = {{
                cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
            }}
        >
            <Stack.Screen name = 'HomeScreen' component = {Home} />
            <Stack.Screen name = 'Notifications' component = {Notifications} />
        </Stack.Navigator>
    )
}

export default HomeScreen