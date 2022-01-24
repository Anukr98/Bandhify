import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
  BackHandler,
  LogBox,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import ColorsText from '../../../constants/ColorsText';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  filterTopRatedAndRegularProducts,
  postMethod,
} from '../../../Utils/CommonFunctions';
import urls from '../../../constants/urls';
import Application from '../../../Utils/db/Application';
import Geolocation from 'react-native-geolocation-service';
import {showMessage} from 'react-native-flash-message';
import {width, height} from '../../../constants/dimensions';
import colors from '../../../constants/colors';
import {Icon} from 'native-base';
import GIFLoading from '../../Components/GIFLoading/GIFLoading';
import Geocode from 'react-native-geocoding';
import keys from '../../../constants/keys';
import {strings} from '../../../constants/strings';
import Slider from 'react-native-app-intro-slider';

const ShopsNear = () => {
  LogBox.ignoreAllLogs();

  const navigation = useNavigation();

  const [shops, setShops] = useState([]);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [deliveringAddress, setDeliveringAddress] = useState({
    mainAddress: '',
    addressDetails: '',
  });
  const [carouselImages, setCarouselImages] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const getCarouselImages = token => {
    let object = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    postMethod(urls.GET_CAROUSEL_IMAGES, object, (err, result) => {
      if (err) console.log(err);
      else if (result.status && result.code === 200) {
        const {value} = result.banner[0];
        const {banner} = value;
        setCarouselImages(() => banner);
      }
    });
  };

  const geoSuccess = async position => {
    Geocode.init(keys.GOOGLE_MAPS_API);
    const {latitude: currentLatitude, longitude: currentLongitude} =
      position.coords;

    let address = await AsyncStorage.getItem('location');
    let lt = 0,
      long = 0;
    if (address) {
      let addressLatitude = await AsyncStorage.getItem('addressLatitude');
      let addressLongitude = await AsyncStorage.getItem('addressLongitude');
      addressLatitude = +addressLatitude;
      addressLongitude = +addressLongitude;
      Geocode.from(address).then(res => {
        setLatitude(addressLatitude);
        setLongitude(addressLongitude);
        getShops(addressLatitude, addressLongitude);
      });
      let temp = address.split(',');
      let secondaryAddress = '';
      temp.map((item, index) => {
        if (index > 0) secondaryAddress = secondaryAddress + item + ', ';
      });
      setDeliveringAddress({
        mainAddress: temp[0],
        addressDetails: secondaryAddress,
      });
    } else {
      lt = position.coords.latitude;
      long = position.coords.longitude;
      setLatitude(lt);
      setLongitude(long);
      Geocode.from(lt, long).then(async res => {
        let tempAddress = res.results[0].formatted_address,
          secondaryAddress = '';
        await AsyncStorage.setItem('location', tempAddress);
        await AsyncStorage.setItem(
          'addressLatitude',
          currentLatitude.toString(),
        );
        await AsyncStorage.setItem(
          'addressLongitude',
          currentLongitude.toString(),
        );
        let temp = tempAddress.split(',');
        temp.map((item, index) => {
          if (index > 0) secondaryAddress = secondaryAddress + item + ', ';
        });
        setDeliveringAddress({
          mainAddress: temp[0],
          addressDetails: secondaryAddress,
        });
        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
        getShops(currentLatitude, currentLongitude);
      });
    }
  };

  const getShops = async (lt, long) => {
    setIsLoading(true);
    await AsyncStorage.getItem('token').then(res => {
      setToken(res);
      let object = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${res}`,
        },
      };
      postMethod(
        `${urls.GET_SHOPS}?latitude=${lt}&longitude=${long}`,
        object,
        (err, result) => {
          console.log(result);
          if (err) console.log(err);
          else if (result.status && result.code === 200) {
            setIsLoading(false);
            setShops(result.shop);
            getCarouselImages(res);
            setUnreadNotificationCount(() => result.notifications_count);
          } else {
            console.log(result);
            setIsLoading(false);
            showMessage({
              icon: 'danger',
              floating: true,
              duration: 1400,
              message: result.message,
              style: {backgroundColor: '#000'},
            });
          }
        },
      );
    });
  };

  const geoFailure = () => {
    setIsLoading(false);
    alert('Error getting position');
  };

  const getLocation = async () => {
    if (Platform.OS === 'android') {
      Geolocation.getCurrentPosition(geoSuccess, geoFailure, {
        enableHighAccuracy: true,
        forceRequestLocation: true,
        showLocationDialog: true,
      });
    } else {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        Geolocation.getCurrentPosition(geoSuccess, geoFailure, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 1000,
        });
      }
    }
  };

  const handleBackButtonClick = () => {
    BackHandler.exitApp();
    return true;
  };

  const getAllProducts = async item => {
    setIsLoading(true);
    let object = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    postMethod(
      `${urls.GET_PRODUCTS}?selling_products=true&shop_id=${item?.id}&top_selling_products=true`,
      object,
      async (err, result) => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        if (err) console.log(err);
        else if (result.status && result.code === 200) {
          let localCart = await Application.executeQuery(`SELECT * FROM CART`);
          let temp = [];
          let productId = [];
          for (let i = 0; i < localCart.length; i++) {
            temp.push(localCart.item(i));
            productId.push(localCart.item(i).product_id);
          }
          setShops([]);
          const [products, topSellingProducts] =
            filterTopRatedAndRegularProducts(
              result.products.selling_products,
              result.products.top_selling_products,
            );
          navigation.navigate('DairyDetais', {
            data: products,
            initialValues: temp,
            cart: productId,
            item,
            top_selling_products: topSellingProducts,
            deliverSlot: result?.shop_slots,
          });
        } else
          showMessage({
            icon: 'danger',
            duration: 1200,
            style: {backgroundColor: '#000'},
            message: result.message,
            floating: true,
          });
      },
    );
  };

  const renderItem = ({item}) => (
    <TouchableWithoutFeedback
      onPress={() => getAllProducts(item)}
      style={styles.shopCard}>
      <View style={styles.innerShopCard}>
        <View style={styles.shopimage}>
          <Image
            style={styles.imageShop}
            source={{uri: `${item?.shop_profile}`}}
            resizeMode="contain"
          />
        </View>
        <View style={styles.shopContent}>
          <View style={styles.shopNameinfo}>
            <View style={{width: '85%'}}>
              <Text numberOfLines={1} style={styles.shopNameText}>
                {item?.shop_name}
              </Text>
              <Text style={styles.shopDescription}>
                {item?.shop_description}
              </Text>
            </View>
          </View>
          <View style={styles.ratingView}>
            <View style={styles.innerRating}>
              <View style={styles.allStars}>
                <AntDesign style={styles.starRating} name="star" size={12} />
              </View>
              <View style={styles.ratingValue}>
                <Text style={styles.rateValue}>
                  {item?.review_avg_rating
                    ? parseFloat(item?.review_avg_rating).toFixed(1)
                    : 0}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.shopLocation}>
            <View style={{flexDirection: 'row', width: '100%'}}>
              <Text numberOfLines={1} style={styles.shopLocationText}>
                {item?.address?.distance}kms. away
              </Text>
            </View>
          </View>
          {item?.shop_coupons?.length > 0 && (
            <View style={styles.offerCard}>
              <View style={styles.innerOfferCard}>
                <Image
                  source={require('../../../assets/Images/OfferStar.png')}
                />
                <Text style={styles.offerText}>
                  Flat {item.shop_coupons[0]?.coupon_value}% Off
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const EmptyList = () => (
    <View
      style={{flex: 1, backgroundColor: colors.WHITE, alignItems: 'center'}}>
      <Image
        source={require('../../../assets/Images/no_shops.png')}
        style={{width: width * 0.9, height: height * 0.6}}
        resizeMode="contain"
      />
      <View
        style={{
          width: '93%',
          alignItems: 'center',
          transform: [{translateY: -50}],
        }}>
        <Text style={styles.areaNotServiceable}>
          {strings.AREA_NOT_SERVICEABLE}
        </Text>
      </View>
    </View>
  );

  const Header = () => (
    <View>
      <View style={styles.mainBanner}>
        <View style={styles.innerBanner}>
          <Slider
            data={carouselImages}
            renderItem={({item}) => (
              <Image
                source={{uri: item}}
                style={{width: '100%', height: 180, borderRadius: 15}}
                resizeMode="contain"
              />
            )}
            keyExtractor={() =>
              Math.floor(Math.random() * 1000 * Math.random() * 4000)
            }
            activeDotStyle={{
              backgroundColor: colors.MANGO_COLOR,
              transform: [{scale: 1.04}],
            }}
            dotStyle={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              transform: [{scale: 0.6}],
            }}
            renderNextButton={() => null}
            renderDoneButton={() => null}
          />
        </View>
      </View>
      <View style={styles.shopNearHeading}>
        <Text style={styles.shopNearText}>Shops Near You</Text>
      </View>
    </View>
  );

  const openNotifications = () => {
    let object = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    postMethod(urls.GET_NOTIFICATIONS, object, (err, result) => {
      if (err) console.log(err);
      else if (result.status && result.code === 200) {
        const {notifications} = result;
        navigation.navigate('Notifications', {
          notifications,
        });
      }
    });
  };

  useEffect(() => {
    const backButtonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );
    const unsubsribe = navigation.addListener('focus', () => {
      setIsLoading(true);
      getLocation();
    });
    return () => {
      setShops([]);
      backButtonAction.remove();
      unsubsribe();
    };
  }, []);

  if (isLoading) return <GIFLoading />;
  else {
    return (
      <View style={{flex: 1, backgroundColor: colors.WHITE}}>
        <View style={[styles.mainShopNear, {position: 'relative'}]}>
          <View style={{position: 'relative'}}>
            <View style={[styles.header]}>
              <TouchableOpacity
                style={{flex: 0.85}}
                activeOpacity={0.5}
                onPress={() =>
                  navigation.navigate('SavedAddressesBeforeLocationChange', {
                    latitude,
                    longitude,
                  })
                }>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    source={require('../../../assets/Images/location2.png')}
                    style={{width: 40, height: 40}}
                  />
                  <Text
                    style={{
                      fontFamily: ColorsText.Bold.fontFamily,
                      fontSize: 20,
                      color: 'rgb(0,49,83)',
                    }}>
                    {deliveringAddress.mainAddress}
                  </Text>
                </View>
                <View style={{paddingLeft: '4%', marginTop: -7}}>
                  <Text
                    style={{
                      color: colors.LIGHT_TEXT_COLOR,
                      fontFamily: ColorsText.Medium.fontFamily,
                      fontSize: 12,
                    }}
                    numberOfLines={2}>
                    {deliveringAddress.addressDetails.slice(
                      0,
                      deliveringAddress.addressDetails.length - 2,
                    )}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 0.15,
                  alignItems: 'center',
                  paddingTop: '5%',
                  position: 'relative',
                }}
                activeOpacity={0.5}
                onPress={openNotifications}>
                <Icon
                  active
                  type="MaterialCommunityIcons"
                  name="bell"
                  style={{color: colors.MANGO_COLOR, fontSize: 25}}
                />
                <View style={styles.notificationCount}>
                  <Text style={{color: colors.ACCENT, fontSize: 12}}>
                    {unreadNotificationCount > 99
                      ? '99+'
                      : unreadNotificationCount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {shops.length === 0 ? (
              <EmptyList />
            ) : (
              <FlatList
                data={shops}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListHeaderComponent={Header}
                showsVerticalScrollIndicator={false}
                onRefresh={() => getShops(latitude, longitude)}
                refreshing={isLoading}
              />
            )}
          </View>
        </View>
      </View>
    );
  }
};

export default ShopsNear;

const styles = StyleSheet.create({
  mainShopNear: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  shopNearText: {
    fontSize: 20,
    fontFamily: ColorsText.Medium.fontFamily,
    color: colors.MANGO_COLOR,
  },

  shopCard: {
    alignSelf: 'center',
    width: '97%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebebeb60',
    marginBottom: '4%',
    borderRadius: 21,
    paddingVertical: 2,
  },

  innerShopCard: {
    width: '99%',
    flexDirection: 'row',
    borderRadius: 18,
    borderColor: '#cccccc',
    borderWidth: 0.5,
    backgroundColor: colors.WHITE,
    paddingTop: 6,
    paddingBottom: 9,
    elevation: 1,
  },

  shopimage: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  imageShop: {
    width: '95%',
    height: 90,
    resizeMode: 'cover',
    borderRadius: 18,
  },

  shopContent: {
    flex: 0.7,
    paddingLeft: 10,
  },

  shopNameinfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  shopNameText: {
    fontSize: 17,
    fontFamily: ColorsText.Medium.fontFamily,
    width: '90%',
  },

  shopDescription: {
    fontFamily: ColorsText.light.fontFamily,
    fontSize: 12,
    color: colors.LIGHT_TEXT_COLOR,
  },

  ratingView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  innerRating: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  allStars: {
    flexDirection: 'row',
  },

  starRating: {
    marginRight: 4,
    color: ColorsText.primary_color.color,
  },

  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 3,
  },

  rateValue: {
    marginRight: 2,
    fontFamily: ColorsText.light.fontFamily,
    fontSize: 12,
  },

  shopLocation: {
    marginTop: 4,
  },

  shopLocationText: {
    fontSize: 13,
    color: '#717171',
    fontFamily: ColorsText.light.fontFamily,
    letterSpacing: 0.5,
  },

  offerCard: {
    width: '100%',
    justifyContent: 'center',
    marginTop: 7,
  },

  innerOfferCard: {
    width: '55%',
    backgroundColor: ColorsText.primary_color.color,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    height: 20,
    flexDirection: 'row',
  },

  offerText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: ColorsText.Medium.fontFamily,
  },

  mainBanner: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '6%',
  },

  innerBanner: {
    width: '93%',
    alignSelf: 'center',
  },

  bannerImage: {
    resizeMode: 'contain',
    width: '100%',
  },

  shopNearHeading: {
    paddingLeft: '5%',
    marginBottom: '2%',
    marginTop: '4%',
  },

  header: {
    paddingLeft: '1.4%',
    width,
    alignSelf: 'center',
    flexDirection: 'row',
    borderBottomColor: colors.LIGHT_GRAY_BG_COLOR,
    borderBottomWidth: 1.8,
    paddingTop: 5,
    paddingRight: 7,
    paddingBottom: '2%',
  },

  areaNotServiceable: {
    fontFamily: ColorsText.Bold.fontFamily,
    fontSize: 17,
    color: colors.MANGO_COLOR,
    textAlign: 'center',
  },

  notificationCount: {
    position: 'absolute',
    top: '15%',
    right: '-2%',
    backgroundColor: colors.PRIMARY,
    borderRadius: 999,
    padding: 3,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
