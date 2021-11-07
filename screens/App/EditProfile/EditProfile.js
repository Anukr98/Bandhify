import {useNavigation} from '@react-navigation/native';
import {Icon} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  BackHandler,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import colors from '../../../constants/colors';
import styles from './styles';
import ImagePicker from 'react-native-image-crop-picker';
import BottomSheet from 'react-native-raw-bottom-sheet';
import {strings} from '../../../constants/strings';
import ColorsText from '../../../constants/ColorsText';
import {showMessage} from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {postMethod} from '../../../Utils/CommonFunctions';
import urls from '../../../constants/urls';
import Loader from '../../Components/Loader/Loader';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
// import { RadioButton } from 'react-native-paper'
import Modal from 'react-native-modal';
import RadioButton from '../../Components/RadioButton';

const GENDERS = [
  {label: 'Male', value: 'Male'},
  {label: 'Female', value: 'Female'},
  {label: 'Other', value: 'Other'},
];

const MARITAL_STATUS = [
  {label: 'Unmarried', value: 0},
  {label: 'Married', value: 1},
];

const FAMILY_SIZE = [
  {value: '1', label: 1},
  {value: '2', label: 2},
  {value: '3', label: 3},
  {value: '3+', label: '3+'},
];

const EditProfile = ({route}) => {
  const {userDetails} = route.params;
  const {id, birth_date, gender, is_married, family_size} = userDetails;
  const navigation = useNavigation();
  const imageChangeRef = useRef(null);
  const updateEmailRef = useRef(null);
  const datePickerRef = useRef(null);
  const nameRef = useRef(null);
  const genderChangeRef = useRef(null);
  const maritalStatusRef = useRef(null);
  // const updatePhoneRef = useRef(null)
  const [userImage, setUserImage] = useState(undefined);
  const [name, setName] = useState(userDetails.name);
  const [email, setEmail] = useState(userDetails.email);
  const [editName, setEditName] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [DOB, setDOB] = useState(birth_date);
  const [userGender, setUserGender] = useState(gender);
  const [commonSheetIdentifier, setCommonSheetIdentifier] = useState('');
  const [maritalStatus, setMaritalStatus] = useState(
    is_married === false ? 0 : 1,
  );
  const [familySize, setFamilySize] = useState(family_size);
  const [isConfirmationModalAvailable, setIsConfirmationModalAvailable] =
    useState(false);

  useEffect(() => {
    const backButtonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );
    return () => backButtonAction.remove();
  }, []);

  const handleBackButtonClick = () => {
    setIsConfirmationModalAvailable(true);
    return true;
  };

  const selectImage = () => {
    imageChangeRef.current.close();
    ImagePicker.openPicker({
      mediaType: 'photo',
      width: 70,
      height: 70,
      cropping: true,
      includeBase64: true,
      cropperCircleOverlay: true,
    })
      .then(image => {
        setUserImage({uri: image.path});
      })
      .catch(err => console.log(err));
  };

  const validateEmail = async () => {
    let details = {...userDetails};
    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regex.test(email)) {
      details.name = name;
      details.birth_date = DOB;
      details.gender = userGender;
      details.is_married = maritalStatus === 0 ? false : true;
      details.family_size = familySize ? familySize : null;
      let object = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: userDetails.phone,
          device: 'app',
        }),
      };
      postMethod(urls.sendOTP, object, (err, result) => {
        if (err) console.log(err);
        else if (result.status && result.code === 200) {
          showMessage({
            type: 'success',
            icon: 'success',
            floating: true,
            duration: 1200,
            message: result.message,
          });
          updateEmailRef.current.close();
          // console.log(details)
          navigation.navigate('OTPValidateProfile', {
            userDetails: details,
            email,
          });
        } else {
          showMessage({
            icon: 'danger',
            floating: true,
            duration: 1400,
            message: 'Problem sending OTP',
            style: {backgroundColor: colors.BLACK},
          });
        }
      });
    } else {
      setIsEmailValid(false);
      showMessage({
        icon: 'warning',
        floating: true,
        duration: 1400,
        type: 'danger',
        message: 'Please enter a valid email id',
      });
    }
  };

  const saveChanges = async showMessages => {
    return new Promise(async (resolve, reject) => {
      let birth_date = DOB
        ? `${moment(DOB).format('YYYY')}-${moment(DOB).format('MM')}-${moment(
            DOB,
          ).format('DD')}`
        : moment().format('YYYY-MM-DD');
      let token = await AsyncStorage.getItem('token');
      showMessages && setIsLoading(true);
      if (userImage !== undefined) {
        //CALL IMAGE UPLOAD API WITH THE IMAGE UPLOADED BY USER
        let image = new FormData();
        image.append('image', {
          type: 'image/jpeg',
          uri: userImage.uri,
          name: 'test',
        });
        let object = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: image,
        };
        postMethod(urls.ADD_IMAGE, object, (err, result) => {
          if (err) console.log(err);
          else if (result.status && result.code === 201) {
            let updateProfileObject = {
              method: 'PATCH',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                profile_image: result.image_url,
                name,
                email,
                gender: userGender,
                is_married: maritalStatus,
                birth_date,
                family_size: familySize,
              }),
            };
            postMethod(
              `${urls.UPDATE_PROFILE}/${id}`,
              updateProfileObject,
              (error, res) => {
                setTimeout(() => {
                  setIsLoading(false);
                }, 600);
                if (error) console.log(error);
                else if (res.status && res.code === 204) {
                  if (showMessages)
                    showMessage({
                      icon: 'success',
                      type: 'success',
                      floating: true,
                      duration: 1400,
                      message: res.message,
                    });
                  setDOB(birth_date);
                  resolve(res?.user);
                } else {
                  setUserImage(undefined);
                  if (showMessages)
                    showMessage({
                      icon: 'danger',
                      floating: true,
                      duration: 1400,
                      message: 'Profile could not be updated. Try again later!',
                      style: {backgroundColor: colors.BLACK},
                    });
                  reject(null);
                }
              },
            );
          } else {
            if (showMessages)
              showMessage({
                icon: 'danger',
                style: {backgroundColor: colors.BLACK},
                floating: true,
                duration: 1400,
                message: 'Image could not be saved',
              });
            reject(null);
          }
        });
      } else {
        let object = {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            gender: userGender,
            is_married: maritalStatus,
            birth_date,
            family_size: familySize,
          }),
        };
        postMethod(`${urls.UPDATE_PROFILE}/${id}`, object, (err, result) => {
          setTimeout(() => {
            setIsLoading(false);
          }, 600);
          if (err) console.log(err);
          else if (result.status && result.code === 204) {
            if (showMessages)
              showMessage({
                icon: 'success',
                type: 'success',
                floating: true,
                duration: 1400,
                message: result.message,
              });
            setDOB(birth_date);
            resolve(result?.user);
          } else {
            setName(userDetails.name);
            if (showMessages)
              showMessage({
                icon: 'danger',
                floating: true,
                duration: 1400,
                message: 'Profile could not be updated. Try again later!',
                style: {backgroundColor: colors.BLACK},
              });
            reject(null);
          }
        });
      }
    });
  };

  const changeDob = date => setDOB(moment(date).format('YYYY-MM-DD'));

  const MaritalStatus = ({item, index}) => (
    <View style={{marginBottom: index === MARITAL_STATUS.length - 1 ? 0 : 15}}>
      <Pressable onPress={() => setMaritalStatus(item.value)}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <RadioButton
            onPress={() => setMaritalStatus(item.value)}
            checked={maritalStatus === item.value}
          />
          <Text style={styles.radioLabel}>{item.label}</Text>
        </View>
      </Pressable>
    </View>
  );

  const FamilySize = ({item, index}) => (
    <View style={{marginBottom: index === FAMILY_SIZE.length - 1 ? 0 : 15}}>
      <Pressable onPress={() => setFamilySize(item.value)}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <RadioButton
            status={familySize === item.value ? 'checked' : 'unchecked'}
            onPress={() => setFamilySize(item.value)}
            color={colors.MANGO_COLOR}
            checked={familySize === item.value}
          />
          <Text style={styles.radioLabel}>{item.label}</Text>
        </View>
      </Pressable>
    </View>
  );

  const Gender = ({item, index}) => (
    <View style={{marginBottom: index === GENDERS.length - 1 ? 0 : 15}}>
      <Pressable onPress={() => setUserGender(item.value)}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <RadioButton
            onPress={() => setUserGender(item.value)}
            checked={userGender === item.value}
          />
          <Text style={styles.radioLabel}>{item.label}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: colors.WHITE}}>
      <View style={styles.backButtonContainer}>
        <Pressable
          hitSlop={25}
          onPress={() => setIsConfirmationModalAvailable(true)}
          style={{width: '10%'}}>
          <Icon
            active
            type="AntDesign"
            name="arrowleft"
            style={{color: colors.DUSKY_BLACK_TEXT}}
          />
        </Pressable>
        <View>
          <Text style={styles.headerText}>Edit your profile</Text>
        </View>
      </View>
      {isLoading && <Loader />}
      <ScrollView
        style={{marginBottom: '15%'}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="never">
        <Modal
          isVisible={isConfirmationModalAvailable}
          onBackdropPress={() => setIsConfirmationModalAvailable(false)}
          onBackButtonPress={() => setIsConfirmationModalAvailable(false)}
          animationIn="flipInX"
          animationInTiming={700}
          animationOut="flipOutX"
          animationOutTiming={500}>
          <View style={styles.modalContainer}>
            <View style={{marginBottom: '3%'}}>
              <Text style={styles.modalTitle}>Wait!</Text>
            </View>
            <View style={{marginBottom: '8%'}}>
              <Text style={styles.modalText}>
                {strings.CONFIRM_PROFILE_DETAILS}
              </Text>
            </View>
            <View style={styles.modalButtonsContainer}>
              <View style={{marginRight: '10%'}}>
                <Pressable
                  style={styles.modalButton}
                  onPress={() => setIsConfirmationModalAvailable(false)}>
                  <Text
                    style={[
                      styles.modalButtonText,
                      {color: colors.GRAY_TEXT_NEW},
                    ]}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
              <View>
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    setIsConfirmationModalAvailable(false);
                    setTimeout(() => {
                      navigation.navigate('ProfileScreen');
                    }, 500);
                  }}>
                  <Text style={styles.modalButtonText}>Proceed</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.innerContainer}>
          <View style={styles.imageContainer}>
            <View style={styles.imageInnerContainer}>
              {userDetails?.profile_image ? (
                <Pressable onPress={() => imageChangeRef.current.open()}>
                  <Image
                    source={{
                      uri: !userImage
                        ? userDetails.profile_image
                        : userImage?.uri,
                    }}
                    style={{width: 100, height: 100, borderRadius: 999}}
                  />
                </Pressable>
              ) : userImage ? (
                <View style={{position: 'relative'}}>
                  <Image
                    source={userImage}
                    style={{width: 90, height: 90, borderRadius: 999}}
                    resizeMode="contain"
                  />

                  <View
                    style={{
                      position: 'absolute',
                      bottom: -10,
                      right: 0,
                      backgroundColor: colors.WHITE,
                      borderRadius: 999,
                      padding: 3,
                    }}>
                    <Pressable onPress={() => imageChangeRef.current.open()}>
                      <Icon
                        active
                        type="Ionicons"
                        name="ios-camera"
                        style={{color: colors.DUSKY_BLACK_TEXT, fontSize: 20}}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={selectImage}>
                  <Icon
                    active
                    type="MaterialIcons"
                    name="add-a-photo"
                    style={{
                      fontSize: 35,
                      color: colors.ROYAL_BLUE,
                      opacity: 0.6,
                    }}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View
              style={[
                styles.detailContainer,
                {
                  borderBottomColor: editName
                    ? colors.ROYAL_BLUE
                    : colors.LIGHT_GRAY_BG_COLOR,
                  borderBottomWidth: 1,
                },
              ]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Name</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  value={name}
                  onChangeText={text => setName(text)}
                  style={styles.input}
                  placeholder="Your name here"
                  onFocus={() => setEditName(true)}
                  onBlur={() => setEditName(false)}
                  placeholderTextColor={colors.DUSKY_BLACK_TEXT}
                  selectTextOnFocus
                  ref={nameRef}
                />
                <View style={styles.inputEditText}>
                  <Pressable
                    onPress={() => {
                      setEditName(true);
                      nameRef.current.focus();
                    }}
                    hitSlop={25}
                    style={{zIndex: 10}}>
                    <Text style={styles.editInputText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={[styles.detailContainer, {marginTop: '4%'}]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Email</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  value={userDetails.email}
                  style={styles.input}
                  editable={false}
                  placeholder={
                    userDetails.email ? userDetails.email : 'Your email'
                  }
                  placeholderTextColor={colors.GRAY_TEXT_NEW}
                />
                <View style={styles.inputEditText}>
                  <Pressable
                    onPress={() => updateEmailRef.current.open()}
                    hitSlop={25}>
                    <Text style={styles.editInputText}>
                      {userDetails.email ? 'Edit' : email ? 'Edit' : 'Add'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={[styles.detailContainer, {marginTop: '4%'}]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Phone number</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  value={userDetails.phone.toString()}
                  style={styles.input}
                  editable={false}
                  placeholder={
                    userDetails.phone
                      ? userDetails.phone.toString()
                      : 'Your phone number'
                  }
                />
                {/* <View style={styles.inputEditText}><Pressable onPress={() => updatePhoneRef.current.open()} hitSlop={25}><Text style={styles.editInputText}>{userDetails.phone ? 'Edit' : phone ? 'Edit' : 'Add'}</Text></Pressable></View> */}
              </View>
            </View>
            <View style={[styles.detailContainer, {marginTop: '4%'}]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>D.O.B</Text>
              </View>
              <View style={styles.inputContainer}>
                <View
                  style={{
                    flex: 0.8,
                    height: 40,
                    justifyContent: 'center',
                    paddingLeft: '1%',
                  }}>
                  <TouchableOpacity
                    onPress={() => datePickerRef.current.open()}
                    activeOpacity={0.6}>
                    <Text
                      style={{
                        fontFamily: ColorsText.light.fontFamily,
                        fontSize: 13,
                        color: colors.DUSKY_BLACK_TEXT,
                      }}>
                      {DOB}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputEditText}>
                  <Pressable
                    onPress={() => datePickerRef.current.open()}
                    hitSlop={25}>
                    <Text style={styles.editInputText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={[styles.detailContainer, {marginTop: '4%'}]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Gender</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={{flex: 0.8, height: 40, paddingLeft: '1%'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setCommonSheetIdentifier('gender');
                      genderChangeRef.current.open();
                    }}
                    activeOpacity={0.6}
                    style={{height: 40, justifyContent: 'center'}}>
                    <Text
                      style={{
                        fontFamily: ColorsText.light.fontFamily,
                        fontSize: 13,
                        color: colors.DUSKY_BLACK_TEXT,
                      }}>
                      {userGender}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputEditText}>
                  <Pressable
                    onPress={() => {
                      setCommonSheetIdentifier('gender');
                      genderChangeRef.current.open();
                    }}
                    hitSlop={25}>
                    <Text style={styles.editInputText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={[styles.detailContainer, {marginTop: '4%'}]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Marital Status</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={{flex: 0.8, height: 40, paddingLeft: '1%'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setCommonSheetIdentifier('marital_status');
                      maritalStatusRef.current.open();
                    }}
                    activeOpacity={0.6}
                    style={{height: 40, justifyContent: 'center'}}>
                    <Text
                      style={{
                        fontFamily: ColorsText.light.fontFamily,
                        fontSize: 13,
                        color: colors.DUSKY_BLACK_TEXT,
                      }}>
                      {maritalStatus === 0 ? 'Unmarried' : 'Married'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputEditText}>
                  <Pressable
                    onPress={() => maritalStatusRef.current.open()}
                    hitSlop={25}>
                    <Text style={styles.editInputText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={[styles.detailContainer, {marginTop: '4%'}]}>
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Family Size</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={{flex: 0.8, height: 40, paddingLeft: '1%'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setCommonSheetIdentifier('familySize');
                      genderChangeRef.current.open();
                    }}
                    activeOpacity={0.6}
                    style={{height: 40, justifyContent: 'center'}}>
                    <Text
                      style={{
                        fontFamily: ColorsText.light.fontFamily,
                        fontSize: 13,
                        color: colors.DUSKY_BLACK_TEXT,
                      }}>
                      {familySize ? familySize : family_size}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputEditText}>
                  <Pressable
                    onPress={() => {
                      setCommonSheetIdentifier('familySize');
                      genderChangeRef.current.open();
                    }}
                    hitSlop={25}>
                    <Text style={styles.editInputText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>

        <BottomSheet
          ref={imageChangeRef}
          height={160}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}>
          <View style={styles.imageSheetContainer}>
            <View style={{alignItems: 'flex-end'}}>
              <Pressable
                onPress={() => imageChangeRef.current.close()}
                style={{
                  backgroundColor: colors.ROYAL_BLUE,
                  borderRadius: 999,
                  padding: 1,
                }}>
                <Icon
                  active
                  type="Entypo"
                  name="cross"
                  style={{color: colors.WHITE, fontSize: 23}}
                />
              </Pressable>
            </View>
            <View>
              <Pressable onPress={selectImage}>
                <Text style={styles.sheetText}>Pick image from gallery</Text>
              </Pressable>
            </View>
            {/* <View style = {{ marginTop : '4%' }}><Pressable onPress = {selectImage}><Text style = {styles.sheetText}>Click image</Text></Pressable></View> */}
          </View>
        </BottomSheet>

        <BottomSheet
          ref={updateEmailRef}
          height={320}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}>
          <View style={[styles.imageSheetContainer, {width: '87%'}]}>
            <View style={{alignItems: 'flex-end'}}>
              <Pressable
                onPress={() => updateEmailRef.current.close()}
                style={{backgroundColor: colors.ROYAL_BLUE, borderRadius: 999}}>
                <Icon
                  active
                  type="Entypo"
                  name="cross"
                  style={{color: colors.WHITE, fontSize: 20}}
                />
              </Pressable>
            </View>
            <View style={{marginTop: '3%'}}>
              <Text
                style={[
                  styles.sheetText,
                  {fontFamily: ColorsText.Medium.fontFamily, fontSize: 16},
                ]}>
                {strings.RECOVER_ACCOUNT_TEXT}
              </Text>
            </View>
            <View style={{marginTop: '4%'}}>
              <TextInput
                onChangeText={text => {
                  setEmail(text);
                  setIsEmailValid(true);
                }}
                style={[
                  styles.sheetInput,
                  {
                    borderBottomColor: isEmailValid
                      ? colors.ROYAL_BLUE
                      : '#f00',
                  },
                ]}
                value={email}
                placeholder={userDetails.email ? userDetails.email : 'Email Id'}
                placeholderTextColor={colors.DUSKY_BLACK_TEXT}
                onSubmitEditing={validateEmail}
                selectTextOnFocus
              />
            </View>

            <View style={styles.emailSubmitButtonContainer}>
              <Pressable
                style={styles.submitEmailButton}
                onPress={validateEmail}>
                <Text
                  style={{
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.WHITE,
                    fontSize: 16,
                    letterSpacing: 0.4,
                  }}>
                  {userDetails.email ? 'Update' : 'Add'} Email Id
                </Text>
              </Pressable>
            </View>
            <View
              style={[styles.emailSubmitButtonContainer, {marginTop: '5%'}]}>
              <Pressable
                style={[
                  styles.submitEmailButton,
                  {backgroundColor: colors.WHITE},
                ]}
                onPress={() => updateEmailRef.current.close()}>
                <Text
                  style={{
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.ROYAL_BLUE,
                    fontSize: 16,
                    letterSpacing: 0.4,
                  }}>
                  I will do it later
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>

        <BottomSheet
          ref={datePickerRef}
          height={Platform.OS === 'android' ? 370 : 430}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}>
          <View style={[styles.imageSheetContainer, {width: '87%'}]}>
            <View style={{alignItems: 'flex-end'}}>
              <Pressable
                onPress={() => datePickerRef.current.close()}
                style={{backgroundColor: colors.ROYAL_BLUE, borderRadius: 999}}>
                <Icon
                  active
                  type="Entypo"
                  name="cross"
                  style={{color: colors.WHITE, fontSize: 20}}
                />
              </Pressable>
            </View>
            <View style={{marginTop: '3%'}}>
              <Text
                style={[
                  styles.sheetText,
                  {fontFamily: ColorsText.Medium.fontFamily, fontSize: 16},
                ]}>
                Select your date of birth
              </Text>
            </View>
            <View style={{marginTop: '4%'}}>
              <DatePicker
                mode="date"
                date={new Date(DOB)}
                androidVariant="iosClone"
                onDateChange={changeDob}
              />
            </View>
            <View
              style={[styles.emailSubmitButtonContainer, {marginTop: '8%'}]}>
              <Pressable
                style={styles.submitEmailButton}
                onPress={() => datePickerRef.current.close()}>
                <Text
                  style={{
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.WHITE,
                    fontSize: 16,
                    letterSpacing: 0.4,
                  }}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>

        <BottomSheet
          ref={genderChangeRef}
          height={320}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}>
          <View style={[styles.imageSheetContainer, {width: '87%'}]}>
            <View style={{alignItems: 'flex-end'}}>
              <Pressable
                onPress={() => genderChangeRef.current.close()}
                style={{backgroundColor: colors.ROYAL_BLUE, borderRadius: 999}}>
                <Icon
                  active
                  type="Entypo"
                  name="cross"
                  style={{color: colors.WHITE, fontSize: 20}}
                />
              </Pressable>
            </View>
            <View style={{marginTop: '3%'}}>
              <Text
                style={[
                  styles.sheetText,
                  {fontFamily: ColorsText.Medium.fontFamily, fontSize: 16},
                ]}>
                {commonSheetIdentifier === 'gender'
                  ? 'Select your gender'
                  : "What's your family size?"}
              </Text>
            </View>
            <View style={{marginTop: '4%'}}>
              {commonSheetIdentifier === 'gender'
                ? GENDERS.map((item, index) => (
                    <Gender key={index} item={item} index={index} />
                  ))
                : commonSheetIdentifier === 'marital_status'
                ? MARITAL_STATUS.map((item, index) => (
                    <MaritalStatus key={index} item={item} index={index} />
                  ))
                : FAMILY_SIZE.map((item, index) => (
                    <FamilySize key={index} item={item} index={index} />
                  ))}
            </View>
            <View
              style={[styles.emailSubmitButtonContainer, {marginTop: '8%'}]}>
              <Pressable
                style={styles.submitEmailButton}
                onPress={() => genderChangeRef.current.close()}>
                <Text
                  style={{
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.WHITE,
                    fontSize: 16,
                    letterSpacing: 0.4,
                  }}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>

        <BottomSheet
          ref={maritalStatusRef}
          height={270}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            },
          }}>
          <View style={[styles.imageSheetContainer, {width: '87%'}]}>
            <View style={{alignItems: 'flex-end'}}>
              <Pressable
                onPress={() => maritalStatusRef.current.close()}
                style={{backgroundColor: colors.ROYAL_BLUE, borderRadius: 999}}>
                <Icon
                  active
                  type="Entypo"
                  name="cross"
                  style={{color: colors.WHITE, fontSize: 20}}
                />
              </Pressable>
            </View>
            <View style={{marginTop: '3%'}}>
              <Text
                style={[
                  styles.sheetText,
                  {fontFamily: ColorsText.Medium.fontFamily, fontSize: 16},
                ]}>
                {commonSheetIdentifier === 'gender'
                  ? 'Select your gender'
                  : commonSheetIdentifier === 'marital_status'
                  ? 'Select marital status'
                  : "What's your family size?"}
              </Text>
            </View>
            <View style={{marginTop: '4%'}}>
              {MARITAL_STATUS.map((item, index) => (
                <MaritalStatus key={index} item={item} index={index} />
              ))}
            </View>
            <View
              style={[styles.emailSubmitButtonContainer, {marginTop: '8%'}]}>
              <Pressable
                style={styles.submitEmailButton}
                onPress={() => maritalStatusRef.current.close()}>
                <Text
                  style={{
                    fontFamily: ColorsText.regular.fontFamily,
                    color: colors.WHITE,
                    fontSize: 16,
                    letterSpacing: 0.4,
                  }}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>

        {/* <BottomSheet
                    ref = {updatePhoneRef}
                    closeOnDragDown={true}
                    height = {320}
                    customStyles={{
                        container: {
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20
                        }
                    }}
                >
                    <View style={[styles.imageSheetContainer, { width: '87%' }]}>
                        <View style={{ alignItems: 'flex-end' }}><Pressable onPress={() => updatePhoneRef.current.close()} style={{ backgroundColor: colors.ROYAL_BLUE, borderRadius: 999 }}><Icon active type='Entypo' name='cross' style={{ color: colors.WHITE, fontSize: 20 }} /></Pressable></View>
                        <View style={{ marginTop: '3%' }}><Text style={[styles.sheetText, { fontFamily: ColorsText.Medium.fontFamily, fontSize: 16 }]}>{strings.PHONE_NUMBER_TEXT}</Text></View>
                        <View style={{ marginTop: '4%' }}>
                            <TextInput
                                onChangeText = {text => {
                                    setPhone(text)
                                    setIsPhoneValid(true)
                                }}
                                style = {[styles.sheetInput , { borderBottomColor : isPhoneValid ? colors.ROYAL_BLUE : '#f00' }]}
                                value = {phone}
                                placeholder = {userDetails.phone ? userDetails.phone.toString() : "Phone number"}
                                placeholderTextColor = {colors.DUSKY_BLACK_TEXT}
                                maxLength = {10}
                                keyboardType = 'number-pad'
                                onSubmitEditing = {validatePhone}
                            />
                        </View>

                        <View style={styles.emailSubmitButtonContainer}>
                            <Pressable style={styles.submitEmailButton} onPress={validatePhone}><Text style={{ fontFamily: ColorsText.regular.fontFamily, color: colors.WHITE, fontSize: 16, letterSpacing: .4 }}>{userDetails.phone ? 'Edit' : 'Add'} phone number</Text></Pressable>
                        </View>
                        <View style={[styles.emailSubmitButtonContainer, { marginTop: '5%' }]}>
                            <Pressable
                                style={[styles.submitEmailButton, { backgroundColor: colors.WHITE }]}
                                onPress={() => updatePhoneRef.current.close()}
                            >
                                <Text style={{ fontFamily: ColorsText.regular.fontFamily, color: colors.ROYAL_BLUE, fontSize: 16, letterSpacing: .4 }}>I will do it later</Text>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheet> */}
      </ScrollView>

      <View style={styles.confirmContainer}>
        <Pressable
          style={styles.confirmButton}
          onPress={() => saveChanges(true)}>
          <Text style={styles.submitButtonText}>Confirm Changes</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default EditProfile;
