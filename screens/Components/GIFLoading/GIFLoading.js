import React from 'react'
import { View, Text, Image } from 'react-native'
import colors from '../../../constants/colors'

const GIFLoading = () => {
    return (
        <View style = {{ flex : 1 , backgroundColor : colors.WHITE , alignItems : 'center' , justifyContent : 'center' }}>
            <Image
                source = {require('../../../assets/GIF/loader.gif')}
                style = {{ width : '30%' , height : '10%' }}
            />
        </View>
    )
}

export default GIFLoading
