import {Icon, Toast} from 'native-base';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ColorsText from '../../../../constants/ColorsText';
import Application from '../../../../Utils/db/Application';
import {width} from '../../../../constants/dimensions';
import Modal from 'react-native-modal';
import {TouchableRipple} from 'react-native-paper';
import {showMessage} from 'react-native-flash-message';
import colors from '../../../../constants/colors';
import NumInput from 'react-native-input-spinner';
import GIFLoading from '../../../Components/GIFLoading/GIFLoading';
import Dash from 'react-native-dash';
import {strings} from '../../../../constants/strings';
import DetailSection from './DetailSection';
import AnimatedView from './AnimatedView';
import Slider from 'react-native-app-intro-slider';
import BottomSheet from 'react-native-raw-bottom-sheet';
import DairyTimings from './DairyTimings';

export default class DairyDetail extends React.Component {
  constructor(props) {
    super(props);
    const {
      shop_id,
      shop_name,
      shop_banner,
      review_avg_rating,
      address,
      shop_phone,
      shop_schedules,
    } = props.route.params.item;
    const {distance} = address;
    this.state = {
      products: props.route.params.data,
      initialValues: props.route.params.initialValues,
      topSellingProducts: props.route.params.top_selling_products,
      changeBtn: false,
      cart: props.route.params.cart,
      shopId: shop_id,
      isAlertModalVisible: false,
      isLoading: false,
      shop_name,
      shouldNameShowOnHeader: false,
      rating: review_avg_rating,
      distance,
      banner: shop_banner,
      address,
      shop_phone,
      startTime: shop_schedules[0].morning_start_time,
      endTime: shop_schedules[0].evening_end_time,
      showAdditionalDetails: false,
      activeSlideIndex: 0,
    };
    this.addToCart = this.addToCart.bind(this);
    this.clearDatabse = this.clearDatabse.bind(this);
    this.proceedToCheckout = this.proceedToCheckout.bind(this);
  }

  componentDidMount() {
    this.backButtonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      // console.log(this.props.route.params.item)
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.backButtonAction.remove();
  }

  handleBackButtonClick = () => {
    this.props.navigation.navigate('HomeScreen');
    return true;
  };

  getDeliveryDateRange = () => {
    const {shop_schedules} = this.props.route.params.item;
    let min = 0,
      lastDay = '',
      max = Infinity,
      startDay = '';
    shop_schedules.forEach(schedule => {
      if (schedule?.id > min && schedule?.key !== 'Holiday') min = schedule?.id;
      if (schedule?.id < max && schedule?.key !== 'Holiday') max = schedule?.id;
    });
    shop_schedules.map(schedule => {
      if (schedule?.id == min) lastDay = schedule?.key.slice(0, 3);
      if (schedule?.id == max) startDay = schedule?.key.slice(0, 3);
    });

    const startTime =
      (this.state.startTime.slice(0, 2) > 12
        ? `${parseFloat(this.state.startTime.slice(0, 2)) - 12}`
        : this.state.startTime.slice(0, 2)) +
      (this.state.startTime.slice(0, 2) > 12 ? 'PM' : 'AM');
    const endTime =
      (this.state.endTime.slice(0, 2) > 12
        ? `${parseFloat(this.state.endTime.slice(0, 2)) - 12}`
        : this.state.endTime.slice(0, 2)) +
      (this.state.endTime.slice(0, 2) > 12 ? 'PM' : 'AM');
    return `${startDay}-${lastDay}\n(${startTime} - ${endTime})`;
  };

  getBestDeliverySlot = () => {
    const {deliverSlot} = this.props.route.params;
    if (!deliverSlot) return 'N.A.';
    const {delivery_day, slot_end} = deliverSlot;
    const slotEndTime = `${slot_end.slice(0, 5)} ${slot_end.slice(-2)}`;
    return `${delivery_day.slice(0, 3)} (${slotEndTime})`;
  };

  onDetailPress = () => {
    this.sheetRef.open();
  };

