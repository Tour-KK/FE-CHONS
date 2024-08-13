import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GoogleMapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 37.541,
    longitude: 126.986,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder='Search for places'
        onPress={(data, details = null) => {
          // Make sure details is not null
          if (details) {
            setRegion({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            });
          }
        }}
        query={{
          key: 'AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE', // Make sure you use a valid API key
          language: 'en',
        }}
        styles={{
          textInputContainer: {
            width: '100%',
            zIndex: 1 // Ensure the input is visible on iOS by giving it a non-zero zIndex
          },
          textInput: {
            height: 38,
            color: '#5d5d5d',
            fontSize: 16,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
      />
      <MapView
        provider={PROVIDER_GOOGLE}
        region={region}
        style={styles.map}
      >
        <Marker coordinate={region} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: "100%",
    width: "100%",
    marginTop: 50 // Add margin to ensure map is positioned below the search bar
  }
});

export default GoogleMapScreen;
