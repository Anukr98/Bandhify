import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { height, width } from '../../../constants/dimensions'

const styles = StyleSheet.create({
    header : {
        width,
        alignItems : "center"
    },

    innerHeader : {
        width : '95%',
        flexDirection : 'row',
        alignItems : 'center',
        paddingTop : 10,
        paddingBottom : 5
    },

    backIconContainer : {
        flex : .13,
        alignItems : 'center'
    },

    orderIdContainer : {
        flex : .87,
        flexDirection : 'row',
        alignItems : "center"
    },

    regularFont : {
        fontFamily : ColorsText.regular.fontFamily
    },

    locationDetailsContainer : {
        width,
        alignItems : 'center',
        paddingBottom : '3%'
    },

    innerLocationDetailsContainer : {
        width : '93%',
    },

    addressContainer : {
        flexDirection : 'row',
        alignItems : 'center',
    },

    shopName : {
        fontFamily : ColorsText.regular.fontFamily,
        letterSpacing : .6,
        color : colors.MANGO_COLOR,
        fontSize : 15,
    },

    shopAddress : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 12,
        marginTop : '.7%',
        color : colors.ROYAL_BLUE,
        letterSpacing : .3
    },

    dotContainer : {
        width : '10%',
        alignItems : 'center',
        marginBottom : '2%'
    },

    itemsContainer : {
        width,
        alignItems : 'center',
        paddingTop : '3%'
    },

    innerItemsContainer : {
        width : '87%',
    },

    product : {
        width : '100%',
        marginBottom : '2%',
        flexDirection : 'row',
        alignItems : 'center',
    },

    productParticulars : {
        flex : .8
    },

    productPrice : {
        flex : .2,
        alignItems : 'center'
    },

    productDetail : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 11,
        color : colors.DUSKY_BLACK_TEXT
    },

    miscellaneousDetails : {
        marginTop : '4%'
    },

    miscDetail : {
        flexDirection : 'row',
        alignItems : 'center'
    },

    feedback : {
        borderColor : '#4b4b4b20',
        borderWidth : 1,
        position : 'relative',
        fontSize : 12,
        color : colors.DUSKY_BLACK_TEXT,
        fontFamily : ColorsText.light.fontFamily,
        paddingLeft : '2%'
    },

    textareaIcon : {
        transform : [{ rotateZ : '-45deg' }],
        fontSize : 13,
        color : colors.DUSKY_BLACK_TEXT
    },

    rateProducts : {
        marginTop : '6%',
        marginBottom : '3%'
    },

    rateProductsButton : {
        backgroundColor : colors.ROYAL_BLUE,
        width : '100%',
        alignItems : 'center',
        justifyContent : "center",
        height : 35
    },

    rateProductsText : {
        color : colors.WHITE,
        fontSize : 13,
        fontFamily : ColorsText.Medium.fontFamily,
        letterSpacing : .5
    },

    modalContainer : {
        backgroundColor : colors.WHITE,
        width : width * 0.8,
        alignSelf : "center",
        alignItems : 'center',
        paddingVertical : 10,
        borderRadius : 8
    },

    innerModalContainer : {
        width : "90%",
    },

    modalItem : {
        marginBottom : '5%',
        flexDirection : 'row',
        alignItems : 'center'
    },

    closeModalButton : {
        width : '25%',
        alignItems : 'center',
        height : 30,
        justifyContent : "center"
    },

    closeModalText : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 13,
        letterSpacing : .4,
        color : colors.ROYAL_BLUE
    },

    orderedText : {
        fontFamily : ColorsText.regular.fontFamily,
        color : colors.DUSKY_BLACK_TEXT,
        fontSize : 13
    },

    modalDescriptionText : {
        fontFamily : ColorsText.Medium.fontFamily,
        color : colors.SUCCESS_GREEN,
        fontSize : 15
    },

    modalTitle : {
        fontFamily : ColorsText.Medium.fontFamily,
        color : colors.MANGO_COLOR,
        fontSize : 18
    },

    modalText : {
        fontFamily : ColorsText.regular.fontFamily,
        color : '#a0a0a0',
        fontSize : 13
    }
})

export default styles