  HeaderComponent = () => {
    const {
      active_subscriptions_count,
      address,
      shop_delivery_range,
      orders_count,
    } = this.props.route.params.item;
    const {locality} = address;

    return (
      <View>
        <View style={styles.dairyDetails}>
          <View style={styles.innerDairyDetails}>
            <View style={styles.shopCard}>
              <View style={styles.innerShopCard}>
                <View style={styles.shopContent}>
                  <View>
                    <Text
                      numberOfLines={1}
                      style={[styles.shopLocationText, {marginTop: '3%'}]}>
                      {this.props.route.params.item.address.locality?.locality}
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.shopLocationText}>
                        {this.state.address?.city?.city} |{' '}
                      </Text>
                      <Text numberOfLines={1} style={styles.shopLocationText}>
                        {this.state.distance} kms
                      </Text>
                    </View>
                  </View>
                  <Dash
                    style={{
                      width: '100%',
                      height: 2,
                      marginTop: '3%',
                      marginBottom: '4%',
                    }}
                    dashThickness={1.5}
                    dashGap={2}
                    dashLength={1.5}
                    dashColor={colors.GRAY_BORDER_COLOR}
                    dashStyle={{
                      borderRadius: 999,
                    }}
                  />
                  <View style={styles.offerCard}>
                    <View style={[styles.innerOfferCard, {width: '30%'}]}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <AntDesign
                          style={styles.starRating}
                          name="star"
                          size={15}
                        />
                        <Text style={styles.detailText}>
                          {this.state.rating
                            ? parseFloat(this.state.rating).toFixed(1)
                            : '0'}
                        </Text>
                      </View>
                      <View style={{width: '100%', alignItems: 'center'}}>
                        <Text
                          style={[
                            styles.detailText,
                            {color: colors.GRAY_TEXT_NEW},
                          ]}>
                          Avg Rating
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.innerOfferCard, {width: '40%'}]}>
                      <DetailSection
                        detail={this.getDeliveryDateRange()}
                        description={'Operating hours*'}
                        disabled={false}
                        onPress={this.onDetailPress}
                      />
                    </View>
                    <View style={[styles.innerOfferCard, {width: '30%'}]}>
                      <DetailSection
                        detail={active_subscriptions_count}
                        description={'Subscriptions'}
                        disabled
                        onPress={this.onDetailPress}
                      />
                    </View>
                  </View>
                  <Dash
                    style={{
                      width: '100%',
                      height: 2,
                      marginTop: '3%',
                      marginBottom: '6%',
                    }}
                    dashThickness={1.5}
                    dashGap={2}
                    dashLength={1.5}
                    dashColor={colors.GRAY_BORDER_COLOR}
                    dashStyle={{
                      borderRadius: 999,
                    }}
                  />
                  <View style={styles.offerCard}>
                    <View style={[styles.innerOfferCard, {width: '30%'}]}>
                      <DetailSection
                        detail={shop_delivery_range + ' kms'}
                        description={'Service Radius'}
                        disabled
                        onPress={this.onDetailPress}
                      />
                    </View>
                    <View style={[styles.innerOfferCard, {width: '40%'}]}>
                      <DetailSection
                        detail={orders_count}
                        description={`${
                          orders_count > 1 ? 'Orders' : 'Order'
                        } in last 3 days`}
                        disabled
                        onPress={this.onDetailPress}
                      />
                    </View>
                    <View style={[styles.innerOfferCard, {width: '30%'}]}>
                      <DetailSection
                        detail={this.getBestDeliverySlot()}
                        description={'Best delivery slot'}
                        disabled
                        onPress={this.onDetailPress}
                      />
                    </View>
                  </View>
                  <AnimatedView
                    details={this.props.route.params.item}
                    onPress={this.onDetailPress}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {this.state.topSellingProducts.length > 0 && (
          <View style={{flex: 1, marginVertical: '3%'}}>
            <FlatList
              data={this.state.topSellingProducts}
              renderItem={this.renderItem}
              numColumns={2}
            />
          </View>
        )}
      </View>
    );
  };

  addToCart = async (quantity, item) => {
    const {shop_delivery_range} = this.props.route.params.item;

    //CHECK WHETHER PRODUCT EXISTS IN CART OR NOT
    let shopId = await Application.executeQuery(`SELECT * FROM CART`);

    //CHECK WHETHER PRODUCT IS FROM ANOTHER SHOP OR NOT
    if (shopId.length > 0 && item.shop_id !== shopId.item(0).shop_id) {
      console.log('control shall go here');
      this.setState({
        isAlertModalVisible: true,
        cart: [],
        initialValues: [],
      });
      return;
    }

    const {latitude, longitude} = this.props.route.params.item.address;
    let tempCart = this.state.cart;

    //GET PARTICULAR PRODUCT
    let localCart = await Application.executeQuery(
      `SELECT * FROM CART WHERE product_id = '${item?.id}'`,
    );

    //IF PRODUCT DOES NOT EXIST IN CART, ADD IT
    if (localCart.length == 0) {
      if (quantity == 0)
        await Application.executeQuery(
          `DELETE FROM CART WHERE product_id = '${item?.id}'`,
        );
      else {
        await Application.insertSingleRecord(
          `INSERT INTO CART(product_id , product_name , shop_id , product_image , product_price , discount , quantity , base_unit , stock , shop_banner , shop_name , shop_distance , rating , is_subscribable , commission , delivery_range, latitude, longitude) VALUES('${item?.id}' , '${item?.product?.product_name}' , ${item?.shop_id} , '${item?.product?.product_image}' , '${item?.product_price}' , '${item?.product_discount}' , ${quantity} , '${item?.product?.base_unit}' , ${item?.product_daily_stock_remaining} , '${this.state.banner}' , '${this.state.shop_name}' , '${this.state.distance}' , '${this.state.rating}' , '${item.product.is_subscribable_product}' , ${item.product_commission} , '${shop_delivery_range}', '${latitude}', '${longitude}')`,
        );
        Toast.show({
          text: `${item?.product?.product_name} added to cart`,
          style: {
            backgroundColor: colors.BUTTON_TEXT_COLOR,
          },
          textStyle: {
            color: colors.BUTTON_BACKGROUND_COLOR,
            textAlign: 'center',
            fontSize: 18,
            fontFamily: ColorsText.Medium.fontFamily,
            letterSpacing: 0.4,
          },
        });
      }
    }
    //UPDATE QUANTITY OF PRODUCT
    else {
      if (quantity == 0)
        await Application.executeQuery(
          `DELETE FROM CART WHERE product_id = '${item?.id}'`,
        );
      else
        await Application.executeQuery(
          `UPDATE CART SET quantity = ${quantity} WHERE product_id = '${item?.id}'`,
        );
    }

    if (tempCart.length === 0 && quantity > 0) tempCart.push(item?.id);
    else {
      if (quantity === 0)
        tempCart = tempCart.filter(cartItem => cartItem !== item?.id);
      else {
        this.state.cart.map(async cartItem => {
          if (!(item?.id === cartItem)) tempCart.push(item?.id);
        });
      }
    }

    //AFTER PUSHING ALL ITEMS IN LOCAL VARIABLE, FILTER OUT DUPLICATE ENTRIES TO GET CORRECT CART LENGTH
    tempCart = tempCart.filter((value, index) => {
      return tempCart.indexOf(value) === index;
    });

    this.setState({
      cart: tempCart,
    });
  };

  showSubscribableMessage = () => {
    showMessage({
      type: 'info',
      icon: 'info',
      message: strings.SUBSRIBABLE_PRODUCT,
      floating: true,
      duration: 4000,
    });
  };

  renderItem = ({item}) => {
    const {product_price, product_daily_stock_remaining} = item;
    const {is_subscribable_product, product_name, base_unit} = item.product;
    let initialValue;
    this.state.initialValues.forEach(cartItem => {
      if (cartItem.product_id === item?.id) initialValue = cartItem.quantity;
    });
    return (
      <>
        <View style={styles.dairyProductCard}>
          <View style={styles.imageProduct}>
            <Image
              style={styles.productimage}
              source={{uri: item?.product?.product_image}}
              resizeMode="cover"
            />
          </View>
          <View style={styles.productContent}>
            <View style={styles.innerProductontent}>
              {item?.topSelling && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}>
                  <View>
                    <Icon
                      type="Entypo"
                      name="star"
                      style={{
                        color: colors.MANGO_COLOR,
                        fontSize: 17,
                        transform: [{translateY: -1.5}],
                      }}
                    />
                  </View>
                  <View style={{marginLeft: 3}}>
                    <Text style={{fontFamily: ColorsText.regular.fontFamily}}>
                      Bestseller
                    </Text>
                  </View>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{width: ' 70%'}}>
                  <Text numberOfLines={2} style={styles.productName}>
                    {product_name}
                  </Text>
                </View>
                {is_subscribable_product === 1 && (
                  <View style={{width: '30%', alignItems: 'flex-end'}}>
                    <TouchableWithoutFeedback
                      onPress={this.showSubscribableMessage}>
                      <Icon
                        type="MaterialCommunityIcons"
                        name="calendar-month-outline"
                        style={{fontSize: 20, color: colors.ROYAL_BLUE}}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                )}
              </View>
              <Text style={styles.productQuantity}>{base_unit}</Text>
            </View>
            <View style={styles.productQuantityPrice}>
              <Text style={styles.fixedPrice}>₹ {product_price}</Text>
              <View style={{width: '100%', marginTop: '3%'}}>
                {product_daily_stock_remaining > 0 ? (
                  <NumInput
                    max={product_daily_stock_remaining}
                    min={0}
                    step={1}
                    onChange={value => this.addToCart(value, item)}
                    initialValue={initialValue}
                    placeholder={0}
                    editable={false}
                    skin={'clean'}
                    height={40}
                    style={{
                      elevation: 0,
                      shadowOpacity: 0,
                    }}
                    buttonStyle={{
                      backgroundColor: colors.PRIMARY,
                      borderRadius: 999,
                      height: 35,
                      width: 35,
                    }}
                    buttonTextColor={colors.DUSKY_BLACK_TEXT}
                    buttonPressStyle={{
                      height: 35,
                      width: 35,
                    }}
                  />
                ) : (
                  // <NumInput
                  //     minValue = {0}
                  //     value = {initialValue}
                  //     onChange = {value => this.addToCart(value,item)}
                  //     step = {1}
                  //     valueType = 'integer'
                  //     type = 'plus-minus'
                  //     rightButtonBackgroundColor = {ColorsText.primary_color.color}
                  //     leftButtonBackgroundColor = {ColorsText.primary_color.color}
                  //     maxValue = {product_daily_stock_remaining}
                  //     editable = {false}
                  //     borderColor = {colors.WHITE}
                  //     rounded
                  //     totalHeight = {35}
                  //     containerStyle = {{
                  //             width : '100%',
                  //             alignSelf : 'center',
                  //     }}
                  // />
                  <View style={styles.productUnavailableContainer}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };

  proceedToCheckout = async () => {
    let cartItems = await Application.executeQuery(`SELECT * FROM CART`);
    let temp = [],
      total = 0;
    for (let i = 0; i < cartItems.length; i++) {
      temp.push(cartItems.item(i));
      total =
        total + cartItems.item(i).product_price * cartItems.item(i).quantity;
    }

    this.props.navigation.navigate('CartScreen', {
      direction: 'Dairy',
    });
  };

  clearDatabse = async () => {
    await Application.clearCart();
    await Application.executeQuery(`DELETE FROM COUPON`).then(() => {
      let products = [...this.state.products];
      this.setState(
        {
          products: [],
          isAlertModalVisible: false,
          isLoading: true,
        },
        () => {
          showMessage({
            floating: true,
            duration: 1200,
            type: 'success',
            icon: 'success',
            message: 'Cart was reset',
          });
          setTimeout(() => {
            this.setState({
              products: products,
              isLoading: false,
            });
          }, 600);
        },
      );
    });
  };

  EmptyList = () => (
    <View>
      <Image
        source={require('../../../../assets/Images/no-product-found.jpg')}
        resizeMode="contain"
        style={{width}}
      />
    </View>
  );

  FooterComponent = () => {
    const {shop_banner} = this.props.route.params.item;
    return (
      <View style={{width: '93%', alignSelf: 'center', marginTop: '5%'}}>
        {shop_banner && shop_banner.length > 0 && (
          <>
            <View style={{marginBottom: '2%'}}>
              <Text
                style={{
                  fontFamily: ColorsText.Medium.fontFamily,
                  fontSize: 17,
                  color: colors.DUSKY_BLACK_TEXT,
                }}>
                {strings.DAIRY_IMAGES}
              </Text>
            </View>
            <Slider
              data={shop_banner}
              renderItem={({item}) => (
                <Image
                  source={{uri: item}}
                  style={{width, height: 200}}
                  resizeMode="contain"
                />
              )}
              keyExtractor={() =>
                Math.floor(Math.random() * 1000 * Math.random() * 4000)
              }
              activeDotStyle={{
                backgroundColor: colors.ROYAL_BLUE,
                transform: [{scale: 1.13}],
              }}
              dotStyle={{
                backgroundColor: 'rgba(0,0,0,0.15)',
                transform: [{scale: 0.6}],
              }}
              renderNextButton={() => null}
              renderDoneButton={() => null}
            />
          </>
        )}
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.changeBtn && (
          <TouchableRipple
            style={styles.proceedBtn}
            onPress={this.proceedToCheckout}>
            <View style={styles.innerProceedButton}>
              <View
                style={[
                  styles.proceedButtonView,
                  {alignItems: 'flex-start', paddingLeft: '4%'},
                ]}>
                <Text style={styles.proceedBtnText}>
                  {this.state.cart.length} Items
                </Text>
              </View>
              <View
                style={[
                  styles.proceedButtonView,
                  {flexDirection: 'row', justifyContent: 'flex-end'},
                ]}>
                <Text style={[styles.proceedBtnText, {marginRight: '6%'}]}>
                  VIEW CART
                </Text>
                <Icon
                  active
                  type="Fontisto"
                  name="shopping-bag"
                  style={{
                    fontSize: 17,
                    color: colors.BUTTON_TEXT_COLOR,
                    transform: [{scaleX: 1.3}],
                  }}
                />
              </View>
            </View>
          </TouchableRipple>
        )}

        <Modal
          isVisible={this.state.isAlertModalVisible}
          animationIn="tada"
          animationInTiming={700}
          animationOut="zoomOutRight"
          animationOutTiming={500}>
          <View
            style={{
              backgroundColor: '#fff',
              paddingVertical: '5%',
              paddingHorizontal: '4%',
              width: width * 0.8,
              alignSelf: 'center',
              position: 'relative',
              borderRadius: 4,
            }}>
            <View style={{marginBottom: '4%'}}>
              <Text
                style={[
                  ColorsText.Medium,
                  {fontSize: 18, color: colors.MANGO_COLOR},
                ]}>
                Replace cart items?
              </Text>
            </View>
            <View style={{marginBottom: '20%'}}>
              <Text style={[ColorsText.regular, {color: '#999'}]}>
                {strings.ITEMS_FROM_DIFFERENT_SHOP}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                position: 'absolute',
                bottom: 20,
                right: 20,
                width: '100%',
                height: '20%',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
              <View style={[styles.modalButtonContainer, {marginRight: '3%'}]}>
                <TouchableRipple
                  onPress={() => {
                    this.setState({isAlertModalVisible: false}, () => {
                      this.props.navigation.navigate('Home');
                    });
                  }}
                  rippleColor="#ffffff"
                  style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>NO</Text>
                </TouchableRipple>
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableRipple
                  onPress={() => this.clearDatabse()}
                  rippleColor="#ffffff"
                  style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>YES</Text>
                </TouchableRipple>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.backContainer}>
          <View style={styles.innerContainer}>
            <TouchableWithoutFeedback
              style={styles.backButton}
              onPress={() => this.props.navigation.navigate('HomeScreen')}>
              <Icon style={styles.backBtn} name="arrow-back" type="Ionicons" />
            </TouchableWithoutFeedback>
            <View style={{width: '100%', paddingLeft: '1%'}}>
              <Text
                style={[styles.shopNameText, {textTransform: 'capitalize'}]}>
                {this.state.shop_name}
              </Text>
            </View>
          </View>
        </View>

        <View style={{width: '96%', alignSelf: 'center'}}>
          {this.state.isLoading ? (
            <GIFLoading />
          ) : this.state.products.length == 0 &&
            this.state.topSellingProducts.length == 0 ? (
            this.EmptyList()
          ) : (
            <FlatList
              data={this.state.products}
              renderItem={this.renderItem}
              ListHeaderComponent={this.HeaderComponent}
              ref={ref => (this.ref = ref)}
              numColumns={2}
              style={{
                marginBottom: 140,
              }}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={this.FooterComponent}
            />
          )}
          <BottomSheet
            ref={ref => (this.sheetRef = ref)}
            closeOnDragDown
            height={320}>
            <DairyTimings
              schedules={this.props.route.params.item.shop_schedules}
            />
          </BottomSheet>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  proceedBtn: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    height: 50,
    backgroundColor: colors.BUTTON_BACKGROUND_COLOR,
    // '#7bc242'
  },

  innerProceedButton: {
    width: '93%',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    height: 50,
    flexDirection: 'row',
  },

  proceedButtonView: {
    flex: 0.5,
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
  },

  backContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: '1%',
    paddingTop: 7,
    backgroundColor: colors.WHITE,
    elevation: 8,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      height: 2,
      width: 2,
    },
  },

  innerContainer: {
    width: '93%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '3%',
  },

  backButton: {
    width: '10%',
  },

  backBtn: {
    color: colors.DUSKY_BLACK_TEXT,
  },

  dairyDetails: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerDairyDetails: {
    width: '93%',
  },

  shopCard: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerShopCard: {
    width: '100%',
    flexDirection: 'row',
  },

  shopContent: {
    width: '100%',
  },

  shopNameinfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  shopNameText: {
    fontSize: 22,
    fontFamily: ColorsText.Medium.fontFamily,
    color: colors.DUSKY_BLACK_TEXT,
    marginLeft: '1%',
    transform: [{translateY: 2}],
  },

  starRating: {
    marginRight: 4,
    color: colors.BLACK,
  },

  shopLocationText: {
    fontSize: 14,
    color: colors.GRAY_TEXT_NEW,
    fontFamily: ColorsText.regular.fontFamily,
    letterSpacing: 0.5,
  },

  offerCard: {
    width: '100%',
    marginBottom: '1%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  innerOfferCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  dairyProducts: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    width: '100%',
    marginTop: '5%',
  },

  productHeading: {
    paddingLeft: 10,
  },

  productText: {
    fontFamily: ColorsText.Bold.fontFamily,
    fontSize: 20,
    color: colors.MANGO_COLOR,
  },

  dairyProductCard: {
    width: '45%',
    margin: 5,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#aaa',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.WHITE,
    elevation: 2,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 80,
  },

  imageProduct: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },

  productimage: {
    width: '100%',
    height: 100,
  },

  productContent: {
    width: '100%',
    padding: 12,
  },

  innerProductontent: {
    width: '93%',
  },

  productName: {
    fontWeight: '600',
    fontFamily: ColorsText.Medium.fontFamily,
    fontSize: 16,
  },

  productQuantity: {
    fontWeight: '200',
    marginTop: 6,
  },

  productQuantityPrice: {
    marginTop: 15,
  },

  fixedPrice: {
    fontSize: 16,
    fontFamily: ColorsText.Medium.fontFamily,
  },

  modalButtonContainer: {
    width: '20%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productUnavailableContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 35,
    width: '100%',
  },

  outOfStockText: {
    fontFamily: ColorsText.regular.fontFamily,
    color: colors.LIGHT_TEXT_COLOR,
  },

  modalButtonText: {
    fontFamily: ColorsText.Medium.fontFamily,
    color: colors.MANGO_COLOR,
  },

  detailText: {
    fontFamily: ColorsText.regular.fontFamily,
    fontSize: 13,
    color: colors.DUSKY_BLACK_TEXT,
  },
  proceedBtnText: {
    fontFamily: ColorsText.Bold.fontFamily,
    color: colors.BUTTON_TEXT_COLOR,
    fontSize: 16,
  },
});
