import React from 'react';
import {View, StyleSheet, Pressable, Platform} from 'react-native';
import colors from '../../../constants/colors';
import {height} from '../../../constants/dimensions';

const RadioButton = ({checked, onPress}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.border,
      {borderColor: checked ? colors.MANGO_COLOR : colors.LIGHT_TEXT_COLOR},
    ]}>
    <View
      style={[
        styles.innerCircle,
        {backgroundColor: checked ? colors.MANGO_COLOR : 'transparent'},
      ]}
    />
  </Pressable>
);

export default RadioButton;

const styles = StyleSheet.create({
  border: {
    height: 20,
    width: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  innerCircle: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginLeft: Platform.OS === 'android' ? height * 0.0008 : 0,
  },
});
