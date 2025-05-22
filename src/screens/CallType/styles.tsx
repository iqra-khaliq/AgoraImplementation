import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollStyle: {
    flex: 1,
    paddingBottom: 50,
  },
  scrollViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 30,
  },
  textStyle: {
    fontSize: 16,
    color: '#ffffff',
  },
  headerTextStyle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    marginVertical: 20,
  },
  textInputStyle: {
    borderWidth: 0.4,
    marginVertical: 10,
    padding: 10,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    borderRadius: 5,
    width: '85%',
    borderColor: '#000000',
  },
  buttonStyle: {
    width: '85%',
    backgroundColor: '#13488A',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  subContainer: {
    borderWidth: 0.4,
    borderColor: '#000000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginVertical: 10,
  },
});

export default styles;
