import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';


GoogleSignin.configure({										              // 구글 로그인 서비스 초기화
  webClientId: '412626397279-lhjdpoasbnh9qejao9v9fkl6hsempkkl.apps.googleusercontent.com',
  offlineAccess: true
});

const GoogleAPIScreen = () => {
  const googleSignin = async () => {					        		// 구글 계정 로그인 함수
    try {
      await GoogleSignin.hasPlayServices(); 			    		// 안드로이드 기기에서 Google Play 서비스를 사용할 수 있는지 확인
      const userInfo = await GoogleSignin.signIn();				// Google 계정선택 로그인창 표시
      console.log(userInfo);								            	// 로그인 한 사용자 데이터 확인용 테스트 코드
      alert("이름: " + userInfo.user.name +"\n" 
        +"이메일: "+ userInfo.user.email +"\n" 
        +"id: "+ userInfo.user.id +"\n" 
        +"socialType: GOOGLE \n" 
        +"프로필 사진: "+ userInfo.user.photo +"\n"
      );
    } catch (error) {
      console.error(error);
    }
  };

  const googleSignout = async () => {					      		// 구글 계정 로그아웃 함수
    try {
      await GoogleSignin.signOut();							      	// 구글 계정 로그아웃처리후, 로컬 세션 제거
      alert('로그아웃되었습니다.');								        // 로그아웃처리 제대로 완료되었는지 테스트 코드
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
