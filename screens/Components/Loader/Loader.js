import React from 'react';
import { View , ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal'
import colors from '../../../constants/colors';
import styles from './styles'

const Loader = () => {

  return (
    <Modal
      isVisible = {true}
    >
      <View style={styles.modalBackground}>
        <View style={[styles.activityIndicatorWrapper , { justifyContent : 'center' }]}>
          <ActivityIndicator animating={true} size="large" color={colors.MANGO_COLOR} />
          {/* <Image
            source = {require('../../Assets-new/LoadingAnimation/animation1.gif')}
            style = {{ width : '100%' , height : '100%' }}
          /> */}
        </View>
      </View>
    </Modal>
  )
}

export default Loader