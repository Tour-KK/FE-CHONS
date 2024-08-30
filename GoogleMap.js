import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Image, Text, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import LinearGradient from 'react-native-linear-gradient';

// 이미지
import customMarkerIMG from "./Image/지도마커_아이콘.png";
import locationBtnIMG from "./Image/위치설정버튼_아이콘.png";

const GoogleMapScreen = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: 37.3225,
    longitude: 127.0957,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [address, setAddress] = useState('위치정보를 불러오는 중...');
  const [autocompleteVisible, setAutocompleteVisible] = useState(true);

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  Geocoder.init('AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE', { language: "ko" });

  useEffect(() => {
    if (mapRef.current && region) {
      mapRef.current.animateToRegion(region, 1000);
    }
    fetchAddress(region.latitude, region.longitude);
  }, [region]);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const json = await Geocoder.from(latitude, longitude);
      const addressComponent = json.results[0].formatted_address;
      setAddress(addressComponent);
    } catch (error) {
      setAddress('주소를 찾을 수 없습니다.');
      console.error(error);
    }
  };

  const onPlaceSelected = (data, details) => {
    const newRegion = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(newRegion);
    setAutocompleteVisible(false);
  };

  const handleMapPress = () => {
    setAutocompleteVisible(true);
  };

  const handleRegisterLocation = () => {
    navigation.navigate('숙소등록', { address, region });
  };

  return (
    <TouchableWithoutFeedback onPress={handleMapPress}>
      <View style={styles.container}>
        {autocompleteVisible && (
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              ref={autocompleteRef}
              minLength={2}
              placeholder="주소를 검색해주세요"
              query={{
                key: 'AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE',
                language: "ko",
                components: "country:kr",
              }}
              keyboardShouldPersistTaps="handled"
              fetchDetails={true}
              onPress={onPlaceSelected}
              onFail={(error) => console.log(error)}
              onNotFound={() => console.log("주소를 찾을 수 없음")}
              keepResultsAfterBlur={true}
              enablePoweredByContainer={false}
              styles={{
                container: { flex: 0, position: 'absolute', width: '100%', zIndex: 1 },
                listView: { backgroundColor: 'white' }
              }}
            />
          </View>
        )}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          region={region}
          style={styles.map}
          onRegionChangeComplete={setRegion}
        >
          <Marker coordinate={region} image={customMarkerIMG}>
            <Callout>
              <View style={styles.calloutView}>
                <Text style={styles.calloutTitle}>현재 위치</Text>
                <Text style={styles.calloutAddress}>{address}</Text>
              </View>
            </Callout>
          </Marker>
        </MapView>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{address}</Text>
          <TouchableOpacity style={styles.locationButton} onPress={handleRegisterLocation}>
            <Image style={styles.locationBtn} source={locationBtnIMG}/>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteContainer: {
    width: '100%',
    zIndex: 1,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  calloutView: {
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    maxWidth: 250,
  },
  calloutTitle: {
    fontWeight: 'bold',
    padding: 0,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  calloutAddress: {
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  addressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'left',
    textAlignVertical: "center",
    marginTop: 20,
    marginBottom: 30,
    // backgroundColor: '#4285F4',
  },
  locationButton: {
    width: "100%",
    height: 50,
    // backgroundColor: '#4285F4',
  },
  locationBtn:{               // '이 위치로 설정' 버튼
    width: 340,
    height: 50,
    resizeMode: "contain",
  },
});

export default GoogleMapScreen;
