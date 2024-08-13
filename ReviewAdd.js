import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Rating } from 'react-native-ratings';
import { launchImageLibrary} from 'react-native-image-picker';
import { getToken } from './token'
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';


class ReviewAddScreen extends Component {
    state = {
        rating: 3, 
        tempRating: 3,
        reviewIMG: [],
        reviewText: "",
        imageType: null, 
    };

    ratingCompleted = (rating) => {          // 정수 형태로 평점 저장
        const roundedRating = Math.round(rating);
        this.setState({ rating: roundedRating });
    };

    handleRating = (rating) => {            // 평점 선택 UI 정수형태로 실시간 반영
        this.setState({ tempRating: rating });
    }

    // changeInputText = (inputText) => {
    //     this.setState({ reviewText: inputText });
    // };

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
                          reviewIMG: [...prevState.reviewIMG, uri], 
                          imageType: type,
                          imageName: fileName,
                      }));
                  };
            });
    };

    onChangeInput = (event)=>{                      // 검색하면 inputText에 변경된 값 적용시킬 때 입력한담아두는 함수
        this.setState({
            reviewText: event 
        })
    }

    async postReview() {                // 리뷰 등록시 리뷰데이터 서버에 보내는 함수
        try {   
            const {                   	// 서버에 보내야하는 데이터들을 관리
                rating,
                reviewIMG,
                reviewText,
                imageType,
            } = this.state;

            const {houseId, name} = this.props.route.params;
    
            const formData = new FormData();      // fromData를 사용하기위해 FormData객체를 선언해주기
    
            const dto = {
                content: reviewText,
                star: `${rating}`,
                houseId: houseId,
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

            this.state.reviewIMG.forEach((uri, index) => {
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
    
            if (reviewIMG.length > 0) {
                reviewIMG.forEach((img, index) => {
                    formData.append('photos', {
                        uri: img.uri,
                        type: img.type || 'image/jpeg',
                        name: `photo${index}.jpg`
                    });
                });
            }
            
            for (let pair of formData._parts) {
            console.log(pair[0] + ': ' + JSON.stringify(pair[1]));
            };
    
    
            const token = await getToken();
    
            const response = await fetch('http://223.130.131.166:8080/api/v1/review', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
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

  render() {

    const { name } = this.props.route.params;

    return (
        <LinearGradient
        colors={['#E8ECFF', '#FFFFFF']} 
        style={styles.linearGradient} 
        start={{ x: 0, y: 1 }} 
        end={{ x: 0, y: 0}} >
            <ScrollView style={styles.background} showsHorizontalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <TouchableOpacity  onPress={() => this.props.navigation.goBack()}>
                    <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.reviewWriteText}> 후기 작성하기 </Text>
                </View>

                <View style={styles.reviewScoreView}>
                    <Text style={styles.InterviewText}> {name}님과의 스테이는 어떠셨나요? </Text>
                    <View style={styles.ratingView}>
                    <Rating
                        type='custom'
                        ratingCount={5}
                        imageSize={20}
                        startingValue={this.state.rating}
                        ratingColor={'#F4CD42'}
                        onFinishRating={this.ratingCompleted}
                        onSwipeRating={this.handleRating} 
                        style={styles.rating}
                    />

                    <Text style={styles.ratingText}> {Math.round(this.state.rating)}점 </Text>
                    </View>       
                </View>

                <View style={styles. reviewWriteView}>
                    <Text style={styles.ReviewText} > 아래에 후기를 남겨주세요. </Text>
                    <TouchableOpacity onPress={this.addImage}>
                        <Text style={styles.addIMGText} >사진 추가</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.reviewIMGView}>
                <ScrollView style={styles.addHouseIMGView}  
                        showsHorizontalScrollIndicator={false}  
                        horizontal={true}>
                            {this.state.reviewIMG.length > 0 ? (
                                this.state.reviewIMG.map((uri, index) => (
                                    <Image key={index} style={styles.houseIMG} source={{ uri: uri }}/>
                                ))
                            ) : (
                                <TouchableOpacity style={styles.ModifySelectView} onPress={this.addImage}>
                                  <Image style={styles.houseIMG} source={houseAddIMG}/>
                                </TouchableOpacity>
                            )}
                </ScrollView>
                </View>

                <View style={styles.reviewTextInputView} >
                    <TextInput style={styles.reviewTextInput} placeholder='내용을 입력해주세요..' multiline={true} onChangeText={this.onChangeInput}/>
                </View>
                
                <View style={styles.reservationBtnView}>
                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.postReview()}>
                    <Text style={styles.reservationBtnText}> 후기 작성 완료</Text>
                </TouchableOpacity>
                </View>
      
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
    titleView: {                   // 뒤로가기버튼, 예약하기 텍스트 담는 View
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
    reviewWriteText: {                       // 후기작성 제목 텍스트  
        marginBottom: '0.5%',
        fontSize: 28,
        width: '88%',
    },  
    content: {                                // 예약버튼 누른 컨텐츠
        width: 370,
        height: 120,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        marginTop: '1.1%',
        borderRadius: 20,
        elevation: 2,
    },
    houseIMG:{                                // 숙소 이미지
        alignItems: 'center',
        borderRadius: 10, 
        width: 200,
        height: 200,
        resizeMode: 'cover',
        margin: '2%',
    },
    houseInfo: {                             // 숙소정보 Text담는 View
        flex: 0,
        width: '55%',
        height: '100%',
    },
    houseName:{                              // 숙소명
        width:'100%',
        textAlign: 'left',
        fontSize: 20,
        marginTop: '12%',
        marginLeft: 2,
    },
    houseAddress: {                         // 숙소주소
        width:'100%',
        textAlign: 'left',
        fontSize: 12,
        marginLeft: 7,
        marginTop: 2,
    },
    houseReview: {                          // 숙소리뷰
        width:'100%',
        textAlign: 'left',
        fontSize: 18,
        marginLeft: 5,
        marginTop: 4,
    },
    reviewHouseText: {                      // 리뷰하는 숙소명 제목 텍스트
        fontSize: 24,
        width: '90%',
        marginTop: '6.6%',
        },
    reviewScoreView:{                       // 리뷰 인터뷰텍스트랑 평점 부여기능 담는 VIew
        marginTop: '4%',
        width: '90%',
        backgroundColor:'white',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    InterviewText: {                        // 호스트님과 함꼐한 여행은 어떠셨나요 텍스트
        marginTop: '6.6%',
        fontSize: 20,
        width: '88%',
        // backgroundColor:'gray',
    },
    ratingView: {                           // 리뷰 평점을 주는 Rating 기능을 담는 View
        flexDirection: 'row',
        width: '88%',
        marginLeft: '5.5%',
        marginTop: '5%',
        marginBottom: '5.5%',
        // backgroundColor:'gray',
    },
    ratingText: {                           // 현재 평점 몇점 줬는지 띄워주는 텍스트
        fontSize: 20,
        color: '#F4CD42',
        width: '20%',
    },
    rating: {
        // backgroundColor: 'gray',
        alignItems: 'flex-start',
        width: '80%',
        
    },
    reviewWriteView: {                      // 후기 작성해달라는 문구와 사진추가 텍스트 담은 View
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
        marginTop: '10%',

    },
    ReviewText: {                           // 후기 작성해달라는 문구 텍스트
        fontSize: 22,
        width: '72%',
        // backgroundColor: 'gray',
    },
    addIMGText:{                            // 사진추가 텍스트
        fontSize: 16,
        alignItems: 'center',
        color: '#4285F4',
    },
    reviewTextInputView:{                    // 후기 textinput 을 담은 View
           marginTop: '12%',
           width: '84%',
           backgroundColor:'white',
           borderRadius: 20,
           alignItems: 'center',
           justifyContent: 'center',
           elevation: 2,
    },
    reviewTextInput: {                      // 후기작성 Input텍스트 
        width: '90%',
        fontSize: 16,
    },
    reservationBtnView:{                    // 버튼 가운데 정렬하기 위한 Veiw
        marginBottom: '6%',
        alignItems: 'center',
        width: '100%',
    },
    reservationBtn:{                          // 숙소등록 버튼
        backgroundColor : '#4285F4',  
        borderRadius: 16,
        width: '80%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,                     
        shadowColor: '#4285F4',
        shadowRadius: 10,
        marginTop: '15%',
    },
    reservationBtnText:{                        // 숙소등록하기 텍스트
        color: 'white', 
        fontSize: 24,
        marginBottom: '1.5%',
    },
    reviewIMGView: {                       // 리뷰 이미지 담는 Scroll View 대신 스타일링
        width: '88%',
        marginTop: '12%',
        alignItems:'center',
        // backgroundColor: 'gray',
    },
    reviewIMGScrollView: {                 // 후기 이미지 담는 스크롤 뷰
        flexDirection: 'row',
    },
    reviewIMG: {                           // 리뷰 이미지 
        width: 180,
        height: 180,
        // backgroundColor: 'gray'
    },

    barMargin: {                    // 스클롤 탭바 마진
        height: 10,
    },

});

export default ReviewAddScreen;