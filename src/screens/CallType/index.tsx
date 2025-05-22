import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import useAuthStore from '../../store/authStore';

const Button = ({text, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonStyle}>
      <Text style={styles.textStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

const CallType = () => {
  const navigation = useNavigation();
  const [channelName, setChannelName] = React.useState({
    audio: '',
    video: '',
  });
  const {clearAuth} = useAuthStore.getState();

  const handleJoinCall = (type: string) => {
    if (type === 'audio') {
      console.log('Join Audio Call Pressed', channelName.audio);
      navigation.navigate('AudioCall', {channel: channelName.audio});
      setChannelName(prev => ({...prev, audio: ''}));
    } else if (type === 'video') {
      console.log('Join Video Call Pressed', channelName.video);
      navigation.navigate('VideoCall', {channel: channelName.video});
      setChannelName(prev => ({...prev, video: ''}));
    }
  };

  const handleCreateCall = (type: string) => {
    if (type === 'audio') {
      console.log('Create Audio Call Pressed');
      navigation.navigate('AudioCall');
    } else if (type === 'video') {
      console.log('Create Video Call Pressed');
      navigation.navigate('VideoCall');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollStyle}
        contentContainerStyle={styles.scrollViewStyle}>
        <View style={styles.subContainer}>
          <Text style={styles.headerTextStyle}>Audio</Text>
          <Button
            text="Create Audio Call"
            onPress={() => handleCreateCall('audio')}
          />
          <View style={styles.subContainer}>
            <TextInput
              placeholder="Audio Channel Name"
              placeholderTextColor={'gray'}
              value={channelName.audio}
              onChangeText={text =>
                setChannelName(prev => ({...prev, audio: text?.trim()}))
              }
              style={styles.textInputStyle}
            />
            <Button
              text="Join Audio Call"
              onPress={() => handleJoinCall('audio')}
            />
          </View>
        </View>

        <View style={styles.subContainer}>
          <Text style={styles.headerTextStyle}>Video</Text>
          <Button
            text="Create Video Call"
            onPress={() => handleCreateCall('video')}
          />
          <View style={styles.subContainer}>
            <TextInput
              placeholder="Video Channel Name"
              placeholderTextColor={'gray'}
              value={channelName.video}
              onChangeText={text =>
                setChannelName(prev => ({...prev, video: text?.trim()}))
              }
              style={styles.textInputStyle}
            />
            <Button
              text="Join Video Call"
              onPress={() => handleJoinCall('video')}
            />
          </View>
        </View>

        <Button
          text="Logout"
          onPress={() => {
            clearAuth();
            navigation.replace('Login');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CallType;
