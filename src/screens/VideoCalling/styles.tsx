import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  callButtonView: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  iconDetails: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackGround: (isActive: boolean) => ({
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isActive ? '#13488A' : '#ffffff50',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  iconTextStyle: {
    marginTop: 2,
    color: '#ffffff',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 16,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 16,
  },
  iconBackGroundRed: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EF0E0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#ffffff',
  },
  callIconStyle: {
    height: 27,
    width: 27,
    resizeMode: 'contain',
  },
  iconContainer: {
    flexDirection: 'row',
    backgroundColor: '#171717',
    position: 'absolute',
    bottom: 0,
    paddingVertical: 18,
    paddingBottom: 28,
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  containerView: {
    borderWidth: 2,
    borderColor: '#807F80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameTextView: {
    backgroundColor: '#4d4d4d20',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    position: 'absolute',
    top: 30,
    left: 16,
  },
  timerTextView: {
    backgroundColor: '#4d4d4d20',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    position: 'absolute',
    top: 30,
    right: 16,
  },
  channelNameView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingVertical: 20,
    backgroundColor: '#13488A',
    borderRadius: 9,
    marginVertical: 6,
  },
  channelNameText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default styles;
