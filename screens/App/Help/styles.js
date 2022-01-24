import { StyleSheet } from "react-native";
import colors from "../../../constants/colors";
import ColorsText from "../../../constants/ColorsText";

const styles = StyleSheet.create({

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: "2%"
    },

    headerText: {
        fontFamily: ColorsText.Medium.fontFamily,
        color: colors.DUSKY_BLACK_TEXT,
        fontSize: 18,
        marginLeft: "4%"
    },

    helpTitle: {
        fontFamily: ColorsText.Bold.fontFamily,
        fontSize: 16,
        textTransform: "uppercase",
        color: colors.MANGO_COLOR
    },

    helpSubtext: {
        fontFamily: ColorsText.regular.fontFamily,
        fontSize: 13,
        color: colors.DUSKY_BLACK_TEXT
    },

    checkboxRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    descriptioninput: {
        borderColor: colors.GRAY_BORDER_COLOR,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: "3%",
        color: colors.DUSKY_BLACK_TEXT,
        minHeight: 60
    },

    submitButton: {
        backgroundColor: colors.ROYAL_BLUE,
        height: 50,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center"
    },

    submitButtonText: {
        color: colors.WHITE,
        fontFamily: ColorsText.regular.fontFamily,
        fontSize: 20,
        letterSpacing: 1.2
    }
})

export default styles