import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'

const styles = StyleSheet.create({

    container : {
        width : '93%',
        alignSelf : 'center',
    },

    header : {
        paddingVertical : 10,
        flexDirection : 'row',
        alignItems : 'center'
    },

    otpView : {
        alignItems : 'center',
        marginTop : '7%'
    },

    inputField : {
        borderColor : colors.DUSKY_BLACK_TEXT,
        borderWidth : .6,
        borderRadius : 999,
        color : colors.MANGO_COLOR,
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 20
    },

    titleText : {
        fontFamily : ColorsText.Bold.fontFamily,
        fontSize : 15,
        letterSpacing : .4
    }
})

export default styles