import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './token'
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';
import mapIMG from './Image/지도_미리보기.png';
import houseIMG1 from './Image/여행지1.png';
import houseIMG2 from './Image/여행지2.png';
import houseIMG3 from './Image/여행지3.png';
import houseIMG4 from './Image/여행지4.png';
import houseIMG5 from './Image/여행지5.png';
import houseIMG6 from './Image/여행지6.png';
import houseIMG7 from './Image/여행지7.png';
import houseIMG8 from './Image/여행지8.png';
import houseIMG9 from './Image/여행지9.png';


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
      };
      
      //////////////////////////////////////////////////////////////   
    // async saveImageToFileSystem(imageUri) {
    //     try {
    //         const response = await fetch(imageUri);
    //         const blob = await response.blob();
    
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             const filePath = `${RNFS.DocumentDirectoryPath}/savedImage.jpg`;
    
    //             RNFS.writeFile(filePath, reader.result, 'base64')
    //                 .then(() => {
    //                     console.log(`File written to ${filePath}`);
    //                 })
    //                 .catch(err => {
    //                     console.error('Error saving file:', err);
    //                 });
    //         };
    //         reader.readAsDataURL(blob);
    //     } catch (error) {
    //         console.error('Error fetching image:', error);
    //     }
    // }

//////////////////////////////////////////////////////////////   
    async postHouseData()  {                          // 모든 숙소 정보 리스트 데이터 axios를 활용한 api 통신을 통해 서버로 부터 불러오기
        try {
            const {
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
    
            const formData = new FormData();
    
            const dto = { 
                hostName: hostName,
                houseIntroduction: introText,
                freeService: freeService,
                phoneNumber: phoneNumber,
                registrantId: 1,
                pricePerNight: Number(price.replace(/\D/g, '')),
                address: address,
                maxNumPeople: Number(maximumGuestNumber.replace(/\D/g, '')),
            };
    
            formData.append('dto', JSON.stringify(dto));

///////////////////
            this.state.imageUri.forEach((filePath, index) => {
                formData.append('photos', {
                    uri: `file://${filePath}`,
                    name: this.state.imageName || `image_${index}.jpg`,
                    type: this.state.imageType || 'image/jpeg',
                });
            });

            // if (Array.isArray(imageUri)) {
            //     imageUri.forEach((uri, index) => {
            //         formData.append('photos', {
            //             uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            //             name: imageName || `image_${index}.jpg`,
            //             type: imageType || 'image/jpeg',
            //         });
            //     });
            // } else {
            //     console.error('imageUri가 배열이 아니자나~~!!');
            // }


            // formData.append('photos', {
            //     uri: imageUri,
            //     type: imageType,
            //     name: imageName,
            // });

            const token = await getToken();
            
            const response = await axios({
                method: "POST",
                url: "http://223.130.131.166:8080/api/v1/house",
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            })
            
            console.log(response.data);
            this.props.navigation.navigate('검색', { refresh: true });

        } catch(error) {
            console.log('숙소 데이터 보내는 도중 에러발생: ', error);
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

//////////////////////////////////////////////////////////////   

    addImage = () => {
        launchImageLibrary({mediaType: 'photo'}, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error:', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button:', response.customButton);
            } else {
                const { uri, type, fileName } = response.assets[0];
                const newFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                // 이미지를 로컬 파일 시스템에 저장
                RNFS.copyFile(uri, newFilePath)
                    .then(() => {
                        this.setState(prevState => ({
                            imageUri: [...prevState.imageUri, newFilePath],
                            imageType: type,
                            imageName: fileName,
                        }));
                        console.log('Image saved to:', newFilePath);
                    })
                    .catch(error => {
                        console.error('Error saving image file:', error);
                    });
            }
        });
    };
    // addImage = () => {

    //     launchImageLibrary({mediaType: 'photo'}, response => {
    //             if (response.didCancel) {
    //                 console.log('사용자가 ImagaPicker를 취소했습니다.');
    //             } else if (response.error) {
    //                 console.log('ImagePicker내에서 에러가 발생했습니다: ', response.error);
    //             } else if (response.customButton) {
    //                 console.log('사용자가 custom버튼을 눌렀습니다: ', response.customButton);
    //             } else {

    //                 const { uri, type, fileName } = response.assets[0];
    //                 this.setState(prevState => ({
    //                     imageUri: [...prevState.imageUri, uri],
    //                     imageType: type,
    //                     imageName: fileName,
    //                 })), () => {
    //                     console.log(`Uri: ${this.state.imageUri}, Type: ${this.state.imageType}, Name: ${this.state.imageName}`);
    //                 };
                    
    //             }
    //         });
    // };


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
    editStreetAddressText = () => {
        this.setState(prevState => ({ editStreetAddressState: !prevState.editStreetAddressState }));
    };
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
                        <TouchableOpacity style={styles.ModifySelectView} onPress={this.editStreetAddressText} >
                            <Text style={styles.InfoModify} > {editStreetAddressState? '입력완료':'입력하기'} </Text>
                        </TouchableOpacity>
                    </View>
                    {editStreetAddressState?
                        ( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeAddress} placeholder="ex) 강원도 속초시 신림면 (일반 주소)" placeholderTextColor="#B1B1B1" editable={editStreetAddressState}>{address}</TextInput>)
                        :( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeAddress} placeholder="주소를 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editStreetAddressState}>{address}</TextInput>) 
                    }
                    {/* {editStreetAddressState?
                        ( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeStreetAddress} placeholder="ex) 강원도 원주시 신림면 치악로 28 (도로명)" placeholderTextColor="#B1B1B1" editable={editStreetAddressState}>{streetAddress}</TextInput>)
                        :( <TextInput style={styles.hostInfoAddressText} onChangeText={this.changeStreetAddress} placeholder="도로명 주소를 입력해주세요" placeholderTextColor="#B1B1B1"  editable={editStreetAddressState}>{streetAddress}</TextInput>) 
                    } */}
                   <Image style={styles.locationMap} source={mapIMG}></Image>

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
                      {this.state.imageUri && typeof this.state.imageUri === 'string' ? (
                            <Image 
                                style={styles.houseIMG} 
                                source={{ uri: this.state.imageUri }}
                            />
                            ) : (
                            <Text>이미지가 아직 로드되지 않았습니다.</Text>
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
        width: 340,
    },
    InfoModify:{                           // 호스트 정보 수정하기
        fontSize: 17,
        marginBottom: '5%',
        color: '#4285F4',  
        // backgroundColor: 'yellow',
    },
    houseIMGView:{                         // 숙소 사진 가운데 정렬 View
        alignItems:'center',
        flexDirection: 'row',
        width: '53%',
        marginTop: '5%',
        marginBottom: '5%',
        // backgroundColor: 'yellow',
    },
    addHouseIMGView:{                      // 숙소 사진등록 View
        marginTop: '10%',
        marginBottom: '4%',
        backgroundColor:'#E2E2E2',
    },
    houseIMG: {                        // 숙소 사진 등록
        width: 200,
        height: 200,
        alignItems:'center',
        justifyContent: 'center',
    },
    hostInfoText: {                        // 호스트 정보 입력 value 텍스트
        fontSize: 16,
        width: 340,
        color: 'gray',
        margin: 0,
        padding: 0,
        paddingLeft: 3,
        height: 50,
        // backgroundColor: 'yellow',
    },
    houseInfoText: {                        // 숙소 소개글
        fontSize: 16,
        width: 340,
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
        width: 340,
        color: 'gray',
        height: 32,
        textAlignVertical: 'top',
        // backgroundColor: 'yellow',
        margin: 0,
        paddingTop: 5,
        paddingLeft: 3,
        padding:0,
    },
    hostInfoView: {                       // 호스트 정보 전체를 담는 View
        width: '90%',
        borderRadius: 15,
        marginTop: '1.8%',
        flexdirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: '3%',
        paddingBottom: '3%',
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
        width: 340,
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
        marginTop: '10%',
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
    tagTextmargin: {                         // 태그 텍스트 스크롤뷰 마진
        width: 30,
    },
});

export default HouseAddScreen;