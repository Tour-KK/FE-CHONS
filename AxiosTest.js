import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './token'
import RNFetchBlob from 'react-native-blob-util';

class AxiosTest extends Component {

    state = {
        hostName: '이민호', 
        introText: '테스트',
        freeService: '#와이파이',
        address: '경기도 용인시 수지구',
        phoneNumber: '010-1234-5678',
        price: '13600',
        maximumGuestNumber: '2',
        imageUri: [],
        imageType: null, 
        imageName: null,
    }

   
async postHouseData() {
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

        const jsonString = JSON.stringify(dto);
        const blob = await RNFetchBlob.polyfill.Blob.build(jsonString, { type: 'application/json;' });
        console.log("Blob 생성 테스트: ", blob);
        formData.append("dto", blob, 'dto.json');

        // Append images as files to the formData
        this.state.imageUri.forEach((filePath, index) => {
            formData.append('photos', {
                uri: `file://${filePath}`,
                type: this.state.imageType || 'image/jpeg',
                name: this.state.imageName || `image_${index}.jpg`,
            });
        });

        const token = await getToken(); 

        const response = await axios({
            method: "POST",
            url: "http://223.130.131.166:8080/api/v1/house",
            data: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data', 
            },
        });

        console.log(response.data);
        this.props.navigation.navigate('검색', { refresh: true });
    } catch(error) {
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
//////////////////////////////////////////////////////////////   


    addImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 1, // 이미지 품질을 50%로 설정
            maxWidth: 300, // 최대 너비를 800픽셀로 제한
            maxHeight: 300, // 최대 높이를 800픽셀로 제한
            includeBase64: false, // Base64 인코딩된 이미지 데이터 포함 여부
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
                    console.log(`Uri: ${uri}\ \n Type: ${type} \n Name: ${fileName}`);
                    this.setState(prevState => ({
                        imageUri: [...prevState.imageUri, uri],
                        imageType: type,
                        imageName: fileName,
                    })), () => {
                        console.log(`Uri: ${this.state.imageUri}, Type: ${this.state.imageType}, Name: ${this.state.imageName}`);
                    };
                    
                }
            });
    };
    

  render() {

    return (
            <View style={styles.container}>
                <View style={styles.houseIMGView}>
                    <TouchableOpacity style={styles.ModifySelectView} onPress={this.addImage}>
                        <Text style={styles.InfoModify}> 사진 추가 </Text>
                    </TouchableOpacity>
                <ScrollView style={styles.addHouseIMGView}  
                    showsHorizontalScrollIndicator={false}  
                    horizontal={true}>
                        {this.state.imageUri.length > 0 ? (
                            this.state.imageUri.map((uri, index) => (
                                <Image 
                                    key={index}
                                    style={styles.houseIMG} 
                                    source={{ uri: uri }}  
                                />
                            ))
                        ) : (
                            <Text>이미지가 아직 로드되지 않았습니다.</Text>
                        )}
                </ScrollView>
                </View>
                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.postHouseData()}>
                    <Text style={styles.InfoModify}> 숙소 등록하기</Text>
                </TouchableOpacity>
            </View>
    )
  }
}

// 스타일 시트
const styles = StyleSheet.create({
    container : {                
        alignItems: 'center', 
        justifyContent: "center",
        height: '100%',
    },
    houseIMGView : {
        alignItems: 'center', 
        justifyContent: "center",
        width: "96%",
        // backgroundColor: 'gray',
    },
    InfoModify: {
        fontSize: 30,
        margin: 40,
    },
    houseIMG: {
        height: 200,
        width: 200,
    },
});

export default AxiosTest;