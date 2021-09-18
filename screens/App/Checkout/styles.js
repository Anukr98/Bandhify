import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { width } from '../../../constants/dimensions'

const styles = StyleSheet.create({

    innerHeader : {
        width : '93%',
        alignSelf : 'center',
        flex : 1
    },

    logoArea : {
        backgroundColor: colors.WHITE,
        width: "100%"
    },

    headerTextContainer : {
        marginTop : '5%'
    },

    listHeaderText : {
        fontFamily : ColorsText.Medium.fontFamily
    },

    listItem : {
        backgroundColor : colors.WHITE,
        paddingVertical : "3%",
        borderBottomColor : colors.GRAY_BORDER_COLOR,
        borderBottomWidth : .5
    },

    listItemContainer : {
        flexDirection : 'row'
    },

    radioButtonArea : {
        flex : .15,
        // backgroundColor : 'yellow',
        alignItems : 'center',
        justifyContent : "center"
    },

    addressArea : {
        flex : .85,
        // backgroundColor : "orange",
        paddingLeft : '2%',
        paddingVertical : '2%',
    },

    name : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 17
    },

    buttonsArea : {
        width : '95%',
        alignSelf : 'center',
        marginTop : '5%'
    },

    deliverButton : {
        width : '100%',
        height : 40,
        alignItems : "center",
        justifyContent : 'center',
        borderRadius : 3,
    },

    // editAddressButton : {
    //     width : '100%',
    //     height : height * 0.04,
    //     alignItems : "center",
    //     justifyContent : 'center',
    //     borderRadius : 3
    // },

    listFooterComponent : {
        width : '100%',
        backgroundColor : colors.WHITE,
        flexDirection : 'row',
        alignItems : 'center',
        height : 50,
    },

    footerText : {
        flex : .85,
        height : '100%',
        justifyContent : 'center',
        paddingLeft : '5%'
    },

    footerIcon : {
        flex : .15,
        alignItems : "flex-end",
        paddingRight : "3%"
    },

    modalContainer : {
        width : width * 0.8,
        alignSelf : 'center',
        backgroundColor : colors.WHITE,
        borderRadius : 4,
        padding : 20,
        // paddingHorizontal : 16
    },

    modalTitle : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 22,
        color : colors.MANGO_COLOR
    },

    modalText : {
        fontFamily : ColorsText.regular.fontFamily,
        fontSize : 14,
        color : '#a0a0a0'
    },

    dismissModalButton : {
        height : 20,
        paddingHorizontal : 10,
        alignItems : 'center',
        justifyContent : "flex-end"
    },

    dismissModalText : {
        fontFamily : ColorsText.regular.fontFamily,
        color : colors.MANGO_COLOR,
        fontSize : 15
    },

    address: {
        fontFamily: ColorsText.regular.fontFamily,
        fontSize: 13,
    }
})

export default styles