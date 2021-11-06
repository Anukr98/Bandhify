import {StyleSheet} from 'react-native';
import colors from '../../../constants/colors';
import ColorsText from '../../../constants/ColorsText';
import {height, width} from '../../../constants/dimensions';

const styles = StyleSheet.create({
  innerHeader: {
    width: '94%',
    alignSelf: 'center',
    marginBottom: '4%',
  },

  logoArea: {
    marginBottom: '4%',
    marginTop: '3%',
  },

  addAddressText: {
    fontFamily: ColorsText.Medium.fontFamily,
    fontSize: 24,
  },

  formArea: {
    marginTop: '4%',
  },

  inputContainer: {
    marginBottom: '4%',
    flexDirection: 'row',
    position: 'relative',
  },

  input: {
    // backgroundColor : 'red',
    width: '100%',
    paddingLeft: '2%',
    borderColor: colors.GRAY_BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 3,
    // color : colors.GRAY_TEXT
    color: colors.BLACK,
    height: 40,
  },

  cityModalContainer: {
    width: width * 0.7,
    backgroundColor: colors.WHITE,
    alignSelf: 'center',
    // flex : .3
  },

  closeContainer: {
    alignItems: 'flex-end',
    backgroundColor: colors.GRAY_BORDER_COLOR,
  },

  cityListItem: {
    paddingVertical: '5%',
    paddingHorizontal: '4%',
    borderBottomColor: colors.GRAY_BORDER_COLOR,
    borderBottomWidth: 0.4,
  },

  deliverButton: {
    width: '100%',
    height: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },

  addressModalContainer: {
    width: width * 0.7,
    alignSelf: 'center',
    backgroundColor: colors.WHITE,
    // flex : height > 730 ? .25 : .32,
  },

  addressModalInnerContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '4%',
  },

  addressModalIcon: {
    marginRight: '2%',
  },
});

export default styles;
