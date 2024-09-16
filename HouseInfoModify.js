import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import { getToken } from './token'
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import Geocoder from 'react-native-geocoding';
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';
import customMarkerIMG from "./Image/지도마커_아이콘.png";
import houseModifyBtn from './Image/숙소수정완료버튼_아이콘.png';




class HouseInfoModifyScreen extends Component {
    state = {
        hostName: '데이터를 불러오지 못했습니다.', 
        introText: '',
        freeService: '',
        address: '',
        phoneNumber: '',
        price: '',
        maximumGuestNumber: '',
        imageUri: [],
        imageType: null, 
        imageName: null,
        houseId: 1,
        photosToDelete: [],

        isCalendarVisible: false,
        selectedDates: {},

        region: {
            latitude: 37.541,
            longitude: 126.986,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
        },
        markerPosition: {
            latitude: 37.541,
            longitude: 126.986,
        },
    };

    componentDidMount() {               // 렌더링하기전에 DOM에서 기존 숙소정보 먼저 불러오기 + houseId
        Geocoder.init('AIzaSyCd9l-dsU0O4PMnRS2BeP0OCZtOv-atoJE', { language: "ko" });

        if (this.props.route.params) {
            const { houseId } = this.props.route.params;
            this.setState({ houseId: houseId });
          console.log('Received houseId:', houseId);
        }
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getAddedHouseData();
        });
    }
    componentWillUnmount() {              // 렌더링하기전에 DOM에서 기존 숙소정보 먼저 불러오기
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }
      
    componentDidUpdate(prevProps) {
        console.log("Current Props:", this.props.route.params);
        console.log("Previous Props:", prevProps.route.params);
      
        if (prevProps.route.params.address !== this.props.route.params.address ||
            JSON.stringify(prevProps.route.params.region) !== JSON.stringify(this.props.route.params.region)) {
          this.setState({
            address: this.props.route.params.address,
            region: {
              latitude: this.props.route.params.region.latitude,
              longitude: this.props.route.params.region.longitude,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            },
            markerPosition: {
              latitude: this.props.route.params.region.latitude,
              longitude: this.props.route.params.region.longitude
            }
          });
        }
      }
      
      
    async getAddedHouseData() {         // 숙소등록시 숙소와 관련된 데이터들을 서버에 보내는 함수
        try{
            const { houseId } = this.props.route.params;
            const token = await getToken();

            if (this.state.address === '') {
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

                this.setState({
                    hostName: house.hostName,
                    introText: house.houseIntroduction ,
                    freeService: house.freeService,
                    address: house.address ,
                    phoneNumber: house.phoneNumber ,
                    price: house.pricePerNight.toString(),
                    maximumGuestNumber: house.maxNumPeople.toString(),
                    imageUri: house.photos || [],
                    region: {
                        latitude: latitude || this.state.region.latitude,
                        longitude: longitude || this.state.region.longitude, 
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003
                    },
                    markerPosition: {
                        latitude: latitude || this.state.region.latitude,
                        longitude: longitude || this.state.region.longitude
                    }
                });
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
    }

    async PutHouseModifyData() {
        try {
            const {
                hostName, introText, phoneNumber, freeService, price,
                address, maximumGuestNumber, selectedDates, photosToDelete, imageUri
            } = this.state;
    
            const formData = new FormData();
    
            const dto = {
                hostName,
                houseIntroduction: introText,
                freeService,
                photos: photosToDelete, 
                phoneNumber,
                pricePerNight: Number(price.replace(/\D/g, '')),
                address,
                maxNumPeople: Number(maximumGuestNumber.replace(/\D/g, '')),
                availableDates: Object.keys(selectedDates),
            };
    
            const jsonString = JSON.stringify(dto);
            const fileName = 'dto.json';
            const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
            await RNFS.writeFile(filePath, jsonString, 'utf8');
            formData.append('dto', {
                uri: `file://${filePath}`,
                type: 'application/json',
                name: fileName
            });
    
            imageUri.forEach((uri, index) => {
                formData.append('photos', {
                    uri: uri,
                    name: `image-${index}.jpg`,
                    type: 'image/jpeg',
                });
            });
    
            const { houseId } = this.state;
    
            const token = await getToken();
            const response = await fetch(`http://223.130.131.166:8080/api/v1/house/${houseId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
    
            if (!response.ok) throw new Error('Failed to update house info');
    
            const responseData = await response.json();
            console.log("Response JSON:", responseData);
            this.props.navigation.navigate('메인', { refresh: true });
    
        } catch (error) {
            console.error('Failed to send house modification data:', error);
        }
    }
    
   

    async deleteHouseData() {                        // 수정한 숙소 삭제하는 함수
        const { houseId } = this.props.route.params;
        const token = await getToken();
        const response = await axios.delete(`http://223.130.131.166:8080/api/v1/house/${houseId}`,{     // 기존 숙소 데이터 먼저 삭제
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
    
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
    
    removeImage = (index) => {
        this.setState(prevState => {
            const imageUri = [...prevState.imageUri];
            const uriToRemove = imageUri[index]; 
            const updatedImages = imageUri.filter((_, i) => i !== index);
    
            // 이미지 URL을 photosToDelete 배열에 추가
            const photosToDeleteUpdate = [...prevState.photosToDelete, uriToRemove];
    
            return {
                imageUri: updatedImages,
                photosToDelete: photosToDeleteUpdate
            };
        });
    };
    
    
    formatAddress(address) {                        // 정규식을 활용하여 도로명을 주소명으로 바꾸기
        const regex = /([\S]+[도시])\s*([\S]+[구군시])?\s*([\S]*[동리면읍가구])?/;
        const match = address.match(regex);
        console.log("Original Address:", address);
        console.log("Matched Segments:", match);
        return match ? match.slice(1).join(' ') : "주소를 불러오는데 문제가 발생하였습니다.";
    }
    
render() {

    const { hostName, phoneNumber, address,  maximumGuestNumber, price, freeService, introText, houseId } = this.state;
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

    return (
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.houseAddView}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                    <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.houseAddText}> 숙소정보 수정하기 </Text>
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
                            <Text style={styles.houseModifyBtn}>{this.state.isCalendarVisible ? '예약 가능 날짜 선택완료' : '예약 가능 날짜 선택하기'}</Text>
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

                    <TouchableOpacity style={styles.locationSelectView}  onPress={() => this.props.navigation.navigate('숙소구글지도', { houseId: houseId } )} >
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

                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.PutHouseModifyData()}>
                    <Image style={styles.reservationBtnText} source={houseModifyBtn}/>
                </TouchableOpacity>

                <View style={styles.barMargin}><Text> </Text></View>

            </View>
            </ScrollView>
    )
  }
}

// 스타일 시트  내폰 width-300, 애뮬레이터 width-340세팅 + 이미지 크기 가로,세로 각각200 (애뮬레이터)
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
    houseModifyBtn:{                           // 숙소 예약일자선택 버튼
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