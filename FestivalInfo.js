import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView, Linking} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { getToken } from './token';
import Geocoder from 'react-native-geocoding';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import grayHorizontalLine from "./Image/회색가로선.png"
import customMarkerIMG from "./Image/지도마커_아이콘.png";



class FestivalInfoScreen extends Component {

    state = {
        festivals: [                                   // 목록에 띄울 주변 축제 컨텐츠 데이터들
            { id: 1,
                name: "", 
                address: "", 
                imageUrl: [], 
                homepages: "", 
                tel:"", 
                introText: "",
                posX: "",
                posY: "",
            },
        ],  
    }

    componentDidMount() {                           // 축제 상세 정보 렌더링전에 먼저 불러오게 세팅 + Geocoder 초기화
        Geocoder.init('AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE', { language: "ko" });

        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getFestivalData();
        });
    }
    
    componentWillUnmount() {                         // 축제 상세 정보 렌더링전에 먼저 불러오게 세팅
        if (this.focusListener) {   
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

    
    async getFestivalData() {                         // axios를 활용해 축제 상세정보 먼저 불러오도록 세팅
        try {
            const { festivalId } = this.props.route.params;

            const token = await getToken();
            const response = await axios.get(`http://223.130.131.166:8080/api/v1/festival/${festivalId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            console.log('getFestivalData Response:', response.data);

            const festival = {
                id: response.data.contentId,
                name: response.data.title,
                address: response.data.addr1,
                imageUrl: { uri: response.data.imageUrl },
                homepages: this.extractDomain(response.data.homepages),
                tel: response.data.tel,
                introText: response.data.overview,
                latitude: null,
                longitude: null,
            };

            const geocodingResponse = await Geocoder.from(festival.address);
            if (geocodingResponse.results.length > 0) {
                const location = geocodingResponse.results[0].geometry.location;
                festival.latitude = location.lat;
                festival.longitude = location.lng;
            }

            this.setState({ festivals: [festival] });
        } catch (error) {
            console.error('getFestivalData Error:', error);
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
    
    // 도메인만 추출하는 메서드
    extractDomain(homepages) {
        const regex = /https?:\/\/(www\.)?([a-zA-Z0-9.-]+)/;
        const match = homepages.match(regex);
        if (match) {
            return `https://${match[1]}${match[2]}`;
        } else {
    return homepages;
        }
    }

    render() {
        const { festivals } = this.state;

        festivals.forEach(festival => {
            if (festival.posX && festival.posY) {
                console.log(`전달받은 Latitude: ${festival.posX}, 전달받은 Longitude: ${festival.posY}`);
            }
        });

        const isValidCoordinate = (value) => !isNaN(parseFloat(value)) && isFinite(value);

        return (
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.festivalIMGView}  >
                    <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                        {this.state.festivals.map((festival) => (
                            <ImageBackground key={festival.id} style={styles.festivalIMG} source={festival.imageUrl}>
                                <TouchableOpacity style={styles.fixedBackButton} onPress={() => this.props.navigation.goBack()}>
                                    <Image style={styles.backBtnIcon} source={backBtnIMG}/>  
                                </TouchableOpacity>
                            </ImageBackground>
                        ))}
                    </ScrollView>
                </View>
                <View> 
                    {this.state.festivals.map(festival => (
                        <View style={styles.contain} key={festival.id}>
                        <View style={styles.festivalNameView}>
                            <Text style={styles.festivalNameText}>{festival.name}</Text>
                        </View>
                        <Image style={styles.grayHorizontalLine} source={grayHorizontalLine}/>
                        <View style={styles.introView} >
                            <Text style={styles.introText}>축제 정보</Text>
                            <Text style={styles.festivalIntroText}>{festival.introText}</Text>
                        </View>
                        <View style={styles.domainView} >
                            <Text style={styles.domainText}>홈페이지 주소</Text>
                            <Text 
                                style={styles.festivalDomainText} onPress={() => Linking.openURL(festival.homepages)}> {festival.homepages}
                            </Text>
                        </View>
                        <View style={styles.phoneNumberView} >
                            <Text style={styles.phoneNumber}>문의 전화</Text>
                            <Text style={styles.phoneNumberText}>{festival.tel}</Text>
                        </View>
                        <View style={styles.locationView} >
                            <Text style={styles.location}>축제 장소</Text>
                            {isValidCoordinate(festival.latitude) && isValidCoordinate(festival.longitude) && (
                            <View style={styles.mapContainer}>
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.locationMap}
                                    initialRegion={{
                                        latitude: festival.latitude,
                                        longitude: festival.longitude,
                                        latitudeDelta: 0.0007, 
                                        longitudeDelta: 0.0007, 
                                    }}>
                                    <Marker
                                        coordinate={{
                                            latitude: festival.latitude,
                                            longitude: festival.longitude
                                        }}
                                        title={festival.name}
                                        description={festival.address} 
                                        image={customMarkerIMG}>
                                        {/* <Image
                                            source={customMarkerIMG}
                                            style={{ width: 50, height: 50 }} /> */}
                                        <Callout tooltip>
                                            <View style={styles.customCallout}>
                                                <Text style={styles.calloutTitle}>{festival.address}</Text>
                                            </View>
                                        </Callout>
                                    </Marker>
                                </MapView>
                            </View>
                        )}
                            <Text style={styles.locationText}>{festival.address}</Text>
                        </View>
                    </View>
                    ))}

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
    container: {                    // 컴포넌트들 가운데 정렬시키는 View
        alignItems: 'center', 
    },
    contain: {                    // 컴포넌트들 가운데 정렬시키는 View
        alignItems: 'center', 
        width: '100%',
    },
    festivalIMGView:{                  // 숙소사진,뒤로가기버튼, 찜버튼,페이지 정보 담는 View
        width: 375,
        height: 320, 
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
    festivalIMG: {                                // 숙소사진
        width: 375, 
        height: 320,
        resizeMode: 'cover',
    },  
    festivalNameView: {                               // 숙소명을 담는 View
        marginTop: '3.3%',
        width: 340,
        justifyContent: 'flex-start',
        // backgroundColor:'gray',
    },
    festivalNameText: {                           // 축제명
        fontSize: 26,
        fontFamily: 'Pretendard-Bold', 
        color:'#232323',
    },
    grayHorizontalLine:{                        // 회색 구분선
        marginTop: '4.4%',
        width: 375,
        height: 3,
        resizeMode: 'cover',
    },
    introView:{                                // 소개글 제목, 본문 담는 View
        alignItems: 'center',
        width: 320,
        // backgroundColor: 'gray',
    },
    introText: {                               // 소개글 제목 텍스트
        marginTop: '9.4%',
        marginBottom: '2.2%',
        fontSize: 24,
        width: 320,
        fontFamily: 'Pretendard-Bold', 
        // backgroundColor: 'gray',
    },  
    festivalIntroText: {                          // 숙소 소개글 본문 텍스트
        marginTop: '0.8%',
        fontSize: 15,
        fontFamily: 'Pretendard-Regular',
        width: 320,
        // backgroundColor: 'green',
    },
    domainView:{                                   // 홈페이지 주소 View
        alignItems: 'center',
        width: 320,
        // backgroundColor: 'yellow'
    },
    domainText: {                                  // 홈페이지 주소 텍스트
        marginTop: '18%',
        marginBottom: '2.2%',
        fontSize: 24,
        width: 320,
        fontFamily: 'Pretendard-Bold', 
        // backgroundColor: 'gray',
    },  
    festivalDomainText: {                          // 홈페이지 주소 본문 텍스트
        marginTop: '2.2%',
        color: "#0AE090",
        fontSize: 16,
        width: 320,
        fontFamily: 'Pretendard-Regular',
        // backgroundColor: 'gray',
    },
    phoneNumberView:{                          // 문의 전화, 연락처 담는 View
        alignItems: 'center',
        width: 320,
        // backgroundColor: 'yellow'
    },
    phoneNumber: {                             // 문의 전화 텍스트
        width: 320,
        marginTop: '18%',
        marginBottom: '2.2%',
        fontSize: 24,
        fontFamily: 'Pretendard-Bold', 
        // backgroundColor: 'green',      
    },
    phoneNumberText: {                         // 010-0000-0000 텍스트       
        width: 320,   
        marginTop: '2.2%',
        fontSize: 16,
        fontFamily: 'Pretendard-Regular',
        // backgroundColor: 'gray'

    },
    locationView: {                            // 숙소 위치 도로명과 미리보기 화면 담는 View
        alignItems: 'center',
        width: 320,
        // backgroundColor: 'yellow'
    },
    mapView: {                                 // 숙소위치 제목 텍스트와 지도보러가기 텍스트 가로배치로 담는 View
        flexDirection: 'row',
        alignitems: 'center',
        // backgroundColor:'gray',
    },
    location: {                                // 숙소 위치 텍스트
        width: 320,
        marginTop: '18%',
        fontSize: 24,
        fontFamily: 'Pretendard-Bold', 
        // backgroundColor:'gray',
    },
    locationText: {                             
        width: 320,
        fontSize: 16,
        textAlign: 'center', 
        paddingBottom: '3.3%', 
        fontFamily: 'Pretendard-Regular',
    },    
    mapContainer: {                           // 구글 지도 화면
        width: 320,
        height: 210,
        borderRadius: 25,
        overflow: 'hidden', 
        borderColor: '#0AE090',
        borderWidth: 0.8,
        marginTop: '8%',
        marginBottom: '7%',
    },
    locationMap: {                             
        width: '100%',
        height: '100%',    
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
        color: 'black',
        textAlign: 'center',
        marginHorizontal: '8%',
    },
    barMargin: {                             // ScrollView 탭바에 대한 마진
        height: 30,
    },
});


export default FestivalInfoScreen;