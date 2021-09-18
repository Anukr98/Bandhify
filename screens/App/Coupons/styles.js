import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'

const styles = StyleSheet.create({

    headerContainer : {
        width : '100%',
    },

    headerInner : {
        flexDirection : 'row',
        alignItems : "center",
        alignSelf : 'center',
        paddingTop : 10,
        width : '95%'
    },

    headerText : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 18,
        letterSpacing : .3,
        color : colors.DUSKY_BLACK_TEXT
    },

    availableCouponsHeaderContainer : {
        marginTop : '4%',
        alignItems : 'center',
        marginBottom : '3%',
        paddingBottom : '2%',
    },

    availableCouponsHeaderInnerContainer : {
        width : '93%',
    },

    availableCouponsHeaderText : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 13,
        letterSpacing : .4,
    },

    couponContainer : {
        width : '100%',
        alignItems : 'center',
        marginBottom : '3%',
    },

    couponInnerContainer : {
        width : '93%',
        backgroundColor : colors.CARD_BACKGROUND_COLOR,
        elevation : 1,
    },
    
    couponCard : {
        borderRadius : 10,
        width : '90%',
        alignSelf : "center",
        paddingVertical : 15
    },

    cardHeader : {
        flexDirection : 'row',
        alignItems : "center",
        justifyContent : 'space-between'
    },

    couponName : {
        backgroundColor : '#ffeb6260',
        borderColor : colors.MANGO_COLOR,
        borderWidth : 1,
        borderStyle : 'dashed',
        borderRadius : 1,
        paddingVertical : 6,
        paddingHorizontal : 10
    },

    nameOfCOupon : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 16,
        letterSpacing : .3,
        color : colors.ACCENT
    },

    applyText : {
        color : colors.MANGO_COLOR,
        fontFamily : ColorsText.light.fontFamily
    },

    couponDescription : {
        marginTop : '5%'
    },

    searchCouponsContainer : {
        width : '96%',
        marginTop : '7%',
        alignItems : 'center',
        alignSelf : 'center',
        borderRadius : 7,
        flexDirection : 'row',
        borderColor : '#ddd',
        borderWidth : .6,
    },

    couponFilter : {
        height : 40,
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 12,
        flex : .85,
        paddingLeft : 10,
        color : colors.DUSKY_BLACK_TEXT,
    }
})

export default styles