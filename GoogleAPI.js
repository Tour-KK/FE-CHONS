import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

GoogleSignin.configure({
  webClientId: '412626397279-eg75216s42no729d1cmftmkns983ouhq.apps.googleusercontent.com',
});

const GoogleAPIScreen = () => {
  const googleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
    } catch (error) {
      console.error(error);
    }
  };

  const googleSignout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('User signed out');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        style={{ width: 192, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={googleSignin}
      />
      <Button title="Sign Out" onPress={googleSignout} />
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
  container: {
    flex: 1,
  },
  map: {
    height: "100%",
    width: "100%"
  }
});

export default GoogleAPIScreen;
