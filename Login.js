import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { setToken } from './token';


// 이미지
import BackgroundIMG from './Image/시골여행_배경사진.png';
import GoogleLogoIMG from './Image/구글_로고.png';
import NaverLogoIMG from './Image/네이버_로고.png';
import KakaoLogoIMG from './Image/카카오_로고.png';

GoogleSignin.configure({                                        // 구글 api confing
  webClientId: '412626397279-f3etaihguig05f60qdp84cpkk7oq5uhm.apps.googleusercontent.com',
  androidClientId: '412626397279-f3etaihguig05f60qdp84cpkk7oq5uhm.apps.googleusercontent.com',
  offlineAccess: true 
});

class LoginScreen extends Component {
  
  async postLoginData() {                              // axios로 서버에 로그인 data를 post하는 함수
    try {
      const response = await axios.post('http://223.130.131.166:8080/api/v1/auth/login', {
          email: "leejunho61@naver.com",
          socialId: "이준호",
          socialType: "KAKAO",
          name: "이준호",
          nickname: "이준호",
          birthYear: "1961",
          birthDay: "0712",
          phoneNum: "010-1234-5678",
      });
      console.log('제대로 보내졌나? 응답 메세지:', response.data);  

      const { accessToken, refreshToken } = response.data;
      await setToken(accessToken, refreshToken);

      this.props.navigation.navigate('메인');
    } catch (error) {
      console.error('응답실패:', error.response ? error.response.data : error.message);  
    }
  }




  googleLogin = async () => {                                   // 구글 로그인 api 연동 코드
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo); 
    }catch (error) {
        if (error.code === 'CANCELED') {
          alert('User cancelled the login process');
        } else if (error.code === 'SIGN_IN_FAILED') {
          alert('Google sign-in failed');
        } else {
          alert('Something went wrong with sign-in: ' + error.toString());
        }
      }
    };
  
  render() {
  
    return (
      <ImageBackground source={BackgroundIMG} style={styles.backgroundIMG}>
      <View style={styles.container}>
        <View style={styles.intro}>
          <Text style={styles.mainText}> 촌스러운 여행 </Text>
          <Text style={styles.introText}> 로컬여행의 패러다임을 </Text>
          <Text style={styles.introText}> 바꾸다 </Text>
        </View>
        <View style={styles.loginLayout}>
          <Text style={styles.loginText}> 로그인 </Text>
          <TouchableOpacity style={styles.googleLogin} onPress={() => this.googleLogin()}>
              <Image source={GoogleLogoIMG} style={styles.googleLogo}/>
              <Text style={styles.googleText}> 구글 로그인 </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.naverLogin}  onPress={() => this.props.navigation.navigate('메인')} >
              <Image source={NaverLogoIMG} style={styles.naverLogo}/>
              <Text style={styles.naverText}> 네이버 로그인 </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.kakaoLogin}  onPress={() => this.postLoginData()} >
              <Image source={KakaoLogoIMG} style={styles.kakaoLogo} />
              <Text style={styles.kakaoText}> 카카오 로그인 </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
    )
  }
}

// 스타일 시트

const styles = StyleSheet.create({
  container: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundIMG: {
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: 'cover',
  },
  intro: {
    flex: 0,
    padding: '4.6%',
    alignItems: 'left',
    width: '100%',
    height: '50%',
  },
  mainText: {
    marginTop: '32%',
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgba(40, 55, 61, 0.55)',
  },
  introText: {
    marginTop: '1%',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(40, 55, 61, 0.3)',
  },
  loginLayout: {
    flex: 0,
    width: '100%',
    height: '50%',
    alignItems: 'center',
  },
  loginText: {
    flex: 0,
    width: '100%',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgba(40, 55, 61, 0.44)',
  },
  googleLogin: {
    marginTop: '11%',
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row',
    height: '10.8%',
    width: '67%',
    backgroundColor: 'rgba(243, 249, 250, 1)',
    borderRadius: 50,
  },
  naverLogin: {
    marginTop: '11%',
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row',
    height: '10.8%',
    width: '67%',
    fontSize: 20,
    backgroundColor: 'rgba(3, 199, 90, 1)',
    borderRadius: 50,
  },
  kakaoLogin: {
    marginTop: '11%',
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row',
    height: '10.8%',
    width: '67%',
    backgroundColor: 'rgba(255, 238, 80, 1)',
    borderRadius: 50,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: '2.8%',
    textAlign: 'center',
  },
  naverLogo: {
    width: 22,
    height: 22,
    marginRight: '2.8%',
    textAlign: 'center',
  },
  kakaoLogo: {
    width: 22,
    height: 22,
    marginRight: '2.8%',
    textAlign: 'center',
  },
  googleText: {
    textAlign: 'center',
    marginBottom: '1.1%',
    fontSize: 20,
  },
  naverText: {
    textAlign: 'center',
    marginBottom: '1.1%',
    fontSize: 20,
    color: 'white',
  },
  kakaoText: {
    textAlign: 'center',
    marginBottom: '1.1%',
    fontSize: 20,
  },

});

export default LoginScreen;