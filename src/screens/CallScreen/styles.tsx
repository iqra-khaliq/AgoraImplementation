import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  callerBackGround: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#b8c8dc',
  },
  singleCallerImage: {
    width: 25,
    height: 30,
    position: 'absolute',
    top: '8%',
    right: '10%',
    borderRadius: 4,
  },
  userConatiner: {
    position: 'absolute',
    top: '5%',
    left: 5,
    backgroundColor: '#4d4d4d20',
    marginTop: 2,
    paddingHorizontal: 8,
    paddingTop: 3,
    paddingBottom: 6,
    borderRadius: 5,
  },
  callerNameTextStyle: {
    color: '#ffffff',
    fontSize: 26,
    textAlignVertical: 'center',
  },
  callTime: {
    color: '#ffffff',
    fontSize: 14,
    textAlignVertical: 'center',
  },
  callerAction: {
    width: '100%',
    height: 100,
    position: 'absolute',
    backgroundColor: '#00000090',
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconBackGround: (isActive: boolean) => ({
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isActive ? '#13488A' : '#ffffff30',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  iconBackGroundRed: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EF0E0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDetails: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iiconTextStyle: {
    marginTop: 2,
    color: '#ffffff',
    fontSize: 14,
  },
  endButton: {
    // backgroundColor: PFColors.Red.RadiantRed,
  },
  callButtonView: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  iconStyle: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    tintColor: '#ffffff',
  },
  callIconStyle: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  backIconStyle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  channelNameView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingVertical: 20,
    backgroundColor: '#13488A',
    borderRadius: 5,
    marginVertical: 6,
  },
  channelNameText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default styles;
