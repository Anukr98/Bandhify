import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { width , height } from '../../../constants/dimensions'

const styles = StyleSheet.create({

    headerView : {
        width,
        height : 50,
        backgroundColor : colors.WHITE 
    },

    innerHeaderView : {
        width : '90%',
        alignSelf : 'center',
        height : '100%',
        flexDirection : 'row',
        alignItems : 'center',
        paddingVertical : 7
    },

    headerIcon : {
        fontSize : 30,
        marginRight : '2%',
        color : colors.DUSKY_BLACK_TEXT
    },

    headerText : {
        textTransform : 'uppercase',
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 16
    },

    addressContainer : {
        width : '100%',
        // paddingTop : '10%',
        flex : 1
    },

    innerContainer : {
        width : '90%',
        alignSelf : 'center',
    },

    title : {
        fontSize : 12.5,
        fontFamily : ColorsText.light.fontFamily,
        textTransform : 'uppercase',
        letterSpacing : .3
    },

    listContainer : {
        paddingHorizontal : '7%',
        backgroundColor : colors.WHITE,
        borderBottomColor : colors.GRAY_BORDER_COLOR,
        borderBottomWidth : .7,
        flex : 1
    },

    listItem : {
        flexDirection : 'row',
        marginBottom : '1%',
    },

    listItemIconContainer : {
        flex : .13,
        paddingVertical : '5%',
        alignItems : "center",
    },

    listItemIcon : {
        fontSize : 20
    },

    listItemAddress : {
        flex : .87,
        paddingBottom : '5%',
        paddingTop : '3%',
        paddingHorizontal : '2%',
        // borderBottomColor : colors.GRAY_BORDER_COLOR,
        // borderBottomWidth : .7
    },

    listButtonArea : {
        marginTop : '5%',
        flexDirection : 'row'
    },

    listButtonContainer : {
        width : '30%',
        marginRight : '5%',
        height : 35
    },

    listButton : {
        height : '100%',
        alignItems : 'center',
        justifyContent : 'center',
        backgroundColor : colors.BUTTON_BACKGROUND_COLOR,
        borderRadius : 3
    },

    buttonText : {
        color : colors.BUTTON_TEXT_COLOR
    },

    modalContainer : {
        backgroundColor : colors.WHITE,
        width : width * 0.7,
        alignSelf : "center",
        height : height * 0.17
    },

    modalButtonContainer : {
        width : '20%',
        alignItems : 'center',
        justifyContent : "center",
    },

    modalButton : {
        width : '100%',
        alignItems : 'center',
        justifyContent : "center",
        height : 30
    },

    addAddressArea : {
        backgroundColor : colors.WHITE,
        paddingVertical : '5%',
        // marginBottom : '5%'
    },

    addAddressButtonContainer : {
        width : width * 0.75,
        alignSelf : 'center',
        height : 40
    },

    addAddressButton : {
        width : '100%',
        height : '100%',
        alignItems : 'center',
        justifyContent : 'center',
        borderColor : colors.ROYAL_BLUE,
        borderWidth : 1
    },

    emptyListText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 15,
        color : colors.LIGHT_TEXT_COLOR
    },

    addAddressText : {
        color : colors.ROYAL_BLUE,
        fontFamily : ColorsText.Medium.fontFamily,
        fontSize : 13,
        letterSpacing : .3
    }
})

export default styles

// #e2dde9