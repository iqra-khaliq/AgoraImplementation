import React from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {appIcons, appImages} from '../../assets';
import styles from './styles';

interface CallScreenProps {
  onPressLeave: () => void;
  isMute: boolean;
  isNear: boolean;
  leaveDisabled?: boolean;
  isSpeakerOn: boolean;
  timer: string;
  channel: string;
  onPressSpeaker: () => void;
  onPressMute: () => void;
  user: object;
}

const CallScreen = ({
  onPressLeave,
  isMute,
  isSpeakerOn,
  timer,
  onPressSpeaker,
  onPressMute,
  user,
  isNear,
  leaveDisabled,
  channel,
}: CallScreenProps) => {
  const iconsView = () => {
    return (
      <View
        style={styles.callButtonView}
        pointerEvents={isNear ? 'box-none' : 'auto'}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconDetails}
          onPress={onPressSpeaker}>
          <View style={styles.iconBackGround(isSpeakerOn)}>
            <Image
              source={isSpeakerOn ? appIcons.speakerOn : appIcons.speakerOff}
              style={styles.iconStyle}
            />
          </View>
          <Text style={styles.iiconTextStyle}>Speaker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconDetails}
          onPress={onPressMute}>
          <View style={styles.iconBackGround(!isMute)}>
            <Image
              source={isMute ? appIcons.muted : appIcons.mute}
              style={styles.iconStyle}
            />
          </View>
          <Text style={styles.iiconTextStyle}>Mute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconDetails}
          onPress={onPressLeave}
          disabled={leaveDisabled}>
          <View style={styles.iconBackGroundRed}>
            <Image source={appIcons.endCall} style={styles.callIconStyle} />
          </View>
          <Text style={styles.iiconTextStyle}>End</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={appImages.userPlaceholder}
        style={styles.callerBackGround}>
        <View style={styles.userConatiner}>
          {channel && (
            <View style={styles.channelNameView}>
              <Text style={styles.channelNameText}>{channel}</Text>
            </View>
          )}
          <Text style={styles.callerNameTextStyle}>
            {user?.callerName ||
              `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
              'User'}
          </Text>
          <Text style={styles.callTime}>{timer}</Text>
        </View>
        <View style={styles.callerAction}>
          <View style={styles.iconContainer}>{iconsView()}</View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default CallScreen;
