import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, BackHandler, ActivityIndicator } from 'react-native'
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import ColorsText from '../../../constants/ColorsText';
import { useNavigation } from '@react-navigation/native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterTopRatedAndRegularProducts, postMethod } from '../../../Utils/CommonFunctions';
import urls from '../../../constants/urls';
import Application from '../../../Utils/db/Application'
import { showMessage } from 'react-native-flash-message';
import { width, height } from '../../../constants/dimensions'
import colors from '../../../constants/colors';
import { Icon } from 'native-base';
import BottomSheet from "react-native-raw-bottom-sheet";
import { RadioButton } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service'

const SearchShops = () => {

   const navigation = useNavigation()
   const refRBSheet = useRef();
   var timerId

   const [shops, setShops] = useState([])
   const [token, setToken] = useState('')
   const [latitude, setLatitude] = useState(0)
   const [longitude, setLongitude] = useState(0)
   const [checked, setChecked] = useState('')
   const [filterText, setFilterText] = useState('')
   const [searching, setSearching] = useState(false)

   useEffect(() => {
      const backButtonAction = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
      const unsubsribe = navigation.addListener('focus', async () => {
         let selectedAddressLatitude = await AsyncStorage.getItem('addressLatitude')
         let selectedAddressLongitude = await AsyncStorage.getItem("addressLongitude")
         let authToken = await AsyncStorage.getItem('token')
         selectedAddressLatitude = +selectedAddressLatitude
         selectedAddressLongitude = +selectedAddressLongitude
         setLatitude(() => selectedAddressLatitude)
         setLongitude(() => selectedAddressLongitude)
         setToken(() => authToken)
      })

      const unsubscribeBlur = navigation.addListener('blur' , () => {
         setShops([])
         setFilterText('')
      })

      return () => {
         setShops([])
         backButtonAction.remove()
         unsubsribe()
         unsubscribeBlur()
      }
   }, [])

   const handleBackButtonClick = () => {
      navigation.navigate('Home')
      return true
   }

   const getAllProducts = async item => {
      // console.log(item)
      let object = {
         method: 'GET',
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         }
      }
      postMethod(`${urls.GET_PRODUCTS}?selling_products=true&shop_id=${item?.id}`, object, async (err, result) => {
         if (err)
            console.log(err)

         else if (result.status && result.code === 200) {
            let localCart = await Application.executeQuery(`SELECT * FROM CART`)
            let temp = []
            let productId = []
            for (let i = 0; i < localCart.length; i++) {
               temp.push(localCart.item(i))
               productId.push(localCart.item(i).product_id)
            }
            setShops([])
            const { selling_products , top_selling_products } = result.products
            const [products, topSellingProducts] = filterTopRatedAndRegularProducts(selling_products, top_selling_products)
            navigation.navigate('DairyDetais', {
               data: products,
               initialValues: temp,
               cart: productId,
               item,
               top_selling_products: topSellingProducts,
               deliverSlot: result.shop_slots
            })
            // setProducts(result.products.selling_products)
            // setInitialValues(temp)
         }
         else
            showMessage({
               icon: 'danger',
               duration: 1200,
               style: { backgroundColor: "#000" },
               message: result.message,
               floating: true
            })
      })
   }

   const renderItem = ({ item }) => <TouchableWithoutFeedback onPress={() => getAllProducts(item)} style={styles.shopCard}>
      <View style={styles.innerShopCard}>
         <View style={styles.shopimage}>
            <Image style={styles.imageShop} source={{ uri: item?.shop_profile }} resizeMode = 'contain' />
         </View>
         <View style={styles.shopContent}>
            <View style={styles.shopNameinfo}>
               <View style={{ width: '85%' }}>
                  <Text numberOfLines={1} style={styles.shopNameText}>{item?.shop_name}</Text>
                  <Text style={styles.shopDescription}>{item?.shop_description}</Text>
               </View>
            </View>
            <View style={styles.ratingView}>
               <View style={styles.innerRating}>
                  <View style={styles.allStars}>
                     <AntDesign style={styles.starRating} name="star" size={12} />
                  </View>
                  <View style={styles.ratingValue}>
                     <Text style={styles.rateValue}>{item.review_avg_rating ? parseFloat(item.review_avg_rating).toFixed(1) : 0}</Text>
                  </View>
               </View>
            </View>
            <View style={styles.shopLocation}>
               <Text numberOfLines={1} style={styles.shopLocationText}>{item?.address?.distance}kms. away</Text>
            </View>
            {
               item?.shop_coupons?.length > 0 && <View style={styles.offerCard}>
                     <View style={styles.innerOfferCard}>
                        <Image source={require('../../../assets/Images/OfferStar.png')} />
                        <Text style={styles.offerText}>Flat {item.shop_coupons[0]?.coupon_value} Off</Text>
                     </View>
               </View>
               }
         </View>
      </View>
   </TouchableWithoutFeedback>

   const debounceFiltering = (func , delay , textParam) => {
      clearTimeout(timerId)
      timerId = setTimeout(() => {
         func(textParam)
      },delay)
   }

   const filterShops = text => {
      debounceFiltering(fetchFilteredShops , 300 , text)
   }

   const fetchFilteredShops = text => {
      setFilterText(text)
      if(text.length == 0)
         setShops([])
      else {
         setSearching(true)
         let object = {
            method: 'GET',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         }
         postMethod(`${urls.GET_SHOPS}?latitude=${latitude}&longitude=${longitude}&search=${text}`, object, (err, result) => {
            setTimeout(() => {
               setSearching(false)
            },400)
            if (err)
               console.error(err)
            else if (result.status && result.code === 200)
               setShops(result.shop)
            else
               setShops([])
         })
      }
   }

   const NoShopsFound = () => <View style={{ flex: 1, alignItems : 'center' }}>
      <Image
         style = {{ width: '100%' , height : height * 0.6 }}
         source = {require('../../../assets/Images/undraw_blank_canvas_3rbb.png')}
         resizeMode = 'contain'
      />
      <Text style = {{ fontFamily : ColorsText.regular.fontFamily , fontSize : 17 , color : colors.ROYAL_BLUE}}>{filterText.length > 0 ? 'No shops found based on your given criteria' : 'Search and start ordering now :D'}</Text>
   </View>

   const ratingLowToHigh = () => {
      let newArray = [...shops]
      let n = newArray.length, temp = 0
      for (let i = 0; i < n; i++) {
         for (let j = 0; j < n - i - 1; j++) {
            if (newArray[j].review_avg_rating > newArray[j + 1].review_avg_rating) {
               temp = newArray[j]
               newArray[j] = newArray[j + 1]
               newArray[j + 1] = temp

            }
         }
      }
      setShops(newArray)
   }

   const ratingHighToLow = () => {
      let newArray = [...shops]
      let n = newArray.length, temp = 0
      for (let i = 0; i < n; i++) {
         for (let j = 0; j < n - i - 1; j++) {
            if (newArray[j].review_avg_rating < newArray[j + 1].review_avg_rating) {
               temp = newArray[j]
               newArray[j] = newArray[j + 1]
               newArray[j + 1] = temp
            }
         }
      }
      setShops(newArray)
   }

   const sortPricesLowToHigh = () => {
      let newArray = [...shops]
      let n = newArray.length, temp = 0
      for (let i = 0; i < n; i++) {
         for (let j = 0; j < n - i - 1; j++) {
            if (newArray[j].shop_products_avg_product_price > newArray[j + 1].shop_products_avg_product_price) {
               temp = newArray[j]
               newArray[j] = newArray[j + 1]
               newArray[j + 1] = temp
            }
         }
      }
      setShops(newArray)
   }

   const sortPricesHighToLow = () => {
      let newArray = [...shops]
      let n = newArray.length, temp = 0
      for (let i = 0; i < n; i++) {
         for (let j = 0; j < n - i - 1; j++) {
            if (newArray[j].shop_products_avg_product_price < newArray[j + 1].shop_products_avg_product_price) {
               temp = newArray[j]
               newArray[j] = newArray[j + 1]
               newArray[j + 1] = temp
            }
         }
      }
      setShops(newArray)
   }

   return (
      <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
         <View style={styles.searchCouponsContainer}>
            <TextInput
               onChangeText={filterShops}
               placeholder='Search shops or products'
               style={styles.couponFilter}
               placeholderTextColor = {colors.DUSKY_BLACK_TEXT}
            />
            { searching && <ActivityIndicator size = 'small' color = {colors.ROYAL_BLUE} /> }
         </View>

         <View style = {{ width : '90%' , alignSelf : 'center' , flexDirection : 'row' , alignItems : 'center' , display : shops.length > 0 ? 'flex' : 'none' , marginBottom : '3%' }}>
            <View style = {{ flex : .7 }}>
               <Text style = {[styles.sortShopsText , { fontSize : 15 }]}>Shops based on your criteria</Text>
            </View>
            <View style={styles.sortShops}>
               <TouchableOpacity
                  onPress={() => refRBSheet.current.open()}
                  style = {{ flexDirection : 'row' , alignItems : "center" , justifyContent : 'flex-end' }}
               >
                  <Image
                     source = {require('../../../assets/Images/filter.png')}
                     style = {{ transform : [{ rotateZ : '90deg' }] , width : 15 , height : 15 , marginRight : 5 }}
                  />
                  <Text style={styles.sortShopsText}>Filter</Text>
               </TouchableOpacity>
            </View>
         </View>

         <View style={{ flex: 1 }}>
            <FlatList
               data={shops}
               renderItem={renderItem}
               keyExtractor={item => item.id}
               ListEmptyComponent={NoShopsFound}
            />
            
            <BottomSheet
               ref={refRBSheet}
               closeOnDragDown={true}
               customStyles={{
                  container: {
                     backgroundColor: colors.WHITE,
                     borderTopLeftRadius: 20,
                     borderTopRightRadius: 20,
                     overflow: 'hidden',
                  },
               }}
            >
               <View style={{ flex: 1 }}>
                  <View style={styles.BottomSheetView}>
                     <Text style={styles.BottomSheetText}>SORT BY</Text>
                  </View>

                  <View style={{ width, flex: 1, justifyContent: 'space-evenly' }}>
                     <View style={{ flex: 1, flexDirection: 'column', marginTop: 17, marginLeft: 5 }}>

                        <View style={{ width: 35 }}>
                           <RadioButton
                              value="first"
                              status={checked === 'first' ? 'checked' : 'unchecked'}
                              onPress={() => {
                                 ratingLowToHigh()
                                 setChecked('first')
                              }}
                              color = {colors.MANGO_COLOR}
                           /></View>
                        <Text style={{ position: 'relative', marginTop: -28, marginLeft: 40 }}>Rating -- Low to High</Text>


                        <View style={{ width: 35, marginTop: 10 }}>
                           <RadioButton
                              value="second"
                              status={checked === 'second' ? 'checked' : 'unchecked'}
                              onPress={() => {
                                 ratingHighToLow()
                                 setChecked('second')
                              }}
                              color = {colors.MANGO_COLOR}
                           /></View>
                        <Text style={{ position: 'relative', marginTop: -28, marginLeft: 40 }}>Rating -- High to Low</Text>

                        <View style={{ width: 35, marginTop: 10 }}>
                           <RadioButton
                              value="third"
                              status={checked === 'third' ? 'checked' : 'unchecked'}
                              onPress={() => {
                                 sortPricesLowToHigh()
                                 setChecked('third')
                              }}
                              color = {colors.MANGO_COLOR}
                           /></View>
                        <Text style={{ position: 'relative', marginTop: -28, marginLeft: 40 }}>Price -- Low to High</Text>

                        <View style={{ width: 35, marginTop: 10 }}>
                           <RadioButton
                              value="fourth"
                              status={checked === 'fourth' ? 'checked' : 'unchecked'}
                              onPress={() => {
                                 sortPricesHighToLow()
                                 setChecked('fourth')
                              }}
                              color = {colors.MANGO_COLOR}
                           /></View>
                        <Text style={{ position: 'relative', marginTop: -28, marginLeft: 40 }}>Price -- High to Low</Text>
                     </View>
                  </View>
               </View>
            </BottomSheet>
         </View>
      </View>
   )
}

