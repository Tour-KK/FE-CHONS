import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from "react-native-modal-datetime-picker";

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import portOneIcon from './Image/포트원_로고.png';
import naverPayIcon from './Image/네이버페이_로고.png';
import kakaoPayIcon from './Image/카카오페이_로고.png';
import tossPayIcon from './Image/토스페이_로고.png';
import checkFavoriteIconIMG from './Image/체크된_즐겨찾기_아이콘.png';
import FavoriteIconIMG from './Image/즐겨찾기_아이콘.png';
import reviewIconIMG from './Image/회색_별_아이콘.png';




class ReservationScreen extends Component {

    state = {
        value: 1,
        labels: ["소극", "보통", "적극"],
        editHostNameState: false,
        editPhoneNumberState: false,
        editMaximumGuestNumberState: false,
        editIntroTextState: false,

        isCheckInPickerVisible: false,  
        isCheckOutPickerVisible: false,
        checkInDate: '',
        checkOutDate: '',

        places: [                                   // 예약선택한 숙소정보 띄울 때 필요한 데이터들 관리
            { id: 1, 
                name: "", 
                address: "", 
                reviewScore: "", 
                reviewCount: 0, 
                imageUrl: [], 
                favoriteState: true, 
                price: 0, 
                reservaionState: true, 
                clearReservation: false },
        ],
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
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
            const data = [{
                id: house.id,
                name: house.hostName,
                imageUri: house.photos,
                price: house.pricePerNight,
                address: house.address,
                reviewScore: house.starAvg, 
                reviewCount: house.reviewNum, 
                favoriteState: house.liked, 
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
   

    sliderValueChange = (value) => {
        const roundedValue = parseFloat(value.toFixed(1));
        this.setState({ value: roundedValue });
    }

    placeInfoDelivery = (houseId) => {             // 숙소 컨텐츠 클릭시 해당 숙소 정보를 같이 보내 숙소정보화면으로 이동
        this.props.navigation.navigate('숙소정보', { houseId: houseId });
    }
    

   showCheckInPicker = () => {
        this.setState({ isCheckInPickerVisible: true });
    };

    hideCheckInPicker = () => {
        this.setState({ isCheckInPickerVisible: false });
    };

    handleCheckInConfirm = (date) => {
        this.setState({
            checkInDate: date.toISOString().split('T')[0], 
            isCheckInPickerVisible: false 
        });
    };

    showCheckOutPicker = () => {
        this.setState({ isCheckOutPickerVisible: true });
    };

    hideCheckOutPicker = () => {
        this.setState({ isCheckOutPickerVisible: false });
    };

    handleCheckOutConfirm = (date) => {
        this.setState({
            checkOutDate: date.toISOString().split('T')[0], 
            isCheckOutPickerVisible: false 
        });
    };

    editHostnameText = () => {
        this.setState(prevState => ({ editHostNameState: !prevState.editHostNameState }));
    };
    editPhoneNumberText = () => {
        this.setState(prevState => ({ editPhoneNumberState: !prevState.editPhoneNumberState }));
    };
    editMaximumGuestNumberText = () => {
        this.setState(prevState => ({ editMaximumGuestNumberState: !prevState.editMaximumGuestNumberState }));
    };
    editIntroText = () => {
        this.setState(prevState => ({ editIntroTextState: !prevState.editIntroTextState }));
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
            
        const { houseId } = this.props.route.params;

        return (
            <LinearGradient
            colors={['#F0F4FF', '#FFFFFF']} 
            style={styles.linearGradient} 
            start={{ x: 0, y: 0.8 }} 
            end={{ x: 0, y: 0}} >
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => this.props.navigation.goBack()}>    
                        <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.reservationText}> 예약하기 </Text>
                </View>
               
                {places.filter(place => place.reservaionState).map((place) => (
                    <TouchableOpacity style={styles.content} onPress={() => this.placeInfoDelivery(place.id)} >
                        <Image source={place.imageUrl} style={styles.houseIMG}/>
                        <View key={place.id} style={styles.Info}>
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
                        </View>
                    </TouchableOpacity>
                ))}
               
                <Text style={styles.reservationDateText}> 예약 날짜 </Text>
                <View style={styles.reservationView}>
                        <View style={styles.reservationSelectView}>
                            <Text style={styles.reservationDate}>입실 날짜</Text>
                            <TouchableOpacity style={styles.ModifySelectView} onPress={this.showCheckInPicker}>
                                <Text style={styles.reservationDateSelect}>날짜 선택하기</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePickerModal
                            isVisible={isCheckInPickerVisible}
                            mode="date"
                            onConfirm={this.handleCheckInConfirm}
                            onCancel={this.hideCheckInPicker} />
                        <TextInput
                            style={styles.reservationDateInput}
                            value={checkInDate}
                            placeholder="날짜를 선택해주세요"
                            editable={false} />

                        <View style={styles.reservationSelectView}>
                            <Text style={styles.reservationDate}>퇴실 날짜</Text>
                            <TouchableOpacity style={styles.ModifySelectView} onPress={this.showCheckOutPicker}>
                                <Text style={styles.reservationDateSelect}>날짜 선택하기</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePickerModal
                            isVisible={isCheckOutPickerVisible}
                            mode="date"
                            onConfirm={this.handleCheckOutConfirm}
                            onCancel={this.hideCheckOutPicker} />
                        <TextInput
                            style={styles.reservationDateInput}
                            value={checkOutDate}
                            placeholder="날짜를 선택해주세요"
                            editable={false} />
                    </View>

                <Text style={styles.reservationInfoText}> 예약 정보 </Text>
                   
                <View style={styles.reservationInfoView}> 
                    <View style={styles.nameInfoView}>
                        <Text style={styles.nameInfo}> 이름 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editHostnameText} >
                            <Text style={styles.nameInfoModify} > {editHostNameState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editHostNameState?
                        ( <TextInput style={styles.nameInfoText} onChangeText={this.changeHostName} placeholder="ex) 이진석" placeholderTextColor="#B1B1B1" editable={editHostNameState}>{hostName}</TextInput>)
                        :( <TextInput style={styles.nameInfoText} onChangeText={this.changeHostName} placeholder="게스트명을 입력해주세요" placeholderTextColor="#B1B1B1" editable={editHostNameState}>{hostName}</TextInput>) 
                    }

                    <View style={styles.nameInfoView}>
                        <Text style={styles.nameInfo}> 예약 인원 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editMaximumGuestNumberText} >
                            <Text style={styles.nameInfoModify} > {editMaximumGuestNumberState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editMaximumGuestNumberState?
                        ( <TextInput style={styles.nameInfoText} onChangeText={this.changeMaximumGuestNumber} placeholder="ex) 2명" placeholderTextColor="#B1B1B1" editable={editMaximumGuestNumberState}>{maximumGuestNumber}</TextInput>)
                        :( <TextInput style={styles.nameInfoText} onChangeText={this.changeMaximumGuestNumber} placeholder="게스트의 인원을 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editMaximumGuestNumberState}>{maximumGuestNumber}</TextInput>) 
                    }

                    <View style={styles.phoneNumberInfoView}>
                        <Text style={styles.phoneNumberInfo}> 게스트 연락처 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editPhoneNumberText} >
                            <Text style={styles.phoneNumberInfoModify} > {editPhoneNumberState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editPhoneNumberState?
                        ( <TextInput style={styles.phoneNumberInfoText} onChangeText={this.changePhoneNumber} placeholder="ex) 010-1234-5678" placeholderTextColor="#B1B1B1" editable={editPhoneNumberState}>{phoneNumber}</TextInput>)
                        :( <TextInput style={styles.phoneNumberInfoText} onChangeText={this.changePhoneNumber} placeholder="게스트의 연락처를 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editPhoneNumberState}>{phoneNumber}</TextInput>) 
                    }
                
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
                            thumbTintColor="#4285F4"
                            
                        />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hostAttentionInfoText}>  {labels[value]} </Text>
                    

                    <View style={styles.phoneNumberInfoView}>
                        <Text style={styles.phoneNumberInfo}> 요청사항 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editIntroText} >
                            <Text style={styles.phoneNumberInfoModify} > {editIntroTextState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editIntroTextState?
                        ( <TextInput style={styles.phoneNumberInfoText} onChangeText={this.changeIntroText} placeholder="ex) 1박 2일 동안 잘 부탁드립니다~!" placeholderTextColor="#B1B1B1" editable={editIntroTextState}>{introText}</TextInput>)
                        :( <TextInput style={styles.phoneNumberInfoText} onChangeText={this.changeIntroText} placeholder="요청사항을 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editIntroTextState}>{introText}</TextInput>) 
                    }
                </View>

                    <View>
                        <Text style={styles.explanation}> ※ 관심도란?</Text>
                        <Text style={styles.explanationText}> 소극: 저희끼리 여행하는게 편해요. 터치하지 말아주세요</Text>
                        <Text style={styles.explanationText}> 보통: 너무 관심없지도 너무 과하지 않게만 가이드해주세요</Text>
                        <Text style={styles.explanationText}> 적극: 이것저것 적극적으로 해당 지역에 대해 가이드해주세요</Text>
                    </View>

                    <Text style={styles.payText}> 결제하기 </Text>
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
                    </View>

                    <Text style={styles.houseRuleText}> 유의사항 </Text>
                    <View style={styles.columnMiidle}>
                        <View style={styles.houseRuleView}>
                            <Text style={styles.houseRuleOptionText}>●  욕설 및 공격적인 언행은 삼가해주세요. </Text>
                            <Text style={styles.houseRuleOptionText}>●  소음제한 시간대에는 소음을 자제해주세요 </Text>
                            <Text style={styles.houseRuleOptionText}>●  객실 내에서 흡연은 금지합니다. </Text>
                            <Text style={styles.houseRuleOptionText}>●  호스트를 존중하고 배려해주세요. </Text>
                            <Text style={styles.houseRuleOptionTextMargin}> </Text>
                        </View>
                    
                        <Text style={styles.ruleAlertText}> ※위 규칙을 3회이상 어길 시, 호스트에게 숙박비의 30%에 해당하는 벌금이 발생할 수 있습니다. </Text>
                    </View>

                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.props.navigation.navigate('찜목록')}>
                    <Text style={styles.reservationBtnText}>예약하기</Text>
                </TouchableOpacity>


