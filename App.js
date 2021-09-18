import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import Screen from './constants/Screen'
import { SafeAreaView, StatusBar } from 'react-native';
import FlashMessage from "react-native-flash-message";
import { Root } from 'native-base';
import colors from './constants/colors';
import { StateProvider } from './Utils/StateProvider';
import reducer, { initialState } from './Utils/reducer';
import messaging from '@react-native-firebase/messaging'

const App = () => {
  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage)
    });
    return unsubscribe;
  }, []);

  return (
    <StateProvider initialState = {initialState} reducer = {reducer}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <NavigationContainer>
          <StatusBar backgroundColor = {colors.WHITE} barStyle = 'dark-content' />
          <Root>
            <Screen></Screen>
          </Root>
          <FlashMessage position="top" />
        </NavigationContainer>
      </SafeAreaView>
    </StateProvider>
  )
}

export default App;
