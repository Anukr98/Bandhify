import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { width } from '../../../constants/dimensions'

const styles = StyleSheet.create({

    innerContainer : {
        width : '93%',
        flex : 1,
        alignSelf : 'center',
    },

    backButtonContainer : {
        paddingHorizontal : 6,
        paddingVertical : 7,
        flexDirection: 'row',
        alignItems: 'center'
    },

    headerText: {
        fontFamily: ColorsText.Medium.fontFamily,
        color: colors.DUSKY_BLACK_TEXT,
        fontSize: 20,
        paddingTop: '1%'
    },

    imageContainer : {
        width : '100%',
        alignItems : "center"
    },

    imageInnerContainer : {
        width : 100,
        height : 100,
        backgroundColor : '#f8f8ff',
        borderRadius : 999,
        alignItems : "center",
        borderColor : colors.ROYAL_BLUE,
        borderWidth : 1,
        justifyContent : 'center'
    },

    imageSheetContainer : {
        flex : 1,
        width : '93%',
        alignSelf : 'center',
        paddingTop : '3%'
    },

    sheetText : {
        fontFamily : ColorsText.regular.fontFamily,
        color : '#383838'
    },

    detailsContainer : {
        width : '100%',
        marginTop : '6%',
    },

    input : {
        height : 40,
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 13,
        flex : .8,
        color : colors.DUSKY_BLACK_TEXT
    },

    detailContainer : {
        marginBottom : "2%",
        borderBottomColor : colors.LIGHT_GRAY_BG_COLOR,
        borderBottomWidth : 1,
    },

    inputTitle : {
        paddingLeft : '1%',
    },

    inputTitleText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 15
    },

    inputContainer : {
        flexDirection : "row",
        alignItems : 'center'
    },

    inputEditText : {
        flex : .2,
        height : 40,
        alignItems : 'center',
        justifyContent : "center"
    },

    editInputText : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 13,
        color : colors.ROYAL_BLUE,
        letterSpacing : .4
    },

    sheetInput : {
        borderBottomWidth : 1.5,
        // borderBottomColor : colors.ROYAL_BLUE,
        height : 40,
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 13,
        color : colors.DUSKY_BLACK_TEXT
    },

    emailSubmitButtonContainer : {
        marginTop : '10%',
    },

    submitEmailButton : {
        backgroundColor : colors.ROYAL_BLUE,
        alignItems : 'center',
        justifyContent : "center",
        height : 40
    },

    confirmContainer : {
        width : '100%',
        position : 'absolute',
        bottom : 0,
        left : 0
    },

    confirmButton : {
        backgroundColor : colors.BUTTON_BACKGROUND_COLOR,
        height : 40,
        borderRadius : 3,
        alignItems : 'center',
        justifyContent : 'center'
    },

    submitButtonText : {
        color : colors.BUTTON_TEXT_COLOR,
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 13,
        letterSpacing : .5
    },

    otpModalContainer : {
        width : width * 0.9,
        backgroundColor : colors.WHITE,
        alignSelf : 'center',
        paddingHorizontal : 6,
        borderRadius : 6,
        // flex : .3
        // alignItems : "center"
    },

    otpField : {
        borderColor : colors.MANGO_COLOR,
        borderWidth : 1
    },

    modalContainer : {
        width : width * 0.8,
        backgroundColor : colors.WHITE,
        borderRadius : 7,
        paddingVertical : 20,
        paddingHorizontal : 15,
        alignSelf : 'center'
    },
    
    modalButtonsContainer : {
        flexDirection : 'row',
        justifyContent : "flex-end",
        alignItems : 'center'
    },

    modalTitle : {
        fontFamily : ColorsText.Bold.fontFamily,
        color : colors.MANGO_COLOR,
        fontSize : 20
    },

    modalText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 14,
        color : '#a0a0a0'
    },

    modalButton : {
        height : 30,
        justifyContent : 'center',
        paddingHorizontal : 4
    },

    modalButtonText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 13,
        color : colors.MANGO_COLOR
    }
})

export default styles