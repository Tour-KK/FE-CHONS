import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { getToken, refreshAccessToken } from './token';

//이미지
import profileIMG from './Image/프로필_아이콘.png';
import nextBtnIMG from './Image/프로필더보기_아이콘.png';

class MyInfoScreen extends Component {
    
    state={
        name: '이민규',
    }

    componentDidMount() {                         // 렌더링전에 DOM 에서 사용자 정보 먼저 불러오기
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getUserInfoData();
        });
    }
    componentWillUnmount() {                      // 렌더링전에 DOM 에서 사용자 정보 먼저 불러오기
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
                    name: name || '정보 없음',  
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
        <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>                      
                <View style={styles.myInfoCard}>               
                    <View style={styles.infoText}>
                        <Text style={styles.nameText}>{this.state.name}<Text style={styles.nameSubText}> 님,</Text></Text>
                        <Text style={styles.nameInfo}>환영합니다! </Text>
                        <TouchableOpacity style={styles.profileModifyView} onPress={() => this.props.navigation.navigate('내정보수정')}>
                            <Text style={styles.profileModifyText}>프로필 편집하기</Text>
                            <Image style={styles.profileModifyBtn} source={nextBtnIMG}/>
                        </TouchableOpacity>
                    </View>
                    <Image style={styles.profileIMG} source={profileIMG}/>
                </View>

                <TouchableOpacity style={styles.settingOption}  onPress={() => this.props.navigation.navigate('숙소등록')}>
                    <Text style={styles.optionText}> 숙소정보 등록하기</Text>    
                    <Image style={styles.nextBtn} source={nextBtnIMG}/>
                </TouchableOpacity>                                    
                <TouchableOpacity style={styles.settingOption} onPress={() => this.props.navigation.navigate('숙소정보수정')}>
                    <Text style={styles.optionText}> 숙소정보 수정하기</Text>    
                    <Image style={styles.nextBtn} source={nextBtnIMG}/>
                </TouchableOpacity>                                    
                <TouchableOpacity style={styles.settingOption} >
                    <Text style={styles.optionText}> 나의 예약내역 보기</Text>    
                    <Image style={styles.nextBtn} source={nextBtnIMG}/>
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
        backgroundColor: "#F5F5F5",
    },
    container: {                // 컴포넌트 가운데 정렬 View
        alignItems: 'center', 
    },
    myInfoCard: {               // 프로필 카드 View
        width: "100%",
        height: 160,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        marginBottom: '3.3%',
    },
    profileIMG: {               // 프로필 사진
        width: 90,
        height: 90,
        resizeMode: 'cover,',
        margin: '3.5%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {                 // 프로필 텍스트 담는 View
        width: '54%',
        height: '80%',
        marginLeft: '8.8%',
        justifyContent: "center",        
        // backgroundColor: "gray",
    },
    nameText:{              // 프로필 이름 텍스트
        fontSize: 26,
        color: '#0AE090',
        fontWeight: '500',
    },
    nameSubText:{           // 프로필 이름 옆의 ',님' 서브 텍스트
        fontSize: 22,
        color: 'black',
        fontWeight: '400',
    },
    nameInfo: {             // 프로필 이름 아래 '반갑습니다!' 텍스트
        fontSize: 22,
        color: 'black',
        fontWeight: '400',
    },
    profileModifyView:{     // 프로필 수정하기 버튼 + 아이콘 담는 View
        height: 30,
        width: '56%',
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: 'green'
    },
    profileModifyText:{     // 프로필 편집하기 버튼 텍스트
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
    },
    profileModifyBtn:{      // 프로필 편집하기 버튼
        marginLeft: "0.4%",
        width: 12,
        height: 12,
    },

    settingOption:{         // 설정 컨텐츠들
        flexDirection: "row",
        backgroundColor: 'white',
        width: '90%',
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: '2%',
        marginTop: '4.4%',
    },
    optionText: {           // 설정 컨텐츠들 텍스트             
        fontSize: 20,
        marginBottom: '2%',
        marginLeft: '2%',
    },
    nextBtn: {              // 옵션 더보기 버튼
        width: 16,
        height: 16,
        marginLeft: '42%',
        // backgroundColor: "green"
    },  
});

export default MyInfoScreen;
