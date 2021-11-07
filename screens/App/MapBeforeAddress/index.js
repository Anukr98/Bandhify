import React from 'react';
import {View, Text, BackHandler, Pressable} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import colors from '../../../constants/colors';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import keys from '../../../constants/keys';
import {TouchableRipple} from 'react-native-paper';
import ColorsText from '../../../constants/ColorsText';
import {Icon} from 'native-base';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

export default class VerifyLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 0,
      longitude: 0,
      location: 'Search for an area or street',
      markerCoordinates: {
        latitude: 0,
        longitude: 0,
      },
      currentLocation: {
        latitude: 0,
        longitude: 0,
      },
      markerAddress: '',
      ismapdragging: false,
    };
    // this.mapRef = React.createRef()
  }

  componentDidMount() {
    const {params} = this.props.route;
    this.backbuttonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBakcButtonClick,
    );
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        Geocoder.init(keys.GOOGLE_MAPS_API);
        Geocoder.from(
          params?.item?.latitude ? params?.item?.latitude : latitude,
          params?.item?.longitude ? params?.item?.longitude : longitude,
        ).then(res => {
          const addressbits = res.results[0].formatted_address.split(',');
          let address = '';
          for (let i = 0; i < 5; i++) {
            address += addressbits[i];
          }
          this.setState({
            latitude: params?.item?.latitude
              ? params?.item?.latitude
              : latitude,
            longitude: params?.item?.longitude
              ? params?.item?.longitude
              : longitude,
            markerCoordinates: {
              latitude: params?.item?.latitude
                ? params?.item?.latitude
                : latitude,
              longitude: params?.item?.longitude
                ? params?.item?.longitude
                : longitude,
            },
            currentLocation: {
              latitude,
              longitude,
            },
            markerAddress: params?.item?.latitude
              ? `${params?.item?.address_line_1} ${params?.item?.address_line_2} ${params?.item?.address_line_3} ${params?.item?.city?.city}`
              : address,
          });
        });
      },
      error => {
        alert(error);
      },
      {
        enableHighAccuracy: true,
        showsUserLocation: true,
        forceRequestLocation: true,
      },
    );
  }

  componentWillUnmount() {
    this.backbuttonAction.remove();
  }

  handleBakcButtonClick = () => {
    const {navigation} = this.props;
    const {direction} = this.props.route.params;
    if (direction === 'Edit' || direction === 'Add')
      navigation.replace('Address');
    else if (direction === 'Checkout')
      navigation.replace('Checkout', {focus: ''});
    else if (direction === 'EditFromCheckout')
      navigation.replace('Checkout', {
        focus: this.props.route.params.item.address_line_1,
      });
    return true;
  };

  getLocationFromMarker = e => {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    Geocoder.init(keys.GOOGLE_MAPS_API);
    Geocoder.from(latitude, longitude).then(res => {
      const addressbits = res.results[0].formatted_address.split(',');
      let address = '';
      for (let i = 0; i < 5; i++) {
        address += addressbits[i];
      }
      this.setState({
        markerCoordinates: {
          latitude,
          longitude,
        },
        markerAddress: address,
      });
    });
  };

  confirmAddress = () => {
    const {markerCoordinates} = this.state;
    const {params} = this.props.route;
    const {direction} = params;
    this.props.navigation.navigate('AddAddress', {
      direction,
      item: params.item ? params.item : null,
      markerCoordinates,
    });
    // console.log(this.props.route.params)
  };

  handleAddressChange = e => {
    Geocoder.init(keys.GOOGLE_MAPS_API);
    Geocoder.from(e.description)
      .then(res => {
        const {lat, lng} = res.results[0].geometry.location;
        const addressbits = res.results[0].formatted_address;
        // let address = ""
        // for(let i = 0 ; i < 5 ; i++)
        //     address += addressbits[i]
        this.setState({
          markerCoordinates: {
            latitude: lat,
            longitude: lng,
          },
          markerAddress: addressbits,
        });
      })
      .catch(err => console.log(err));
  };

  goToInitialPosition = () => {
    // this.mapRef.animateToRegion({ latitude: this.state.currentLocation.latitude, longitude: this.state.currentLocation.longitude, latitudeDelta: 0.003, longitudeDelta: 0.003 })
    Geocoder.init(keys.GOOGLE_MAPS_API);
    Geocoder.from(
      this.state.currentLocation.latitude,
      this.state.currentLocation.longitude,
    ).then(res => {
      const {formatted_address} = res.results[0];
      this.setState({
        markerCoordinates: {
          latitude: this.state.currentLocation.latitude,
          longitude: this.state.currentLocation.longitude,
        },
        location: formatted_address,
        markerAddress: formatted_address,
      });
    });
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: colors.WHITE}}>
        <MapView
          ref={ref => (this.mapRef = ref)}
          style={{flex: 1}}
          provider={PROVIDER_GOOGLE}
          region={{
            latitude: this.state.markerCoordinates.latitude,
            longitude: this.state.markerCoordinates.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          }}
          followsUserLocation
          // showsMyLocationButton
          loadingEnabled
          onPress={this.getLocationFromMarker}>
          <Marker
            coordinate={{
              latitude: this.state.markerCoordinates.latitude,
              longitude: this.state.markerCoordinates.longitude,
            }}
          />
        </MapView>
        <View
          style={{
            position: 'absolute',
            top: '9%',
            width: '93%',
            alignSelf: 'center',
            borderRadius: 7,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <GooglePlacesAutocomplete
            placeholder={this.state.location}
            fetchDetails
            ref={ref => (this.autoCompleteRef = ref)}
            query={{
              key: keys.GOOGLE_MAPS_API,
              language: 'en',
            }}
            enableHighAccuracyLocation
            keyboardShouldPersistTaps="always"
            textInputProps={{placeholderTextColor: colors.DUSKY_BLACK_TEXT}}
            minLength={4}
            onPress={this.handleAddressChange}
            styles={{
              textInputContainer: {
                backgroundColor: '#00000008',
              },
              textInput: {
                fontSize: 12,
                fontFamily: ColorsText.regular.fontFamily,
                height: 45,
                color: colors.DUSKY_BLACK_TEXT,
                borderWidth: 1,
                borderColor: '#b2b0b330',
                elevation: 8,
              },
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            left: '5%',
            top: '3%',
            backgroundColor: '#ffffff',
            elevation: 7,
            borderRadius: 7,
            width: 40,
            height: 40,
          }}>
          <Pressable
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              width: 40,
            }}
            onPress={this.handleBakcButtonClick}>
            <Icon
              active
              name="return-up-back"
              style={{color: colors.DUSKY_BLACK_TEXT, fontSize: 22}}
            />
          </Pressable>
        </View>
        <View style={{alignItems: 'flex-end', paddingRight: '6%'}}>
          <Pressable
            style={{
              height: 40,
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={this.goToInitialPosition}>
            <Icon
              active
              name="my-location"
              type="MaterialIcons"
              style={{color: colors.DUSKY_BLACK_TEXT, fontSize: 22}}
            />
          </Pressable>
        </View>
        <View
          style={{
            height: 190,
            backgroundColor: colors.WHITE,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            overflow: 'hidden',
            justifyContent: 'space-evenly',
          }}>
          <View style={{width: '90%', alignSelf: 'center'}}>
            <View style={{marginBottom: '2%'}}>
              <Text
                style={{
                  fontFamily: ColorsText.regular.fontFamily,
                  color: colors.GRAY_TEXT_NEW,
                  fontSize: 12,
                }}>
                You can also tap on the map to change your location *
              </Text>
            </View>
            <View style={{width: '70%'}}>
              <Text
                style={{
                  fontFamily: ColorsText.Medium.fontFamily,
                  color: colors.DUSKY_BLACK_TEXT,
                  letterSpacing: 0.6,
                }}>
                {this.state.markerAddress}
              </Text>
            </View>
          </View>
          <View style={{width: '90%', alignSelf: 'center'}}>
            <TouchableRipple
              onPress={() => this.confirmAddress()}
              rippleColor={colors.RIPPLE_COLORS.WHITE}
              style={{
                width: '100%',
                backgroundColor: colors.ROYAL_BLUE,
                height: 50,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: colors.WHITE,
                  fontFamily: ColorsText.Medium.fontFamily,
                  fontSize: 20,
                }}>
                Confirm
              </Text>
            </TouchableRipple>
          </View>
        </View>
      </View>
    );
  }
}
