import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { height, width } from '../../../constants/dimensions'

const styles = StyleSheet.create({

    innerContainer : {
        backgroundColor : colors.WHITE,
        flex : 1,
        position : 'relative'
    },

    logoArea : {
        borderBottomColor : colors.LIGHT_GRAY_BG_COLOR,
        borderBottomWidth : 1.5,
        marginTop: '3%',
    },

    logoInnerContainer : {
        width : '93%',
        alignSelf : 'center',
    },

    details : {
        width : '93%',
        alignSelf : 'center',
        flexDirection : 'row',
        paddingVertical : '5%',
    },

    modalContainer : {
        backgroundColor : colors.WHITE,
        flex : .3
    },

    proceedButtonContainer : {
        width : '100%',
        flexDirection : 'row',
        alignItems : 'center',
        paddingVertical : 15,
        backgroundColor : '#FFEB6220'
    },

    proceedButton : {
        width : '95%',
        alignItems : 'center',
        height : height * 0.05,
        justifyContent : 'center',
        borderRadius : 3,
        backgroundColor : colors.BUTTON_BACKGROUND_COLOR
    },

    proceedButtonText : {
        color : colors.BUTTON_TEXT_COLOR,
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 16
    },

    offersContainer : {
        marginTop : '4%',
        borderBottomColor : colors.LIGHT_GRAY_BG_COLOR,
        borderBottomWidth : 1.5,
        paddingBottom : '4%'
    },

    offersInnerContainer : {
        flexDirection : 'row',
        alignItems : 'center',
        width : '100%',
    },

    paymentModeContainer : {
        width,
        marginTop : '12%',
    },

    innerPaymentModeContainer : {
        width : "93%",
    },

    paymentMode : {
        flexDirection : 'row',
        alignItems : 'center',
        marginBottom : '1%'
    },

    paymentModeText : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 15,
        color : colors.DUSKY_BLACK_TEXT
    },

    subscriptionContainer : {
        marginBottom : '4%',
        // flexDirection : 'row',
        // alignItems : 'center',
    },

    subscriptionSlotsContainer : {
        flexDirection : 'row',
        alignItems : 'center',
        justifyContent : 'space-between',
    },

    subscriptionSlot : {
        width : '22%',
        alignItems : 'center',
        justifyContent : 'center',
        height : 50,
        borderRadius : 8
    },

    slotButton : {
        width : '100%',
        height : '100%',
        alignItems : 'center',
        justifyContent : 'center',
    },

    titleText : {
        color : colors.ROYAL_BLUE,
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 16
    },

    tootltipTitle : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 16,
        color : colors.MANGO_COLOR
    },

    tooltipText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 12,
        color : colors.DUSKY_BLACK_TEXT
    }
})

export default styles