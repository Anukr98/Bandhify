import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  BackHandler,
  Pressable,
  Platform,
} from 'react-native';
import ColorsText from '../../../constants/ColorsText';
import Modal from 'react-native-modal';
import Application from '../../../Utils/db/Application';
import {height, width} from '../../../constants/dimensions';
import colors from '../../../constants/colors';
import {
  filterTopRatedAndRegularProducts,
  postMethod,
  updateCartQuery,
} from '../../../Utils/CommonFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../../../constants/urls';
import {showMessage} from 'react-native-flash-message';
import NumInput from 'react-native-numeric-input';
import GIFLoading from '../../Components/GIFLoading/GIFLoading';
import {TouchableRipple} from 'react-native-paper';
import {Icon} from 'native-base';
import Geolocation from 'react-native-geolocation-service';
import {strings} from '../../../constants/strings';
import {StateContext} from '../../../Utils/StateProvider';
import actions from '../../../constants/actions';

export default class Cart extends React.Component {
  static contextType = StateContext;

  constructor(props) {
    super(props);
    this.state = {
      cart: [],
      subtotal: 0,
      newCart: [],
      isLoading: false,
      changeFlag: false,
      shop_name: '',
      shop_banner: '',
      request: '',
      coupon_name: '',
      discount: 0,
      deliveryFee: 0,
      coupon_expiry: '',
      min_spend: 0,
      max_spend: 2000,
      coupon_value: 0,
      maxDeliveryFee: 0,
      cartCutoffValue: 0,
      disableProceedButton: false,
    };
    this.filterItem = this.filterItem.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
    this.removeCoupon = this.removeCoupon.bind(this);
  }

