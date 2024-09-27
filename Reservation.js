import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native'; 
import Slider from '@react-native-community/slider';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getToken } from './token';
import axios from 'axios';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import portOneIcon from './Image/포트원_로고.png';
import naverPayIcon from './Image/네이버페이_로고.png';
import kakaoPayIcon from './Image/카카오페이_로고.png';
import tossPayIcon from './Image/토스페이_로고.png';
import reviewIconIMG from './Image/평점_별아이콘.png';
import reservationBtn from './Image/예약요청버튼_아이콘.png';
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import noImage from './Image/이미지없음표시.png';
import locationFilterGrayIcon from './Image/검색화면_클릭전_지역필터링아이콘.png';


class ReservationScreen extends Component {

    state = {
        value: 1,
        labels: ["적음", "보통", "많음"],
        houseId: 1,
        reservationId: 1,
        formattedAddresses: {},
        maximumGuestNumber: '',
        phoneNumber: '', 
        availableDates : [],
        interestLevel: "보통",
        

        editHostNameState: false,
        editPhoneNumberState: false,
        editMaximumGuestNumberState: false,
        editIntroTextState: false,

        isCheckInPickerVisible: false,  
        isCheckOutPickerVisible: false,
        checkInDate: '',
        checkOutDate: '',

        places: [                                   // 목록에 띄울 데이터들 관
            { id: 1, 
                name: "김갑순님의 거주지", 
                address:'강원도 속초시 신림면', 
                reviewScore: "4.2", 
                reviewCount: 48, 
                imageUrl: [], 
                favoriteState: true, 
                price: 43000, 
                reservaionState: true, 
                clearReservation: false },
        ],
    }

    componentDidMount() {                           // 렌더링전에 DOM에서 houseId 파라미터 전달받아 두기
        if (this.props.route.params) {
            const { houseId } = this.props.route.params;
            this.setState({ houseId: houseId });
          console.log('Received houseId:', houseId);
        }
            this.getHouseData();
      }

      sliderValueChange = (value) => {                // 호스트 관심도 세팅 슬라이드 바
        const roundedValue = parseFloat(value.toFixed(1));
        this.setState({ 
            value: roundedValue,
            interestLevel: this.state.labels[roundedValue]  
        });
    }

    placeInfoDelivery = (houseId) => {             // 숙소 컨텐츠 클릭시 해당 숙소 정보를 같이 보내 숙소정보화면으로 이동
        this.props.navigation.navigate('숙소정보', { houseId: houseId });
    }

    // axios를 활용한 api통신을 통해 서버에 예약 요청을 보내는 함수
    async postReserationInfoData() {
        try {
            const token = await getToken();
            const { houseId, checkInDate, checkOutDate, maximumGuestNumber, phoneNumber, interestLevel } = this.state;
    
            console.log("startAt:", checkInDate);
            console.log("endAt:", checkOutDate);
            console.log("personNum:",  Number(maximumGuestNumber.replace(/\D/g, '')));
            console.log("phoneNum:", phoneNumber.replace(/\D/g, ''));
            console.log("interestLevel:", interestLevel);
            const response = await axios.post(`http://223.130.131.166:8080/api/v1/reservation/${houseId}`, 
                {
                    startAt: checkInDate,
                    endAt: checkOutDate,
                    personNum: Number(maximumGuestNumber.replace(/\D/g, '')),
                    phoneNum: phoneNumber.replace(/\D/g, ''),
                    interestLevel: interestLevel,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            this.setState({ reservationId : response.id});
    
            console.log('응답받은 데이터:', response.data);
            this.placeInfoDelivery(this.state.houseId);
            
    
        } catch (error) {
            console.error('예약 요청 중 에러 발생:', error);
            
            if (error.response) {
                console.log('Error status:', error.response.status);
                console.log('Error data:', error.response.data);
                console.log('Error headers:', error.response.headers);

                Alert.alert(
                    "예약 요청 실패", 
                    `에러 메시지: ${error.response.data.message}`, 
                    [{ text: "확인", onPress: () => console.log('Alert closed') }] 
                );
            } else if (error.request) {
                console.log('No response received:', error.request);
            } else {
                console.log('Error message:', error.message);
            }
        }
    }

    // async joinReservationState() {                          // 예약상태 확인 테스트용
    //     try {
    //         const token = await getToken();
    //         const { reservationId } = this.state;  
    //         console.log("접근중인 reservationId: "+reservationId);
    
    //         const response = await axios.get(`http://223.130.131.166:8080/api/v1/reservation/${reservationId}`, 
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`
    //                 }
    //             }
    //         );
    
    //         console.log('응답받은 데이터:', response.data);
    
    //     } catch (error) {
    //         console.error('예약 조회 요청 중 에러 발생:', error);
    //         if (error.response) {
    //             console.log('Error status:', error.response.status);
    //             console.log('Error data:', error.response.data);
    //             console.log('Error headers:', error.response.headers);
    //         } else if (error.request) {
    //             console.log('No response received:', error.request);
    //         } else {
    //             console.log('Error message:', error.message);
    //         }
    //     }
    // }
    
    async getHouseData() {                      // axios를 활용한 api통신을 통해 서버로부터 숙소 리스트들을 불러오는 함수
        try {
            const { houseId } = this.props.route.params;
            const token = await getToken();
            const response = await axios.get(`http://223.130.131.166:8080/api/v1/house/${houseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('API response:', response.data);  
            const house = response.data;

            const data = [{
                id: house.id,
                name: house.hostName,
                introText: house.houseIntroduction,
                freeService: house.freeService,
                imageUri: house.photos && house.photos.length > 0 ? house.photos  : [{noImage}],
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
                clearReservation: false,
                availableDates: house.availableDates,
              }];
              

            this.setState({ places: data, availableDates: house.availableDates });

        } catch (error) {
            console.error('Error fetching house data:', error);
        }
    }
        
