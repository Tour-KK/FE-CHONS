import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './token';


//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import profileIMG from './Image/프로필_아이콘.png';

class MyInfoModifyScreen extends Component {
    
    state={
        name: '이민규',
        email: 'adaddwafw@naver.com',
        phoneNum: '010-1234-5678',
        profile: profileIMG,
    }

    componentDidMount() {                       // 렌더링하기전 DOM 에서 먼저 사용자 정보들 불러오기
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getUserInfoData();
        });
    }
    componentWillUnmount() {                    // 렌더링하기전 DOM 에서 먼저 사용자 정보들 불러오기
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

    async getUserInfoData() {                    // axios를 활용한 api통신을 통해 서버로부터 유저 데이터를 불러오는 함수
        try{
            const token = await getToken();
            const response = await axios.get('http://223.130.131.166:8080/api/v1/user',{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                const { name, email, phoneNum } = response.data;
                this.setState({
                    name: name || '정보 없음',  
                    email: email || '정보 없음',  
                    phoneNum: phoneNum || '정보 없음', 
                });
                console.log('응답받은 데이터:', response.data);
            }
        } catch(error) {
            if (error.response) {
              console.log('Error status:', error.response.status);
              console.log('Error data:', error.response.data);
              console.log('Error headers:', error.response.headers);
            } else if (error.request) {
              console.log('No response received:', error.request);
            } else {
              console.log('Error message:', error.message);
            }
            console.log('Error config:', error.config);
          }
    }

    async logout() {
        try {
          const accessToken = await AsyncStorage.getItem('userToken');
          const refreshToken = await AsyncStorage.getItem('refreshToken');
      
          const response = await axios.patch('http://223.130.131.166:8080/api/v1/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Authorization-refresh': `Bearer ${refreshToken}` 
            }
          });
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('refreshToken');
      
          console.log('로그아웃에 성공하였습니다!');
          this.props.navigation.navigate("로그인");
      
        } catch(error) {
            if (error.response) {
              console.log('Error status:', error.response.status);
              console.log('Error data:', error.response.data);
              console.log('Error headers:', error.response.headers);
            } else if (error.request) {
              console.log('No response received:', error.request);
            } else {
              console.log('Error message:', error.message);
            }
            console.log('Error config:', error.config);
          }
      }

  render() {
    return (
        <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>                      
                <View style={styles.tabBar}>
                    <TouchableOpacity style={styles.backBtnTouchView} onPress={() => this.props.navigation.goBack()}>
                        <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.myInfoText}> 내정보 수정</Text>
                </View>
                <View style={styles.grayHorizontalLine}/>

                <View style={styles.myInfoCard}>     
                    <View style={styles.rowLayout}>
                        <Image style={styles.profileIMG} source={this.state.profile}/>
                        <Text style={styles.profileName}> {this.state.name}님 </Text>
                    </View>     
                </View>

                <View style={styles.InfoView}>
                    <View style={styles.infoColumnLayout}>
                        <Text style={styles.infoText}>이름</Text>
                        <Text style={styles.infoInputText}> {this.state.name} </Text>
                    </View>

                    <View style={styles.infoColumnLayout}>
                        <Text style={styles.infoText}>이메일</Text>
                        <Text style={styles.infoInputText}> {this.state.email} </Text>
                    </View>

                    <View style={styles.infoColumnLayout}>
                        <Text style={styles.infoText}>연락처</Text>
                        <Text style={styles.infoInputText}> {this.state.phoneNum} </Text>
                    </View>
                </View>

            </View>
            <View style={styles.logoutView}>
                <TouchableOpacity onPress={() => this.logout()}>
                    <Text style={styles.logoutText}> 로그아웃 </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
    background: {               // 전체화면 세팅
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "white",
    },
    container: {                // 컴포넌트 가운데 정렬 View
        alignItems: 'center', 
    },
    tabBar: {                   // 상단 네비게이션 View
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 46,
        width: '100%',
        paddingLeft: "1.8%",
        // backgroundColor: "yellow",
    },
    backBtnTouchView:{          // 뒤로가기 버튼 터치 View
        width: 30,
        height: 30,
        // backgroundColor: "green",
        alignItems: "center",
        justifyContent: "center",
    },
    backBtnIcon: {              // 뒤로가기 버튼
        resizeMode: 'contain',
        width: 20,
        height: 20,
        marginTop: '5%',
        marginRight: '0.3%',
    },
    myInfoText: {               // 내정보 텍스트  
        marginBottom: '0.5%',
        fontSize: 22,
        color: "black",
        width: '88%',
    },  

    grayHorizontalLine: {       // 회색 가로선
        width: '100%',
        height: '0.3%',
        backgroundColor: '#BFBFBF',
        marginTop: "3.8%",
    },
    myInfoCard: {               // 프로필 카드 View
        width: '100%',
        alignItems: 'top',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'white',
    },
    rowLayout: {                         // 프로필사진 가운데 배열 (원래는 이름, 프로필 가로배열)
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 160,
        // backgroundColor: 'yellow',
    },
    profileIMG: {                       // 프로필 사진
        width: 90,
        height: 90,
        marginHorizontal: "5.5%",
        marginVertical: "3.8%",
        resizeMode: 'cover',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {                          // 프로필 이름 텍스트
        fontSize: 20,
        color: '#606060',
        fontFamily: 'Pretendard-Bold',
    },
    InfoView:{                           // 프로필 정보 담는 View (프로필사진 아래부분) 
        alignItems: 'center',
        width: '94%',
    },
    infoColumnLayout:{
        flexDirection: 'column',
        alignItems: 'Center',
        width:'92%',
        marginTop: "6.6%",
        // backgroundColor:'yellow',
    },
    infoText:{                           // 이름, 나이등 텍스트
        fontSize: 18,
        marginBottom: '7%',
        width: '28%',
        justifyContent: 'flex-start',  
        alignItems: 'flex-start',  
        color: "black"
        // backgroundColor:'white',
    },
    infoInputText: {                     // 박양순, 64세등 텍스트
        fontSize: 16,
        height: 46,
        width: '100%',
        marginBottom: '5%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor:'#F5F5F5',
        padding:"3%",
    },

    logoutView:{                         // 로그아웃 텍스트 담는 View
        marginTop: '1%',
        width: '92%',        
        alignItems: 'flex-end',
    },
    logoutText:{                        // 로그아웃 텍스트
        color: '#0AE090',
        fontSize: 18,
        marginTop: '3.3%',
    },
});

export default MyInfoModifyScreen;
