import React from 'react'
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native'
import ColorsText from '../../../constants/ColorsText'

const Location = () => {
    return (

        <View style={styles.location}>
            <View style={styles.innerLocation}>
                <View style={styles.locationIconAddress}>
                    <View style={styles.locationIcon}>
                        <Image source={require('../../../assets/Images/Location.png')} />
                    </View>
                    <View style={styles.locationAddress}>
                        <Text numberOfLines={1} style={styles.addressText}>Home -  Umar Nagar, Hapur Road, Meerut </Text>
                    </View>
                </View>
                <View style={styles.notificationIcon}>
                    <Image source={require('../../../assets/Images/Notification.png')} />
                </View>
            </View>
        </View>
    )
}

export default Location

const styles = StyleSheet.create({
    location: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '2%'
    },
    innerLocation: {
        width: '93%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    locationIconAddress: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    locationAddress: {
        marginLeft: 10
    },
    addressText: {
        width: '70%',
        fontFamily: ColorsText.Medium.fontFamily
    }
})