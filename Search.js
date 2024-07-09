import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Hangul from 'hangul-js';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import housePlusIconIMG from './Image/추가_아이콘.png';
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



class SearchScreen extends Component {
    
    state = {
        searchText: '',
        modalVisible: false,
        currentFilter: [], 
        currentFilterType: '',

        places: [                                   // 목록에 띄울 데이터들 관
            { id: 1, name: "김갑순님의 거주지", address:'강원도 속초시 신림면', reviewScore: "4.2", reviewCount: 48, imageUrl: require('./Image/여행지1.png'), favoriteState: true, price: 43000, reservaionState: false, clearReservation: false },
            { id: 2, name: "김경민님의 거주지", address:'강원도 원주시 신림면', reviewScore: "3.8", reviewCount: 23, imageUrl: require('./Image/여행지2.png'), favoriteState: true, price: 38000, reservaionState: false,  clearReservation: false },
            { id: 3, name: "강진석님의 거주지", address:'강원도 철원군 동송읍', reviewScore: "4.0", reviewCount: 31, imageUrl: require('./Image/여행지3.png'), favoriteState: false, price: 88000, reservaionState: false,  clearReservation: false },
            { id: 4, name: "오진태님의 거주지", address:'강원도 강릉시 옥계면',reviewScore: "4.4", reviewCount: 18, imageUrl: require('./Image/여행지4.png'), favoriteState: true, price: 26000, reservaionState: false,  clearReservation: false },
            { id: 5, name: "박경숙님의 거주지", address: '경상남도 부산광역시 김해시 진영읍', reviewScore: "4.2", reviewCount: 66, imageUrl: require('./Image/여행지5.png'), favoriteState: false, price: 40000, reservaionState: true,  clearReservation: true },
            { id: 7, name: "이창민님의 거주지", address:'경상남도 부산광역시 금정구 구서2동',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지6.png'), favoriteState: true, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 9, name: "오경숙님의 거주지", address:'경상북도 울산광역시 울주군 둔기리', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지8.png'), favoriteState: true, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 8, name: "양민우님의 거주지", address:'전라남도 전주시 덕진구', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지7.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 10, name: "이정민님의 거주지", address:'경기도 화성시 남양읍', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지9.png'), favoriteState: true, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 11, name: "박범석님의 거주지", address:'제주도 서귀포시 남원읍', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지10.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 12, name: "황진영님의 거주지", address:'전라남도 광주광역시 북구 오치1동', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지11.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 13, name: "박우석님의 거주지", address:'전라남도 나주시 영강동', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지12.png'), favoriteState: true, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 14, name: "이현숙님의 거주지", address:'충천남도 공주시 우성면', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지13.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 15, name: "황지석님의 거주지", address:'충천남도 아산시 신창면 남성리', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지14.png'), favoriteState: true, price: 54000, reservaionState: false,  clearReservation: false },
            { id: 16, name: "이미연님의 거주지", address:'충천남도 당진시 순성면', reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지15.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false },
        ],

        filters: [                                // 필터링 목록의 필터링 컨텐츠들
            { key: 'location', text: '지역' },
            { key: 'period', text: '숙박기간' },
            // { key: 'attention', text: '관심도' },
            { key: 'price', text: '가격' },
            { key: 'guestCount', text: '인원수'},
            // { key: 'period', text: '날짜선택' },
            // { key: 'freeContents', text: '무료제공 서비스'}, 
        ],

