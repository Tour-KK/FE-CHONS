import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Hangul from 'hangul-js';
import axios from 'axios';
import { getToken } from './token';

//이미지
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import housePlusIconIMG from './Image/추가_아이콘.png';
import reviewIconIMG from './Image/평점_별아이콘.png';
import searchIconIMG from './Image/검색화면_검색아이콘.png';
import locationFilterIcon from './Image/검색화면_지역필터링아이콘.png';
import priceFilterIcon from './Image/검색화면_가격필터링아이콘.png';
import guestNumFilterIcon from './Image/검색화면_인원수필터링아이콘.png';
import periodFilterIcon from './Image/검색화면_기간필터링아이콘.png';
import noImage from './Image/이미지없음표시.png';
import locationFilterGrayIcon from './Image/검색화면_클릭전_지역필터링아이콘.png';
import priceFilterGrayIcon from './Image/검색화면_클릭전_가격필터링아이콘.png';
import guestNumFilterGrayIcon from './Image/검색화면_클릭전_인원수필터링아이콘.png';
import periodFilterGrayIcon from './Image/검색화면_클릭전_기간필터링아이콘.png';
import closeBtnIcon from './Image/닫기버튼_아이콘.png';


class SearchScreen extends Component {
    
    state = {
        searchText: '',
        modalVisible: false,

        tempFilter: null,
        selectedFilterItem: null,
        
        currentFilter: [], 
        currentFilterType: '',
        selectedFilterTitle: '',
        
        appliedFilters: {
            location: '',
            period: '',
            price: '',
            guestCount: ''
        },
        
        places: [                                   // 목록에 띄울 데이터들 관
            { id: 1, 
                name: "이민호", 
                address: "경기도 용인시 수지구", 
                reviewScore: 4.3, 
                reviewCount: 21, 
                imageUri: [],
                price: 32000, 
                favoriteState: true, 
            },
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
            { id: 3, 
                name: "[이름없음]", 
                address: "[주소없음]", 
                reviewScore: 0,     
                reviewCount: 0, 
                imageUri: [],
                price: 0, 
                favoriteState: false, 
                reservaionState: false, 
                clearReservation: false 
            },
            { id: 4, 
                name: "[이름없음]", 
                address: "[주소없음]", 
                reviewScore: 0, 
                reviewCount: 0, 
                imageUri: [],
                price: 0, 
                favoriteState: false, 
                reservaionState: false, 
                clearReservation: false 
            },
            { id: 5, 
                name: "[이름없음]", 
                address: "[주소없음]", 
                reviewScore: 0, 
                reviewCount: 0, 
                imageUri: [],
                price: 0, 
                favoriteState: false, 
                reservaionState: false, 
                clearReservation: false 
            },
        ],

        filters: [                                // 필터링 목록의 필터링 컨텐츠들
            { key: 'location', text: '숙소지역', icon: locationFilterIcon},
            { key: 'period', text: '숙박기간', icon: periodFilterIcon},  
            { key: 'price', text: '숙박가격', icon: priceFilterIcon},  
            { key: 'guestCount', text: '전체 인원수', icon: guestNumFilterIcon},  
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
        priceFilter: [
            { id: '1', text: '50000원 이하' },
            { id: '2', text: '50000원 ~ 100000원' },
            { id: '3', text: '100000원 ~ 200000원' },
            { id: '4', text: '300000원 이상' },
        ],
        guestCountFilter: [
            { id: '1', text: '1명' },
            { id: '2', text: '2명' },
            { id: '3', text: '3명' },
            { id: '4', text: '4명 이상' },
        ],
      }

    componentDidMount() {
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
    

    // 필터링 버튼 클릭시 필터링 종류에 맞게 모달과 모달title에 출력하는 filterData를 지정해주고 모달을 보이게 해주는 함수
    setModalVisible = (visible, filterKey = '') => {    
        let filterData = [];
        let filterTitle = '';

    if (!visible) {
        this.setState({ tempFilter: null, selectedFilterItem: null }); 
    } else if (filterKey === 'location') {
        filterData = this.state.locationFilter;
        filterTitle = '숙소지역 필터';
    } else if (filterKey === 'period') {
        filterData = this.state.periodFilter;
        filterTitle = '숙박기간 필터 (1박)';
    } else if (filterKey === 'price') {
        filterData = this.state.priceFilter;
        filterTitle = '숙박가격 필터';
    } else if (filterKey === 'guestCount') {
        filterData = this.state.guestCountFilter;
        filterTitle = '전체 인원수 필터';
    }

        
        this.setState({
            modalVisible: visible,
            currentFilter: filterData,
            currentFilterType: filterKey,
            selectedFilterTitle: filterTitle,
        });
    };

    
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
        
    
    applyFilter = () => {                               // 선택한 필터 적용시키기
        if (this.state.tempFilter) {
            this.setState(prevState => ({
                appliedFilters: {
                    ...prevState.appliedFilters,
                    [prevState.currentFilterType]: prevState.tempFilter.value
                },
                filters: prevState.filters.map(filter => 
                    filter.key === prevState.tempFilter.type ? { ...filter, text: prevState.tempFilter.value } : filter
                ),
                modalVisible: false,
                tempFilter: null,
                selectedFilterItem: null
            }));
        }
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
    
    
    render() {
        const { searchText, modalVisible, places, filters, selectedFilterTitle } = this.state;           

        const filteredPlaces = places.filter(place => {                   // Hangul 모듈을 활용해 검색어와 숙소의 name, address값 같은게 있는지 비교
        return Hangul.search(place.name, searchText) >= 0 || Hangul.search(place.address, searchText) >= 0;     
        }); 
        
        return (
        <View style={styles.backgroundView}>
            <ScrollView  style={styles.background} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.search}>
                        <Image style={styles.searchIcon} source={searchIconIMG}/>  
                        <TextInput 
                            style={styles.input} 
                            placeholder= '지역, 호스트 이름 검색' 
                            placeholderTextColor="#979797"
                            value={searchText} 
                            onChangeText={this.onChangeInput}/>
                    </View>

                    <Modal transparent={true} visible={modalVisible} onRequestClose={() => { this.setModalVisible(false); }}>
                        <View style={styles.modalView}>
                            <View style={styles.modalMenu}>
                                <Text style={styles.selectedFilterTitle}> {selectedFilterTitle} </Text>
                                <TouchableOpacity style={styles.modalBtn} onPress={() => this.setModalVisible(false)} >
                                    <Image style={styles.closeBtnIcon} source={closeBtnIcon}/>
                                </TouchableOpacity>
                            </View>

                            {/* // 필터 조건 리스트 */}
                            {this.state.currentFilter.map((filterItem) => (
                                <TouchableOpacity key={filterItem.id} style={[ styles.modalTextView, this.state.selectedFilterItem === filterItem.text ? styles.selectedFilterBackground : null ]} onPress={() => this.selectFilterItem(filterItem.text)} >
                                    <Text style={[ styles.modalText, this.state.selectedFilterItem === filterItem.text ? styles.selectedFilterText : null ]}>{filterItem.text}</Text>
                                </TouchableOpacity>
                            ))}
                            

                            <LinearGradient colors={['#0AE090', '#0AE0C6']} style={styles.modalCheckBtn} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                                <TouchableOpacity onPress={this.applyFilter}>
                                    <Text style={styles.modalCheckBtnText}>적용</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </Modal>

                    {/* //필터 리스트 */}
                    <ScrollView style={styles.filterView} horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 140 }}>
                        {this.state.filters.map((filter) => (
                            <TouchableOpacity key={filter.key} style={[ styles.filterTouch, this.state.appliedFilters[filter.key] ? styles.selectedFilterBackground : {} ]} onPress={() => this.setModalVisible(true, filter.key)} >
                                <Image style={styles.filterIcon} source={filter.icon}/>
                                <Text style={[ styles.filterText, this.state.appliedFilters[filter.key] ? styles.selectedFilterText : {} ]}>{filter.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

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
                                    <Text style={styles.houseAddress}>{place.address}</Text>
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
        
            <TouchableOpacity style={styles.fixedButton} onPress={() => this.props.navigation.navigate('숙소등록')}>
                <Image style={styles.housePlusIcon} source={housePlusIconIMG}/>
            </TouchableOpacity>

        </View>
    );  
    }
}

    // 스타일 시트
const styles = StyleSheet.create({
    backgroundView:{                  // 전체화면 세팅 ( 숙소등록버튼떄문에 View로 감싸줌)         
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "#F5F5F5",
    },
    background: {                     // scrollView 세팅                     
        flex: 0,
        width: '100%',
        height: '100%',
       
    },
    container : {                   // 컴포넌트들 가운데 정렬
        alignItems: 'center', 
    },
    search: {                           // 검색창 View
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '92%',
        height: 48,
        borderRadius: 50, 
        backgroundColor: 'white',
        marginTop: '6.6%',
        marginBottom: '3.8%',
        borderWidth: 2,
        borderColor: '#00D282' 
    },
    searchIcon: {                       // 검색 아이콘         
        marginLeft: 15,  
        width: 24,
        height: 24,
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
    filterView: {                   // 필터 컴포넌트 담는 View
        width: '90%',
        height: 34,
        marginBottom: '3.3%',
        // backgroundColor: 'gray',
        // alignItems: "center",
    },
    filterTouch: {                  // 필터 TouchableOpacity View
        justifyContent: 'center',
        alignItems: "center",
        flexDirection: "row",
        height: 34,
        paddingRight: 4,
        minWidth: 74,        
        marginRight: 14, 
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#0AE090',
        borderRadius: 50, 
    },
    filterIcon:{                     // 필터버튼 아이콘
        width: 11,
        height: 14,
        resizeMode: "contain",
        marginRight: "10%",
    },
    filterText: {                    // 필터 버튼
        fontSize: 14,
        textAlignVertical: "center",
        height: 20,
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
    fixedButton: {                  // 숙소등록 버튼 고정시키는 View
        position: 'absolute',
        bottom: 90,
        right: 25,    
        height: 40,  
        width: 40,
        justifyContent: 'center', 
        alignItems: 'center',     
        borderRadius: 50,       
        backgroundColor: "gray"
    },
    housePlusIcon: {                // 호스트 숙소등록 버튼
        height: 70,  
        width: 70,
        resizeMode: 'cover',
        // backgroundColor: "gray",
    },
    modalView: {
        position: "absolute",
        bottom: 0,
        width: '100%',  
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection:'row',
        flexWrap: 'wrap',
        borderRadius: 10,
        elevation: 2,
        paddingBottom: 80,  
    },
    modalMenu:{                           // 모달 title과 닫기버튼 담는 View
        flexDirection: "row",
        alignItems: "center",
        marginTop: '11.4%',
        // backgroundColor: "yellow",
    },
    selectedFilterTitle:{                 // 모달 필터링 title
        fontSize: 18,
        fontFamily: 'Pretendard-Bold',
        textAlign: 'left',
        paddingLeft: "5%",
        width: '90%',
    },
    modalBtn: {                             // 모달 필터링 닫기 버튼
        marginTop: '2.4%',
        marginLeft: '3.3%',
        // backgroundColor: "gray",
    },  
    closeBtnIcon:{                            // 모달 필터링 닫기 버튼 아이콘
        width: 18,
        height: 18,
        resizeMode: "contain",
    },  
    modalTextView:{                       // 모달  필터링 터치 View
        paddingTop: '2%',
        paddingBottom: '2%',
        paddingRight: '4%',
        paddingLeft: '4%',
        margin:'2%',
        backgroundColor: 'white',
        borderColor: '#CBCBCB',
        borderWidth: 0.8,
        borderRadius: 10, 
    },
    selectedFilterBackground: {             // '서울'과 같은 선택된 필터값의 배경색 및 테두리
        backgroundColor: '#F3FFFA', 
        borderColor: '#0AE090', 
    },
    selectedFilterText:{                    // '서울'과 같은 선택된 필터값의 텍스트 디자인
        fontFamily: 'Pretendard-Bold',
        textAlign: 'center',
        fontSize: 13,
        color: '#0AE090'
    },
    modalText: {                            // 모달 필터링 내용 텍스트
        textAlign: 'center',
        fontSize: 13,
        fontFamily: 'Pretendard-Regular',
    },
    modalCheckBtn:{                         // 모달 선택한 필터링 적용버튼
        position: "absolute",
        bottom: "5%",
        width: '90%',
        height: 50,
        borderRadius: 50,
        backgroundColor: '#0AE090',
        alignItems: "center",
        justifyContent: "center",
    },
    modalCheckBtnText:{
        color: "white",
        fontSize: 18,
        fontFamily: 'Pretendard-Bold',
    },
});

export default SearchScreen;