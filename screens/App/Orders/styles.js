import { StyleSheet } from 'react-native'
import { width , height } from '../../../constants/dimensions'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'

const styles = StyleSheet.create({

    innerHeader : {
        width : '94%',
        alignSelf : 'center',
    },

    header : {
        height : 40,
        flexDirection : 'row',
        alignItems : 'center',
        backgroundColor : colors.WHITE,
        marginBottom : '2.5%',
        paddingVertical : 7,
    },

    headerTitle : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 18,
        color : colors.DUSKY_BLACK_TEXT,
        paddingTop : '.8%'
    },

    listItemContainer : {
        marginBottom : '5%',
        backgroundColor : colors.CARD_BACKGROUND_COLOR,
        elevation : 2,
        shadowColor : '#000',
        width : width * 0.94,
        justifyContent : "center",
    },

    listItemInnerContainer : {
        width : '98%',
        alignSelf : 'center',
    },

    listItemHeader : {
        flexDirection : "row",
        paddingBottom : 8,
        paddingTop : 10,
    },

    listItemImageArea : {
        flex : .75,
        justifyContent : 'center',
        flexDirection : 'row',
        paddingLeft : '5%',
    },

    listItemSubtotalArea : {
        flex : .25,
        justifyContent : 'center',
        alignItems : 'center'
    },

    listItemImageContainer : {
        flex : .2,
        justifyContent : 'center',
    },

    listItemAddressContainer : {
        // backgroundColor : 'green',
        flex : .8,
        justifyContent : 'center',
        paddingLeft : '5%'
    },

    listItemShopName : {
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 16,
        margin : 0,
        padding : 0,
        letterSpacing : .4,
        color : colors.DUSKY_BLACK_TEXT
    },

    listItemShopLocation : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 11,
        color : colors.MANGO_COLOR,
        letterSpacing : .4
    },

    listItemDetails : {
        // height : '53%',
        marginTop : '1.5%',
        paddingLeft : '5%',
        paddingVertical : '2%',
        borderTopColor : colors.GRAY_BORDER_COLOR,
        borderTopWidth : .4,
        justifyContent : 'space-evenly',
        borderBottomColor : colors.GRAY_BORDER_COLOR,
        borderBottomWidth : .3
    },

    listItemOrderDateContainer : {
        marginTop : '2%'
    },

    titleText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 13,
        color : colors.MANGO_COLOR,
        // color : '#c0c0c0',
        // textTransform : 'uppercase',
        letterSpacing : 1
    },

    descriptionText : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 10,
        color : colors.ROYAL_BLUE,
        letterSpacing: .2
    },

    reorderContainer : {
        // height : '15%',
        paddingVertical : 10,
        alignItems : 'flex-end',
        paddingRight : '5%',
        width : '100%',
        justifyContent : 'center'
    },

    reorderButton : {
        flexDirection : 'row',
        alignItems : 'center',
        // height : '60%',
        width : '25%',
        justifyContent : 'center',
        height : 30
    },

    emptyListTextContainer : {
        width,
    },

    emptyListInnerTextContainer : {
        alignItems : "center",
        marginBottom: '2%'
    },

    emptyListText : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 22,
        letterSpacing : .5,
        color : colors.ROYAL_BLUE
    },

    emptyListSubText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 14,
        letterSpacing : .4,
        color : colors.GRAY_TEXT_NEW
    },

    startOrderButtonContainer : {
        alignItems : "center",
        marginTop : '1%'
    },

    startOrderingButton : {
        width : '70%',
        alignItems : 'center',
        justifyContent : "center",
        height : 40,
        borderColor : 'rgba(65,105,225,.6)',
        borderWidth : 1
    },

    orderParticulars : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 11,
        letterSpacing : .4,
        color : colors.ROYAL_BLUE
    },

    modalContainer : {
        width : width * 0.8,
        alignSelf : 'center',
        backgroundColor : colors.WHITE,
        alignItems : 'center',
        position : 'relative',
        borderRadius : 5,
        padding : 15,
        paddingLeft : 20
    },

    modalInnerContainer : {
        width : '87%',
        marginBottom : '20%'
    },

    dismissModalContainer : {
        width : '100%',
        position : 'absolute',
        bottom : 10,
        alignItems : 'flex-end',
    },

    alertText : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 20,
        color : colors.MANGO_COLOR,
        letterSpacing : 1
    },

    modalText : {
        fontFamily : ColorsText.regular.fontFamily,
        color : colors.GRAY_TEXT,
        fontSize : 14
    },

    dismissModalButton : {
        width : '30%',
        alignItems : "center",
        justifyContent : "center",
        height : 23,
    },

    modalButtonContainer : {
        width : '20%',
    },

    modalButton : {
        height : 25,
        alignItems : 'center',
        justifyContent : 'center'
    },

    modalButtonText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 13,
        color : colors.MANGO_COLOR
    },

    subscriptionOrder: {
        position : 'absolute',
        width : '100%',
        top : 0,
        left : 0,
        alignItems : 'center',
        height : '100%',
        justifyContent : 'flex-end',
        opacity : .25,
        paddingLeft : '8%'
    }
})

export default styles