import React from 'react'
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native'
import colors from '../../../../constants/colors'
import ColorsText from '../../../../constants/ColorsText'

const DetailSection = ({ detail , description, disabled, onPress }) => {
    return <TouchableOpacity disabled = {disabled} onPress = {onPress}>
        <View style = {{ alignItems : 'center' }}>
            <Text style = {styles.detailText}>{detail}</Text>
            <Text style = {[styles.detailText , { color : colors.GRAY_TEXT_NEW }]}>{description}</Text>
        </View>
    </TouchableOpacity>
}

export default DetailSection

const styles = StyleSheet.create({
    detailText: {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 13,
        color : colors.DUSKY_BLACK_TEXT,
        textAlign: 'center'
    }
})