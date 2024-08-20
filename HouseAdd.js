import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';
import { getToken } from './token'
import RNFS from 'react-native-fs';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';
import mapIMG from './Image/지도_미리보기.png';



class HouseAddScreen extends Component {
    state = {
        hostName: '', 
        introText: '',
        freeService: '',
        address: '',
        phoneNumber: '',
        price: '',
        maximumGuestNumber: '',
        imageUri: [],
        imageType: null, 
        imageName: null,
        editHostNameState: false,
        editPhoneNumberState: false,
        editStreetAddressState: false,
        editMaximumGuestNumberState: false,
        editPriceState: false,
        editFreeServiceState: false,
        editIntroTextState: false,
        // streetAddress: '아직 전달 못 받음',
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

      componentDidMount() {
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
          const { params } = this.props.route;
          if (params?.address) {
            this.setState({
              address: params.address,
              region: {
                latitude: params.region.latitude,
                longitude: params.region.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005 
              },
              markerPosition: {
                latitude: params.region.latitude,
                longitude: params.region.longitude
              }
            });
          }
        });
      }
      
      componentWillUnmount() {
        this._unsubscribe();
      }
      

    async postHouseData() {         // 숙소등록시 숙소와 관련된 데이터들을 서버에 보내는 함수
        try {   
            const {                   	// 서버에 보내야하는 데이터들을 관리
            hostName,
            introText,
            phoneNumber,
            freeService,
            price,
            address,
            maximumGuestNumber,
            imageUri,
            imageType,
            imageName,
            } = this.state;
    
            const formData = new FormData();      // fromData를 사용하기위해 FormData객체를 선언해주기
    
            const dto = {
            hostName,
            houseIntroduction: introText,
            freeService,
            phoneNumber,
            registrantId: 1,
            pricePerNight: Number(price.replace(/\D/g, '')),
            address,
            maxNumPeople: Number(maximumGuestNumber.replace(/\D/g, ''))
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

            this.state.imageUri.forEach((uri, index) => {
            RNFS.stat(uri)
                .then((stats) => {
                    console.log(`Image ${index}:`, stats);
                    if (stats.isFile()) {
                        console.log(`파일이 저장된 Uri: ${uri}`);
                        console.log(`파일크기: ${stats.size} bytes`);
                        console.log(`최근 수정일: ${stats.mtime}`);
                        console.log(`파일 존재여부: ${stats.isFile()}`);
                    }
                })
                .catch((error) => {
                    console.error(`Error retrieving file stats for URI ${uri}:`, error);
                });
            });
    
            imageUri.forEach((filePath, index) => {
            formData.append('photos', {
                uri: filePath,
                name: `image-${index}.jpg`,
                type: imageType,
            });
            });

            for (let pair of formData._parts) {
            console.log(pair[0] + ': ' + JSON.stringify(pair[1]));
            }
    
    
            const token = await getToken();
    
            const response = await fetch('http://223.130.131.166:8080/api/v1/house', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
        
            const responseData = await response.json();
            console.log("Response JSON:", responseData);
            this.props.navigation.navigate('메인', { refresh: true });
        } catch (error) {
            console.log('숙소 데이터 보내는 도중 에러발생:', error);
            if (error.response) {
            console.log('Error status:', error.response.status);
            console.log('Error data:', error.response.data);
            console.log('Error headers:', error.response.headers);
            } else if (error.request) {
            console.log('Request that triggered error:', error.request);
            } else {
            console.log('Error message:', error.message);
            }
        }
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
    
    
//////////////////////////////////////////////////////////////   
    editHostnameText = () => {
        this.setState(prevState => ({ editHostNameState: !prevState.editHostNameState }));
    };
    editPhoneNumberText = () => {
        this.setState(prevState => ({ editPhoneNumberState: !prevState.editPhoneNumberState }));
    };
    editMaximumGuestNumberText = () => {
        this.setState(prevState => ({ editMaximumGuestNumberState: !prevState.editMaximumGuestNumberState }));
    };
    // editStreetAddressText = () => {
    //     this.setState(prevState => ({ editStreetAddressState: !prevState.editStreetAddressState }));
    // };
    editPriceText = () => {
        this.setState(prevState => ({ editPriceState: !prevState.editPriceState }));
    };
    editFreeServiceText = () => {
        this.setState(prevState => ({ editFreeServiceState: !prevState.editFreeServiceState }));
    };
    editIntroText = () => {
        this.setState(prevState => ({ editIntroTextState: !prevState.editIntroTextState }));
    };
    
    
render() {

    const { hostName, editHostNameState, phoneNumber, editPhoneNumberState, address, editStreetAddressState,  maximumGuestNumber, 
        editMaximumGuestNumberState, price, editPriceState, freeService, editFreeServiceState, introText, editIntroTextState } = this.state;

    return (
        <LinearGradient
        colors={['#E6EAFF', '#FCFDFF']} 
        style={styles.linearGradient} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 0, y: 0.88 }} >
            <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.houseAddView}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                    <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.houseAddText}> 숙소 등록하기 </Text>
                </View>

                <View style={styles.hostInfoView}> 
                    <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 호스트명 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editHostnameText} >
                            <Text style={styles.InfoModify} > {editHostNameState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editHostNameState?
                        ( <TextInput style={styles.hostInfoText} onChangeText={this.changeHostName} placeholder="ex) 이진석" placeholderTextColor="#B1B1B1" editable={editHostNameState}>{hostName}</TextInput>)
                        :( <TextInput style={styles.hostInfoText} onChangeText={this.changeHostName} placeholder="호스트명을 입력해주세요" placeholderTextColor="#B1B1B1" editable={editHostNameState}>{hostName}</TextInput>) 
                    }

                    <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 연락처 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editPhoneNumberText} >
                            <Text style={styles.InfoModify} > {editPhoneNumberState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editPhoneNumberState?
                        ( <TextInput style={styles.hostInfoText} onChangeText={this.changePhoneNumber} placeholder="ex) 010-1234-5678" placeholderTextColor="#B1B1B1" editable={editPhoneNumberState}>{phoneNumber}</TextInput>)
                        :( <TextInput style={styles.hostInfoText} onChangeText={this.changePhoneNumber} placeholder="연락처를 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editPhoneNumberState}>{phoneNumber}</TextInput>) 
                    }
                
                    <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 최대 인원 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editMaximumGuestNumberText} >
                            <Text style={styles.InfoModify} > {editMaximumGuestNumberState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editMaximumGuestNumberState?
                        ( <TextInput style={styles.hostInfoText} onChangeText={this.changeMaximumGuestNumber} placeholder="ex) 2명" placeholderTextColor="#B1B1B1" editable={editMaximumGuestNumberState}>{maximumGuestNumber}</TextInput>)
                        :( <TextInput style={styles.hostInfoText} onChangeText={this.changeMaximumGuestNumber} placeholder="게스트의 최대인원을 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editMaximumGuestNumberState}>{maximumGuestNumber}</TextInput>) 
                    }

                    <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 가격 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editPriceText} >
                            <Text style={styles.InfoModify} > {editPriceState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editPriceState?
                        ( <TextInput style={styles.hostInfoText} onChangeText={this.changePrice} placeholder="ex) 34000원" placeholderTextColor="#B1B1B1" editable={editPriceState}>{price}</TextInput>)
                        :( <TextInput style={styles.hostInfoText} onChangeText={this.changePrice} placeholder="숙소의 1박 가격을 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editPriceState}>{price}</TextInput>) 
                    }
                  
                    <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 숙소 위치 </Text>
                        <TouchableOpacity style={styles.ModifySelectView}  onPress={() => this.props.navigation.navigate('구글지도')} >
                            <Text style={styles.InfoModify}>지도 보기</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeAddress} placeholder="지도에서 위치를 선택해주세요" placeholderTextColor="#B1B1B1" editable={false} multiline={true} numberOfLines={4} >{address}</TextInput>
                    {/* {editStreetAddressState?
                        ( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeAddress} placeholder="지도에서 위치를 지정해주세요" placeholderTextColor="#B1B1B1" editable={false}>{address}</TextInput>)
                        :( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeAddress} placeholder="지도에서 위치를 지정해주세요" placeholderTextColor="#B1B1B1" editable={false} multiline={true} numberOfLines={4} >{address}</TextInput>) 
                    } */}
                    {/* {editStreetAddressState?
                        ( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeStreetAddress} placeholder="ex) 강원도 원주시 신림면 치악로 28 (도로명)" placeholderTextColor="#B1B1B1" editable={editStreetAddressState}>{streetAddress}</TextInput>)
                        :( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeStreetAddress} placeholder="도로명 주소를 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editStreetAddressState}>{streetAddress}</TextInput>) 
                    } */}
                   {/* <Image style={styles.locationMap} source={mapIMG}></Image> */}
                   <MapView provider={PROVIDER_GOOGLE} style={styles.locationMap} region={this.state.region}  >
                        <Marker
                            coordinate={this.state.markerPosition}
                            title={"Title"}
                            description={"Description"} 
                            draggable={true}  
                            onDragEnd={(e) => this.onMarkerDragEnd(e.nativeEvent.coordinate)}  
                        />
                    </MapView>

                   <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 숙소 소개 사진 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.addImage}>
                            <Text style={styles.InfoModify}> 사진 추가 </Text>
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
                        <Text style={styles.hostInfo}> 소개글 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editIntroText} >
                            <Text style={styles.InfoModify} > {editIntroTextState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editIntroTextState?
                        ( <TextInput style={styles.houseInfoText} onChangeText={this.changeIntroText} 
                            placeholder="내용을 입력해주세요.." placeholderTextColor="#B1B1B1" editable={editIntroTextState} multiline={true}  >
                                    {introText}</TextInput>)
                        :( <TextInput style={styles.houseInfoText} onChangeText={this.changeIntroText} placeholder="숙소와 호스트님을 소개해주세요" placeholderTextColor="#B1B1B1"  editable={editIntroTextState} multiline={true}>{introText}</TextInput>) 
                    }
                  


                  <View style={styles.hostNameInfoView}>
                        <Text style={styles.hostInfo}> 무료 제공 서비스 </Text>
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editFreeServiceText} >
                            <Text style={styles.InfoModify} > {editFreeServiceState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editFreeServiceState?
                        ( <TextInput style={styles.houseInfoText} onChangeText={this.changeFreeService} placeholder="ex) #냉장고 #음료" placeholderTextColor="#B1B1B1" editable={editFreeServiceState} multiline={true}>{freeService}</TextInput>)
                        :( <TextInput style={styles.houseInfoText} onChangeText={this.changeFreeService} placeholder="태그 입력를 입력해주세요 (ex: #냉장고 #음료)" placeholderTextColor="#B1B1B1"  editable={editFreeServiceState} multiline={true}>{freeService}</TextInput>) 
                    }

                          



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

                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.postHouseData()}>
                    <Text style={styles.reservationBtnText}> 숙소 등록하기</Text>
                </TouchableOpacity>

                <View style={styles.barMargin}><Text> </Text></View>

            </View>
            </ScrollView>

        </LinearGradient> 
    )
  }
}

