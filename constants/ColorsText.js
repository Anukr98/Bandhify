import { StyleSheet, Dimensions } from 'react-native';

const ColorsText = StyleSheet.create({
    primary_color: {
        color: '#FFEB62',
    },
    ripple_color: {
        color: 'rgba(102, 114, 229, 0.1)',
    },
    schedule_card: {
        color: '#eceefc',
    },
    shadow: {
        elevation: 4,
    },
    shadowHeader: {
        elevation: 2,
    },
    scheduleShadowCard: {
        elevation: 3,
    },
    iosShadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    success_color: {
        color: '#86BF3E'
    },
    regular: {
        fontFamily: 'Poppins-Regular'
    },
    light: {
        fontFamily: 'Poppins-Light'
    },
    Medium: {
        fontFamily: 'Poppins-Medium'
    },
    Bold: {
        fontFamily: 'Poppins-Bold'
    },
    BLACK_COLOR : {
        color : '#242424'
    }
});

export default ColorsText;