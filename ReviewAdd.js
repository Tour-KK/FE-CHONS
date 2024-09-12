import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { Rating } from 'react-native-ratings';
import { launchImageLibrary} from 'react-native-image-picker';
import { getToken } from './token'
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';
import reviewAddIMG from './Image/후기작성완료버튼_아이콘.png';


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

    removeImage = (indexToRemove) => {
        this.setState(prevState => ({
            reviewIMG: prevState.reviewIMG.filter((_, index) => index !== indexToRemove)
        }));
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
                star: rating,
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
                        uri: img,
                        type: imageType || 'image/jpeg',
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
            <ScrollView style={styles.background} showsHorizontalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.reviewAddView}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                    <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.reviewAddText}> 후기 작성하기 </Text>
                </View>
                <View style={styles.grayHorizontalLine}/>

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
                <View style={styles.grayHorizontalLine2}/>

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

                <View style={styles.reviewTextInputView} >
                    <TextInput style={styles.reviewTextInput} placeholder='내용을 입력해주세요..' multiline={true} onChangeText={this.onChangeInput}/>
                </View>
                
                <View style={styles.reservationBtnView}>
                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.postReview()}>
                    <Image style={styles.reviewAddBtn} source={reviewAddIMG}/>
                </TouchableOpacity>
                </View>
      
                <View style={styles.barMargin}><Text> </Text></View>
            </View>
            </ScrollView>
    )
  }
}

// 스타일 시트
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
    reviewAddView: {                   // 뒤로가기버튼,  숙소등록 제목 담는 View
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        width: '100%',
        paddingLeft: "1.8%",
        marginTop: '2.8%',
        // backgroundColor: "yellow",
    },  
    backBtnIcon: {                         // 뒤로가기 아이콘
        resizeMode: 'contain',
        width: 20,
        height: 20,
        marginRight: '0.3%',
        // backgroundColor: "gray"
        
    },
    reviewAddText: {                        // 최상단 '후기작성' 제목 텍스트
        fontSize: 22,
        color: "black",
        width: '88%',
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: "gray"
    },  
    grayHorizontalLine: {                  // 회색 가로선
        width: '100%',
        height: 1.8,
        backgroundColor: '#BFBFBF',
        marginTop: "2.2%",
    },
    grayHorizontalLine2: {                  // 별점부분 회색 가로선2
        width: '100%',
        height: 1.8,
        backgroundColor: '#DADADA',
        marginTop: "2.2%",
    },
    houseIMG:{                                // 숙소 이미지
        alignItems: 'center',
        borderRadius: 10, 
        width: 200,
        height: 200,
        resizeMode: 'cover',
        margin: '2%',
    },
    reviewScoreView:{                       // 리뷰 인터뷰텍스트랑 평점 부여기능 담는 VIew
        marginTop: '2.2%',
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    InterviewText: {                        // 호스트님과 함꼐한 여행은 어떠셨나요 텍스트
        marginTop: '6.6%',
        fontSize: 20,
        width: '100%',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor:'green',
    },
    ratingView: {                           // 리뷰 평점을 주는 Rating 기능을 담는 View
        flexDirection: 'row',
        paddingLeft: '1.1%',
        width: '100%',
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
        width: '74%',
        
    },
    reviewWriteView: {                      // 후기 작성해달라는 문구와 사진추가 텍스트 담은 View
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
        marginTop: '10%',

    },
    ReviewText: {                           // 후기 작성해달라는 문구 텍스트
        fontSize: 20,
        width: '72%',
        color: "black",
        fontFamily: 'Pretendard-Bold',
        // backgroundColor: 'gray',
    },
    addIMGText:{                            // 사진추가 텍스트
        fontSize: 16,
        alignItems: 'center',
        color: '#0AE090',
    },
    reviewTextInputView:{                    // 후기 textinput 을 담은 View
           marginTop: '4.4%',
           width: '100%',
           alignItems: 'center',
           justifyContent: 'center',
        //    backgroundColor:'green',
    },
    reviewTextInput: {                      // 후기작성 Input텍스트 
        fontSize: 16,
        width: '88%',
        marginTop: '3.8%',
        marginBottom: '4.4%',
        textAlign: 'left',
        textAlignVertical: "center",
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        padding:"3%",
    },
    reservationBtnView:{                    // 버튼 가운데 정렬하기 위한 Veiw
        marginBottom: '6%',
        width: '100%',
        alignItems: 'center',
    },
    reservationBtn:{                          // 숙소등록 버튼
        width: '100%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15%',
        // backgroundColor : '#4285F4',  
    },
    reviewAddBtn:{                          // '후기작성완료' 버튼
        width: '88%',
        height: 55,  
        resizeMode: 'contain',
    },
    reviewIMGView: {                       // 리뷰 이미지 담는 Scroll View 대신 스타일링
        width: '88%',
        marginTop: '10%',
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
    barMargin: {                    // 스클롤 탭바 마진
        height: 30,
    },

});

export default ReviewAddScreen;