    getMarkedDates() {                          // availableDates를 Calendar 컴포넌트의 markedDates로 변환하는 함수
        const { availableDates } = this.state;
    
        let markedDates = {};
    
        availableDates.forEach(date => {
            markedDates[date] = {
                selected: false,
                marked: true,
                disabled: false,  // 예약 가능한 날짜는 선택 가능
            };
        });
    
        return markedDates;
    }
   
    formatAddress(address) {                        // 정규식을 활용하여 도로명을 주소명으로 바꾸기
        const regex = /([\S]+[도시])\s*([\S]+[구군시])?\s*([\S]*[동리면읍가구])?/;
        const match = address.match(regex);
        console.log("Original Address:", address);
        console.log("Matched Segments:", match);
        return match ? match.slice(1).join(' ') : "주소를 불러오는데 문제가 발생하였습니다.";
    }
    
    isCheckInPickerVisible = () => {                            // 입실날짜 관련 캘린더 visable 상태관리
        this.setState(prevState => ({
            isCheckInPickerVisible: !prevState.isCheckInPickerVisible,
            isCheckOutPickerVisible: false  
        }));
    };
    
    isCheckOutPickerVisible = () => {                            // 퇴실날짜 관련 캘린더 visable 상태관리
        this.setState(prevState => ({
            isCheckOutPickerVisible: !prevState.isCheckOutPickerVisible,
            isCheckInPickerVisible: false  
        }));
    };


    // onCheckInSelect = (day) => {                                  // 입실 날짜 선택한 날짜들 관리 
    //     const { dateString } = day;
    //     this.setState({ checkInDate: dateString });
    // };
    
    // onCheckOutSelect = (day) => {                                 // 퇴실 날짜 선택한 날짜들 관리
    //     const { dateString } = day;
    //     this.setState({ checkOutDate: dateString });
    // };


    renderCheckInSelectedDate = () => {                             // 캘린더에서 입실날짜 관련 선택한 날짜들 렌더링 처리하기 위해 따로 다룸
        const { checkInDate } = this.state;
        return checkInDate
    };

    renderCheckOutSelectedDate = () => {                            // 캘린더에서 퇴실날짜 관련 선택한 날짜들 렌더링 처리하기 위해 따로 다룸
        const { checkOutDate } = this.state;
        return checkOutDate
    };
    

    changeHostName = (inputText) => {
        this.setState({ hostName: inputText });
    };
    changePhoneNumber = (inputText) => {
        this.setState({ phoneNumber: inputText });
    };
    changeMaximumGuestNumber = (inputText) => {
        this.setState({ maximumGuestNumber: inputText });
    };
    changeIntroText = (inputText) => {
        this.setState({ introText: inputText });
    };
    

