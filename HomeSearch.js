import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Modal } from 'react-native';
import Hangul from 'hangul-js';
import axios from 'axios';
import { getToken } from './token';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import reviewIconIMG from './Image/회색_별_아이콘.png';
import noImage from './Image/이미지없음표시.png';
import locationFilterGrayIcon from './Image/검색화면_클릭전_지역필터링아이콘.png';





class HomeSearchScreen extends Component {
    
    state = {
        searchText: '',
        formattedAddresses: {},

        places: [                                   // 목록에 띄울 데이터들 관리
            { id: 2, 
                name: "[이름없음]", 
                address: "[주소없음]", 
                reviewScore: 0, 
                reviewCount: 0, 
                imageUri: [],
                price: 28300, 
                favoriteState: false, 
                reservaionState: false, 
                clearReservation: false 
            },
        ],
      }

    componentDidMount() {
        const { searchText } = this.props.route.params;
        this.setState({ searchText });
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getHouseListData();
        });
    }
    componentWillUnmount() {
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

      async getHouseListData() {                      // axios를 활용한 api통신을 통해 서버로부터 숙소 리스트들을 불러오는 함수
        try{
            const token = await getToken();
            
            const response = await axios.get('http://223.130.131.166:8080/api/v1/house/list',{
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

    changeFavoriteState = (id) => {                 // 찜버튼 누르면 FavoriteState 상태 바꿔주는 함수
        const PlacesState = this.state.places.map(place => {
            if (place.id === id) {                 
                return { ...place, favoriteState: !place.favoriteState };
            }
            return place;
        });
        this.setState({ places: PlacesState });
    };
 
    placeInfoDelivery = (houseId) => {             // 숙소 컨텐츠 클릭시 해당 숙소 정보를 같이 보내 숙소정보화면으로 이동
        this.props.navigation.navigate('숙소정보', { houseId: houseId });
    }
        
    onChangeInput = (event)=>{                      // 검색하면 inputText에 변경된 값 적용시킬 때 입력한담아두는 함수
        this.setState({
            searchText: event 
        })
    }

    selectFilterItem = (text) => {                     // 필터링 목록들 배열로 추출
        this.setState(prevState => {
            const isSelected = prevState.tempFilter && prevState.tempFilter.value === text;
            return {
                tempFilter: isSelected ? null : { type: prevState.currentFilterType, value: text },
                selectedFilterItem: isSelected ? null : text,
            };
        });
    };

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
    
    formatAddress(address) {                        // 정규식을 활용하여 도로명을 주소명으로 바꾸기
        const regex = /([\S]+[도시])\s*([\S]+[구군시])?\s*([\S]*[동리면읍가구])?/;
        const match = address.match(regex);
        console.log("Original Address:", address);
        console.log("Matched Segments:", match);
        return match ? match.slice(1).join(' ') : "주소를 불러오는데 문제가 발생하였습니다.";
    }
    
    render() {
        const { searchText, places } = this.state; 
        const filteredPlaces = places.filter(place =>    // Hangul 모듈을 활용해 검색어와 숙소의 name, address값 같은게 있는지 비교
            place.name.includes(searchText) || place.address.includes(searchText)
        );

        return (
                <ScrollView 
                    style={styles.background} 
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.titleView}>
                            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                                <Image style={styles.backBtnIcon} source={backBtnIMG} />
                            </TouchableOpacity>
                            <TextInput 
                                style={styles.input} 
                                placeholder= '지역, 호스트 이름 검색' 
                                placeholderTextColor="#979797"
                                value={searchText} 
                                onChangeText={this.onChangeInput}/>
                        </View>

                        <Text style={styles.SearchResultText}>'{searchText}'에 대한 검색결과</Text>


                        {/* //숙소정보 리스트 */}
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
                                    <Text style={styles.houseReview}>{place.reviewScore}</Text>
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
    );  
    }
}

    // 스타일 시트
const styles = StyleSheet.create({
    background: {                     // scrollView 세팅                     
        flex: 0,
        width: '100%',
        height: '100%',
        backgroundColor: "#F5F5F5",
    },
    container : {                   // 컴포넌트들 가운데 정렬
        alignItems: 'center', 
    },
    titleView: {                   // 뒤로가기버튼, 검색창 담는 View
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        height: 80,
        
    },  
    backBtnIcon: {                  // 뒤로가기 버튼
        resizeMode: 'contain',
        opacity: 0.38,
        width: 30,
        height: 30,
        marginRight:'2%',
        
    },
    input: {                        // 검색창
        width: '80%',
        height: 40,
        marginRight:'3%',
        borderRadius: 50, 
        backgroundColor: 'white',
        elevation: 2.2, 
        fontSize: 13,
        paddingLeft: 16,
    },
    SearchResultText:{              // ''에 대한 검색결과 텍스트
        fontSize: 22,
        marginTop: '2.2%',
        marginBottom: '2.2%',
        // backgroundColor:'white',
    },
    filterView: {                   // 필터 컴포넌트 담는 View
        width: '90%',
        height: 40,
        marginBottom: '1.5%',
        // backgroundColor: 'gray',
    },
    filterTouch: {                  // 필터 TouchableOpacity View
        justifyContent: 'center',
        height: 40,
        // backgroundColor: 'blue',
        marginHorizontal: 7, // 각 필터 버튼의 좌우 마진
    },
    filterBtn: {                    // 필터 버튼
        height: 32,
        paddingRight: 14,
        paddingLeft: 14,
        paddingTop: 3,
        paddingBottom: 3,
        textAlign: 'center',
        alignItems: 'center',
        fontSize: 16,
        borderRadius: 10, 
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: '#CBCBCB',
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
    barMargin: {                    // 스클롤 탭바 마진
        height: 75,
    },

    modalLayoutView: {              // 필터링버튼 누르면 나오는 버튼창 레이아웃
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        marginTop: '30%',
        width: '90%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection:'row',
        flexWrap: 'wrap',
        borderRadius: 10,
        elevation: 2,
    },
    modalTextView:{                       // 모달  필터링 터치 View
        paddingTop: '2%',
        paddingBottom: '2%',
        paddingRight: '4%',
        paddingLeft: '4%',
        margin:'2%',
        backgroundColor: 'white',
        borderColor: '#CBCBCB',
        borderWidth: 1,
        borderRadius: 10, 
    },
    modalText: {                            // 모달 필터링 내용 텍스트
        textAlign: 'center',
        fontSize: 13,
    },
    modalBtn: {                             // 모달 필터링 닫기 버튼
        paddingTop: '2%',
        paddingBottom: '2%',
        paddingRight: '4%',
        paddingLeft: '4%',
        margin:'2%',
        backgroundColor: '#F2F2F2',
        borderColor: '#CBCBCB',
        borderWidth: 1,
        borderRadius: 10, 
    },  
    modalBtnText: {                        // 모달 버튼 텍스트
        fontSize: 14,
    },
});

export default HomeSearchScreen;