import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import { getToken } from './token'
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';
import customMarkerIMG from "./Image/지도마커_아이콘.png";
import houseAddBtn from './Image/숙소등록버튼_아이콘.png';

class HouseInfoModifyScreen extends Component {
      state = {
        hostName: '김갑순', 
        phoneNumber: '010-1122-3344',
        maximumGuestNumber: '2명',
        streetAddress: '강원도 속초시 중도문길 95',
        price: '43000원',
        freeService: '#와이파이 #침대 #욕실 #음료 #세면도구 #드라이기 #냉장고',
        introText: '강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요.',
        address: '강원도 속초시 신림면',
        imageUri: [],
        imageType: null, 
        imageName: null,

        isCalendarVisible: false,
        selectedDates: {},

        region: {
            latitude: 37.541,
            longitude: 126.986,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        markerPosition: {
            latitude: 37.541,
            longitude: 126.986,
        },
      };
    

      onMarkerDragEnd = (coordinate) => {
        this.setState({
            markerPosition: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
            }
        });
    };
    

//////////////////////////////////////////////////////////////   
    addImage = () => {                      // 이미지를 로컬앨범에서 선택하는 불러오는 함수
        const options = {
            mediaType: 'photo',
            quality: 1, 
            maxWidth: 300, 
            maxHeight: 300, 
            includeBase64: false, 
        }
        launchImageLibrary(options, response => {
                if (response.didCancel) {
                    console.log('사용자가 ImagaPicker를 취소했습니다.');
                } else if (response.error) {
                    console.log('ImagePicker내에서 에러가 발생했습니다: ', response.error);
                } else if (response.customButton) {
                    console.log('사용자가 custom버튼을 눌렀습니다: ', response.customButton);
                } else {

                    const { uri, type, fileName } = response.assets[0];
                      this.setState(prevState => ({
                          imageUri: [...prevState.imageUri, uri], 
                          imageType: type,
                          imageName: fileName,
                      }));
                  };
            });
    };


//////////////////////////////////////////////////////////////    
    changeHostName = (inputText) => {
        this.setState({ hostName: inputText });
    };
    changePhoneNumber = (inputText) => {
        this.setState({ phoneNumber: inputText });
    };
    changeMaximumGuestNumber = (inputText) => {
        this.setState({ maximumGuestNumber: inputText });
    };
    changeAddress = (inputText) => {
        this.setState({ address: inputText });
    };
    changeStreetAddress = (inputText) => {
        this.setState({ streetAddress: inputText });
    };
    changePrice = (inputText) => {
        this.setState({ price: inputText });
    };
    changeFreeService = (inputText) => {
        this.setState({ freeService: inputText });
    };
    changeIntroText = (inputText) => {
        this.setState({ introText: inputText });
    };

////////////////////////////////////////////////////////////////
    toggleCalendar = () => {
        this.setState(prevState => ({ isCalendarVisible: !prevState.isCalendarVisible }));
    }

    onDaySelect = (day) => {
        const { dateString } = day;
        this.setState(prevState => {
            let selectedDates = { ...prevState.selectedDates };
            if (selectedDates[dateString]) {
                delete selectedDates[dateString]; 
            } else {
                selectedDates[dateString] = { selected: true, marked: true }; 
            }
            return { selectedDates };
        });
    }

    renderSelectedDates = () => {
        const { selectedDates } = this.state;
        return Object.keys(selectedDates).join(',  ');
    }
    