    render() {
        const { places, value, labels } = this.state;
        const { checkInDate, checkOutDate, isCheckInPickerVisible, isCheckOutPickerVisible  } = this.state;

        const { hostName, editHostNameState, phoneNumber, editPhoneNumberState, maximumGuestNumber, editMaximumGuestNumberState, 
            price, editPriceState, introText, editIntroTextState } = this.state;

        const { selectedDate } = this.state;

        // 달력 한국어 텍스트 커스텀
        const monthNames = [];
        const dayNames = [];
        const dayNamesShort = [];

        LocaleConfig.locales['ko'] = {
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
            dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
            today: '오늘'
        };

        LocaleConfig.defaultLocale = 'ko';

        // 오늘 날짜 눌럿을때 생기는 이벤트 효과 동일적용
        const today = new Date().toISOString().split('T')[0];
        
        const markedDates = this.getMarkedDates();
        
        // const markedDates = {
        //     [selectedDate]: { selected: true, marked: true, selectedColor: 'green' }
        // };
        
        return (
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => this.props.navigation.goBack()}>    
                        <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.reservationText}> 예약하기 </Text>
                </View>
                <View style={styles.grayHorizontalLine}/>

                {places.length > 0 && places.map((place) => (
                    <TouchableOpacity key={place.id} style={styles.content} onPress={() => this.placeInfoDelivery(place.id)}>
                        <Image source={place.imageUri && place.imageUri.length > 0  ? { uri: place.imageUri[0] }  : noImage} style={styles.houseIMG}/>
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
                </TouchableOpacity>
            ))}

                <View style={styles.grayHorizontalWideLine}/>
               
