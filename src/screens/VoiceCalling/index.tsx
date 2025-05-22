import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {BackHandler, PermissionsAndroid, Platform} from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  RtcConnection,
} from 'react-native-agora';
import uuid from 'react-native-uuid';
import proximity, {SubscriptionRef} from 'rn-proximity-sensor';
import {formatTime} from '../../helpers';
import useAuthStore from '../../store/authStore';
import {AGORA_KEY, BASE_URL} from '../../utils';
import CallScreen from '../CallScreen';

const appId = AGORA_KEY;

const VoiceCalling = () => {
  const {params} = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
  const eventHandler = useRef<IRtcEngineEventHandler>();
  const sensorSubscriptionRef = useRef<SubscriptionRef | null>(null);
  const startTimeRef = useRef(null); // Ref to store the start time
  const timerIntervalRef = useRef(null); // Ref to store the interval ID

  const [controls, setControls] = useState({
    isJoined: false,
    remoteUid: 0,
    isMuted: false,
    isSpeakerOn: false,
    channel: '',
    elapsedTime: 0,
    isNear: false,
    call_data: {},
    status: null,
  });

  // Function to start the timer
  const startTimer = () => {
    startTimeRef.current = Date.now(); // Record the start time
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setControls(prev => ({...prev, elapsedTime: now - startTimeRef.current}));
    }, 1000); // Update every second
  };

  // Function to stop the timer
  const stopTimer = () => {
    clearInterval(timerIntervalRef.current); // Stop the interval
  };

  useEffect(() => {
    const init = async () => {
      await setupVoiceSDKEngine();
      setupEventHandler();
      join();
    };
    if (isFocused) {
      setControls(prev => ({...prev, elapsedTime: 0}));
      init();
    }
    return () => {
      cleanupAgoraEngine(); // Ensure this is synchronous
    };
  }, [isFocused]); // Empty dependency array ensures it runs only once

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

  // useEffect(() => {
  //   if (controls.status === 'ringing' && isFocused) {
  //     const timeoutId = setTimeout(() => {
  //       if (controls.remoteUid === 0 && controls.call_data) {
  //         // updateCallStatus('not_attended');
  //       }
  //     }, 60000); // 60,000ms = 1 minute

  //     return () => clearTimeout(timeoutId); // Cleanup on unmount
  //   }
  // }, [controls.status]);

  useEffect(() => {
    sensorSubscriptionRef.current = proximity.subscribe(values => {
      if (values.distance > 4) {
        setControls(prev => ({...prev, isNear: false}));
      } else {
        setControls(prev => ({...prev, isNear: true}));
      }
    });

    return () => {
      if (sensorSubscriptionRef.current) {
        sensorSubscriptionRef.current.unsubscribe();
        sensorSubscriptionRef.current = null;
      }
    };
  }, []);

  const setupEventHandler = () => {
    eventHandler.current = {
      onJoinChannelSuccess: () => {
        setControls(prev => ({...prev, isJoined: true}));
      },
      onUserJoined: (_connection: RtcConnection, uid: number) => {
        setControls(prev => ({...prev, remoteUid: uid}));
        startTimer();
      },
      onUserOffline: (_connection: RtcConnection, uid: number) => {
        setControls(prev => ({...prev, remoteUid: uid}));
        stopTimer();
        setTimeout(() => {
          leave();
        }, 1500);
      },
      onConnectionStateChanged: (
        _connection: RtcConnection,
        state,
        _reason,
      ) => {
        if (state === 1 || state === 5) {
          stopTimer();
        }
      },
    };
    agoraEngineRef.current?.registerEventHandler(eventHandler.current);
  };

  const setupVoiceSDKEngine = async () => {
    try {
      await getPermission();
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.initialize({appId: appId});
      agoraEngine.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );

      agoraEngine.setClientRole(
        params?.channel
          ? ClientRoleType.ClientRoleAudience
          : ClientRoleType.ClientRoleBroadcaster,
      );
    } catch (e) {
      //
    }
  };

  const fetchAgoraToken = async (channelName: string) => {
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

  const join = async () => {
    if (controls.isJoined) {
      return;
    }
    const channelName = params?.channel
      ? params?.channel
      : `call_${user?.user?.id}_${uuid.v4()}`;

    setControls(prev => ({...prev, channel: channelName}));

    const agoraCallToken = await fetchAgoraToken(channelName);
    try {
      // Join the channel as a broadcaster
      agoraEngineRef.current?.joinChannel(agoraCallToken, channelName, 0, {
        // Set channel profile to live broadcast
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        // Set user role to broadcaster
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        // Publish audio collected by the microphone
        publishMicrophoneTrack: true,
        // Automatically subscribe to all audio streams
        autoSubscribeAudio: true,
      });
      setControls(prev => ({...prev, isJoined: true}));
      agoraEngineRef.current?.enableLocalAudio(true);
    } catch (e) {
      //
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setControls(prev => ({...prev, remoteUid: 0, isJoined: false}));

      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const cleanupAgoraEngine = () => {
    return () => {
      agoraEngineRef.current?.unregisterEventHandler(eventHandler.current!);
      agoraEngineRef.current?.release();
    };
  };

  // const increaseVolume = () => {
  //   if (volume !== 100) {
  //     setVolume(volume + 5);
  //   }
  //   agoraEngineRef.current?.adjustRecordingSignalVolume(volume);
  // };

  // const decreaseVolume = () => {
  //   if (volume !== 0) {
  //     setVolume(volume - 5);
  //   }
  //   agoraEngineRef.current?.adjustRecordingSignalVolume(volume);
  // };

  // Toggle publishing the local audio stream
  const mute = () => {
    const hasMuted = !controls.isMuted;
    setControls(prev => ({...prev, isMuted: hasMuted}));
    agoraEngineRef.current?.muteLocalAudioStream(hasMuted);
  };

  // Toggle Speaker Volume
  const toggleSpeaker = () => {
    const newSpeakerState = !controls.isSpeakerOn;
    agoraEngineRef.current?.setEnableSpeakerphone(newSpeakerState);
    setControls(prev => ({...prev, isSpeakerOn: newSpeakerState}));
  };

  return (
    <CallScreen
      onPressLeave={() => {
        if (!params?.channel) {
          leave();
          // !isLoading && leave();
        } else {
          leave();
        }
      }}
      isMute={controls.isMuted}
      isSpeakerOn={controls.isSpeakerOn}
      timer={formatTime(controls.elapsedTime)}
      onPressMute={() => mute()}
      onPressSpeaker={() => toggleSpeaker()}
      user={params?.user}
      isNear={controls.isNear}
      channel={controls.channel}
      // leaveDisabled={params?.channel ? false : isLoading}
    />
  );
};

const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
  }
};

export default VoiceCalling;
