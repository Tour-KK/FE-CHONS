import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

GoogleSignin.configure({
  webClientId: ' 응애 ',
});


const GoogleAPIScreen = () => {
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
       {/* <GoogleSigninButton
         style={{ width: 192, height: 48 }}
         size={GoogleSigninButton.Size.Wide}
         color={GoogleSigninButton.Color.Dark}
         onPress={signIn}
       /> */}

      <MapView
        provider={PROVIDER_GOOGLE} 
        initialRegion={{
          latitude: 37.541,
          longitude: 126.986,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={styles.map}
      />
   	</View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%"
  }
});

export default GoogleAPIScreen;
