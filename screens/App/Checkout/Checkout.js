import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  BackHandler,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import styles from './styles';
import {RadioButton, TouchableRipple} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../../constants/colors';
import ColorsText from '../../../constants/ColorsText';
import {Icon} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  distanceBetweenCoordinates,
  postMethod,
} from '../../../Utils/CommonFunctions';
import urls from '../../../constants/urls';
import {showMessage} from 'react-native-flash-message';
import GIFLoading from '../../Components/GIFLoading/GIFLoading';
import {strings} from '../../../constants/strings';
import Modal from 'react-native-modal';
import Application from '../../../Utils/db/Application';

const Checkout = props => {
  const {focus} = props.route.params;

  const [addresses, setAddresses] = useState([]);
  const [isFocused, setIsFocused] = useState({
    id: 0,
    address1: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const backButtonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );
    const unsubscribe = props.navigation.addListener('focus', async () => {
      if (focus !== '')
        setIsFocused({
          address1: focus,
        });
      setIsLoading(true);

      let token = await AsyncStorage.getItem('token');
      let object = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      postMethod(
        `${urls.GET_ALL_ADDRESSES}?with_address=true`,
        object,
        (err, result) => {
          if (err) console.log(err);
          else if (result.status && result.code === 200) {
            setAddresses(result.user.address);
            setTimeout(() => {
              setIsLoading(false);
            }, 700);
          } else {
            showMessage({
              icon: 'danger',
              floating: true,
              message: 'Error getting your addresses! Try again later',
              style: {backgroundColor: colors.BLACK},
              duration: 1300,
            });
            setTimeout(() => {
              props.navigation.navigate('CartScreen');
            }, 1400);
          }
        },
      );
    });
    return () => {
      unsubscribe();
      backButtonAction.remove();
    };
  }, []);

  const handleBackButtonClick = () => {
    props.navigation.navigate('CartScreen');
    return true;
  };

  const proceed = async address => {
    console.log('pressed');
    const res = await Application.executeQuery(
      `SELECT delivery_range, latitude, longitude FROM CART`,
    );
    const {delivery_range, latitude, longitude} = res.item(0);
    const shopAddress = {
      latitude: +latitude,
      longitude: +longitude,
    };
    const selectedAddress = {
      latitude: address.latitude,
      longitude: address.longitude,
    };
    const d = distanceBetweenCoordinates(shopAddress, selectedAddress);
    console.log(d);
    if (Math.round(d).toFixed(2) > delivery_range) {
      showMessage({
        icon: 'info',
        style: {backgroundColor: colors.BLACK},
        message: strings.DELIVERY_LOCATION_OUT_OF_RANGE,
        floating: true,
        duration: 4000,
      });
      return;
    }
    props.navigation.replace('SlotSelection', {item: address});
  };

  const renderItem = ({item}) => {
    const changeAddress = () => {
      let obj = {
        // id : index,
        address1: item.address_line_1,
      };
      setIsFocused(obj);
    };
    const {
      locality,
      address_line_1,
      address_line_2,
      address_line_3,
      state,
      pincode,
      country,
      city,
    } = item;
    return (
      <TouchableWithoutFeedback style={styles.listItem} onPress={changeAddress}>
        <View style={styles.listItemContainer}>
          <View style={styles.radioButtonArea}>
            <RadioButton
              status={
                address_line_1 === isFocused.address1 ? 'checked' : 'unchecked'
              }
              onPress={changeAddress}
              color={colors.MANGO_COLOR}
            />
          </View>

          <View style={styles.addressArea}>
            <View>
              <Text style={styles.name}>{item?.name}</Text>
            </View>
            <View>
              <Text style={styles.address} numberOfLines={1}>
                {address_line_1}
              </Text>
            </View>
            <View
              style={{
                display:
                  isFocused.address1 === address_line_1 ? 'flex' : 'none',
              }}>
              <Text numberOfLines={1} style={styles.address}>
                {address_line_2}
              </Text>
            </View>
            <View>
              <Text style={styles.address} numberOfLines={2}>
                {address_line_3}, {locality?.locality}, {city?.city}, {state},{' '}
                {pincode}, {country}
              </Text>
            </View>

            <View
              style={[
                styles.buttonsArea,
                {
                  display:
                    isFocused.address1 === item.address_line_1
                      ? 'flex'
                      : 'none',
                },
              ]}>
              <TouchableRipple
                style={styles.deliverButton}
                onPress={() => proceed(item)}>
                <LinearGradient
                  colors={[colors.PRIMARY, '#CAC531']}
                  locations={[0.5, 1]}
                  start={{x: 0.5, y: 0}}
                  end={{x: 0.5, y: 1}}
                  style={styles.deliverButton}>
                  <Text style={{fontFamily: ColorsText.Medium.fontFamily}}>
                    Deliver to this address
                  </Text>
                </LinearGradient>
              </TouchableRipple>
              <View style={{marginTop: '5%', marginBottom: '5%'}}></View>
              <TouchableRipple
                style={styles.deliverButton}
                onPress={() =>
                  props.navigation.replace('VerifyLocation', {
                    direction: 'EditFromCheckout',
                    item,
                  })
                }>
                <LinearGradient
                  colors={['#F5F7FA', '#B8C6DB']}
                  style={styles.deliverButton}>
                  <Text>Edit Address</Text>
                </LinearGradient>
              </TouchableRipple>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // const HeaderCmponent = () => (

  // )

  const FooterComponent = () => (
    <TouchableWithoutFeedback
      style={styles.listFooterComponent}
      onPress={() =>
        props.navigation.replace('VerifyLocation', {direction: 'Checkout'})
      }>
      <View style={styles.footerText}>
        <Text style={{fontFamily: ColorsText.Bold.fontFamily}}>
          Add a new address
        </Text>
      </View>
      <View style={styles.footerIcon}>
        <Icon active type="EvilIcons" name="chevron-right" />
      </View>
    </TouchableWithoutFeedback>
  );

  if (isLoading) return <GIFLoading />;
  else
    return (
      <View style={{flex: 1}}>
        <View
          style={{backgroundColor: colors.WHITE, padding: 10, paddingLeft: 12}}>
          <TouchableWithoutFeedback
            onPress={() => props.navigation.navigate('CartScreen')}>
            <Icon
              active
              type="Ionicons"
              name="arrow-back"
              style={{color: colors.DUSKY_BLACK_TEXT}}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.innerHeader}>
          <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setIsModalVisible(false)}
            animationInTiming={700}
            animationIn="flipInX"
            animationOut="flipOutX"
            animationOutTiming={500}>
            <View style={styles.modalContainer}>
              <View style={{marginBottom: '2%'}}>
                <Text style={styles.modalTitle}>Error!</Text>
              </View>
              <View style={{marginBottom: '8%'}}>
                <Text style={styles.modalText}>{strings.LOCATION_ERROR}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Pressable
                  style={styles.dismissModalButton}
                  hitSlop={30}
                  onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.dismissModalText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <View style={{flex: 1}}>
            <>
              <View style={styles.logoArea}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={{width: '70%'}}
                  onPress={() => props.navigation.replace('Home')}>
                  <Image
                    source={require('../../../assets/Images/logo2.png')}
                    style={{width: '60%', height: 80}}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.listHeaderText}>Select an Address</Text>
              </View>
            </>
            <FlatList
              data={addresses}
              renderItem={renderItem}
              ListFooterComponent={FooterComponent}
              style={{marginBottom: '2%'}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
    );
};

export default Checkout;