                <View style={styles.barMargin}><Text> </Text></View>
            </View>
            </ScrollView>

        </LinearGradient> 
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
  background: {                                // 전체화면 세팅                     
        flex: 1,
    },
    linearGradient: {                         // 그라데이션
        flex: 0,
        width: '100%',
        height: '100%',
    },
    container : {                             // 컴포넌트들 가운데 정렬
        alignItems: 'center', 
    },
    titleView: {                             // 뒤로가기버튼, 예약하기 텍스트 담는 View
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        height: 80,
        
    },  
    backBtnIcon: {                            // 뒤로가기 버튼
        resizeMode: 'contain',
        opacity: 0.38,
        width: 30,
        height: 30,
        marginRight:'2%',
        
    },
    content: {                               // 예약버튼 누른 컨텐츠
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
        marginTop: '8.8%',
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
        marginLeft: '4.4%',
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
        marginTop: '4.4%',
        fontSize: 18,
        marginLeft: '4.4%',
        color: '#777777',
        fontWeight: 'bold',
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

    reservationText: {                      // 예약하기 텍스트  
        marginBottom: '0.5%',
        fontSize: 28,
        width: '88%',
    },  
    reservationDateText: {                  // 예약날짜 제목 텍스트
        marginTop: '6.6%',
        fontSize: 28,
        width: '88%',
    },
    reservationView: {                      // 예약날짜 본문 텍스트 담는 view
        width: '90%',
        borderRadius: 15,
        marginTop: '6.6%',
        flexdirection: 'row',
        backgroundColor: 'white',
    },
    reservationSelectView:{                 // 예약날짜, 예약날짜 선택 가로로 배치하는 View
        flexDirection: 'row',
        alignitems: 'center',
    },
    reservationDate: {                      // 예약날짜 본문 텍스트
        marginTop: '3.3%',
        marginLeft: '3.3%',
        fontSize: 22,
        width:'66%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ModifySelectView: {                    // 날짜 선택, 입력하기 세로 위치조절 ToucableOpacity View
        marginTop: '4.4%',
    },
    reservationDateSelect: {               // 날짜 선택하기 텍스트
        fontSize: 16,
        color: '#4285F4',
    },
    reservationDateInput: {                // 입력한 날짜 본문 텍스트
        marginTop: '2.2%',
        marginBottom: '5%',
        marginLeft: '4%',
        fontSize: 16,
        color: 'gray',
    },
    reservationInfoText:{                  // 예약 정보 제목 텍스트
        marginTop: '6.6%',
        fontSize: 28,
        width: '88%',
    },
    reservationInfoView: {                 // 예약 정보 본문 View
        width: '90%',
        borderRadius: 15,
        marginTop: '6.6%',
        flexdirection: 'row',
        backgroundColor: 'white',
    },
    nameInfoView: {                        // 이름 , 입력하기 텍스트담는 가로 배치 View
        flexDirection: 'row',
        alignitems: 'center',
    },
    nameInfo: {                            // '이름' 텍스트
        marginTop: '3.3%',
        marginLeft: '3.3%',
        fontSize: 22,
        width:'74%',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8D8D8D',
    },
    nameInfoModify:{                       // 입력하기 텍스트
        fontSize: 17,
        color: '#4285F4',
    },
    nameInfoText: {                        // 이름 본문 텍스트
        marginTop: '2.2%',
        marginBottom: '2%',
        marginLeft: '4%',
        fontSize: 16,
        color: '#8D8D8D',
    },
    phoneNumberInfoView: {                 // 게스트 연락처 , 입력하기 텍스트담는 가로 배치 View
        flexDirection: 'row',
        alignitems: 'center',
    },
    phoneNumberInfo: {                     // '게스트 연락처' 텍스트
        marginTop: '3.3%',
        marginLeft: '3.3%',
        fontSize: 22,
        width:'74%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneNumberInfoModify:{                // 입력하기 텍스트
        fontSize: 17,
        color: '#4285F4',
    },
    phoneNumberInfoText: {                 // 게스트 연락처 본문 텍스트
        marginTop: '2.2%',
        marginBottom: '2%',
        marginLeft: '4%',
        fontSize: 16,
        color: '#8D8D8D',
    },
    hostAttentionInfoView: {                 // 호스트 관심도 , 입력하기 텍스트담는 가로 배치 View
        flexDirection: 'row',
        alignitems: 'center',
    },
    hostAttentionInfo: {                     // '호스트 관심도' 텍스트
        marginTop: '3.3%',
        marginLeft: '3.3%',
        fontSize: 22,
        width:'72%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slider: {                                // 호스트 관심도 설정 슬라이더
        width: 90,
        color:'red',
    },
    hostAttentionInfoText: {                 // 호스트 관심도 본문 텍스트
        marginTop: '2.2%',
        marginBottom: '2%',
        marginLeft: '4%',
        fontSize: 16,
        color: '#8D8D8D',
    },
    requestInfoView: {                       // 요청사항 , 입력하기 텍스트담는 가로 배치 View
        flexDirection: 'row',
        alignitems: 'center',
    },
    requestInfo: {                           // '요청사항' 텍스트
        marginTop: '3.3%',
        marginLeft: '3.3%',
        fontSize: 22,
        width:'74%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    requestInfoModify:{                      // 입력하기 텍스트
        fontSize: 17,
        color: '#4285F4',
    },
    requestInfoText: {                      // 요청 사항 본문 텍스트
        marginTop: '2.2%',      
        marginBottom: '2.2%',      
        marginBottom: '2%',
        marginLeft: '4%',
        fontSize: 16,
    },
    payText: {                              // 결제하기 제목 텍스트
        marginTop: '8.8%',
        fontSize: 28,
        width: '88%',
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
        height: 40,
    },
    reservationBtn:{                          // 예약 버튼
        backgroundColor : '#4285F4',  
        borderRadius: 16,
        width: '90%',
        height: 55,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,                     
        shadowColor: '#4285F4',
        shadowRadius: 10,
        marginTop: '10%',
    },
    reservationBtnText:{                         // 예약하기 텍스트
        color: 'white', 
        fontSize: 24,
        marginBottom: '1.5%',
    },
    explanation: {                           // 관심온도란? 텍스트
        fontSize: 20,
        marginTop: '10%',
        marginBottom: '1%',
        color: '#7C7C7C',
        width: 360,
        },
    explanationText: {                       // 관심온도 설명 텍스트
        fontSize: 14,
        marginTop: '1%',
        color: '#7C7C7C'
    },
    houseRuleText:{                          // 유의사항 제목 텍스트
            marginTop: '8.8%',
            fontSize: 28,
            width: '100%',
            marginLeft: '9%',
    },
    columnMiidle:{                           // 가로 가운데 정렬 - 숙소 이용규칙 본문담는 View 가운데 정렬
        alignItems: 'center',
    },
    houseRuleView: {                          // 숙소 이용규칙 본문 담는 View
        marginTop: '5.5%',
        paddingLeft: '4%',
        width: 360,
        heigh: 400,
        backgroundColor: 'white',
        borderRadius: 20,
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
        width: 340,
        color: '#4285F4',
        marginTop: '5.5%',
        textAlign:'center',
    },
});

export default ReservationScreen;