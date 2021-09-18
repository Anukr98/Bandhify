import moment from 'moment'
import { Icon } from 'native-base'
import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Dash from 'react-native-dash'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import colors from '../../../../constants/colors'
import ColorsText from '../../../../constants/ColorsText'
import DetailSection from './DetailSection'

const AnimatedView = ({ details, onPress }) => {

    const { shop_license_number, shop_coupons, shop_founding_date } = details
    const age = moment().diff(shop_founding_date, 'days')

    const visibility = useSharedValue(false)

    const textStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withTiming(visibility.value ? 6 : -17 , {
                duration: 500
            })}],
            opacity: withTiming(visibility.value ? 0 : 1),
        }
    })

    const arrowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withTiming(visibility.value ? 15 : 6, { duration: 400 })}, { rotateX: withTiming(visibility.value ? '180deg' : '0deg', { duration: 400 })}],
            opacity: withTiming(visibility.value ? 1 : 0)
        }
    })

    const viewStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateY: withTiming(visibility.value ? 0 : -4)}],
          opacity: withTiming(visibility.value ? 1 : 0),
        };
    });

    const dashStyle = useAnimatedStyle(() => {
        return {
            marginBottom: withTiming(visibility.value ? '3%' : '0%')
        }
    })

    const dairyAge = () => {
        let years, months, days
        if(age < 30)
            return `${age} days`
        if(age > 30 && age < 365) {
            months = Math.floor(age/30)
            return `${months} months`
        }
        if(age > 365) {
            months = Math.floor(age/30)
            years = Math.floor(months/12)
            return `${years} years`
        }
    }

    return (
        <Animated.View style = {{ position : 'relative' }}>
            <Animated.View style = {[ dashStyle ]}>
            <Dash
                style = {{ width : '100%' , height : 2 , marginTop : '3%' }}
                dashThickness = {1.5}
                dashGap = {2}
                dashLength = {1.5}
                dashColor = {colors.GRAY_BORDER_COLOR}
                dashStyle = {{
                    borderRadius : 999
                }}
            />
            </Animated.View>
            <Animated.View style = {[styles.row , viewStyle]}>
                <View style = {styles.column}><DetailSection detail = {shop_license_number} description = {'License number'} disabled onPress = {onPress} /></View>
                <View style = {[styles.column , { width: '40%' }]}><DetailSection detail = {shop_coupons.length > 0 ? `${shop_coupons[0].coupon_value}% off` : 'No offers'} description = {'Available offers'} disabled onPress = {onPress} /></View>
                <View style = {styles.column}><DetailSection detail = {shop_founding_date ? dairyAge() : 'N.A.'} description = {`Dairy age`} disabled onPress = {onPress} /></View>
            </Animated.View>
            <Animated.View style = {[ textStyle, { alignItems : 'flex-end', position: 'absolute', right: 0, bottom: 0 }]}>
                <Pressable onPress = {() => (visibility.value = !visibility.value)} hitSlop = {40}>
                    <Text style = {{ color : colors.ROYAL_BLUE , fontFamily: ColorsText.Medium.fontFamily , fontSize: 12 }}>+more</Text>
                </Pressable>
            </Animated.View>
            <Animated.View style = {[ arrowStyle, { alignItems : 'flex-end', position: 'absolute', right: 0, bottom: 0 }]}>
                <Pressable onPress = {() => (visibility.value = !visibility.value)} hitSlop = {40}>
                    <Icon type = 'Entypo' name = 'chevron-down' style = {{ color : colors.ROYAL_BLUE , fontSize: 23 }} />
                </Pressable>
            </Animated.View>
        </Animated.View>
    )
}

export default AnimatedView

const styles = StyleSheet.create({
    column: {
        width : '30%',
        alignItems : 'center',
        justifyContent : 'center'
    },

    row: {
        width: '100%',
        marginBottom : '1%',
        flexDirection : 'row',
        alignItems : 'center',
    }
})