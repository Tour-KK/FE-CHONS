import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { getToken } from './token';


//이미지
import searchIconIMG from './Image/홈화면_검색아이콘.png';
import festivalIconIMG from "./Image/축제_아이콘2.png";
import looactionIconIMG from "./Image/검색화면_지역필터링아이콘.png";
import grayHorizontalLine from "./Image/회색가로선.png"


class HomeScreen extends Component {

    state = {                                          // 화면 구성에 필요한 데이터들 state로 관리
        searchText: '',
        addr1: '',
        addr2: '',

        festivals: [                                   // 목록에 띄울 주변 축제 컨텐츠들
            { id: 1, 
                name: "", 
                address:'', 
                imageUrl: [], 
                homepages: ""},
        ],
    }

    componentDidMount() {                               // 탭바를 통해 홈화면으로 이동시 화면 렌더링 전 현재위치 받아오게 세팅
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getCurrentLocation();
        });
    }
    componentWillUnmount() {                             // 탭바를 통해 홈화면으로 이동시 화면 렌더링 전 현재위치 받아오게 세팅
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

    getCurrentLocation = () => {
        Geolocation.getCurrentPosition(                                             // 현재 위치를 place api를 geolocation 라이브러리를 활용해 위도와 경도값으로 받아오기
          position => {
            console.log(position);
            this.fetchAddress(position.coords.latitude, position.coords.longitude);
          },
          error => {
            console.log(error.code, error.message);
            Alert.alert('위치 정보를 불러오는 도중 오류발생', `${error.message} (에러코드: ${error.code})`);
          },
          { enableHighAccuracy: false, timeout: 30000, maximumAge: 100000 }
        );
    };
    
    fetchAddress = (latitude, longitude) => {               // 구글 지도 api를 활용해 경도와 위도를 지역명으로 변경해 위치를 받아오는 함수
        const apiKey = 'AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE'; 
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=ko`;
    
        axios.get(url)
            .then(response => {
                if (response.data.results.length > 0) {
                    const addressComponents = response.data.results[0].address_components;
                    const administrativeArea = addressComponents.find(component => component.types.includes('administrative_area_level_1'));
                    const locality = addressComponents.find(component => component.types.includes('locality'));
                    const sublocality = addressComponents.find(component => component.types.includes('sublocality_level_1'));
    
                    const formattedArea = administrativeArea ? administrativeArea.long_name : '지역 정보 없음';
                    const formattedLocality = locality ? locality.long_name : (sublocality ? sublocality.long_name : '상세 지역 정보 없음');
    
                    this.setState({
                        addr1: formattedArea,
                        addr2: formattedLocality
                    }, () => {
                        this.fetchFestivals(this.state.addr1, this.state.addr2);              
                    });
    
                    console.log(`현재 위치: ${formattedArea}, ${formattedLocality}`);
                } else {
                    console.log('주소 변환 실패: 주소를 찾을 수 없습니다.', response);
                }
            })
            .catch(error => {
                console.error('API 요청 오류:', error);
                Alert.alert('API 요청 오류', error.message);
            });
    };
    
    async fetchFestivals(addr1, addr2) {                    // axios를 활용해 서버에서 축제정보를 불러오는 get요청을 보내는 함수
        try {
            const token = await getToken(); 
            console.log(addr1+""+addr2);
            const response = await axios.get(`http://223.130.131.166:8080/api/v1/festival/around?addr1=${encodeURIComponent(addr1)}&addr2=${encodeURIComponent(addr2)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
    
            console.log('Festivals Response:', response.data);
            const festivals = response.data.map(item => ({
                id: item.contentId, 
                name: item.title,
                address: item.address,
                imageUrl: { uri: item.imageUrl }, 
                homepages: item.tel, 
            }));

            this.setState({ festivals });
        } catch (error) {
            console.error('Festivals Fetch Error:', error);
            if (error.response) {
                console.error('Error data:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        }
    }
    
    onChangeInput = (event)=>{                                                      // 검색창 text값 수정가능하게 하기
        const trimmedText = event.replace(/\s+$/, '');
        this.setState({
            searchText: trimmedText,
        })
    }

    goToHomeSearch = () => {                   // 검색창에 입력한 textInput값을 같이 전달하여 홈전용 검색화면으로 전환 
        this.props.navigation.navigate('홈검색', { searchText: this.state.searchText, changeFavoriteState: this.changeFavoriteState});
    }
   
    festivalInfoDelivery = (festivalId) => {             // 축제 컨텐츠 클릭시 해당 축제 정보를 같이 보내 축제정보화면으로 이동
        this.props.navigation.navigate('축제정보', { festivalId: festivalId });
    }

  render() {
    return (
    <ScrollView style={styles.background} showsVerticalScrollIndicator={false} animationType="slide">   
        <View style={styles.container}>
            <LinearGradient colors={['#0AE090', '#0AE0C6']} style={styles.linearGradient} start={{x:0, y:0}} end={{x:1, y:0}} >
                <View style={styles.search}>
                    <Image style={styles.searchIcon} source={searchIconIMG}/>  
                    <TextInput style={styles.input} 
                        placeholder='어디로 떠나고 싶으신가요?' 
                        placeholderTextColor="#979797"
                        value={this.state.searchText} 
                        onChangeText={this.onChangeInput}
                        onSubmitEditing={this.goToHomeSearch}/>
                </View>
            </LinearGradient> 
                <View style={styles.contents}>
                    <View style={styles.festivalTitleView}>
                        <Image style={styles.festivalIcon} source={festivalIconIMG}/>  
                        <Text style={styles.ContentText}>주변 축제 정보</Text>
                        <Image style={styles.LocationIcon} source={looactionIconIMG}/>  
                        <Text style={styles.currentLocationText}>{this.state.addr2}</Text>
                    </View>
                    <ScrollView style={styles.todayContents} horizontal={true} showsHorizontalScrollIndicator={false}>
                        {this.state.festivals.map((festival, index) => (    
                         <View key={`${festival.id}-${index}`} style={styles.content}>
                            <Image source={festival.imageUrl} style={styles.festivalIMG}/>
                            <TouchableOpacity style={styles.TouchView} onPress={() => this.festivalInfoDelivery(festival.id)} >
                                <View style={styles.houseReviewView}>
                                    <Text style={styles.festivalName}>{festival.name}</Text>
                                </View>
                                <Text style={styles.festivalAddress}>{festival.address}</Text>
                            </TouchableOpacity>
                         </View>
                       ))}
                    </ScrollView>
                    <Image style={styles.grayHorizontalLine} source={grayHorizontalLine}/>
                    <View style={styles.barMargin}><Text> </Text></View>
                </View>
        </View>
    </ScrollView>
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
    background: {                   // 전체화면 세팅
        flex: 1,
        backgroundColor: 'white',
    },
    linearGradient: {               // 그라데이션 
        width: '100%',
        height: '16%',
        justifyContent: 'center',
    },  
    container: {                    // 컴포넌트들 가운데 정렬시키는 View
        alignItems: 'center', 
    },
    search: {                           // 검색창 View
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '90%',
        height: 45,
        borderRadius: 50, 
        backgroundColor: 'white',
        elevation: 5, 
        margin: '5%',
    },
    searchIcon: {                       // 검색 아이콘         
        marginLeft: 15,  
        width: 20,
        height: 20,
        opacity: 0.5,
        resizeMode: 'contain',
    },
    input: {                            // 검색창 텍스트 input 
        flex: 1,  
        fontSize: 16,
        paddingLeft: 10,  
        paddingRight: '5%',
        color: '#979797',
    },
    contents: {                     // 컨텐츠들 남는 ScrillView
        flex: 1,
        width: 340,
        height:'100%',
        // backgroundColor: 'gray'
    },
    festivalTitleView: {            // '주변 축제 정보' 텍스트 아이콘과 텍스트 가로정렬시키는 View
        marginTop: '5.5%',
        marginLeft: '2.2%',
        flexDirection: "row",
        alignItems: "center", 
        // backgroundColor: 'gray',
    },
    festivalIcon:{                   // 주병 축제정보 왼쪽 아이콘
        width: 28,
        height: 28,
        alignContent: "center",
        // backgroundColor: 'yellow',
    },
    ContentText: {                   // 컨텐츠 주제 Text
        fontSize: 22,
        height: 40,
        marginLeft: '3.3%',
        fontFamily: 'Pretendard-Bold', 
        textAlignVertical: "center",
        // backgroundColor: 'green',
    },
    LocationIcon:{                  // 현재위치 표시 아이콘 (용인시옆 아이콘)
        marginLeft: '25%',
        width: 14,
        height: 16,
        resizeMode: 'contain',
        alignContent: "center",
    },
    currentLocationText: {          // 현재위치 표시 텍스트 (용인시 텍스트)
        fontFamily: 'Pretendard-Bold', 
        fontSize: 16,
        color: '#00D282',
        marginLeft: '1.4%',
    },
    todayContents:{                 // 오늘의 추천코스 컨텐츠 담는 View
        flex: 1,
        width: 340,
        height: 330,
        borderRadius: 20, 
        marginTop: '3%',
      //  backgroundColor:'gray'
    },
    content: {                      // 오늘의 추천코스 컨텐츠담는 스크롤 한개단위 View
        flex: 1,
        width: 200,
        padding: 8,
        // backgroundColor:'yellow'
    },
    TouchView:{                     // 터치 View 이미지포함안되게 지정하는 View
        width:'100%',
        // backgroundColor: 'gray',
    },
    festivalIMG: {                          // 축제 이미지
        flex: 0.85,
        alignItems: 'center',
        borderRadius: 20, 
        width: '98%',
        resizeMode: 'cover',
    },
    festivalName: {                        // 축제명 텍스트
        width:'100%',
        textAlign: 'left',
        marginTop: '3.3%',
        marginLeft: '2.2%',
        fontSize: 16,
        fontFamily: 'Pretendard-Bold', 
        // backgroundColor: 'yellow',
    },  
    festivalAddress: {                   // 축제 상세 주소
        textAlign: 'left',
        fontSize: 12,
        marginTop: '3.3%',
        marginLeft: '2.2%',
        // backgroundColor: 'green',
    },
    grayHorizontalLine:{
        width: '100%',
        height: '1%',
        resizeMode: 'cover',
    },
    barMargin: {                          // ScrollView 탭바에 대한 마진
        height: 80,
    },
});

export default HomeScreen;