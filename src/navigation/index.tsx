import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import CallType from '../screens/CallType';
import Login from '../screens/Login';
import VideoCalling from '../screens/VideoCalling';
import VoiceCalling from '../screens/VoiceCalling';

const Stack = createNativeStackNavigator();

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={'Login'}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name={'Login'} component={Login} />
        <Stack.Screen name={'CallType'} component={CallType} />
        <Stack.Screen name={'AudioCall'} component={VoiceCalling} />
        <Stack.Screen name={'VideoCall'} component={VideoCalling} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
