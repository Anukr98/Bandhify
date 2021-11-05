import AsyncStorage from '@react-native-async-storage/async-storage'
import { Icon } from 'native-base'
import React from 'react'
import { View, Text, BackHandler, Pressable } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'
import keys from '../../../constants/keys'
import styles from './styles'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Geolocation from 'react-native-geolocation-service'
import Geocoder from 'react-native-geocoding'
import MapView , { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { TouchableRipple } from 'react-native-paper'

export default class SearchLocation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            location: "Search for an area or street",
            isloading: false,
            latitude: 0,
            longitude: 0,
            markerCoordinates:{
                latitude: 0,
                longitude: 0
            },
            initialCoords: {
                latitude: 0,
                longitude: 0
            }
        }
        this.onMapPanComplete = this.onMapPanComplete.bind(this)
        this.handleAddressChange = this.handleAddressChange.bind(this)
        this.getLocationFromMarker = this.getLocationFromMarker.bind(this)
    }

    componentDidMount() {
        this.backbuttonAction = BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick)
        this.unsubscribe = this.props.navigation.addListener('focus', async () => {
            this.setState({ isloading: true })
            Geolocation.getCurrentPosition(this.geoSucces, this.geoFailure, {
                enableHighAccuracy: true,
                forceRequestLocation: true,
                showLocationDialog: true
            })
        })
    }

    componentWillUnmount() {
        this.backbuttonAction.remove()
    }

    handleBackButtonClick = () => {
        this.props.navigation.navigate('SavedAddressesBeforeLocationChange')
        return true
    }

    geoSucces = position => {
        const { latitude, longitude } = position.coords
        this.setState({
            // latitude,
            // longitude,
            isloading: false,
            markerCoordinates: {
                latitude,
                longitude
            },
            initialCoords: {
                latitude, longitude
            }
        })
    }

    geoFailure = () => {
        alert("something went wrong while getching error")
        this.setState({ isloading: false })
    }

    handleAddressChange = e => {
        Geocoder.init(keys.GOOGLE_MAPS_API)
        Geocoder.from(e.description).then(res => {
            const { lat, lng } = res.results[0].geometry.location
            this.setState({
                markerCoordinates: {
                    latitude: lat,
                    longitude: lng
                },
                latitude: lat,
                longitude: lng,
                location: res.results[0].formatted_address
            })
        }).catch(err => {})
    }

    getLocationFromMarker = e => {
        const { latitude, longitude } = e.nativeEvent.coordinate
        Geocoder.init(keys.GOOGLE_MAPS_API)
        Geocoder.from(latitude, longitude).then(async res => {
            this.setState({
                markerCoordinates: {
                    latitude,
                    longitude,
                },
                location: res.results[0].formatted_address,
            })
        }).catch(err => {})
    }

    onMapPanComplete = e => {
        const { latitude, longitude } = e
        Geocoder.init(keys.GOOGLE_MAPS_API)
        Geocoder.from(latitude, longitude).then(res => {
            this.setState({
                markerCoordinates: {
                    latitude,
                    longitude
                },
                location: res.results[0].formatted_address
            })
        }).catch(err => {})
    }

    selectLocation = async () => {
        await AsyncStorage.setItem('location', this.state.location)
        await AsyncStorage.setItem('addressLatitude', this.state.markerCoordinates.latitude.toString())
        await AsyncStorage.setItem('addressLongitude', this.state.markerCoordinates.longitude.toString())
        this.props.navigation.navigate('Home')
    }

    render() {
        return <View style = {{ flex: 1, backgroundColor: colors.WHITE }}>
            <MapView
                ref = {ref => this.mapRef = ref}
                style = {{ flex: 1 }}
                provider = {PROVIDER_GOOGLE}
                region = {{
                    latitude: this.state.markerCoordinates.latitude,
                    longitude: this.state.markerCoordinates.longitude,
                    latitudeDelta: 0.003,
                    longitudeDelta: 0.003
                }}
                followsUserLocation
                showsMyLocationButton
                loadingEnabled
                onPress = {this.getLocationFromMarker}
            >
                <Marker coordinate = {{ latitude: this.state.markerCoordinates.latitude, longitude: this.state.markerCoordinates.longitude }} />
            </MapView>

            <View style = {styles.searchBarArea}>
                 <GooglePlacesAutocomplete
                    placeholder = {this.state.location}
                    blurOnSubmit
                    fetchDetails
                    ref = {ref => this.autocompleteref = ref}
                    query = {{
                        key : keys.GOOGLE_MAPS_API,
                        language : 'en'
                    }}
                    onPress = {this.handleAddressChange}
                    enableHighAccuracyLocation
                    keyboardShouldPersistTaps = 'always'
                    placeholderTextColor = 'red'
                    textInputProps = {{ placeholderTextColor : colors.DUSKY_BLACK_TEXT }}
                    minLength = {4}
                    styles = {{
                        textInputContainer : {
                            backgroundColor : '#00000008',
                        },
                        textInput : {
                            fontSize : 12,
                            fontFamily : ColorsText.regular.fontFamily,
                            height : 45,
                            color : colors.DUSKY_BLACK_TEXT,
                            borderWidth : 1,
                            borderColor : '#b2b0b330',
                            elevation: 8
                        },
                        container : {
                            marginRight : 6
                        }
                    }}
                />
            </View>

            <View style = {{ position: "absolute", left: '5%', top: "3%", backgroundColor: "#ffffff", elevation: 7, borderRadius: 7, width: 40, height: 40  }}>
                <Pressable style = {{ alignItems: "center", justifyContent: "center", height: 40, width: 40 }} onPress = {this.handleBackButtonClick}>
                    <Icon active name = 'return-up-back' style = {{ color: colors.DUSKY_BLACK_TEXT, fontSize: 22 }} />
                </Pressable>
            </View>

            <View style = {{ position: "absolute", right: '5%', top: "3%", backgroundColor: "#ffffff", elevation: 7, borderRadius: 7 }}>
                <Pressable style = {{ alignItems: "center", justifyContent: "center", height: 40, width: 40 }} onPress = {() => this.mapRef.animateToRegion({ latitude: this.state.initialCoords.latitude, longitude: this.state.initialCoords.longitude, latitudeDelta: 0.003, longitudeDelta: 0.003 })}>
                    <Icon active name = 'my-location' type = "MaterialIcons" style = {{ color: colors.DUSKY_BLACK_TEXT, fontSize: 22 }} />
                </Pressable>
            </View>

            <View style = {{ position: "absolute", bottom: "5%", width: "100%", alignItems: "center" }}>
                <TouchableRipple onPress = {this.selectLocation} style = {{ height: 45, alignItems: "center", justifyContent: "center", width: "80%", backgroundColor: colors.ROYAL_BLUE, borderRadius: 7, elevation: 6 }}><Text style = {{ fontFamily: ColorsText.regular.fontFamily, color: colors.WHITE, fontSize: 18 }}>Continue</Text></TouchableRipple>
            </View>
        </View>
    }
}
