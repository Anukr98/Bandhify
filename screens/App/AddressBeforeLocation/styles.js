import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { width } from '../../../constants/dimensions'

const styles = StyleSheet.create({

    header : {
        alignItems : 'center',
        width,
        paddingVertical : 8
    },

    innerHeader : {
        width : '93%',
    },

    backButton : {
        color : colors.DUSKY_BLACK_TEXT,
        fontSize : 25
    },

    locationContainer : {
        marginTop : '4%'
    },

    locationInnerContainer : {
        flexDirection : 'row',
        alignItems : 'center'
    },

    locationText : {
        color : colors.ROYAL_BLUE,
        fontFamily : ColorsText.regular.fontFamily
    },

    addresses : {
        width,
        marginTop : '3%',
        flex : 1,
        alignItems : 'center'
    },

    innerAddressContainer : {
        width : "93%",
    },

    address : {
        flexDirection : 'row',
        alignItems : 'center',
        marginBottom : '1%',
        paddingVertical : '3%',
        paddingHorizontal : '2%'
    },

    iconContainer : {
        flex : .13
    },

    addressDetails : {
        flex : .87
    },

    listItemIcon : {
        fontSize : 20,
        color : colors.DUSKY_BLACK_TEXT
    },

    addressType : {
        fontFamily : ColorsText.Medium.fontFamily,
        color : colors.MANGO_COLOR,
        fontSize : 16,
        letterSpacing : 1
    },

    addressText : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 12,
        color : colors.DUSKY_BLACK_TEXT,
        letterSpacing : .4
    }
})

export default styles