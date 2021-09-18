import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'

const styles = StyleSheet.create({
    
    mainInnerContainer : {
        flex : 1,
        backgroundColor : colors.WHITE
    },

    header : {
        // borderBottomColor : colors.LIGHT_GRAY_BG_COLOR,
        // borderBottomWidth : 1.3,
        // paddingTop : 7,
        position : 'relative',
    },

    innerHeader : {
        // flexDirection : 'row',
        // alignItems : "center",
        width : '94%',
        alignSelf : 'center',
        backgroundColor : 'red'
    },

    iconContainer : {
        // flex : .1,
        // alignItems : 'center'
    },

    headerText : {
        fontFamily : ColorsText.light.fontFamily,
        fontSize : 12,
        letterSpacing : .7,
        color : colors.ROYAL_BLUE
    },

    locationContainer : {
        // flex : .9,
        // paddingLeft : 7,
        flex : 1
    },

    locationInput : {
        height : 40,
        color : colors.ACCENT,
        fontFamily : ColorsText.Medium.fontFamily,
        alignItems : "center",
        justifyContent : "center"
    },

    emptyContainer : {
        height : '.7%',
        // backgroundColor : colors.LIGHT_GRAY_BG_COLOR,
        marginTop : '2%'
    },

    addressListContainer : {
        width : '94%',
        alignSelf : 'center',
        // marginTop : "4%"
    },
    
    addressContainer : {
        flexDirection : 'row',
        alignItems : 'center',
        marginBottom : '4%',
        marginTop : '2%'
        // paddingVertical : 8,
    },

    addressIconContainer : {
        flex : .1,
        alignItems : 'center',
        justifyContent : "center"
    },

    addressDetails : {
        // backgroundColor : 'green',
        flex : .9,
        paddingBottom : 8,
        paddingHorizontal : '2%',
        borderBottomColor : colors.GRAY_BORDER_COLOR,
        borderBottomWidth : .3
    },

    searchBarArea : {
        position : 'absolute',
        top : '9%',
        width : '93%',
        alignSelf : 'center',
        borderRadius : 7,
        flex : 1,
        flexDirection : 'row',
        alignItems : 'center'
    },

    searchBar : {
        height : 50,
        fontSize : 12
    }
})

export default styles