    removeImage = (index) => {                      // image-picker에서 이미지 선택 취소
        this.setState(prevState => {
            const imageUri = prevState.imageUri.filter((_, i) => i !== index);
            return { imageUri };
        });
    };
    
render() {
    const { hostName, phoneNumber, address,  maximumGuestNumber, price, freeService, introText } = this.state;
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
    return (
        <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
            <View style={styles.houseAddView}>
                <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                </TouchableOpacity>
                <Text style={styles.houseAddText}> 숙소 등록하기 </Text>
            </View>
            <View style={styles.grayHorizontalLine}/>

            <View style={styles.hostInfoView}> 
                <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 호스트 이름 </Text>
                    <TextInput style={styles.hostInfoText} onChangeText={this.changeHostName} placeholder="ex) 이진석" placeholderTextColor="#B1B1B1">{hostName}</TextInput>
                </View>

                <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 호스트 연락처 </Text>
                    <TextInput style={styles.hostInfoText} onChangeText={this.changePhoneNumber} placeholder="ex) 010-1234-5678" placeholderTextColor="#B1B1B1">{phoneNumber}</TextInput>
                </View>
            
                <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 총 수용가능 인원 </Text>
                    <TextInput style={styles.hostInfoText} onChangeText={this.changeMaximumGuestNumber} placeholder="ex) 2명" placeholderTextColor="#B1B1B1">{maximumGuestNumber}</TextInput>
                </View>

                <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 숙박 가격 (1박기준) </Text>
                    <TextInput style={styles.hostInfoText} onChangeText={this.changePrice} placeholder="ex) 34000원" placeholderTextColor="#B1B1B1" >{price}</TextInput>
                </View>

                <View style={styles.houseInfoView}>
                    <Text style={styles.houseName}> 숙소 예약 가능일 </Text>
                </View>
                <View style={styles.reservationView}>
                    <ScrollView style={styles.scrollView} horizontal={true} showsHorizontalScrollIndicator={false}>
                    {this.renderSelectedDates() === '' ? (
                        <Text style={[styles.reservationDateplaceholder]}>날짜를 선택해주세요</Text>
                        ) : (
                            <Text style={styles.reservationDateInput}>{this.renderSelectedDates()}</Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity style={styles.ModifySelectView}  onPress={this.toggleCalendar}>
                        <Text style={styles.houseAddBtn}>{this.state.isCalendarVisible ? '예약 가능 날짜 선택완료' : '예약 가능 날짜 선택하기'}</Text>
                    </TouchableOpacity>
                </View>
                
                {this.state.isCalendarVisible && (
                    <Calendar
                        onDayPress={this.onDaySelect}
                        markingType={'multi-dot'}
                        markedDates={this.state.selectedDates}
                        monthNames={monthNames}
                        dayNames={dayNames}
                        dayNamesShort={dayNamesShort}
                        locale={'ko'}
                        theme={{
                            todayTextColor: 'lightgreen',
                            selectedDayBackgroundColor: '#00D282',
                            selectedDayTextColor: '#ffffff'
                        }}
                    />
                )}
              
                <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 숙소 위치 설정</Text>
                </View>
                <View style={styles.mapContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.locationMap} 
                        region={this.state.region}
                        initialRegion={{
                            latitude: this.state.markerPosition.latitude,
                            longitude: this.state.markerPosition.longitude,
                            latitudeDelta: 0.0007, 
                            longitudeDelta: 0.0007
                        }}>
                        <Marker
                            coordinate={this.state.markerPosition}
                            image={customMarkerIMG}
                            draggable={true}
                            region={this.state.region}
                            onRegionChangeComplete={(region) => this.setState({ region })}>
                            <Callout tooltip>
                                <View style={styles.customCallout}>
                                    <Text style={styles.calloutTitle}>{this.state.address}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    </MapView>
                </View>

                <TouchableOpacity style={styles.locationSelectView}  onPress={() => this.props.navigation.navigate('구글지도')} >
                    <Text style={styles.locationSelectBtn}>지도에서 숙소위치 선택하기</Text>
                </TouchableOpacity>
                <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeAddress} placeholder="지도에서 위치를 선택해주세요" placeholderTextColor="#B1B1B1" editable={false} multiline={true} numberOfLines={4} >{address}</TextInput>


               <View style={styles.houseInfoView}>
                    <Text style={styles.houseIMGName}> 숙소 소개 사진 </Text>
                    <TouchableOpacity style={styles.IMGSelectView} onPress={this.addImage}>
                        <Text style={styles.houseIMGAddBtn}> 사진 추가 </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.houseIMGView}>
                <ScrollView style={styles.addHouseIMGView}  
                    showsHorizontalScrollIndicator={false}  
                    horizontal={true}>
                        {this.state.imageUri.length > 0 ? (
                            this.state.imageUri.map((uri, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image style={styles.houseIMG} source={{ uri: uri }} />
                                    <TouchableOpacity 
                                        style={styles.removeBtn} 
                                        onPress={() => this.removeImage(index)}>
                                        <Text style={styles.removeBtnText}>ㅡ</Text>
                                    </TouchableOpacity>
                                    
                                </View>
                            ))
                        ) : (
                            <TouchableOpacity style={styles.ModifySelectView} onPress={this.addImage}>
                                <Image style={styles.houseIMG} source={houseAddIMG}/>
                            </TouchableOpacity>
                        )}
                </ScrollView>
               </View>

                <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 소개글 </Text>
                    <TextInput style={styles.houseInfoText} onChangeText={this.changeIntroText} placeholder="숙소와 호스트님을 소개해주세요" placeholderTextColor="#B1B1B1" multiline={true}>{introText}</TextInput>
                </View>

              <View style={styles.hostNameInfoView}>
                    <Text style={styles.hostName}> 무료 제공 서비스 </Text>
                    <TextInput style={styles.houseInfoText} onChangeText={this.changeFreeService} placeholder="태그 입력를 입력해주세요 (ex: #냉장고 #음료)" placeholderTextColor="#B1B1B1" multiline={true}>{freeService}</TextInput>
                </View>
            </View>

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

            <TouchableOpacity style={styles.reservationBtn} onPress={() => this.postHouseData()}>
                <Image style={styles.reservationBtnText} source={houseAddBtn}/>
            </TouchableOpacity>

            <View style={styles.barMargin}><Text> </Text></View>

        </View>
        </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
background: {                     // 전체화면 세팅                     
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "white",
    },
    container : {                   // 컴포넌트들 가운데 정렬
        alignItems: 'center', 
    },
    houseAddView: {                   // 뒤로가기버튼,  숙소등록 제목 담는 View
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
    houseAddText: {                        // 최상단 숙소등록 제목 텍스트
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
    locationSelectView: {                    // 수정하기 버튼 위쪾 마진 View
        width: "100%",
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'blue',
    },
    locationSelectBtn:{                    // '지도에서 숙소위치 선택하기'버튼
        width: "94%",
        height: 44,
        backgroundColor: "white",
        borderWidth: 1.5,
        borderColor: "#00D282",
        borderRadius: 10,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 16,
        color: "#00D282",
    },  
    hostNameInfoView: {                    // 숙소 정보 제목 테스트, 수정하기 버튼 가로배열 View
        marginTop: '5.5%',
        width: '94%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        // backgroundColor: 'green',
    },
    houseInfoView:{                         // 숙소 소개사진+ 사진추가 버튼 담는 View
            marginTop: '5.5%',
            width: '94%',
            flexDirection: 'row',
            alignItems: 'flex-start',
            // backgroundColor: 'green',
    },
    hostName: {                            // 호스트 정보 제목 텍스트 (호스트명, 연락처)
        fontSize: 20,
        width:'94%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    houseName:{                            // 숙소 소개 사진 텍스트
        fontSize: 20,
        width:'78%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    houseIMGName:{                            // 숙소 소개 사진 텍스트
        fontSize: 20,
        width:'63%',
        alignItems: 'center',
        justifyContent: 'center',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    hostInfoText: {                        // 호스트 정보 입력 value 텍스트
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
    houseIMGView:{                         // 숙소 사진 가운데 정렬 View
        width: '88%',
        marginTop: '3%',
        alignItems:'center',
        marginBottom: '5%',
        // backgroundColor: 'gray',
    },
    addHouseIMGView:{                      // 숙소 사진등록 View
        marginTop: '10%',
        marginBottom: '4%',
        // backgroundColor:'#E2E2E2',
    },
    houseIMG: {                        // 숙소 사진 등록
        width: 170,                     
        height: 160,
        alignItems:'center',
        justifyContent: 'center',
    },
    ModifySelectView: {                    // 수정하기 버튼 위쪾 마진 View
        width: 170,
        alignItems: "center",
        justifyContent: 'center',
        marginLeft: '3.3%',
        // backgroundColor: 'blue',
    },
    IMGSelectView: {                    // 수정하기 버튼 위쪾 마진 View
        width: 170,
        alignItems: "center",
        justifyContent: 'center',
        // backgroundColor: 'blue',
    },
    houseAddBtn:{                           // 숙소 예약일자선택 버튼
        fontSize: 14,
        color: "#00D282",  
        borderWidth: 1,
        borderColor: '#00D282',
        borderRadius: 10,
        width: 175,
        height: 42,
        textAlign:  'center',
        textAlignVertical: "center",
        backgroundColor: 'white',
    },
    houseIMGAddBtn:{                           // 사진추가 버튼
        fontSize: 17,
        marginBottom: '5%',
        color: "#00D282",  
        // backgroundColor: 'yellow',
    },
    reservationView:{                       // 예약가능 날싸 선택버튼과 선택한 날짜 텍스트 담는 View
        width: '94%',
        flexDirection: 'row',
        alignItems: 'center',
        margin: "4.4%",
        // backgroundColor: "gray",
    },
    scrollView: {                           // Text 스크룔뷰 
        width: 140,
        height: 42,
        backgroundColor: "#F5F5F5",
        borderRadius: 10,
        // backgroundColor: "yellow",
    },
    reservationDateInput: {                // 캘린더에서 선택한 날짜 본문 텍스트
        height: 42,
        fontSize: 14,
        color: 'gray',
        flexWrap: 'nowrap',
        textAlignVertical: "center",
        paddingLeft: 10,
        paddingRight: 10,

    },
    reservationDateplaceholder:{                // 숙소 예약일자선택 Text placeholder
        height: 42,
        fontSize: 14,
        flexWrap: 'nowrap',
        textAlignVertical: "center",
        paddingLeft: 10,
        paddingRight: 10,
        color: '#B1B1B1',
    },
    houseInfoText: {                        // 숙소 소개글
        fontSize: 16,
        width: 318,
        color: 'gray',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        paddingLeft: "3%",
    },
    hostInfoAddressText: {                  // 주소, 도로명 주소 입력받는 본문 텍스트
        fontSize: 16,
        height: 60,
        width: '94%',
        marginTop: '11.4%',
        marginBottom: '4.4%',
        textAlign: 'center',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        padding:"3%",
        color: "gray",
    },
    hostInfoView: {                       // 호스트 정보 전체를 담는 View
        width: '94%',
        marginTop: '1.8%',
        flexdirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        paddingTop: '1.2%',
        // backgroundColor: 'yellow',
    },
    hostFreeServiceView:{                   // 무료 서비스 하단 마진
        width: '98%',
        flexDirection: 'row',
        marginBottom: '4.4%',
        justifyContent:'center',
        // backgroundColor: 'green',
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
    reservationBtn:{                          // 숙소등록 버튼
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10%',
        // backgroundColor : "#00D282", 
    },
    reservationBtnText:{                        // 숙소등록하기 텍스트
        marginBottom: '1.5%',
        width: "100%",
        height: 55,
        resizeMode: "contain",
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
    locationMap: {                             
        width: '100%',
        height: '100%',    
    },
    barMargin: {                               // 스클롤 탭바 마진
        height: 40,
    },

    imageContainer: {                               // 이미지 담는 View
        position: 'relative',
        alignItems: 'center',
        margin: 5,
        borderRadius: 10, 
    },
    
    removeBtn: {                                    // 이미지 제거 버튼
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 28,
        height: 28,
        borderRadius: 50,  
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    removeBtnText: {                                // 이미지 제거 버튼 'ㅡ' 텍스트
        color: '#FF774C',
        fontWeight: 'bold',
        fontSize: 22,
        lineHeight: 28,  
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
  
export default HouseInfoModifyScreen;