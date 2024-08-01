import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { getToken, refreshAccessToken } from './token';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import profileIMG from './Image/프로필_아이콘.png';
import nextBtnIMG from './Image/Next버튼_아이콘.png';

class MyInfoScreen extends Component {
    
    state={
        name: '',
        email: '',
        phoneNum: '',
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getUserInfoData();
        });
    }
    
    componentWillUnmount() {
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }


    async getUserInfoData() {                      // axios를 활용한 api통신을 통해 서버로부터 유저 데이터를 불러오는 함수
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
                     name: name, 
                     email: email,
                     phoneNum : phoneNum, 
                    });
                    console.log('응답받은 데이터:', response.data);
            }

        }catch (error) {
            if (error.response && error.response.status === 401) {              // 토큰 재발급 예외처리 후 다시 실행
                try {
                  const newToken = await refreshAccessToken();
                  const response = await axios.get('http://223.130.131.166:8080/api/v1/user', {
                    headers: {
                      'Authorization': `Bearer ${newToken}`
                    }
                  });
                  console.log('응답받은 데이터:', response.data);
                  return response.data;
                } catch (refreshError) {
                  console.error('토큰 갱신 및 데이터 불러오기 실패:', refreshError);
                }
              } else {
                console.error('데이터 불러오기 실패:', error);
              }
        }
    }





  render() {
    return (
        <LinearGradient
        colors={['#E8ECFF', '#FFFFFF']} 
        style={styles.linearGradient} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 0, y: 0.8}} >
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>                      
                <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Image style={styles.backBtnIcon} source={backBtnIMG}/>  
                    </TouchableOpacity>
                    <Text style={styles.myInfoText}> 내정보 </Text>
                </View>

                <View style={styles.myInfoCard}>               
                    <TouchableOpacity style={styles.profileIMGView}>
                        <Image style={styles.profileIMG} source={profileIMG}/>
                    </TouchableOpacity>
                    <View style={styles.infoText}>
                        <Text style={styles.nameInfo}> {this.state.name} </Text>
                        <Text style={styles.detailInfo}> {this.state.email} </Text>
                        <Text style={styles.PhoneNumberInfo}> 연락처: {this.state.phoneNum} </Text>
                    </View>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('내정보수정')}>
                        <Image style={styles.nextBtnIcon} source={nextBtnIMG}/>  
                    </TouchableOpacity>
                </View>

                <Text style={styles.settingText}> 설정 </Text>   

                <TouchableOpacity style={styles.settingOption}  onPress={() => this.props.navigation.navigate('숙소등록')}>
                    <Text style={styles.optionText}> 숙소정보 등록하기</Text>    
                </TouchableOpacity>                                    
                <TouchableOpacity style={styles.settingOption} onPress={() => this.props.navigation.navigate('숙소정보수정')}>
                    <Text style={styles.optionText}> 숙소정보 수정하기</Text>    
                </TouchableOpacity>                                    
                <TouchableOpacity style={styles.settingOption}>
                    <Text style={styles.optionText} onPress={() => this.props.navigation.navigate('후기작성')}> 후기 작성하러가기 </Text>    
                </TouchableOpacity>                                    

            </View>
            </ScrollView>
        </LinearGradient> 
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
    background: {               // 전체화면 세팅
        flex: 1,
    },
    linearGradient: {           // 그라데이션
        flex: 0,
        width: '100%',
        height: '100%',
    },
    container: {                // 컴포넌트 가운데 정렬 View
        alignItems: 'center', 
    },
    tabBar: {                   // 상단 네비게이션 View
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: '100%',
    },
    backBtnIcon: {              // 뒤로가기 버튼
        resizeMode: 'contain',
        opacity: 0.38,
        width: 26,
        height: 26,
        marginTop: '5%',
        marginRight: '0.3%',
    },
    myInfoText: {               // 내정보 텍스트  
        marginBottom: '0.5%',
        fontSize: 28,
        width: '88%',
    },  
    myInfoCard: {               // 프로필 카드 View
        width: 370,
        height: 120,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        marginTop: '2.8%',
        borderRadius: 20,
    },
    profileIMGView:{            // 프로필 사진 담는 View
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'gray',
        width: 80,
        height: 80,
        borderRadius: 50,
        borderWidth: 1.5,
        margin: '3.5%',
    },
    profileIMG: {               // 프로필 사진
        borderRadius: 50,
        width: '100%',
        height: '100%',
        resizeMode: 'cover,',
        margin: '3.5%',
    },
    infoText: {                 // 프로필 정보 텍스트 담는 View
        width: '62%',
        height: '80%',
        marginLeft: '1.5%',
    },
    nextBtnIcon:{           // 프로필 더 보기 버튼
        resizeMode: 'contain',
        opacity: 0.6,
        width: 26,
        height: 26,
        marginRight: '3%',
    },
    nameInfo: {             // 프로필 이름 텍스트
        fontSize: 17,
        color: 'black',
        marginTop: '7%',
    },
    detailInfo: {           // 프로필 세부정보
        marginTop: '2.5%',
        fontSize: 10,       
    },

    PhoneNumberInfo: {      // 프로필 연락처 정보
        marginTop: '1%',
        fontSize: 10,       
    },
    settingText: {          // 설정 텍스트 
        marginTop: '8%',
        marginBottom: '2%',
        fontSize: 28,
        width: '86%',
    },
 
    settingOption:{         // 설정 컨텐츠들
        backgroundColor: 'white',
        width: '88%',
        height: 45,
        borderRadius: 50,
        alignItems: 'left',
        justifyContent: 'center',
        margin: '2%',
    },
    optionText: {           // 설정 컨텐츠들 텍스트             
        fontSize: 20,
        marginBottom: '2%',
        marginLeft: '2%',
    },
});

export default MyInfoScreen;
