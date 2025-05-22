import axios from 'axios';
import React, {useEffect} from 'react';
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import useAuthStore from '../../store/authStore';
import {BASE_URL} from '../../utils';
import styles from './styles';
import {useIsFocused, useNavigation} from '@react-navigation/native';

const Login = () => {
  const {setUser, setToken} = useAuthStore.getState();
  const token = useAuthStore(state => state.token);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [credentials, setCredentials] = React.useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (token) {
      navigation.navigate('CallType');
    }
  }, [token, isFocused]);

  const handleLogin = async () => {
    try {
      if (!credentials.email || !credentials.password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const obj = {
        user: {
          email: credentials?.email?.trim()?.toLowerCase() ?? '',
          password: credentials?.password?.trim() ?? '',
        },
      };
      const res = await axios
        .post(`${BASE_URL}sessions`, obj, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
        .catch(err => {
          console.log('err', err?.response);
          Alert.alert(
            'Error',
            err?.response?.data?.error ?? 'Something went wrong',
          );
        });

      console.log('res', res);

      if (res?.status === 200) {
        const authToken = res?.headers?.get('authorization');

        setToken(authToken);
        setUser(res?.data);
      }
    } catch (error) {
      console.log('error', error?.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Email"
        placeholderTextColor={'gray'}
        value={credentials.email}
        onChangeText={text => setCredentials({...credentials, email: text})}
        style={styles.textInputStyle}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={'gray'}
        value={credentials.password}
        onChangeText={text => setCredentials({...credentials, password: text})}
        style={styles.textInputStyle}
      />
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => handleLogin()}>
        <Text style={styles.textStyle}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;