// 스타일 시트  내폰 width-300, 애뮬레이터 width-340세팅 + 이미지 크기 가로,세로 각각200 (애뮬레이터)
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
    houseAddView: {                   // 뒤로가기버튼,  숙소등록 제목 담는 View
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        height: 80,
        
    },  
    backBtnIcon: {                         // 뒤로가기 아이콘
        resizeMode: 'contain',
        opacity: 0.38,
        width: 30,
        height: 30,
        marginRight:'2%',
        
    },
    houseAddText: {                        // 최상단 숙소등록 제목 텍스트
        marginBottom: '0.5%',
        fontSize: 28,
        width: '88%',
    },  
    ModifySelectView: {                    // 수정하기 버튼 위쪾 마진 View
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'blue',
    },
    hostNameInfoView: {                    // 숙소 정보 제목 테스트, 수정하기 버튼 가로배열 View
        marginTop: '3%',
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: 'green',
    },
    hostInfo: {                            // 호스트 정보 제목 텍스트 (호스트명, 연락처)
        fontSize: 22,
        width:'74%',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'gray',
    },
    hostIntroText: {                       // 소개글 본문
        marginTop: '4.4%',
        marginBottom: '2%',
        fontSize: 16,
        width: 300,                       
    },
    InfoModify:{                           // 호스트 정보 수정하기
        fontSize: 17,
        marginBottom: '5%',
        color: '#4285F4',  
        // backgroundColor: 'yellow',
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
    hostInfoText: {                        // 호스트 정보 입력 value 텍스트
        fontSize: 16,
        width: 300,
        color: 'gray',
        margin: 0,
        padding: 0,
        paddingLeft: 3,
        height: 50,
        // backgroundColor: 'yellow',
    },
    houseInfoText: {                        // 숙소 소개글
        fontSize: 16,
        width: 300,
        color: 'gray',
        margin: 0,
        padding: 0,
        paddingTop: '5.5%',
        paddingBottom: '8.8%',
        paddingLeft: 3,
        
        // backgroundColor: 'yellow',
    },
    hostInfoAddressText: {                  // 주소, 도로명 주소 입력받는 본문 텍스트
        fontSize: 16,
        width: '100%',   
        minHeight: 32, 
        color: 'gray',
        textAlignVertical: 'top',
        padding: 15,    
    },
    hostInfoView: {                       // 호스트 정보 전체를 담는 View
        width: '90%',
        borderRadius: 15,
        marginTop: '1.8%',
        flexdirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        paddingTop: '3%',
        paddingBottom: '3%',
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
            marginTop: '8.8%',
            fontSize: 28,
            width: '100%',
            marginLeft: '10%',
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
        width: 300,
        color: '#4285F4',
        marginTop: '5.5%',
        textAlign:'center',
    },
    reservationBtn:{                          // 숙소등록 버튼
        backgroundColor : '#4285F4',  
        borderRadius: 16,
        width: '90%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,                     
        shadowColor: '#4285F4',
        shadowRadius: 10,
        marginTop: '10%',
    },
    reservationBtnText:{                        // 숙소등록하기 텍스트
        color: 'white', 
        fontSize: 24,
        marginBottom: '1.5%',
    },
    locationMap: {                             // 지도 미리보기 화면
        width: '68%',
        height: 210,    
        borderRadius: 15,
        marginBottom: '10%',
    },
    barMargin: {                               // 스클롤 탭바 마진
        height: 75,
    },

    tagView: {                               // 무료제공서비스, 태그 담는 View
        flexDirection: 'row',
        width: '90%',
        // backgroundColor: 'gray',
    },
    tagText: {                               // 무료제공서비스, 태그 담는 View 텍스트
        fontSize: 16,
        color: '#4285F4',  
        marginBottom: '6.6%',
        // backgroundColor: 'green',
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
    
    tagTextmargin: {                         // 태그 텍스트 스크롤뷰 마진
        width: 30,
    },
});

export default HouseAddScreen;