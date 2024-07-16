import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Hangul from 'hangul-js';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import reviewIconIMG from './Image/회색_별_아이콘.png';




class HomeSearchScreen extends Component {
    
    state = {
        searchText: '',


        places: [                                   // 목록에 띄울 데이터들 관
            { id: 1, 
                name: "김갑순님의 거주지", 
                address:'강원도 속초시 신림면', 
                reviewScore: "4.2", 
                reviewCount: 48, 
                imageUrl: require('./Image/여행지1.png'), 
                favoriteState: true, 
                price: 43000, 
                reservaionState: false, 
                clearReservation: false },
        ],
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
 

    
    render() {
        const { searchText } = this.props.route.params;

        const { modalVisible, places, filters } = this.state;           

        const searchChars = Hangul.disassemble(searchText);               // Hangul 모듈을 활용해 텍스트 분해              
        const filteredPlaces = places.filter(place => {                   // Hangul 모듈을 활용해 검색어와 숙소의 name, address값 같은게 있는지 비교
        return Hangul.search(place.name, searchText) >= 0 || Hangul.search(place.address, searchText) >= 0;     
    }); 
        
        return (
            <LinearGradient
            colors={['#E8ECFF', '#FCFDFF']} 
            style={styles.linearGradient} 
            start={{ x: 0, y: 0.88 }} 
            end={{ x: 0, y: 0 }}>
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
                                placeholder='시골여행 / 농촌체험' 
                                placeholderTextColor="#979797"
                                editable={false}
                                value={searchText}/>
                        </View>

                        <Text style={styles.SearchResultText}>'{searchText}'에 대한 검색결과</Text>


                        {/* //숙소정보 리스트 */}
                    {filteredPlaces.map((place) => (    
                        <TouchableOpacity key={place.id} style={styles.content} onPress={() => this.props.navigation.navigate('숙소정보')}>
                            <Image source={place.imageUrl} style={styles.houseIMG}/>
                            <View style={styles.Info}>
                                <Text style={styles.houseName}>{place.name}</Text>
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

                    <View style={styles.barMargin}><Text> </Text></View>
                </View>
            </ScrollView>
        </LinearGradient> 
    );  
    }
}

    // 스타일 시트
const styles = StyleSheet.create({
  background: {                     // 전체화면 세팅                     
        flex: 1,
    },
    linearGradient: {               // 그라데이션
        flex: 0,
        width: '100%',
        height: '100%',
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
    content: {                      // 검색 리스트 컴포넌트
        width: 370,
        height: 120,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        marginTop: '3.3%',
        borderRadius: 20,
        elevation: 1,
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
        marginLeft: '1.1%',
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