        locationFilter: [                           // 지역 필터링의 상세 필터링 목록들
            { id:'1', text: '서울'},
            { id:'2', text: '인천'},
            { id:'3', text: '대전'},
            { id:'4', text: '대구'},
            { id:'5', text: '경기'},
            { id:'6', text: '부산'},
            { id:'7', text: '울산'},
            { id:'8', text: '광주'},
            { id:'9', text: '강원'},
            { id:'10', text: '충북'},
            { id:'11', text: '충남'},
            { id:'12', text: '경북'},
            { id:'13', text: '경남'},
            { id:'14', text: '전북'},
            { id:'15', text: '전남'},
            { id:'16', text: '제주'},
            { id:'17', text: '기타'},
        ],
        periodFilter: [
            { id: '1', text: '1박 2일' },
            { id: '2', text: '2박 3일' },
            { id: '3', text: '3박 4일' },
            { id: '4', text: '5박 6일' },
            { id: '5', text: '6박 7일' },
            { id: '6', text: '7박 이상' },
        ],
        // attentionFilter: [
        //     { id: '1', text: '소극' },
        //     { id: '2', text: '보통' },
        //     { id: '3', text: '적극' },
        // ],
        priceFilter: [
            { id: '1', text: '50000원 이하' },
            { id: '2', text: '50000원 ~ 100000원' },
            { id: '3', text: '100000원 ~ 200000원' },
            { id: '3', text: '300000원 이상' },
        ],
        guestCountFilter: [
            { id: '1', text: '1명' },
            { id: '2', text: '2명' },
            { id: '3', text: '3명' },
            { id: '4', text: '4명 이상' },
        ],
      }

    // 필터링 버튼 클릭시 필터링 종류에 맞게 모달에 출력하는 filterData를 지정해주고 모달을 보이게 해주는 함수
    setModalVisible = (visible, filterKey = '') => {    
        let filterData = [];
        if (filterKey === 'location') {
            filterData = this.state.locationFilter;
        } else if (filterKey === 'period') {
            filterData = this.state.periodFilter;
        } else if (filterKey === 'attention'){
            filterData = this.state.attentionFilter;
        } else if (filterKey === 'price'){
            filterData = this.state.priceFilter;
        } else if (filterKey === 'guestCount'){
            filterData = this.state.guestCountFilter;
        }
        
        this.setState({
            modalVisible: visible,
            currentFilter: filterData,
            currentFilterType: filterKey
        });
    };
    
    placeInfoDelivery = (houseId) => {             // 숙소 컨텐츠 클릭시 해당 숙소 정보를 같이 보내 숙소정보화면으로 이동
        this.props.navigation.navigate('숙소정보', { houseId: houseId });
    }

    selectFilterItem = (text) => {
        this.setState(prevState => ({
            filters: prevState.filters.map(filter => 
                filter.key === prevState.currentFilterType ? { ...filter, text: text } : filter
            ),
            modalVisible: false
        }));
    };
    

    changeFavoriteState = (id) => {                 // 찜버튼 누르면 FavoriteState 상태 바꿔주는 함수
        const PlacesState = this.state.places.map(place => {
            if (place.id === id) {                 
                return { ...place, favoriteState: !place.favoriteState };
            }
            return place;
        });
        this.setState({ places: PlacesState });
    };
 
    
    onChangeInput = (event)=>{                      // 검색하면 inputText에 변경된 값 적용시킬 때 입력한담아두는 함수
        this.setState({
            searchText: event 
        })
    }


    
    render() {
        
        const { searchText, modalVisible, places, filters } = this.state;           

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
                                value={searchText} 
                                onChangeText={this.onChangeInput}/>
                        </View>

                <Modal
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { this.setModalVisible(false); }}>
                    <View style={styles.modalLayoutView}>
                        <View style={styles.modalView}>
                            {/* // 필터 조건 리스트 */}
                            {this.state.currentFilter.map((filterItem) => (
                                <TouchableOpacity
                                key={filterItem.id}
                                style={styles.modalTextView}
                                onPress={() => this.selectFilterItem(filterItem.text)}
                                >
                                    <Text style={styles.modalText}>{filterItem.text}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() => this.setModalVisible(false)}
                                >
                                <Text style={styles.modalBtnText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                             {/* //필터 리스트 */}
                <ScrollView style={styles.filterView} showsHorizontalScrollIndicator={false} horizontal={true}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                        key={filter.key}
                        style={styles.filterTouch}
                        onPress={() => this.setModalVisible(true, filter.key)}>
                            <Text style={styles.filterBtn}>{filter.text}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                    {/* //숙소정보 리스트 */}
                {filteredPlaces.map((place) => (    
                    <TouchableOpacity key={place.id} style={styles.content} onPress={() => this.placeInfoDelivery(place.id)}>
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

            <TouchableOpacity style={styles.fixedButton} onPress={() => this.props.navigation.navigate('숙소등록')}>
                <Image style={styles.housePlusIcon} source={housePlusIconIMG}/>
            </TouchableOpacity>
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
    barMargin: {                    // 스클롤 탭바 마진
        height: 75,
    },
    fixedButton: {                  // 숙소등록 버튼 고정시키는 View
        position: 'absolute',
        bottom: 90,
        right: 25,    
        height: 50,  
        width: 50,  
        justifyContent: 'center', 
        alignItems: 'center',     
        borderRadius: 50,      
    },
    housePlusIcon: {                // 호스트 숙소등록 버튼
        height: 50,  
        width: 50,
        resizeMode: 'contain',
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

export default SearchScreen;