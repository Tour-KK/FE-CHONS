import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView} from 'react-native';
import axios from 'axios';
import { getToken } from './token';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import HouseReviewIconIMG from './Image/평점_별아이콘.png';
import ArrowIconIMG from './Image/화살표_아이콘.png';
import noImage from './Image/이미지없음표시.png';
import reviewDotIcon from './Image/리뷰DOT_아이콘.png';
import reviewPlusIcon from './Image/리뷰_더보기버튼_아이콘.png';
import subLocationIcon from './Image/서브주소_아이콘.png';
import customMarkerIMG from "./Image/지도마커_아이콘.png";

class HouseInfoScreen extends Component {
    state = {
        formattedAddresses: {},

        places: [                                   // 목록에 띄울 데이터들 관리
            { id: 1, 
                name: "", 
                address: "", 
                streetAddress: "", 
                reviewScore: "", 
                reviewCount: 0, 
                imageUri: [], 
                favoriteState: true, 
                price: 0, 
                phoneNumber: "", 
                maximumGuestNumber: 0, 
                freeService: "", 
                introText: "",
                registrantId: 0,
            },
        ],
    }

    componentDidMount() {                                       // 렌더링 하기전에 DOM에서 해당 숙소 상세정보들 불러오기
        Geocoder.init('AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE', { language: "ko" });


        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 숙소 상제정보 렌더링 완료');
            this.getHouseData();
        });
    }
    componentWillUnmount() {
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }
    

    async getHouseData() {                      // axios를 활용한 api통신을 통해 서버로부터 숙소 리스트들을 불러오는 함수
        try{
            const { houseId } = this.props.route.params;
            const token = await getToken();

            const response = await axios.get(`http://223.130.131.166:8080/api/v1/house/${houseId}`,{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            
            const house = response.data;
            let latitude = null, longitude = null;
            const geocodingResponse = await Geocoder.from(house.address);
            if (geocodingResponse.results.length > 0) {
                latitude = geocodingResponse.results[0].geometry.location.lat;
                longitude = geocodingResponse.results[0].geometry.location.lng;
            }

            const data = [{
                id: house.id,
                name: house.hostName,
                introText: house.houseIntroduction,
                freeService: house.freeService,
                imageUri: house.photos,
                phoneNumber: house.phoneNumber,
                registrantId: house.registrantId,
                price: house.pricePerNight,
                address: house.address,
                formattedAddress: this.formatAddress(house.address),
                maximumGuestNumber: house.maxNumPeople,
                reviewScore: house.starAvg, 
                reviewCount: house.reviewNum, 
                favoriteState: house.liked, 
                reservationState: false, 
                clearReservation: false ,
                latitude,
                longitude
            }];

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
   
    formatAddress(address) {                        // 정규식을 활용하여 도로명을 주소명으로 바꾸기
        const regex = /([\S]+[도시])\s*([\S]+[구군시])?\s*([\S]*[동리면읍가구])?/;
        const match = address.match(regex);
        console.log("Original Address:", address);
        console.log("Matched Segments:", match);
        return match ? match.slice(1).join(' ') : "주소를 불러오는데 문제가 발생하였습니다.";
    }
    
    render() {

        const { houseId } = this.props.route.params;
        const { places } = this.state;
        const filteredPlaces = places.filter(place => place.id === houseId);
        

        return (
            <View style={styles.container}>
                <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
                <View style={styles.houseIMGView}  >
                    <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                           {filteredPlaces.map((place) =>
                                place.imageUri.length > 0 ? ( 
                                    place.imageUri.map((uri, index) => (
                                        <ImageBackground key={index} style={styles.houseIMG} source={{ uri: uri }}>
                                            <TouchableOpacity style={styles.fixedBackButton} onPress={() => this.props.navigation.goBack()}>
                                                <Image style={styles.backBtnIcon} source={backBtnIMG}/>  
                                            </TouchableOpacity>
                                        </ImageBackground>
                                    ))
                                ) : (  
                                    <ImageBackground key={"no-image"} style={styles.houseIMG} source={noImage}>
                                        <TouchableOpacity style={styles.fixedBackButton} onPress={() => this.props.navigation.goBack()}>
                                            <Image style={styles.backBtnIcon} source={backBtnIMG}/>  
                                        </TouchableOpacity>
                                    </ImageBackground>
                                )
                            )}
                    </ScrollView>
                </View>

                <View> 
                    {filteredPlaces.map(place => (
                    <View style={styles.container} key={place.id}>
                        <View style={styles.houseName}>
                            <Text style={styles.houseNameText}>{place.name}님의 거주지</Text>
                        </View>
                        <View style={styles.houseAddress}>
                            <Image style={styles.subLocationIcon} source={subLocationIcon} />
                            <Text style={styles.houseAddressSubText}>{place.formattedAddress}</Text>
                        </View>
                        <View style={styles.houseReviewView}>
                            <TouchableOpacity style={styles.houseReview} onPress={ ()=>this.props.navigation.navigate('후기', { houseId: place.id, name: place.name })}>
                                <Image style={styles.houseReviewIcon} source={HouseReviewIconIMG} />
                                <Text style={styles.houseReviewText}>{place.reviewScore}점</Text>
                                <Image style={styles.reviewDotIcon} source={reviewDotIcon} />
                                <Text style={styles.houseReviewSubText}>({place.reviewCount}개의 후기)</Text>
                                <Image style={styles.reviewPlusIcon} source={reviewPlusIcon} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.grayHorizontalLine}/>

                        <View style={styles.introView}>
                            <Text style={styles.introText}>소개글</Text>
                            <Text style={styles.houseIntroText}>{place.introText}</Text>
                        </View>
                        <View style={styles.introView}>
                            <Text style={styles.hostAttention}>최대 인원</Text>
                            <Text style={styles.hostAttentionText}>{place.maximumGuestNumber}명</Text>
                        </View>
                        <View style={styles.introView}>
                            <Text style={styles.tagTextView}>무료 제공 서비스</Text>
                            <View style={styles.tagView}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {place.freeService.replace(/^[\s#,\s]*/, '').split(/[\s#,]+/).map((service, index) => (
                                        <Text key={index} style={styles.tagText}> #{service.trim()}</Text>
                                    ))}
                                    <Text style={styles.tagTextmargin}> </Text>
                                </ScrollView>
                            </View>
                        </View>
                        <View style={styles.locationView} >
                            <View style={styles.mapView}>
                                <Text style={styles.location}>숙소 위치</Text>
                            </View>
                            <Text style={styles.locationText}>{place.address}</Text>
                            <View style={styles.mapContainer}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.locationMap}
                                initialRegion={{
                                    latitude: place.latitude || 37.541,  
                                    longitude: place.longitude || 126.986,
                                    latitudeDelta: 0.003,
                                    longitudeDelta: 0.003,
                                }}>
                                <Marker
                                    coordinate={{
                                        latitude: place.latitude || 37.541,
                                        longitude: place.longitude || 126.986,
                                    }}
                                    title={`${place.name} 위치`}
                                    description={place.address}
                                    image={customMarkerIMG}
                                >
                                    <Callout tooltip>
                                        <View style={styles.customCallout}>
                                            <Text style={styles.calloutTitle}>{place.address}</Text>
                                        </View>
                                    </Callout>
                                </Marker>
                            </MapView>
                            </View>
                        </View>
                        <View style={styles.introView}>
                            <Text style={styles.phoneNumber}>연락처</Text>
                            <Text style={styles.phoneNumberText}>{place.phoneNumber}</Text>
                        </View>

                        <Text style={styles.houseRuleText}> 숙소 이용규칙 </Text>
                        <View style={styles.columnMiidle}>
                            <View style={styles.houseRuleView}>
                                <Text style={styles.houseRuleOptionText}>• 욕설 및 공격적인 언행은 삼가해주세요. </Text>
                                <Text style={styles.houseRuleOptionText}>• 소음제한 시간대에는 소음을 자제해주세요 </Text>
                                <Text style={styles.houseRuleOptionText}>• 객실 내에서 흡연은 금지합니다. </Text>
                                <Text style={styles.houseRuleOptionText}>• 호스트를 존중하고 배려해주세요. </Text>
                                <Text style={styles.houseRuleOptionTextMargin}> </Text>
                            </View>
                        
                            <Text style={styles.ruleAlertText}> ※위 규칙을 3회이상 어길 시, 호스트에게 숙박비의 30%에 해당하는 벌금이 발생할 수 있습니다. </Text>
                        </View>
                        <View style={styles.barMargin}><Text> </Text></View>
                    </View>
                    ))}





                </View>
                </ScrollView>

                <View style={styles.reservationView}>
                    <Text style={styles.priceText}>  ₩{filteredPlaces.length > 0 ? filteredPlaces[0].price.toLocaleString() : '0'}원</Text>
                    <TouchableOpacity  style={styles.reservationBtn} onPress={() => this.props.navigation.navigate('예약', { houseId: houseId })}>


                        <Text style={styles.reservationText}>간편 예약하기</Text>
                        <Image style={styles.arrowIcon} source={ArrowIconIMG}/>
                    </TouchableOpacity>
                </View>
            </View>
    )
  }
}

// 스타일 시트 숙소 이미지 width:415, height:380 + (애뮬레이터 기존값) + 다른 텍스트View width:415-> 375
const styles = StyleSheet.create({
    background: {                   // 전체화면 세팅
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
    },
    container: {                    // 컴포넌트들 가운데 정렬시키는 View
        alignItems: 'center', 
        width: '100%',
        height: '100%',
    },
    houseIMGView:{                  // 숙소사진,뒤로가기버튼, 찜버튼,페이지 정보 담는 View
        width: 375,                 
        height: 340,                // 415->375
        alignItems: 'center', 
    },
    backBtnIcon: {              // 뒤로가기 버튼
        resizeMode: 'contain',
        opacity: 0.38,
        width: 26,
        height: 26,
    },
    fixedBackButton: {                  // 뒤로가기 버튼 고정시키는 View
        position: 'absolute',
        top: '2.5%',
        left: '2.5%',    
        height: 34,  
        width: 34,  
        justifyContent: 'center', 
        alignItems: 'center',     
        borderRadius: 50,   
        backgroundColor: 'rgba(255, 255, 255, 0.4)',   
    },
    houseIMG: {                                // 숙소사진
        width: 375, 
        height: 375,
        resizeMode: 'cover',
    },  
    houseName: {                               // 숙소명을 담는 View
        marginTop: '6.6%',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // backgroundColor: 'gray',
    },
    houseNameText: {                           // 숙소명
        fontSize: 24,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },
    houseAddress: {                               // 숙소 주소 아이콘과 주소 텍스트를 담는 View
        marginTop: '0.6%',
        width: '90%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: "row",
        // backgroundColor: 'gray',
    },
    subLocationIcon:{                          // 숙소위치 텍스트 옆 위치 아이콘
        width: 12,
        height: 12,
        resizeMode: 'contain',
        marginRight: '1.1%',
        marginTop: '1.8%',
        // backgroundColor: 'yellow',
    },
    houseAddressSubText:{                       // 숙소명 밑 숙소위치 표시 텍스트
        fontSize: 17,
        fontFamily: 'Pretendard-Regular', 
        color: 'gray',
        // backgroundColor: 'green',
    },
    houseReviewView: {                         // 숙소 평점 및 후기 담는 View
        flexDirection: 'row',
        marginTop: '6.6%',
        width: '90%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    houseReview: {                             // 숙소 평점 및 후기 담는 ScrollView
        flexDirection: 'row',
        alignItems: 'center',
    },
    houseReviewIcon: {                         // 별 아이콘
        width: 15.6,
        height: 15.6,   
        marginTop: '1.5%',
    },
    houseReviewText: {                         // 평점 및 후기 텍스트
        marginLeft: '4%',
        fontSize: 16,
        color: '#787370',   
    }, 
    reviewDotIcon:{                             // 평점과 리뷰 갯수 사이 dot 
        width: 3.8,
        height: 3.8,
        margin: '3.3%',
        marginTop: '5.5 %',
        resizeMode: 'contain',
    },
    houseReviewSubText:{                        // 평점 및 후기 갯수 표시해주는 텍스트
        fontSize: 16,
        color: '#0AE090',   
    },
    reviewPlusIcon:{                           // 리뷰 더보기 아이콘
        width: 12,
        height: 12,
        resizeMode: 'contain',
        marginTop: '3%',
        // backgroundColor: 'gray',
    },
    grayHorizontalLine: {                  // 회색 가로선
        width: '100%',
        height: 6.6,
        backgroundColor: '#F5F5F5',
        marginTop: "6.6%",
    },
    introView:{                                // 소개글 제목, 본문 담는 View
        width: '90%',
        alignItems: 'flex-start',
        marginBottom: '8%',
    },
    introText: {                               // 소개글 제목 텍스트
        marginTop: '8%',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },  
    houseIntroText: {                          // 숙소 소개글 본문 텍스트
        marginTop: '2.2%',
        fontSize: 16,
        width: '100%',
        fontFamily: 'Pretendard-Regular', 
        color: '#353535',
        // backgroundColor: 'gray',
    },
    locationView: {                            // 숙소 위치 도로명과 미리보기 화면 담는 View
        alignItems: 'flex-start',
        width: "90%",
    },
    mapView: {                                 // 숙소위치 제목 텍스트와 지도보러가기 텍스트 가로배치로 담는 View
        flexDirection: 'row',
        alignitems: 'center',
        width: '100%',
        // backgroundColor:'gray',
    },
    location: {                                // 숙소 위치 텍스트
        marginTop: '8%',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },
    locationText: {                            // 도로명 본문 텍스트          
        marginTop: '2.2%',
        fontSize: 16,
        width: '100%',
        fontFamily: 'Pretendard-Regular', 
        color: '#353535',
        // backgroundColor: 'gray',
    },
    mapContainer: {                           // 구글 지도 화면
        width: 318,
        height: 210,
        borderRadius: 25,
        overflow: 'hidden', 
        borderColor: '#0AE090',
        borderWidth: 0.8,
        marginTop: '10%',
        marginBottom: '4.4%',
    },
    locationMap: {                            // 구글 지도 MapView                       
        width: '100%',
        height: '100%',    
    },
    phoneNumber: {                             // 연락처 텍스트
        marginTop: '8%',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },
    phoneNumberText: {                         // 010-0000-0000 텍스트          
        marginTop: '2.2%',
        fontSize: 16,
        width: '100%',
        fontFamily: 'Pretendard-Regular', 
        color: '#353535',
        // backgroundColor: 'gray',
    },
    reservationView: {                        // 가격및 예약버튼담는 View
        position: 'absolute',
        width: '100%',
        height: 75,
        backgroundColor: 'white',
        justifyContent: 'center',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reservationBtn:{                          // 예약 버튼
        backgroundColor : '#00D282',  
        borderRadius: 16,
        width: '55%',
        height: 55,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,                       
        shadowColor: '#00D282',
        shadowRadius: 10,
    },
    priceText: {                              // 가격 텍스트
        fontSize: 26,
        color: '#00D282',  
        width: '40%',
        // backgroundColor: 'yellow',
        textAlign: 'center',
        marginBottom: '2%',
    },
    reservationText:{                         // 간편 예약하기 텍스트
        color: 'white', 
        fontSize: 18,
        marginBottom: '1.5%',
    },
    arrowIcon: {                              // 화살표 아이콘     
        width: 24,
        height: 24,
        marginLeft: '4%',
    },
    barMargin: {                             // ScrollView 탭바에 대한 마진
        height: 120,
    },
    hostAttention:{                          // '최대 인원' 텍스트
        marginTop: '8%',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },
    hostAttentionText: {                     // 최대인원 본문 값 텍스트 (2명)
        marginTop: '2.2%',
        fontSize: 16,
        width: '100%',
        fontFamily: 'Pretendard-Regular', 
        color: '#353535',
        // backgroundColor: 'gray',
    },
    tagTextView:{                            // 무료제공 서비스, 이런건 챙겨와주세요! 
        marginTop: '8%',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },
    tagView: {                               // 무료제공서비스, 태그 담는 View
        flexDirection: 'row',
        marginTop: '2.5%',
        width: '100%',
        // backgroundColor: 'yellow',
    },
    tagText: {                               // 무료제공서비스, 태그 담는 View 텍스트
        fontSize: 18,
        color: '#0AE090',  
        fontFamily: 'Pretendard-Regular', 
    },
    tagTextmargin: {                         // 태그 텍스트 스크롤뷰 마진
        width: 30,
    },
    houseRuleText:{                          // 숙소 이용규칙 제목 텍스트
        width: '90%',
        marginTop: '8%',
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        color: 'black',
    },
    columnMiidle:{                           // 가로 가운데 정렬 - 숙소 이용규칙 본문담는 View 가운데 정렬
        alignItems: 'center',
        width: '90%',
    },
    houseRuleView: {                          // 숙소 이용규칙 본문 담는 View
        marginTop: '3.3%',
        borderRadius: 20,
        width: '90%',
        // backgroundColor: 'yellow',
    },

    houseRuleOptionText: {                    // 숙소 이용규칙 본문 텍스트
        marginTop: '4.4%',
        fontSize: 16,
        color: '#939393',
        // backgroundColor:'yellow',
    },
    houseRuleOptionTextMargin: {              // 숙소 이용규칙 하단 마진
        marginBottom: '1%',
    },
    ruleAlertText: {                          // 숙소 이용규칙 패널티에 대한 텍스트
        fontSize: 14,
        width: 300,
        color: "#00D282",
        marginTop: '5.5%',
        textAlign:'center',
    },
    customCallout: {                       // 마커 누르면 나오는 정보창 타이틀 스타일링    
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        alignItems: 'center',
        borderColor: '#0AE090',
        borderWidth: 1.2,
        maxWidth: 250, 
        flexDirection: 'row', 
        justifyContent: 'center', 
    },
    calloutTitle: {                         // 마커 누르면 나오는 callout 텍스트 스타일링                        
        fontSize: 14,
        color: '#4B4B4B',
        textAlign: 'center',
        marginHorizontal: '8%',
    },
});


export default HouseInfoScreen;