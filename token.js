import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const setToken = async (accessToken, refreshToken) => {       // 토큰 AsyncStorage 라이브러리에 저장하는 함수
//     try {
//       await AsyncStorage.setItem('userToken', accessToken);          
//       await AsyncStorage.setItem('refreshToken', refreshToken);        
//     } catch (error) {
//       console.error('토큰 저장 실패:', error);
//     }
// };

export const setToken = async (accessToken, refreshToken) => {
  try {
    if (accessToken) {
      await AsyncStorage.setItem('userToken', accessToken);
    } else {
      console.log('Access token is undefined or null, not setting');
    }
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    } else {
      console.log('Refresh token is undefined or null, not setting');
    }
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
};


export const getToken = async () => {               // 토큰을 AsyncStorage 라이브러리의 "userToken" 키값에 저장한 토큰 값 가져오는 함수
    try{
        const token = await AsyncStorage.getItem("userToken");
        return token;
    } catch (error) {
        console.log( '토큰 불러오기 실패' + error);
      }
    }
    
    
export const refreshAccessToken = async () => {                      // access 토큰을 재발급 받는 함수
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('refreshToken 없음');
    }
    // console.log( '기존 리프레시 토큰: ' + refreshToken);
    
    const response = await axios.post('http://223.130.131.166:8080/api/v1/auth/reissue', {}, {
      headers: {
        'Authorization-refresh': `Bearer ${refreshToken}` 
      }
    });
    
    // const responseData = response.headers;
    let newAccessToken = response.headers['authorization'];
    let newRefreshToken = response.headers['authorization-refresh'];

    newAccessToken = newAccessToken.replace('Bearer ', '');
    newRefreshToken = newRefreshToken.replace('Bearer ', '');


    // console.log( '서버 response: ' + responseData);
    console.log( '새로운 엑세스 토큰: ' + newAccessToken);
    console.log( '새로운 리프레시 토큰: ' + newRefreshToken);

    if (newAccessToken) {
      await setToken(newAccessToken, newRefreshToken);
      return newAccessToken;
    } else {
      throw new Error('서버로부터 토큰을 재발급받지 못했습니다.');
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
};