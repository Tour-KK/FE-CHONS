import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login, getProfile as getKakaoProfile,} from "@react-native-seoul/kakao-login";
import NaverLogin, { GetProfileResponse, NaverLoginResponse } from '@react-native-seoul/naver-login';
import axios from 'axios';
import { setToken } from './token';


// 이미지
import BackgroundIMG from './Image/시골여행_배경사진.png';
import GoogleLogoIMG from './Image/구글_로고.png';
import NaverLogoIMG from './Image/네이버_로고.png';
import KakaoLogoIMG from './Image/카카오_로고.png';

GoogleSignin.configure({                                        // 구글 api confing
  webClientId: '412626397279-lhjdpoasbnh9qejao9v9fkl6hsempkkl.apps.googleusercontent.com',
  offlineAccess: true 
});

class LoginScreen extends Component {

  componentDidMount() {
    NaverLogin.initialize({
        appName: 'KONKUK_TOUR',
        consumerKey: '18XLfToQbYAywdZuhuNz',
        consumerSecret: 'k0C3kCR9Mw',
    });
  }
  
  postLoginData = async (userInfo, socialType) => { // axios로 서버에 로그인 data를 post하는 함수
    try {
      console.log(userInfo);
      console.log(socialType);
      console.log(userInfo.user.email);
      console.log(userInfo.user.id);
      console.log(userInfo.user.name);
      console.log(userInfo.user.givenName);

      const response = await axios.post('http://223.130.131.166:8080/api/v1/auth/login', {
        email: userInfo.user.email,
        socialId: userInfo.user.id,
        socialType: socialType,
        name: userInfo.user.name,
        nickname: userInfo.user.givenName,
        birthYear: "", 
        birthDay: "",
        phoneNum: 0,
      });
      console.log('제대로 보내졌나? 응답 메세지:', response.data);

      const { accessToken, refreshToken } = response.data;
      await setToken(accessToken, refreshToken);

      this.props.navigation.navigate('메인');
    } catch (error) {
      console.error('응답실패:', error.response ? error.response.data : error.message);
    }
  }

  googleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const socialType = "GOOGLE";
  
      await this.postLoginData({
        user: {
          email: userInfo.user.email,      
          id: userInfo.user.id,             
          name: userInfo.user.name,         
          givenName: userInfo.user.givenName 
        }
      }, socialType);
    } catch (error) {
      if (error.code === 'CANCELED') {
        alert('사용자가 로그인창을 닫았습니다.');
      } else if (error.code === 'SIGN_IN_FAILED') {
        alert('구글 로그인에 실패했습니다.');
      } else {
        alert('구글 로그인 중 에러가 발생하였습니다.: ' + error.toString());
      }
    }
  };
  
  naverSignIn = async () => {
    try {
      const { successResponse, failureResponse } = await NaverLogin.login();
      const socialType = "NAVER";

      if (successResponse) {
        console.log('Naver Login Success:', successResponse);
        
        const profileResult = await NaverLogin.getProfile(successResponse.accessToken);
        console.log('Naver Profile Data:', profileResult);
  
        const userInfo = {
          user: {
            email: profileResult.response.email || '',  
            id: profileResult.response.id || '',
            name: profileResult.response.name || '',
            givenName: profileResult.response.nickname || ''  
          }
        };
  
        await this.postLoginData(userInfo, socialType);
      } else if (failureResponse) {
        console.error('Naver Login Failed:', failureResponse);
      }
    } catch (error) {
      console.error('Naver Login Error:', error);
    }
  };
  



  kakaoSignIn = async () => {
    try {
      const token = await login(); // 카카오 로그인
      console.log(JSON.stringify(token));
      const profile = await getKakaoProfile(); // 프로필 정보 가져오기
      console.log(JSON.stringify(profile));
      const socialType = "KAKAO";
  
      await this.postLoginData({
        user: {
          email: profile.email,  
          id: profile.id,        
          name: profile.name,    
          givenName: profile.nickname
        }
      }, socialType);
    } catch (err) {
      console.error("login err", err);
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
          <TouchableOpacity style={styles.googleLogin} onPress={() => this.googleSignin()}>
              <Image source={GoogleLogoIMG} style={styles.googleLogo}/>
              <Text style={styles.googleText}> 구글 로그인 </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.naverLogin} onPress={() => this.naverSignIn()}> */}
          <TouchableOpacity style={styles.naverLogin}  onPress={() => this.props.navigation.navigate('메인')} >
              <Image source={NaverLogoIMG} style={styles.naverLogo}/>
              <Text style={styles.naverText}> 네이버 로그인 </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.kakaoLogin} onPress={() => this.kakaoSignIn()}>
          {/* <TouchableOpacity style={styles.kakaoLogin}  onPress={() => this.props.navigation.navigate('카카오API')} > */}
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