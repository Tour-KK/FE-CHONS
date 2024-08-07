import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { getToken } from './token';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import reviewIconIMG from './Image/회색_별_아이콘.png';
import houseIMG1 from './Image/여행지1.png';
import houseIMG2 from './Image/여행지2.png';
import houseIMG3 from './Image/여행지3.png';
import houseIMG4 from './Image/여행지4.png';
import houseIMG5 from './Image/여행지5.png';
import houseIMG6 from './Image/여행지6.png';
import houseIMG7 from './Image/여행지7.png';
import houseIMG8 from './Image/여행지8.png';
import houseIMG9 from './Image/여행지9.png';



class FavoriteListScreen extends Component {

    state = {
        places: [                                   // 목록에 띄울 데이터들 관
            {
                id: "",
                name: "",
                address: "",
                price: 0,
                imageUri: [], 
                reviewScore: 0, 
                reviewCount: 0, 
                favoriteState: false,
                reservationState: false, 
                clearReservation: true, 
            },
        ],
    };

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getFavoriteData();
        });
    }
    
    componentWillUnmount() {
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

    async getFavoriteData()  {                          // 즐겨찾기, 나의 예약현황 데이터 axios를 활용한 api 통신을 통해 서버로 부터 불러오기
        try {
            const token = await getToken();
    
            const response = await axios.get('http://223.130.131.166:8080/api/v1/house/list/like',{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            
            const data = response.data.map(house => ({
                id: house.id,
                name: house.hostName,
                address: house.address,
                price: house.pricePerNight,
                imageUri: house.photos, 
                reviewScore: house.starAvg, 
                reviewCount: house.reviewNum, 
                favoriteState: house.liked, 
                reservationState: false, 
                clearReservation: false 
            }));

            this.setState({ places: data });

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

    

    changeFavoriteState = async (id) => {                    // 즐겨찾기시 체크표시후 서버 api로 상태보내기
        const updatedPlaces = this.state.places.map(place => {
            if (place.id === id) {
                return { ...place, favoriteState: !place.favoriteState };
            }
            return place;
        });
    
        this.setState({ places: updatedPlaces });
    
        const currentPlace = updatedPlaces.find(place => place.id === id);
        
        try {
            const token = await getToken();  
            
            if (currentPlace.favoriteState) {
                const response = await axios.post(`http://223.130.131.166:8080/api/v1/like/${id}`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`${currentPlace.name}님의 숙소 즐겨찾기 추가`, response.data);
            } else {
                const response = await axios.delete(`http://223.130.131.166:8080/api/v1/like/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`${currentPlace.name}님의 숙소 즐겨찾기 해제`, response.data);
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
    };
    
    

    placeInfoDelivery = (houseId) => {             // 숙소 컨텐츠 클릭시 해당 숙소 정보를 같이 보내 숙소정보화면으로 이동
        this.props.navigation.navigate('숙소정보', { houseId: houseId });
    }
    
    
    render() {
        let ReservationText = '예약완료' 
        let NoReservationText = '예약 요청중..' 

        const filteredPlaces =  this.state.places.filter(place => place.favoriteState);

        return (
        <LinearGradient
        colors={['#E8ECFF', '#FFFFFF']} 
        style={styles.linearGradient} 
        start={{ x: 0, y: 0.8 }} 
        end={{ x: 0, y: 0}} >
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.tabBar}>            
                    <TouchableOpacity style={styles.backBtn} onPress={() => this.props.navigation.navigate('홈')}>
                        <Image style={styles.backBtnIcon} source={backBtnIMG}/>  
                    </TouchableOpacity>
                    <Text style={styles.myFavoriteListText}> 내가 찜한 숙소 </Text>
                </View>
                {filteredPlaces.map((place) => (    
                    <TouchableOpacity key={place.id} style={styles.content} onPress={() => this.placeInfoDelivery(place.id)}>
                        {place.imageUri.length > 0 && (
                            <Image source={{uri : place.imageUri[0]}} style={styles.houseIMG}/>
                        )}
                        <View style={styles.Info}>
                            <Text style={styles.houseName}>{place.name}님의 거주지</Text>
                            <Text style={styles.houseAddress}>{place.address}</Text>
                            <View style={styles.houseReviewView}>
                                <Image style={styles.reviewIcon} source={reviewIconIMG} />
                                <Text style={styles.houseReview}>{place.reviewScore}</Text>
                                <Text style={styles.houseReview}>({place.reviewCount})</Text>
                            </View>
                            <Text style={styles.housePrice}>₩{place.price}원</Text>
                        </View>
                        <TouchableOpacity onPress={() => this.changeFavoriteState(place.id)}>
                            <Image style={styles.favoriteIcon} source={place.favoriteState ? checkFavoriteIconIMG : FavoriteIconIMG} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}

                    {
                        this.state.places.filter(place => place.reservaionState).length > 0 && (
                            <Text style={styles.myReservationListText}> 나의 예약 현황 </Text>
                        )
                    }
            
                    {this.state.places.filter(place => place.reservaionState).map((place) => (
                    <TouchableOpacity style={styles.content} onPress={() => this.placeInfoDelivery(place.houseID)} >
                        <Image source={place.imageUrl} style={styles.houseIMG}/>
                        <View key={place.houseID} style={styles.Info}>
                            <View style={styles.Info}>
                                <Text style={styles.houseName}>{place.name}</Text>
                                <Text style={styles.address}>{place.address}</Text>
                                <View style={styles.houseReviewView}>
                                    <Image style={styles.reviewIcon} source={reviewIconIMG} />
                                    <Text style={styles.houseReview}>{place.reviewScore}</Text>
                                    <Text style={styles.houseReview}>({place.reviewCount})</Text>
                                </View>
            
                                <Text style={styles.reservationStateText}> {(place.clearReservation) ? ReservationText : NoReservationText }</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => this.changeFavoriteState(place.houseID)}>
                            <Image style={styles.favoriteIcon} source={place.favoriteState ? checkFavoriteIconIMG : FavoriteIconIMG} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    ))}
            

                <View style={styles.barMargin}><Text> </Text></View>
            </View>
            </ScrollView>
        </LinearGradient> 
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
    background: {                   // 전체화면 설정
        flex: 1,
    },
    linearGradient: {               // 그라데이션
        flex: 0,
        width: '100%',
        height: '100%',
    },
    container: {
        alignItems: 'center', 
    },
    tabBar: {                       // 상단 네비게이션 View
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: '100%',
    },
    backBtnIcon: {                   // 뒤로가기 버튼
        resizeMode: 'contain',
        opacity: 0.38,
        width: 24,
        height: 24,
        marginTop: '5%',
        marginRight: '0.3%',
    },
    myFavoriteListText: {           // 내가 찜한 숙소 텍스트  
        marginBottom: '0.5%',
        fontSize: 26,
        width: '88%',
    },  
    content: {                      // 내가 찜한 숙소 컨텐츠들 
        width: 370,
        height: 120,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        marginTop: '3.3%',
        borderRadius: 20,
        elevation: 1,
    },
    houseIMG: {                      // 숙소 이미지
        alignItems: 'center',
        borderRadius: 10, 
        width: 100,
        height: 100,
        resizeMode: 'cover',
        margin: '3%',
    },
    Info: {                          // 숙소데이터 담는 View
        flex: 0,
        width: '55%',
        height: '100%',
        // backgroundColor:'gray'
    },
    houseName: {                        // 숙소명 텍스트
        width: 200,
        textAlign: 'left',
        fontSize: 20,
        marginTop: '3.3%',
        color:'#393939',
        // backgroundColor: 'yellow',
    },
    houseAddress: {                  // 찜한숙소 상세 주소
        width: 200,
        textAlign: 'left',
        fontSize: 12,
        marginLeft: '2%',
        marginTop: '1.1%',
        color: '#777777',
        // backgroundColor: 'yellow',
    },
    houseReviewView: {              // 평점 아이콘, 평점 텍스트 담는 View
        flexDirection: 'row',
        alignItems:'center',
        marginTop: '1.1%',  
        // backgroundColor: 'gray',
    },
    houseReview: {                  // 찜한숙소 평점및 리뷰 갯수
        textAlign: 'left',
        fontSize: 12,
        marginLeft: '1.5%',
        color: '#777777',
        // backgroundColor: 'yellow',
    },
    reviewIcon:{                    // 리뷰 별 아이콘
        marginLeft: '2.2%',
        width: 11,
        height: 11,
        // backgroundColor: 'yellow',
    },
    housePrice:{                    // 숙소 가격
        marginTop: '2.2%',
        fontSize: 22,
        marginLeft: '3.3%',
        color: '#9E9E9E',
        // fontWeight: 'bold',
    },
    favoriteIcon: {                 // 찜버튼 아이콘
        width: 24,
        height: 24,
        resizeMode: 'cover',
    },
    reservationStateText: {         // 예약 요청중, 예약완료 텍스트
        marginTop: '5.5%',
        fontSize: 18,
        color: '#AFAFAF',
    },
    
    myReservationListText: {        // 나의 예약 현황 제목 텍스트
        marginTop: '5.5%',
        marginBottom: '2.2%',
        fontSize: 26,
        width: '88%',
    },


    barMargin: {                    // 스크롤 여백
        height: 75,
    },
});

export default FavoriteListScreen;