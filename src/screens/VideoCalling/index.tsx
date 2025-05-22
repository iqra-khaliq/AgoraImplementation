import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngineEventHandler,
  RtcSurfaceView,
  RtcTextureView,
  VideoViewSetupMode,
} from 'react-native-agora';
import uuid from 'react-native-uuid';
import proximity, { SubscriptionRef } from 'rn-proximity-sensor';
import { appIcons } from '../../assets';
import { formatTime } from '../../helpers';
import useAuthStore from '../../store/authStore';
import { AGORA_KEY, BASE_URL } from '../../utils';
import styles from './styles';

const APP_ID = AGORA_KEY

const { height, width } = Dimensions.get('window');

const VideoCalling = () => {
  const { params } = useRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  const startTimeRef = useRef(null); // Ref to store the start time
  const timerIntervalRef = useRef(null); // Ref to store the interval IDstatus
  const sensorSubscriptionRef = useRef<SubscriptionRef | null>(null);

  const [controls, setControls] = useState({
    engine: null,
    call_data: {},
    isMute: false,
    isNear: false,
    status: null,
    elapsedTime: 0,
    remoteUsers: [],
    isSpeakerOn: false,
    remoteUserCamera: false,
    renderByTextureView: true,
    joinChannelSuccess: false,
    setupMode: VideoViewSetupMode.VideoViewSetupReplace,
    channel: '',
  });

  useEffect(() => {
    const initRtcEngine = async () => {
      const agoraEngine = createAgoraRtcEngine();
      agoraEngine.initialize({ appId: APP_ID });
      agoraEngine.registerEventHandler(eventHandler);
      agoraEngine.enableVideo();

      setControls(prev => ({ ...prev, renderByTextureView: true }));
      agoraEngine.enableLocalVideo(true);
      agoraEngine.muteLocalVideoStream(false);

      await getPermission();

      agoraEngine.startPreview();
      setControls(prev => ({ ...prev, engine: agoraEngine }));
      // joinChannel();
    };

    initRtcEngine();

    return () => {
      if (controls.engine) {
        cleanupAgoraEngine();
      }
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      // setElapsedTime(0);
      setControls(prev => ({ ...prev, elapsedTime: 0 }));
    }
    if (isFocused && controls.engine) {
      joinChannel();
    } else {
      // onPressLeave();
      cleanupAgoraEngine();
    }
  }, [isFocused, controls.engine]);

  useEffect(() => {
    const backAction = () => {
      return true; // Block the back button
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    sensorSubscriptionRef.current = proximity.subscribe(values => {
      if (values.distance > 4) {
        setControls(prev => ({ ...prev, isNear: false }));
      } else {
        setControls(prev => ({ ...prev, isNear: true }));
      }
    });

    return () => {
      if (sensorSubscriptionRef.current) {
        sensorSubscriptionRef.current.unsubscribe();
        sensorSubscriptionRef.current = null;
      }
    };
  }, []);

  const eventHandler: IRtcEngineEventHandler = {
    onJoinChannelSuccess: () => {
      setControls(prev => ({ ...prev, joinChannelSuccess: true }));
    },
    onUserJoined: (connection, remoteUid) => {
      setControls(prev => ({
        ...prev,
        remoteUsers: [...prev.remoteUsers, remoteUid],
      }));
      startTimer();
    },
    onUserOffline: (connection, remoteUid) => {
      stopTimer();
      setControls(prev => ({
        ...prev,
        remoteUsers: prev.remoteUsers.filter(uid => uid !== remoteUid),
      }));

      if (controls.remoteUsers.length === 0) {
        onPressLeave();
      }
    },
    onUserMuteVideo: (connection, remoteUser, muted) => {
      setControls(prev => ({ ...prev, remoteUserCamera: muted }));
    },
    onConnectionStateChanged: (connection, state) => {
      if (state === 1 || state === 5) {
        stopTimer();
      }
    },
  };

  const cleanupAgoraEngine = () => {
    return () => {
      controls.engine.unregisterEventHandler(eventHandler);
      controls.engine.release();
    };
  };

  // Function to start the timer
  const startTimer = () => {
    startTimeRef.current = Date.now(); // Record the start time
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setControls(prev => ({ ...prev, elapsedTime: now - startTimeRef.current }));
    }, 1000); // Update every second
  };

  // Function to stop the timer
  const stopTimer = () => {
    clearInterval(timerIntervalRef.current); // Stop the interval
  };

  const fetchToken = async channelName => {
    try {
      const res = await axios
        .get(
          `${BASE_URL}agora_integrations/generate_agora_token?channel_name=${channelName}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: token,
            },
          },
        )
        .catch(err => console.log('err', err?.response));

      const data = await res?.data?.data?.token;
      return data;
    } catch (error) {
      //
    }
  };

  // useEffect(() => {
  //   if (controls.status === 'ringing' && isFocused) {
  //     const timeoutId = setTimeout(() => {
  //       if (controls.remoteUsers?.length === 0 && controls.call_data) {
  //         console.error('No one joined in 3 mins, ending call...');
  //         updateCallStatus('not_attended');
  //       }
  //       // }, 85000);
  //     }, 60000);
  //     // }, 60000);

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [controls.status]);

  const joinChannel = async () => {
    const CHANNEL_NAME = params?.channel
      ? params?.channel
      : `video_call_${user?.user?.id}_${uuid.v4()}`;

    setControls(prev => ({ ...prev, channel: CHANNEL_NAME }));

    if (!controls.engine) {
      return;
    }
    const agoraCallToken = await fetchToken(CHANNEL_NAME);

    controls.engine.joinChannel(agoraCallToken, CHANNEL_NAME, 0, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });

    controls.engine.enableInstantMediaRendering();
  };

  const onPressFlip = () => {
    if (!controls.engine) {
      return;
    }
    controls.engine.switchCamera();
  };

  const onPressCamera = () => {
    if (!controls.engine) {
      return;
    }
    const hasPreview = !controls.renderByTextureView;
    setControls(prev => ({ ...prev, renderByTextureView: hasPreview }));
    controls.engine.enableLocalVideo(hasPreview);
    controls.engine.muteLocalVideoStream(!hasPreview);
  };

  const onPressMute = () => {
    if (!controls.engine) {
      return;
    }
    const hasMuted = !controls.isMute;
    setControls(prev => ({ ...prev, isMute: hasMuted }));
    controls.engine?.muteLocalAudioStream(hasMuted);
  };

  const onPressSpeaker = () => {
    const newSpeakerState = !controls.isSpeakerOn;
    setControls(prev => ({ ...prev, isSpeakerOn: newSpeakerState }));
    controls.engine?.setEnableSpeakerphone(newSpeakerState);
  };

  const onPressLeave = () => {
    try {
      setControls(prev => ({
        ...prev,
        joinChannelSuccess: false,
        remoteUsers: [],
      }));

      if (controls.engine) {
        controls.engine.leaveChannel();
      }
      setControls(prev => ({ ...prev, engine: null }));

      setTimeout(() => {
        // navigation.pop();
        navigation.goBack();
      }, 500);
    } catch (error) {
      //
    }
  };

  const iconsView = () => {
    return (
      <View
        style={styles.callButtonView}
        pointerEvents={controls.isNear ? 'none' : 'auto'}>
        <TouchableOpacity style={styles.iconDetails} onPress={onPressSpeaker}>
          <View style={styles.iconBackGround(controls.isSpeakerOn)}>
            <Image
              source={
                controls.isSpeakerOn ? appIcons.speakerOn : appIcons.speakerOff
              }
              style={styles.iconStyle}
            />
          </View>
          <Text style={styles.iconTextStyle}>Speaker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconDetails} onPress={onPressMute}>
          <View style={styles.iconBackGround(!controls.isMute)}>
            <Image
              source={controls.isMute ? appIcons.muted : appIcons.mute}
              style={styles.iconStyle}
            />
          </View>
          <Text style={styles.iconTextStyle}>Mute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconDetails} onPress={onPressFlip}>
          <View style={styles.iconBackGround(true)}>
            <Image source={appIcons.flipCamera} style={styles.iconStyle} />
          </View>
          <Text style={styles.iconTextStyle}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconDetails} onPress={onPressCamera}>
          <View style={styles.iconBackGround(controls.renderByTextureView)}>
            <Image
              source={
                controls.renderByTextureView
                  ? appIcons.showVideo
                  : appIcons.hideVideo
              }
              style={styles.iconStyle}
            />
          </View>
          <Text style={styles.iconTextStyle}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconDetails}
          // disabled={params?.channel ? false : isLoading}
          onPress={() => {
            if (!params?.channel) {
              onPressLeave();
              // !isLoading && onPressLeave();
            } else {
              onPressLeave();
            }
          }}>
          <View style={styles.iconBackGroundRed}>
            <Image source={appIcons.endCall} style={styles.callIconStyle} />
          </View>
          <Text style={styles.iconTextStyle}>End</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderVideo = (user: { uid: number }) => {
    const cameraHeight =
      controls.remoteUsers?.length > 0 ? (height - 220) / 2 : height;
    const showUserCamera =
      user?.uid === 0
        ? controls.renderByTextureView
        : !controls.remoteUserCamera;
    return showUserCamera ? (
      <RtcSurfaceView
        style={{
          width: width - 10,
          height: cameraHeight,
        }}
        canvas={{ uid: user?.uid, setupMode: controls.setupMode }}
      />
    ) : Platform.OS === 'android' ? (
      <RtcTextureView
        style={{ width: width, height: cameraHeight }}
        canvas={{ uid: user?.uid, setupMode: controls.setupMode }}
      />
    ) : (
      <View
        style={{
          width: width - 10,
          height: cameraHeight,
          backgroundColor: '#171717',
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.cameraView}>
      {controls.channel && (
        <View style={styles.channelNameView}>
          <Text style={styles.channelNameText}>{controls.channel}</Text>
        </View>
      )}
      {controls.joinChannelSuccess && (
        <View style={{ height: height - 210 }}>
          {/* Remote video streams */}
          <View style={styles.containerView}>
            {controls.remoteUsers?.map(uid => renderVideo({ uid }))}
            <View style={styles.userNameTextView}>
              <Text style={styles.userName}>
                {params?.user?.callerName ||
                  `${params?.user?.first_name || ''} ${params?.user?.last_name || ''
                    }`.trim() ||
                  'User'}
              </Text>
            </View>
          </View>

          {/* Local video stream */}
          <View style={styles.containerView}>{renderVideo({ uid: 0 })}</View>
          <View style={styles.timerTextView}>
            <Text style={styles.counterText}>
              {formatTime(controls.elapsedTime)}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.iconContainer}>{iconsView()}</View>
    </SafeAreaView>
  );
};

const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default VideoCalling;