  componentDidMount() {
    this.removeBackButtonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.getMaximumDeliveryCharge();
    });

    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      this.props.navigation.setParams({direction: ''});
    });
  }

  getMaximumDeliveryCharge = async () => {
    this.setState({isLoading: true});
    let token = await AsyncStorage.getItem('token');
    let object = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    postMethod(urls.GET_DELIVERY_CHARGE, object, (err, result) => {
      if (err) console.log(err);
      else if (result.status && result.code === 200) {
        const [state, dispatch] = this.context;
        const {charge, cart_cut_off_value} = result.delivery_charge[0].value;
        dispatch({
          type: actions.SET_CUTOFF_VALUE,
          payload: {
            cutoff: cart_cut_off_value,
          },
        });
        this.setState(
          {maxDeliveryFee: +charge, cartCutoffValue: cart_cut_off_value},
          () => this.configureCart(),
        );
      }
    });
  };

  configureCart = async () => {
    let token = await AsyncStorage.getItem('token');
    let cart = await Application.executeQuery(`SELECT * FROM CART`);
    let couponDetails = await Application.executeQuery(`SELECT * FROM COUPON`);

    if (cart.length > 0) {
      this.setState({
        shop_name: cart.item(0).shop_name,
        shop_banner: cart.item(0).shop_banner,
      });
    }

    let temp = [],
      total = 0,
      ids = '',
      deliveryFee = 0;
    for (let i = 0; i < cart.length; i++) {
      temp.push(cart.item(i));
      total = total + cart.item(i).quantity * cart.item(i).product_price;
      if (ids.length == 0) ids += cart.item(i).product_id;
      else ids += ',' + cart.item(i).product_id;
    }

    if (couponDetails.length > 0) {
      const {
        coupon_name,
        expiry,
        max_spend,
        min_spend,
        discount_applied,
        coupon_value,
      } = couponDetails.item(0);
      let discount = (total * parseFloat(coupon_value).toFixed(2)) / 100;
      this.setState({
        coupon_name,
        discount,
        min_spend,
        max_spend,
        coupon_value,
      });

      if (min_spend != 'null') {
        if (total < min_spend) {
          console.log('min limit reached');
          this.removeCoupon();
        }
      }

      if (max_spend != 'null') {
        if (total > max_spend) this.removeCoupon();
      }

      // if(expiry != 'null') {
      //     let date =
      // }
    }

    if (temp.length > 0) {
      let object = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      postMethod(
        `${urls.GET_UPDATED_PRICES}?shop_product_ids=${ids}`,
        object,
        async (err, result) => {
          if (err) console.log(err);
          if (result.status && result.code === 200) {
            total = 0;
            let newCart = [];
            for (let i = 0; i < cart.length; i++) {
              for (let j = 0; i < result.product.length; j++) {
                const oldProduct = cart.item(i);
                const newProduct = result.product[j];
                if (oldProduct.product_id === newProduct.id) {
                  const updateQuery = await updateCartQuery(newProduct);
                  await Application.executeQuery(updateQuery);
                  const {
                    quantity,
                    shop_banner,
                    shop_name,
                    shop_distance,
                    rating,
                    delivery_range,
                    latitude,
                    longitude,
                  } = oldProduct;
                  const {
                    id,
                    product,
                    product_commission,
                    product_daily_stock_remaining,
                    product_discount,
                    product_price,
                    shop_id,
                  } = newProduct;
                  const {
                    base_unit,
                    commission,
                    is_subscribable_product,
                    product_image,
                    product_name,
                  } = product;
                  const cartProduct = {
                    product_id: id,
                    product_name,
                    shop_id,
                    product_image,
                    product_price,
                    discount: product_discount,
                    quantity,
                    base_unit,
                    stock: product_daily_stock_remaining,
                    shop_banner,
                    shop_name,
                    shop_distance,
                    rating,
                    is_subscribable: is_subscribable_product,
                    commission: product_commission,
                    delivery_range,
                    latitude,
                    longitude,
                  };
                  newCart.push(cartProduct);
                  total = total + +quantity * +product_price;
                  break;
                }
              }
            }
            if (total < this.state.cartCutoffValue)
              deliveryFee = this.state.maxDeliveryFee;
            let t = setTimeout(() => {
              clearTimeout(t);
              this.setState({
                cart: newCart,
                subtotal: total,
                isLoading: false,
                deliveryFee,
                changeFlag:
                  cart.length === result.product.length ? false : true,
              });
            }, 250);
          } else {
            console.log('dikkat', result);
            if (total < this.state.cartCutoffValue)
              deliveryFee = this.state.maxDeliveryFee;
            showMessage({
              icon: 'danger',
              message: strings.ERROR_UPDATING_CART,
              floating: true,
              style: {backgroundColor: colors.BLACK},
              duration: 5000,
            });
            let t = setTimeout(() => {
              clearTimeout(t);
              this.setState({
                cart: temp,
                subtotal: total,
                isLoading: false,
                deliveryFee,
                disableProceedButton: true,
                changeFlag: false,
              });
            }, 700);
          }
        },
      );
    } else this.setState({isLoading: false});
  };

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeBlur();
    this.removeBackButtonAction.remove();
  }

  geoSuccess = async position => {
    const {latitude, longitude} = position.coords;
    let shopDetails = await Application.executeQuery(
      `SELECT shop_id , shop_name , shop_banner FROM CART`,
    );
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
      `${
        urls.GET_PRODUCTS
      }?selling_products=true&top_selling_products=true&shop_id=${
        shopDetails.item(0).shop_id
      }`,
      object,
      async (err, result) => {
        if (err) console.log(err);
        else if (result.status && result.code === 200) {
          let localCart = await Application.executeQuery(`SELECT * FROM CART`),
            temp = [],
            productId = [];
          for (let i = 0; i < localCart.length; i++) {
            temp.push(localCart.item(i));
            productId.push(localCart.item(i).product_id);
          }

          const {shop_id} = localCart.item(0);
          let obj = {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          };
          postMethod(
            `${urls.GET_SHOPS}?latitude=${latitude}&longitude=${longitude}`,
            obj,
            (error, res) => {
              if (error) console.log(error);
              else if (res.code === 200 && res.status) {
                res.shop.map(item => {
                  if (item.id === shop_id) {
                    const [products, topSellingProducts] =
                      filterTopRatedAndRegularProducts(
                        result.products.selling_products,
                        result.products.top_selling_products,
                      );
                    this.props.navigation.navigate('DairyDetais', {
                      data: products,
                      initialValues: temp,
                      cart: productId,
                      item,
                      top_selling_products: topSellingProducts,
                      deliverSlot: result?.shop_slots,
                    });
                  }
                });
              } else {
                showMessage({
                  icon: 'warning',
                  style: {backgroundColor: colors.BLACK},
                  duration: 1400,
                  floating: true,
                  message: 'We are having problems getting shop details.',
                });
                this.props.navigation.navigate('Home');
              }
            },
          );
        } else
          showMessage({
            icon: 'danger',
            duration: 1200,
            style: {backgroundColor: colors.BLACK},
            message: result.message,
            floating: true,
          });
      },
    );
  };

  geoFailure = () => {
    showMessage({
      icon: 'warning',
      style: {backgroundColor: colors.BLACK},
      message: strings.LOCATION_ERROR,
      floating: true,
      duration: 1400,
    });
    this.props.navigation.navigate('Home');
  };

  handleBackButtonClick = async () => {
    const {direction} = this.props.route.params;
    console.log(direction);
    if (direction === 'Other' || direction === '' || direction === 'Coupon')
      this.props.navigation.goBack();
    else if (this.state.cart.length == 0)
      this.props.navigation.navigate('HomeScreen');
    else {
      if (Platform.OS === 'android')
        Geolocation.getCurrentPosition(this.geoSuccess, this.geoFailure, {
          enableHighAccuracy: true,
        });
      else
        Geolocation.getCurrentPosition(this.geoSuccess, this.geoFailure, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 1000,
        });
    }
    return true;
  };

  filterItem = async item => {
    this.setState({isLoading: true});
    let temp = [],
      total = 0;
    let filterResult = await Application.executeQuery(
      `DELETE FROM CART WHERE product_id = '${item?.product_id}'`,
    );
    let result = await Application.executeQuery(`SELECT * FROM CART`);
    for (let i = 0; i < result.length; i++) {
      temp.push(result.item(i));
      total = total + result.item(i).quantity * result.item(i).product_price;
    }

    setTimeout(() => {
      this.setState({
        cart: temp,
        subtotal: total,
        isLoading: false,
      });
    }, 600);
  };

  updateQuantity = async (quantity, item) => {
    let cart,
      temp = [],
      total = 0,
      deliveryFee = 0,
      discount = this.state.discount;
    if (quantity != 0)
      await Application.executeQuery(
        `UPDATE CART SET quantity = ${quantity} WHERE product_id = '${item.product_id}'`,
      );
    else
      await Application.executeQuery(
        `DELETE FROM CART WHERE product_id = '${item.product_id}'`,
      );
    let res = await Application.executeQuery(`SELECT * FROM CART`);

    for (let i = 0; i < res.length; i++) {
      temp.push(res.item(i));
      total = total + res.item(i).quantity * res.item(i).product_price;
    }

    if (total < this.state.cartCutoffValue)
      deliveryFee = this.state.maxDeliveryFee;

    if (this.state.coupon_value != 0)
      discount = (total * parseFloat(this.state.coupon_value)) / 100;

    if (total > this.state.max_spend) {
      discount = 0;
      this.removeCoupon();
    }
    if (total < this.state.min_spend) {
      discount = 0;
      this.removeCoupon();
    }

    this.setState({
      cart: temp,
      subtotal: total,
      deliveryFee,
      discount,
    });
  };

  renderItem = ({item}) => {
    return (
      <View style={styles.innerCartItem}>
        <View style={styles.cardInfo}>
          <View style={styles.productInfo}>
            <View
              style={{
                backgroundColor: colors.ROYAL_BLUE,
                width: 2,
                borderRadius: 999,
              }}>
              <Text style={{color: colors.ROYAL_BLUE}}>fs</Text>
            </View>
            <View style={styles.productName}>
              <View style={{width: '50%'}}>
                <Text numberOfLines={2} style={styles.productNameText}>
                  {item?.product_name} [{item?.base_unit}]
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '50%',
                  justifyContent: 'center',
                }}>
                <View style={styles.productQuantity}>
                  <View style={styles.changeButton}>
                    <NumInput
                      minValue={0}
                      onChange={val => this.updateQuantity(val, item)}
                      maxValue={item.stock}
                      value={parseInt(item.quantity)}
                      step={1}
                      valueType="integer"
                      type="plus-minus"
                      editable={false}
                      borderColor={colors.GRAY_BORDER_COLOR}
                      totalHeight={30}
                      separatorWidth={0}
                      iconStyle={{
                        fontSize: 18,
                      }}
                      inputStyle={{
                        color: colors.MANGO_COLOR,
                        fontFamily: ColorsText.Bold.fontFamily,
                      }}
                      containerStyle={{
                        width: '100%',
                        // alignSelf : 'center',
                        // borderColor : colors.GRAY_BORDER_COLOR,
                        // borderWidth : 1
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    width: '40%',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: ColorsText.light.fontFamily,
                    }}>
                    ₹{' '}
                  </Text>
                  <Text style={styles.totalPrice}>
                    {parseFloat(item?.product_price * item?.quantity).toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  removeCoupon = async () => {
    this.setState({
      isLoading: true,
      coupon_name: '',
      discount: 0,
      coupon_value: 0,
    });
    await Application.executeQuery(`DELETE FROM COUPON`).then(() => {
      setTimeout(() => {
        this.setState({isLoading: false});
      }, 600);
    });
  };

  HeaderComponent = () => (
    <View
      style={{
        width,
        display: this.state.cart.length > 0 ? 'flex' : 'none',
        paddingTop: 10,
        marginBottom: '3%',
      }}>
      <View style={styles.listInnerHeader}>
        <View style={styles.vendor}>
          <Image
            source={{
              uri: this.state.shop_banner ? `${this.state.shop_banner}` : null,
            }}
            style={{width: 40, height: 40}}
          />
          <Text style={styles.shopName}>{this.state.shop_name}</Text>
        </View>
      </View>
    </View>
  );

  EmptyCart = () => (
    <View
      style={{
        width,
        alignItems: 'center',
        maxHeight: height * 0.85,
        minHeight: height * 0.85,
        justifyContent: 'center',
      }}>
      <View style={{width: '100%', alignItems: 'center'}}>
        <Image
          source={require('../../../assets/Images/products.jpg')}
          resizeMode="contain"
          style={{width: '95%', height: '60%', alignSelf: 'center'}}
        />
        <View>
          <Text
            style={{
              textTransform: 'uppercase',
              fontFamily: ColorsText.Bold.fontFamily,
              color: colors.DUSKY_BLACK_TEXT,
              fontSize: 15,
              letterSpacing: 0.3,
              textAlign: 'center',
            }}>
            Crunchify your desire
          </Text>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <Text style={styles.emptyCartText}>Start adding items now!</Text>
          <TouchableRipple
            style={styles.browseDairiesButton}
            onPress={() => this.props.navigation.navigate('HomeScreen')}
            rippleColor={colors.RIPPLE_COLORS.BLACK}>
            <Text style={styles.browseDairiesText}>BROWSE DAIRIES</Text>
          </TouchableRipple>
        </View>
      </View>
    </View>
  );

  proceedToCheckout = () => {
    const [state, dispatch] = this.context;
    let payable = parseFloat(this.state.subtotal - this.state.discount);
    dispatch({
      type: actions.SET_PAYABLE,
      payload: {
        payable,
        delivery: this.state.deliveryFee,
        discount: this.state.discount,
      },
    });
    this.props.navigation.navigate('Checkout', {
      focus: '',
      deliveryFee: this.state.deliveryFee,
    });
  };

  ListFooter = () => (
    <View style={{display: this.state.cart.length > 0 ? 'flex' : 'none'}}>
      <View
        style={{
          marginTop: '4%',
          borderTopColor: colors.GRAY_TEXT,
          borderTopWidth: 0.4,
        }}>
        <View
          style={{height: 12, backgroundColor: colors.LIGHT_GRAY_BG_COLOR}}
        />
        <Pressable
          style={[styles.innerHeader, {paddingVertical: '2%'}]}
          onPress={() => this.props.navigation.navigate('Coupons')}
          hitSlop={30}
          disabled={this.state.coupon_name ? true : false}>
          <View style={{flex: 0.14, justifyContent: 'center'}}>
            <Image
              source={require('../../../assets/GIF/coupon.gif')}
              style={{width: '55%', height: 25}}
            />
          </View>
          <View style={styles.couponText}>
            <View>
              <Text
                style={{
                  fontFamily: ColorsText.Medium.fontFamily,
                  fontSize: 16,
                  color: this.state.coupon_name
                    ? colors.ROYAL_BLUE
                    : colors.DUSKY_BLACK_TEXT,
                }}>
                {this.state.coupon_name
                  ? this.state.coupon_name
                  : 'APPLY COUPON'}
              </Text>
              <Text
                style={{
                  display: this.state.coupon_name ? 'flex' : 'none',
                  fontSize: 13,
                  color: colors.LIGHT_TEXT_COLOR,
                  fontFamily: ColorsText.regular.fontFamily,
                }}>
                Coupon applied on the bill
              </Text>
            </View>
            <Pressable
              disabled={
                this.state.disableProceedButton
                  ? true
                  : this.state.coupon_name
                  ? false
                  : true
              }
              hitSlop={25}
              onPress={() => this.removeCoupon()}>
              <Icon
                active
                type={this.state.coupon_name ? 'MaterialIcons' : 'EvilIcons'}
                name={this.state.coupon_name ? 'cancel' : 'chevron-right'}
                style={{
                  fontSize: this.state.coupon_name ? 25 : 30,
                  color: this.state.coupon_name
                    ? colors.ROYAL_BLUE
                    : colors.DUSKY_BLACK_TEXT,
                }}
              />
            </Pressable>
          </View>
        </Pressable>

        <View
          style={{height: 12, backgroundColor: colors.LIGHT_GRAY_BG_COLOR}}
        />

        <View
          style={[
            styles.columnInnerHeader,
            {
              marginTop: '6%',
              borderBottomColor: colors.GRAY_BORDER_COLOR,
              borderBottomWidth: 0.3,
              paddingBottom: 15,
            },
          ]}>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: ColorsText.Medium.fontFamily,
                color: colors.DUSKY_BLACK_TEXT,
              }}>
              Bill Details
            </Text>
          </View>
          <View style={styles.subtotalContainer}>
            <View style={styles.leftRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {fontFamily: ColorsText.regular.fontFamily},
                ]}>
                Item Total
              </Text>
            </View>
            <View style={styles.rightRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {fontFamily: ColorsText.light.fontFamily},
                ]}>
                ₹{parseFloat(this.state.subtotal).toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.subtotalContainer}>
            <View style={styles.leftRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.ROYAL_BLUE,
                  },
                ]}>
                Delivery Fees
              </Text>
            </View>
            <View style={styles.rightRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {fontFamily: ColorsText.light.fontFamily},
                ]}>
                {this.state.deliveryFee > 0
                  ? `₹ ${this.state.deliveryFee}`
                  : 'Free'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.subtotalContainer,
              {display: this.state.coupon_name ? 'flex' : 'none'},
            ]}>
            <View style={styles.leftRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.ROYAL_BLUE,
                  },
                ]}>
                Total Discount
              </Text>
            </View>
            <View style={styles.rightRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {
                    fontFamily: ColorsText.light.fontFamily,
                    color: colors.PERSIAN_GREEN,
                  },
                ]}>
                -₹ {parseFloat(this.state.discount).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.columnInnerHeader, {marginTop: '1%'}]}>
          <View style={styles.subtotalContainer}>
            <View style={styles.leftRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.DUSKY_BLACK_TEXT,
                  },
                ]}>
                To Pay
              </Text>
            </View>
            <View style={styles.rightRow}>
              <Text
                style={[
                  styles.subtotalText,
                  {
                    fontFamily: ColorsText.Medium.fontFamily,
                    color: colors.MANGO_COLOR,
                    fontSize: 16,
                    letterSpacing: 0.6,
                  },
                ]}>
                ₹{' '}
                {parseFloat(
                  this.state.subtotal -
                    this.state.discount +
                    this.state.deliveryFee,
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{height: 12, backgroundColor: colors.LIGHT_GRAY_BG_COLOR}}
        />
      </View>
    </View>
  );

  render() {
    if (this.state.isLoading) return <GIFLoading />;
    else
      return (
        <View style={styles.container}>
          <View>
            <Pressable onPress={this.handleBackButtonClick}>
              <Icon name="arrow-back" />
            </Pressable>
          </View>
          <Modal
            isVisible={this.state.changeFlag}
            onBackdropPress={() => this.setState({changeFlag: false})}>
            <View style={styles.modalContainer}>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontFamily: ColorsText.Bold.fontFamily,
                    fontSize: 22,
                    color: colors.MANGO_COLOR,
                  }}>
                  Alert
                </Text>
                <Text
                  style={{
                    marginTop: '4%',
                    fontFamily: ColorsText.Medium.fontFamily,
                  }}>
                  {strings.ITEMS_REMOVED}
                </Text>
                <View style={styles.modalDismissContainer}>
                  <Pressable
                    onPress={() => this.setState({changeFlag: false})}
                    hitSlop={30}>
                    <Text
                      style={{
                        fontFamily: ColorsText.regular.fontFamily,
                        fontSize: 13,
                      }}>
                      OK
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <>
            <View style={styles.cartItem}>
              <FlatList
                data={this.state.cart}
                keyExtractor={item => item?.product_id}
                renderItem={this.renderItem}
                ListHeaderComponent={this.HeaderComponent}
                extraData={this.state.newCart}
                ListEmptyComponent={this.EmptyCart}
                ListFooterComponent={this.ListFooter}
              />
              <View
                style={[
                  styles.paymentContainer,
                  {
                    display: this.state.cart.length > 0 ? 'flex' : 'none',
                    opacity: this.state.disableProceedButton ? 0.5 : 1,
                  },
                ]}>
                <View style={styles.paymentContainerBillAmount}>
                  <Text style={styles.payableAmount}>
                    ₹
                    {parseFloat(
                      this.state.subtotal -
                        this.state.discount +
                        this.state.deliveryFee,
                    ).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.paymentButtonContainer}>
                  <TouchableRipple
                    onPress={this.proceedToCheckout}
                    style={styles.payButton}
                    rippleColor={'#ffffff20'}
                    disabled={this.state.disableProceedButton}>
                    <Text style={styles.checkoutText}>Proceed to Pay</Text>
                  </TouchableRipple>
                </View>
              </View>
            </View>
          </>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },

  checkoutText: {
    fontFamily: ColorsText.regular.fontFamily,
    fontSize: 16,
    color: colors.WHITE,
  },

  cartItem: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  innerCartItem: {
    width: '93%',
    marginBottom: '4%',
    alignSelf: 'center',
  },

  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  productName: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 7,
  },

  productQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    justifyContent: 'flex-end',
  },

  changeButton: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  productNameText: {
    fontFamily: ColorsText.Medium.fontFamily,
    fontSize: 16,
  },

  totalPrice: {
    fontFamily: ColorsText.light.fontFamily,
    fontSize: 13,
    alignItems: 'flex-end',
  },

  modalContainer: {
    backgroundColor: colors.WHITE,
    width: width * 0.85,
    alignSelf: 'center',
    borderRadius: 5,
    position: 'relative',
    paddingVertical: '7%',
    alignItems: 'center',
  },

  modalDismissContainer: {
    marginTop: '6%',
    alignItems: 'flex-end',
  },

  emptyCartText: {
    fontSize: 13,
    color: colors.GRAY_TEXT,
    textAlign: 'center',
    fontFamily: ColorsText.Medium.fontFamily,
    letterSpacing: 0.5,
  },

  browseDairiesButton: {
    borderColor: colors.ROYAL_BLUE,
    borderWidth: 1,
    marginTop: '4%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 2,
  },

  browseDairiesText: {
    fontFamily: ColorsText.Medium.fontFamily,
    color: colors.ROYAL_BLUE,
    letterSpacing: 1,
  },

  vendor: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  listInnerHeader: {
    width: '93%',
    alignSelf: 'center',
    marginBottom: '2%',
  },

  shopName: {
    fontFamily: ColorsText.Medium.fontFamily,
    fontSize: 13,
    marginLeft: '3%',
  },

  innerHeader: {
    width: '93%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2%',
  },

  columnInnerHeader: {
    width: '93%',
    alignSelf: 'center',
    marginBottom: '2%',
  },

  couponText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 0.86,
  },

  subtotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4%',
  },

  subtotalText: {
    fontSize: 14,
  },

  leftRow: {
    flex: 0.5,
  },

  rightRow: {
    flex: 0.5,
    alignItems: 'flex-end',
  },

  paymentContainer: {
    width,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#ebebeb80',
  },

  paymentContainerBillAmount: {
    flex: 0.4,
    paddingLeft: 20,
    justifyContent: 'center',
  },

  paymentButtonContainer: {
    flex: 0.6,
  },

  payButton: {
    backgroundColor: colors.SUCCESS_GREEN,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  payableAmount: {
    fontFamily: ColorsText.regular.fontFamily,
    fontSize: 15,
  },
});