                <Text style={styles.reservationDateText}> 예약 날짜 </Text>
                <View style={styles.reservationView}>
                    <Text style={styles.reservationDate}>입실 날짜</Text> 
                    <View style={styles.reservationSelectView}>
                        <TextInput style={styles.reservationDateInput} value={this.renderCheckInSelectedDate()} placeholder="날짜를 선택해주세요" editable={false} />
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.isCheckInPickerVisible}>
                        {this.state.isCheckInPickerVisible ? (
                            <Text style={styles.reservationDateSelect}>입실 날짜 선택완료</Text>
                        ):  <Text style={styles.reservationDateSelect}>입실 날짜 선택하기</Text>}
                        </TouchableOpacity>
                    </View>

                    {this.state.isCheckInPickerVisible && (
                        <Calendar
                            current={Date()}
                            monthNames={monthNames}
                            dayNames={dayNames}
                            dayNamesShort={dayNamesShort}
                            markedDates={markedDates}
                            onDayPress={(day) => {
                                const selectedDate = day.dateString;
                                if (markedDates[selectedDate] && !markedDates[selectedDate].disabled) {
                                    this.setState({ checkInDate: selectedDate });
                                } else {
                                    Alert.alert("선택 불가", "예약할 수 없는 날짜입니다.");
                                }
                            }}
                            locale={'ko'} 
                            theme={{
                                todayTextColor: 'lightgreen',
                                selectedDayBackgroundColor: '#00D282',
                                selectedDayTextColor: '#ffffff'
                            }}
                        />
                    )}  
                </View>

                <View style={styles.reservationView}>
                    <Text style={styles.reservationDate}>퇴실 날짜</Text>
                    <View style={styles.reservationSelectView}>
                            <TextInput style={styles.reservationDateInput} value={this.renderCheckOutSelectedDate()} placeholder="날짜를 선택해주세요" editable={false} />
                            <TouchableOpacity style={styles.ModifySelectView} onPress={this.isCheckOutPickerVisible}>
                            {this.state.isCheckOutPickerVisible ? (
                                <Text style={styles.reservationDateSelect}>퇴실 날짜 선택 완료</Text>
                            ):  <Text style={styles.reservationDateSelect}>퇴실 날짜 선택하기</Text>}
                            </TouchableOpacity>
                    </View>
                                  
                    {this.state.isCheckOutPickerVisible && (
                        <Calendar
                            current={Date()}
                            monthNames={monthNames}
                            dayNames={dayNames}
                            dayNamesShort={dayNamesShort}
                            markedDates={markedDates}
                            onDayPress={(day) => {
                                const selectedDate = day.dateString;
                                if (markedDates[selectedDate] && !markedDates[selectedDate].disabled) {
                                    this.setState({ checkOutDate: selectedDate });
                                } else {
                                    Alert.alert("선택 불가", "예약할 수 없는 날짜입니다.");
                                }
                            }}
                            locale={'ko'} 
                            theme={{
                                todayTextColor: 'lightgreen',
                                selectedDayBackgroundColor: '#00D282',
                                selectedDayTextColor: '#ffffff'
                            }}
                        />
                    )}
                </View>
                <View style={styles.grayHorizontalWideLine2}/>

                <Text style={styles.reservationInfoText}> 예약 정보 </Text>
                <View style={styles.reservationInfoView}> 
                    <View style={styles.nameInfoView}>
                        <Text style={styles.nameInfo}> 이름 </Text>
                        <TextInput style={styles.nameInfoText} onChangeText={this.changeHostName} placeholder="ex) 이진석" placeholderTextColor="#B1B1B1">{hostName}</TextInput>
                    </View>

                    <View style={styles.GuestNumberInfoView}>
                        <Text style={styles.GuestNumberInfo}> 예약 인원 </Text>
                        <TextInput style={styles.GuestNumberInfoText} onChangeText={this.changeMaximumGuestNumber} placeholder="ex) 2명" placeholderTextColor="#B1B1B1" >{maximumGuestNumber}</TextInput>
                    </View>
                 
                    <View style={styles.phoneNumberInfoView}>
                        <Text style={styles.phoneNumberInfo}> 게스트 연락처 </Text>
                        <TextInput style={styles.phoneNumberInfoText} onChangeText={this.changePhoneNumber} placeholder="ex) 010-1234-5678" placeholderTextColor="#B1B1B1" >{phoneNumber}</TextInput>
                    </View>

                
                    <View style={styles.hostAttentionInfoView}>
                        <Text style={styles.hostAttentionInfo}> 호스트 관심도 </Text>
                        <TouchableOpacity style={styles.ModifySelectView}>
                        <Slider
                            style={styles.slider}
                            value = {this.state.value}
                            minimumValue={0}
                            maximumValue={2}
                            onValueChange={this.sliderValueChange}
                            step={1}
                            thumbTintColor="#00D282"
                        />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hostAttentionInfoText}>  {labels[value]} </Text>
                    
                    <Text style={styles.requestInfo}> 요청사항 </Text>
                    <TextInput style={styles.requestInfoText} onChangeText={this.changeIntroText} placeholder="ex) 1박 2일 동안 잘 부탁드립니다~!" placeholderTextColor="#B1B1B1" multiline={true}>{introText}</TextInput>
                </View>

                <View style={styles.explanationView}>
                    <Text style={styles.explanation}> ※ 관심도란?</Text>
                    <Text style={styles.explanationText}> 소극: 호스트의 터치없이 개인시간을 가지고 싶어요</Text>
                    <Text style={styles.explanationText}> 보통: 평소처럼 편하신대로 대해주세요 </Text>
                    <Text style={styles.explanationText}> 적극: 호스트가 적극적으로 가이드 해주길 원해요</Text>
                </View>
                <View style={styles.grayHorizontalWideLine2}/>

                {/* <Text style={styles.payText}> 결제하기 </Text>
                <View style={styles.payMethodView}>
                    <TouchableOpacity style={styles.payMethodTouchView} onPress={()=> alert('api 버전호환문제 고치는중')}>
                    <View style={styles.payMethod}>
                        <Image style={styles.portOneIcon} source={portOneIcon} />
                        <Text style={styles.protOneText}> 포트원으로 결제하기 </Text>
                    </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.payMethodTouchView} onPress={()=> alert('api 버전호환문제 고치는중')}>
                    <View style={styles.payMethod}>
                        <Image style={styles.naverPayIcon} source={naverPayIcon}/>
                        <Text style={styles.naverPayText}> 네이버 페이로 결제하기 </Text>
                    </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.payMethodTouchView} onPress={()=> alert('api 버전호환문제 고치는중')}>
                    <View style={styles.payMethod}>
                        <Image style={styles.kakaoPayIcon} source={kakaoPayIcon} />
                        <Text style={styles.kakaoPayText}> 카카오 페이로 결제하기 </Text>
                    </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.payMethodTouchView} onPress={()=> alert('api 버전호환문제 고치는중')}> 
                    <View style={styles.payMethod}>
                        <Image style={styles.tossPayIcon} source={tossPayIcon} />
                        <Text style={styles.tossPayText}> 토스 페이로 결제하기 </Text>
                    </View>
                    </TouchableOpacity>
                </View> */}

                <Text style={styles.houseRuleText}> 유의사항 </Text>
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

                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.postReserationInfoData()}>
                <Image style={styles.reservationBtnIcon} source={reservationBtn}/>
                </TouchableOpacity>

                {/* <TouchableOpacity style={styles.reservationBtn} onPress={() => this.joinReservationState()}>
                    <Text style={styles.reservationBtn}>예약현황 조회하기</Text>
                </TouchableOpacity> */}

                <View style={styles.barMargin}><Text> </Text></View>
            </View>
            </ScrollView>
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
  background: {                                // 전체화면 세팅                     
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
    },
    container : {                             // 컴포넌트들 가운데 정렬
        alignItems: 'center', 
    },
    titleView: {                             // 뒤로가기버튼, 예약하기 텍스트 담는 View
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 44,
        width: '100%',
        paddingLeft: "1.8%",
        // backgroundColor: "yellow",
    },  
    backBtnIcon: {                         // 뒤로가기 아이콘
        resizeMode: 'contain',
        width: 20,
        height: 20,
        marginRight: '0.3%',
        // backgroundColor: "gray"
        
    },
    content: {                      // 검색 리스트 컴포넌트, 내가 찜한 숙소 컨텐츠들 
        width: 330,
        height: 150,
        alignItems: "center",
        flexDirection: 'row',
        backgroundColor: 'white',
        marginTop: '3.8%',
        borderRadius: 20,
        // elevation: 1,
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
        marginLeft: "1.8%",
        marginTop: "1.8%",
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
    addressIcon:{                                // 상세주소 위치 아이콘 
        width: 10,
        height: 14,
        resizeMode: "contain",
        marginRight: "2.2%",
    },
    houseAddress: {                                // 찜한숙소 상세 주소
        width: 150,
        textAlign: 'left',
        fontSize: 15,
        color: '#A8A8A8',
        fontFamily: 'Pretendard-Regular', 
        // backgroundColor: 'yellow',
    },
    houseReviewView: {                           // 평점 아이콘, 평점 텍스트 담는 View
        width: 170,
        height: 26,
        flexDirection: 'row',
        alignItems:'center',
        marginTop: '1.1%',  
        // backgroundColor: 'gray',

    },
    houseReview: {                              // 찜한숙소 평점및 리뷰 갯수
        textAlign: 'left',
        fontSize: 15,
        marginLeft: '1.5%',
        color: '#777777',
        fontFamily: 'Pretendard-Regular', 
        // backgroundColor: 'gray',
    },
    reviewIcon:{                               // 리뷰 별 아이콘
        marginLeft: '0.5%',
        marginRight: '1.5%',
        width: 15.4,
        height: 15.4,
        // backgroundColor: 'yellow',
    },  
    housePrice:{                              // 숙소 가격
        position: 'absolute',
        width: 165,
        bottom: 18,
        fontSize: 20,
        marginLeft: '1.5%',
        color: '#0AE090',
        fontWeight: '500',
        // backgroundColor: 'yellow',
    },
    PriceSubText:{                           // 가격옆에 서브 텍스트 (/박) 
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
    favoriteIcon: {                          // 찜버튼 아이콘
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },

    reservationText: {                      // 예약하기 텍스트  
            fontSize: 22,
            color: "black",
            width: '88%',
            // backgroundColor: "gray"
    },  
    grayHorizontalLine: {                  // 회색 가로선
        width: '100%',
        height: 1.8,
        backgroundColor: '#BFBFBF',
        marginTop: "5%",
    },
    grayHorizontalWideLine:{                // 두꺼운 회색 가로선
        width: '100%',
        height: 10,
        backgroundColor: '#F5F5F5',
        marginTop: "5%",
    },
    grayHorizontalWideLine2:{                // 두꺼운 회색 가로선2 (위쪽 마진값만 다름)
        width: '100%',
        height: 10,
        backgroundColor: '#F5F5F5',
        marginTop: "7.7%",
    },
    reservationDateText: {                  // 예약날짜 제목 텍스트
        marginTop: '6.6%',
        fontSize: 22,
        width: '90%',
        color: 'black',
        fontFamily: 'Pretendard-Bold',
    },
    reservationView: {                      // 예약날짜 본문 텍스트 담는 view
        width: '84%',
        marginTop: '3.3%',
        flexdirection: 'row',
        justifyContent: "center",
        alignItems: 'center',
        // backgroundColor: 'gray',
        
    },
    reservationSelectView:{                 // 예약날짜, 예약날짜 선택 가로로 배치하는 View
        flexDirection: 'row',
        width: '100%',
        alignItems: "center",
        marginTop: '3.3%',
        // backgroundColor: 'yellow',
    },
    reservationDate: {                      // 입실날짜, 퇴실날짜 텍스트
        marginTop: '2.4%',
        fontSize: 18,
        width:'100%',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Pretendard-Bold',
        color: 'black',
        // backgroundColor: 'yellow',
    },
    ModifySelectView: {                    // 날짜 선택, 입력하기 세로 위치조절 ToucableOpacity View
        width: '20%',
        marginLeft: '3.3%',

        // backgroundColor: 'green',
    },
    reservationDateSelect: {               // 날짜 선택하기 텍스트
        fontSize: 14,
        color: "#00D282",  
        borderWidth: 1,
        borderColor: '#00D282',
        borderRadius: 10,
        width: 170,
        height: 42,
        textAlign:  'center',
        textAlignVertical: "center",
        backgroundColor: 'white',
    },
    reservationDateInput: {                // 입력한 날짜 본문 텍스트
        height: 42,
        width: 130,
        fontSize: 14,
        textAlignVertical: "center",
        paddingLeft: 10,
        paddingRight: 10,
        color: 'black',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    reservationInfoText:{                  // 예약 정보 제목 텍스트
        marginTop: '6.6%',
        fontSize: 22,
        width: '90%',
        color: 'black',
        fontFamily: 'Pretendard-Bold',
    },
    reservationInfoView: {                 // 예약 정보 본문 View
        width: '90%',
        marginTop: '3.3%',
        alignItems: 'center',
        // backgroundColor: 'green',
    },
    nameInfoView: {                        // 이름 , 입력하기 텍스트담는 가로 배치 View
        marginTop: '5.5%',
        width: '94%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        // backgroundColor: 'green',
    },
    nameInfo: {                            // '이름' 텍스트
        fontSize: 18,
        width:'94%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    nameInfoText: {                        // 이름 본문 텍스트
        fontSize: 16,
        height: 46,
        width: '100%',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        padding:"3%",
    },
    GuestNumberInfoView: {                        // 이름 , 입력하기 텍스트담는 가로 배치 View
        marginTop: '5.5%',
        width: '94%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        // backgroundColor: 'green',
    },
    GuestNumberInfo: {                            // '이름' 텍스트
        fontSize: 18,
        width:'94%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    GuestNumberInfoText: {                        // 이름 본문 텍스트
        fontSize: 16,
        height: 46,
        width: '100%',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        padding:"3%",
    },
    phoneNumberInfoView: {                 // 게스트 연락처 , 입력하기 텍스트담는 가로 배치 View
        marginTop: '5.5%',
        width: '94%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        // backgroundColor: 'green',
    },
    phoneNumberInfo: {                     // '게스트 연락처' 텍스트
        fontSize: 18,
        width:'94%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    phoneNumberInfoText: {                 // 게스트 연락처 본문 텍스트
        fontSize: 16,
        height: 46,
        width: '100%',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        padding:"3%",
    },
    hostAttentionInfoView: {                 // 호스트 관심도 , 입력하기 텍스트담는 가로 배치 View
        marginTop: '5.5%',
        width: '94%',
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: 'green',
    },
    hostAttentionInfo: {                     // '호스트 관심도' 텍스트
        fontSize: 18,
        width:'62%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    slider: {                                // 호스트 관심도 설정 슬라이더
        width: 110,
    },
    hostAttentionInfoText: {                 // 호스트 관심도 본문 텍스트
        fontSize: 16,
        height: 46,
        width: '94%',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
    },
    requestInfo: {                           // '요청사항' 텍스트
        marginTop: '5.5%',
        fontSize: 18,
        width:'94%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    requestInfoText: {                      // 요청 사항 본문 텍스트
        fontSize: 16,
        width: '94%',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        padding:"3%",
    },
    payText: {                              // 결제하기 제목 텍스트
        marginTop: '6.6%',
        fontSize: 22,
        width: '90%',
        color: 'black',
        fontFamily: 'Pretendard-Bold',
    },
    payMethodTouchView:{                   // 결제수단 touchableOpacity View
        width: '90%',
        // backgroundColor: 'gray',
    },
    payMethodView: {                       // 결제수단 VIew들 정렬하는 view
        width: '90%',
        borderRadius: 15,
        marginTop: '6.6%',
        paddingBottom: '7.3%',
        flexDirection: 'column',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'gray',
    },
    payMethod: {                           // 결제수단 아이콘, 텍스트 가로로 배치하는 View
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '7.3%',
        borderWidth: 1,
        borderColor: '#979797',
        borderRadius: 18,
        width: '100%',
        height: 66,
    },
    portOneIcon: {                         // 포트원 아이콘
        width: 60,
        height: 60,
        // backgroundColor: 'green',
    },
    protOneText: {                         // 포트원으로 결제하기 텍스트
        width: '72%',
        textAlign: 'center',
        fontSize: 20,
        // backgroundColor: 'yellow',
    },
    naverPayIcon: {                         // 네이버페이 아이콘
        width: 60,
        height: 60,
    },
    naverPayText: {                         // 네이버페이로 결제하기 텍스트
        width: '72%',
        textAlign: 'center',
        fontSize: 20,
        // backgroundColor: 'yellow',
    },
    kakaoPayIcon: {                         // 카카오페이 아이콘
        width: 60,
        height: 60,
    },
    kakaoPayText: {                         // 카카오페이로 결제하기 텍스트
        width: '72%',
        textAlign: 'center',
        fontSize: 20,
        // backgroundColor: 'yellow',
    },
    tossPayIcon: {                         // 토스페이 아이콘
        width: 60,
        height: 60,
    },
    tossPayText: {                         // 토스페이로 결제하기 텍스트
        width: '72%',
        textAlign: 'center',
        fontSize: 20,
        // backgroundColor: 'yellow',
    },

    columnMiidle:{                           // 가로 가운데 정렬 - 숙소 이용규칙 본문담는 View 가운데 정렬
        alignItems: 'center',
    },
    houseRuleView: {                          // 숙소 이용규칙 본문 담는 View
        marginTop: '6.6%',
        paddingLeft: '4%',
        width: 360,
        heigh: 400,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    houseRuleOptionText: {                    // 숙소 이용규칙 본문 텍스트
        marginTop: '5.5%',
        fontSize: 16,
        color: '#939393',
        // backgroundColor:'yellow',
    },
    houseRuleOptionTextMargin: {              // 숙소 이용규칙 하단 마진
        marginBottom: '1%',
    },
    ruleAlertText: {                          // 숙소 이용규칙 패널디에 대한 텍스트
        fontSize: 14,
        width: 340,
        color: '#4285F4',
        marginTop: '8.8%',
        textAlign:'center',
    },
    barMargin: {                              // 스클롤 탭바 마진
        height: 70,
    },
    reservationBtn:{                          // 예약 버튼
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10%',
        // backgroundColor : "#00D282", 
    },
    reservationBtnIcon:{                         // 예약하기 버튼
        marginBottom: '1.5%',
        width: "100%",
        height: 55,
        resizeMode: "contain",
    },
    explanationView:{
        width: '90%',
        marginTop: '4.4%',
        marginBottom: '1%',
    },
    explanation: {                           // 관심온도란? 텍스트
        fontSize: 20,
        color: '#7C7C7C',
        width: 360,
        },
    explanationText: {                       // 관심온도 설명 텍스트
        fontSize: 14,
        marginTop: '1.8%',
        marginLeft: '1.1%',
        color: '#7C7C7C'
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
});

export default ReservationScreen;