export default SearchShops

const styles = StyleSheet.create({
   searchCouponsContainer: {
      width: '93%',
      marginTop: '7%',
      alignItems: 'center',
      marginBottom: '3%',
      borderColor: '#ddd',
      borderWidth: 1,
      alignSelf : 'center',
      borderRadius: 6,
      flexDirection : 'row',
      justifyContent : 'space-around',
      paddingRight : '2%'
   },

   couponFilter: {
      height: 40,
      fontFamily: ColorsText.regular.fontFamily,
      fontSize: 12,
      width: '96%',
      paddingLeft: 10,
      color: colors.DUSKY_BLACK_TEXT,
   },
   mainShopNear: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      // marginTop: '6%'
   },
   innerShopNear: {
      // width: '93%'
   },
   shopNearText: {
      fontSize: 20,
      fontFamily: ColorsText.Medium.fontFamily
   },
   shopCard: {
      alignSelf: 'center',
      width: '97%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ebebeb60',
      marginBottom: '4%',
      borderRadius: 21,
      paddingVertical: 2
      // paddingHorizontal : '3%',
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
      flex: .3,
      alignItems: "center",
      justifyContent: 'center',
      overflow: 'hidden',
   },
   imageShop: {
      width: '95%',
      height: 90,
      resizeMode: 'cover',
      borderRadius: 18
   },
   shopContent: {
      flex: .7,
      // paddingTop: 10,
      paddingLeft: 10,
   },
   shopNameinfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
   },
   shopNameText: {
      fontSize: 17,
      fontFamily: ColorsText.Medium.fontFamily,
      width: '90%'
   },

   shopDescription: {
      fontFamily: ColorsText.light.fontFamily,
      fontSize: 12,
      color: colors.LIGHT_TEXT_COLOR
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
      flexDirection: 'row'
   },

   starRating: {
      marginRight: 4,
      color: ColorsText.primary_color.color
   },

   ratingValue: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 3,
   },
   rateValue: {
      marginRight: 2,
      fontFamily: ColorsText.light.fontFamily,
      fontSize: 12
   },
   totalValue: {
      marginLeft: 2,
      fontWeight: '200',
      fontFamily: ColorsText.light.fontFamily
   },
   shopLocation: {
      marginTop: 4
   },
   shopLocationText: {
      width: '100%',
      fontSize: 14,
      color: '#717171',
      fontFamily: ColorsText.light.fontFamily
   },
   offerCard: {
      width: '100%',
      justifyContent: 'center',
      // alignItems: 'center',
      marginTop: 7
   },
   innerOfferCard: {
      width: '55%',
      backgroundColor: ColorsText.primary_color.color,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 999,
      height: 20,
      flexDirection: 'row'
   },
   offerText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      fontFamily: ColorsText.Medium.fontFamily
   },

   mainBanner: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '6%'
   },
   innerBanner: {
      width: '93%',
      alignSelf: 'center'
   },
   bannerImage: {
      resizeMode: 'contain',
      width: '100%',
   },

   shopNearHeading: {
      paddingLeft: '5%'
   },

   searchBar: {
      marginTop: '5%'
   },

   searchBarContainer: {
      width: '90%',
      backgroundColor: colors.WHITE,
      alignSelf: 'center',
      height: 40,
      alignItems: 'center',
      flexDirection: 'row'
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
      paddingBottom: '2%'
   },
   iconContainer: {
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 999,
      elevation: 4,
   },
   sheetIconTextContainer: {
      width: '100%',
      paddingLeft: '5%'
   },
   sheetIcon: {
      fontSize: 35,
   },
   row: {
      width: '100%',
      paddingLeft: '5%',
      alignItems: 'center',
      flexDirection: 'row',
   },
   BottomSheetView: {
      borderBottomWidth: 0.2,
      borderBottomColor: 'gray',
      paddingBottom : '2%',
      width : '93%',
      alignSelf : "center"
   },
   BottomSheetText: {
      color: 'gray',
      fontFamily : ColorsText.regular.fontFamily
   },
   sortShops: {
      flex : .3,
   },
   sortShopsText: {
      fontSize: 13,
      fontFamily: ColorsText.Medium.fontFamily,
      position: 'relative',
   }
})
