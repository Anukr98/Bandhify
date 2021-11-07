import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {Icon} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  BackHandler,
  FlatList,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import colors from '../../../constants/colors';
import styles from './styles';
import {strings} from '../../../constants/strings';
import {postMethod} from '../../../Utils/CommonFunctions';
import urls from '../../../constants/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';
import Modal from 'react-native-modal';
import GIFLoading from '../../Components/GIFLoading/GIFLoading';

const Notifications = ({route}) => {
  const {notifications} = route.params;
  const navigation = useNavigation();

  const [allNotifications, setAllNotifications] = useState(notifications);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBackButtonClick = () => {
    navigation.navigate('HomeScreen');
    return true;
  };

  useEffect(() => {
    const backButtonAction = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );
    return () => backButtonAction.remove();
  }, []);

  const renderItem = ({item}) => {
    const {data, created_at} = item;
    const today = moment(),
      notificationCreatedAt = moment(created_at);
    const differenceInDays = today.diff(notificationCreatedAt, 'days');
    const text_for_created_at =
      differenceInDays >= 30
        ? 'More than a month ago'
        : differenceInDays < 1
        ? 'Less than a day ago'
        : `${differenceInDays} days ago`;

    return (
      <View style={styles.notificationRow}>
        <View style={{width: '5%'}}>
          <View
            style={[
              styles.readStatus,
              {display: item?.read_at ? 'none' : 'flex'},
            ]}>
            <Text style={{opacity: 0, color: 'red'}}>dhfsg</Text>
          </View>
        </View>
        <View style={{width: '95%'}}>
          <Text style={styles.notificationText}>{data}</Text>
          <Text style={styles.notificationCreatedAt}>
            {text_for_created_at}
          </Text>
        </View>
      </View>
    );
  };

  const markNotificationsAsRead = async () => {
    setIsModalVisible(false);
    setIsLoading(true);
    let token = await AsyncStorage.getItem('token');
    let object = {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    postMethod(urls.MARK_NOTIFICATIONS, object, (err, result) => {
      if (err) console.log(err);
      else if (result.status && result.code === 200) {
        let object = {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        postMethod(urls.GET_NOTIFICATIONS, object, (error, res) => {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
          if (error) console.log(error);
          else if (res.status && res.code === 200) {
            setAllNotifications(res.notifications);
            showMessage({
              type: 'success',
              icon: 'success',
              message: result.message,
              floating: true,
            });
          } else alert('Something went wrong');
        });
      } else {
        setIsLoading(false);
        showMessage({
          message: 'Could not mark notifications as read',
          floating: true,
          icon: 'danger',
          style: {backgroundColor: colors.BLACK},
        });
      }
    });
  };

  if (isLoading) return <GIFLoading />;

  return (
    <View style={{flex: 1, backgroundColor: colors.WHITE}}>
      <View style={styles.header}>
        <View
          style={{width: '93%', flexDirection: 'row', alignItems: 'center'}}>
          <View>
            <Pressable onPress={() => navigation.navigate('HomeScreen')}>
              <Icon
                name="arrow-back"
                style={{color: colors.DUSKY_BLACK_TEXT}}
              />
            </Pressable>
          </View>
          <View
            style={{
              marginLeft: '3%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
            }}>
            <View>
              <Text style={styles.headerText}>Notifications</Text>
            </View>
            <View>
              <Pressable onPress={() => setIsModalVisible(true)}>
                <Icon name="ios-ellipsis-vertical" style={{fontSize: 20}} />
              </Pressable>
              <Modal
                isVisible={isModalVisible}
                style={styles.modal}
                onBackdropPress={() => setIsModalVisible(false)}
                animationIn="fadeInRight"
                animationOut="fadeOutRight"
                backdropOpacity={0.3}>
                <SafeAreaView>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalInnerContainer}>
                      <View>
                        <TouchableWithoutFeedback
                          onPress={markNotificationsAsRead}>
                          <Text style={styles.popoverText}>
                            {strings.MARK_NOTIFICATIONS_AS_READ}
                          </Text>
                        </TouchableWithoutFeedback>
                      </View>
                      <View>
                        <TouchableWithoutFeedback
                          onPress={() => setIsModalVisible(false)}>
                          <Text style={styles.popoverText}>Dismiss</Text>
                        </TouchableWithoutFeedback>
                      </View>
                    </View>
                  </View>
                </SafeAreaView>
              </Modal>
            </View>
          </View>
        </View>
      </View>
      <View style={{flex: 1}}>
        <FlatList data={allNotifications} renderItem={renderItem} />
      </View>
    </View>
  );
};

export default Notifications;
