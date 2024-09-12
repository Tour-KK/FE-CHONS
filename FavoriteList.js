import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView} from 'react-native';
import axios from 'axios';
import { getToken } from './token';

//이미지
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import reviewIconIMG from './Image/평점_별아이콘.png';
import noImage from './Image/이미지없음표시.png';
import locationFilterGrayIcon from './Image/검색화면_클릭전_지역필터링아이콘.png';

class FavoriteListScreen extends Component {

    state = {
        formattedAddresses: {},

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
            },
        ],
    };

    componentDidMount() {                           // 렌더링전에 DOM에서 축제정보들 먼저 불러오기
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getFavoriteData();
        });
    }
    componentWillUnmount() {                        // 렌더링전에 DOM에서 축제정보들 먼저 불러오기
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
                formattedAddress: this.formatAddress(house.address),
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
    

    formatAddress(address) {                        // 정규식을 활용하여 도로명을 주소명으로 바꾸기
        const regex = /([\S]+[도시])\s*([\S]+[구군시])?\s*([\S]*[동리면읍가구])?/;
        const match = address.match(regex);
        console.log("Original Address:", address);
        console.log("Matched Segments:", match);
        return match ? match.slice(1).join(' ') : "주소를 불러오는데 문제가 발생하였습니다.";
    }
    
    render() {
        const filteredPlaces =  this.state.places.filter(place => place.favoriteState);

        return (
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.tabBar}>            
                    <Text style={styles.myFavoriteListText}>내가 찜한 숙소</Text>
                </View>
                {filteredPlaces.map((place) => (    
                    <TouchableOpacity key={place.id} style={styles.content} onPress={() => this.placeInfoDelivery(place.id)}>
                        {place.imageUri.length > 0 ? (
                            <Image source={{uri : place.imageUri[0]}} style={styles.houseIMG}/>
                        ): ( <Image source={noImage} style={styles.houseIMG}/>)}
                        <View style={styles.Info}>
                            <Text style={styles.houseName}>{place.name}님의 거주지</Text>
                            <View style={styles.addressView}>
                                <Image style={styles.addressIcon}source={locationFilterGrayIcon}/>
                                <Text style={styles.houseAddress}>{place.formattedAddress}</Text>
                            </View>
                            <TouchableOpacity style={styles.houseReviewView} onPress={ ()=>this.props.navigation.navigate('후기', { houseId: place.id, name: place.name })}>
                                <Image style={styles.reviewIcon} source={reviewIconIMG} />
                                <Text style={styles.houseReview}>{parseFloat(place.reviewScore).toFixed(1)}</Text>
                                <Text style={styles.houseReview}>(리뷰 {place.reviewCount}개)</Text>
                                </TouchableOpacity>
                            <Text style={styles.housePrice}>₩{place.price}원<Text style={styles.PriceSubText}> /박</Text></Text>
                        </View>
                        <TouchableOpacity style={styles.FavoriteIconTouchView} onPress={() => this.changeFavoriteState(place.id)}>
                            <Image style={styles.favoriteIcon} source={place.favoriteState ? checkFavoriteIconIMG : FavoriteIconIMG} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}

                <View style={styles.barMargin}><Text> </Text></View>
            </View>
            </ScrollView>
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
    background: {                   // 전체화면 설정
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "#F5F5F5",
    },
    container: {
        alignItems: 'center', 
    },
    tabBar: {                       // 상단 네비게이션 View
        justifyContent: 'flex-end',
        alignItems: "center",
        height: 60,
        width: '100%',
        // backgroundColor: 'gray'
    },
    myFavoriteListText: {           // 내가 찜한 숙소 텍스트  
        fontSize: 24,
        fontFamily: 'Pretendard-Bold',
        width: '88%',
        marginBottom: 10,
        // backgroundColor: 'yellow'
    },  
    content: {                      // 검색 리스트 컴포넌트, 내가 찜한 숙소 컨텐츠들 
        width: 330,
        height: 150,
        alignItems: "center",
        flexDirection: 'row',
        backgroundColor: 'white',
        marginTop: '3.8%',
        borderRadius: 20,
        elevation: 1,
    },
    houseIMG: {                      // 숙소 이미지
        alignItems: 'center',
        borderRadius: 10, 
        width: 105,
        height: 130,
        resizeMode: 'cover',
        margin: '2.2%',
    },
    Info: {                          // 숙소데이터 담는 View
        flex: 1,
        width: '51%',
        height: 150,
        marginLeft: "0.8%",
        // backgroundColor:'gray'
    },
    houseName: {                        // 숙소명 텍스트
        width: 210,
        textAlign: 'left',
        fontSize: 20,
        marginTop: '6.6%',
        color:'black',
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'yellow',
    },
    addressView:{                    // 숙소 주소, 위치 아이콘 가로로 담는 View
        width: 160,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: '1%',
        marginTop: '1.1%',
        // backgroundColor: 'green',
    },
    addressIcon:{                    // 상세주소 위치 아이콘 
        width: 10,
        height: 14,
        resizeMode: "contain",
        marginRight: "2.2%",
    },
    houseAddress: {                  // 찜한숙소 상세 주소
        width: 150,
        textAlign: 'left',
        fontSize: 15,
        color: '#A8A8A8',
        fontFamily: 'Pretendard-Regular', 
        // backgroundColor: 'yellow',
    },
    houseReviewView: {              // 평점 아이콘, 평점 텍스트 담는 View
        width: 170,
        height: 26,
        flexDirection: 'row',
        alignItems:'center',
        marginTop: '1.1%',  
        // backgroundColor: 'gray',

    },
    houseReview: {                  // 찜한숙소 평점및 리뷰 갯수
        textAlign: 'left',
        fontSize: 15,
        marginLeft: '1.5%',
        color: '#777777',
        fontFamily: 'Pretendard-Regular', 
        // backgroundColor: 'gray',
    },
    reviewIcon:{                    // 리뷰 별 아이콘
        marginLeft: '0.5%',
        marginRight: '1.5%',
        width: 15.4,
        height: 15.4,
        // backgroundColor: 'yellow',
    },
    housePrice:{                    // 숙소 가격
        position: 'absolute',
        width: 165,
        bottom: 18,
        fontSize: 20,
        marginLeft: '1.5%',
        color: '#0AE090',
        fontWeight: '500',
        // backgroundColor: 'yellow',
    },
    PriceSubText:{                  // 가격옆에 서브 텍스트 (/박) 
        fontSize: 18,
        color: 'black',
        fontWeight: "300",
    },
    FavoriteIconTouchView: {
        width: 40,  
        height: 40,
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: "27%",
        // backgroundColor: 'gray',
    },
    favoriteIcon: {                 // 찜버튼 아이콘
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },

    barMargin: {                    // 스크롤 여백
        height: 75,
    },
});

export default FavoriteListScreen;