import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import { getToken } from './token'
import RNFS from 'react-native-fs';



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
    
//////////////////////////////////////////////////////////////   


    addImage = () => {
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
                    // const newFilePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
                    // const fileUri = `file://${newFilePath}`
                    // console.log(`Uri: ${uri}\ \n Type: ${type} \n Name: ${fileName} \n fileUri: ${fileUri}`);
                    
                    // RNFS.copyFile(uri, newFilePath)
                    // .then(() => {
                      this.setState(prevState => ({
                          imageUri: [...prevState.imageUri, uri], 
                          imageType: type,
                          imageName: fileName,
                      }));
                    // })
                    // .catch(err => console.error('File Copy Error:', err));
                  };
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