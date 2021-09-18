import { StyleSheet } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import { width } from '../../../constants/dimensions'

const styles = StyleSheet.create({

    header: {
        width,
        alignItems : 'center',
        paddingTop: 4,
        paddingBottom: 8,
    },

    headerText: {
        fontFamily: ColorsText.Medium.fontFamily,
        fontSize: 22,
        color: colors.DUSKY_BLACK_TEXT,
        transform: [{ translateY: 1 }]
    },

    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 20,
        marginBottom: '1%',
    },

    readStatus: {
        backgroundColor: colors.ROYAL_BLUE,
        height: 5,
        width: 5,
        borderRadius: 999,
    },

    notificationText: {
        fontFamily: ColorsText.Medium.fontFamily,
        color: '#000000a8',
        fontSize: 15,
    },

    notificationCreatedAt: {
        fontFamily: ColorsText.regular.fontFamily,
        color: colors.GRAY_TEXT_NEW,
        fontSize: 12
    },

    popoverText: {
        fontFamily: ColorsText.regular.fontFamily,
        color: colors.DUSKY_BLACK_TEXT
    },

    modal: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        margin: 0
    },

    modalContainer: {
        backgroundColor: 'white',
        width: width*.35,
        height: 100,
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 2
    },

    modalInnerContainer: {
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'space-evenly',
        height: '100%',
    }
})

export default styles