import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Rating } from 'react-native-ratings';
import { launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import { getToken, refreshAccessToken } from './token';
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';  
import reviewModifyIcon from './Image/후기수정완료버튼_아이콘.png';  


class ReviewModifyScreen extends Component {
    state = {
        rating: 5,
        imageType: "",

        reviews: [
            {
                id: 0,
                profileName: "dadas",
                reviewText: "asda",
                reviewScore: 0,
                images: [],
                optionsVisible: false,
            },
        ]
    };

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getReviewData();
        });
    }
    
    componentWillUnmount() {
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

    async getReviewData() {                      // axios를 활용한 api통신을 통해 서버로부터 해당숙소의 이전 리뷰를 불러오는 함수
        try{
            const { reviewId } = this.props.route.params;

            const token = await getToken();

            const response = await axios.get(`http://223.130.131.166:8080/api/v1/review/${reviewId}`,{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            
                     
            const review = response.data;
            const data = [{
                id: review.reviewId,
                profileName: review.userName,
                reviewText: review.content,
                reviewScore: review.star,
                images: review.photos
            }];

            this.setState({ reviews: data });
            
            console.log("현재 reviews state:", this.state.reviews);

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

    deleteReview = async () => {                       // 리뷰삭제하기 - 삭제권한없으면 수정권한없다고 표시하기
        try {
            const token = await getToken();  
            const { reviewId } = this.props.route.params;
            
            const response = await axios.delete(`http://223.130.131.166:8080/api/v1/review/${reviewId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch(error) {
            if (error.response) {
              alert('수정할 권한이 없습니다.');
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

    putReviewData = async () => {
        try {
            const { reviews, imageType, rating } = this.state;
            const reviewText = reviews[0].reviewText;  
            const { reviewId,houseId } = this.props.route.params;
    
            const token = await getToken();
            const formData = new FormData();
            
            const reviewData = {
                content: reviewText,
                star: rating,
                houseId: houseId,
                // reviewId: reviewId, 
            };
    
            const jsonString = JSON.stringify(reviewData);
            const fileName = 'dto.json';
            const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
    
            await RNFS.writeFile(filePath, jsonString, 'utf8');
    
            formData.append('dto', {
                uri: `file://${filePath}`,
                type: 'application/json',
                name: fileName
            });

            reviews[0].images.forEach((uri, index) => {
                formData.append('photos', {
                    uri: uri,
                    name: `image-${index}.jpg`, 
                    type: imageType || 'image/jpeg',
                });
            });

            reviews[0].images.forEach((uri, index) => {
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
    
            const response = await fetch('http://223.130.131.166:8080/api/v1/review', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
    
            const responseData = await response.json();
            console.log("Server response:", responseData);
    
            this.props.navigation.navigate('메인', { refresh: true });
            this.deleteReview();
        } catch (error) {
            console.error('Error while sending review data:', error);
            if (error.response) {
                console.error('Response Error:', error.response.status);
            } else if (error.request) {
                console.error('Request Error:', error.request);
            } else {
                console.error('Unexpected Error:', error.message);
            }
        }
    };
    


    // putReviewData = async () => {                 // axios를 활용한 api통신을 통해 서버로부터 수정한 리뷰를 서버로 다시 보내주는 함수
    //     try{
    //         const {                                // 서버에 보내야하는 데이터들을 관리
    //             rating,
    //             imageType,
    //             reviewText,
    //         } = this.state;

    //         const { reviewId, name } = this.props.route.params;

    //         const formData = new FormData();

    //         const dto = {
    //             content: reviewText,
    //             star: rating,
    //             reviewId: reviewId,
    //         };
            
    //         console.log("put요청 버튼누름");

    //         const jsonString = JSON.stringify(dto);
    //         const fileName = 'dto.json';
    //         const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

    //         await RNFS.writeFile(filePath, jsonString, 'utf8');

    //         formData.append('dto', {
    //             uri: `file://${filePath}`,
    //             type: 'application/json',
    //             name: fileName
    //         });
    
    //         this.state.reviews[0].images.forEach((filePath, index) => {
    //         formData.append('photos', {
    //             uri: filePath,
    //             name: `image-${index}.jpg`,
    //             type: imageType || 'image/jpeg',
    //         });
    //         });

    //         for (let pair of formData._parts) {
    //         console.log(pair[0] + ': ' + JSON.stringify(pair[1]));
    //         };

    //         const token = await getToken();

    //         const response = await axios.put(`http://223.130.131.166:8080/api/v1/review/${reviewId}`,formData, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             },
    //         });
    //         console.log(response.data);
    //         this.props.navigation.navigate('검색',);

    //         } catch(error) {
    //             if (error.response && error.response.status === 401) {          
    //                 console.log('토큰 재발급 요청중...');
                
    //             const newAccessToken = await refreshAccessToken();                 

    //             const {                                
    //                 rating,
    //                 imageType,
    //                 reviewText,
    //             } = this.state;

    //             const { reviewId, name } = this.props.route.params;

    //             const formData = new FormData();

    //             const dto = {
    //                 content: reviewText,
    //                 star: rating,
    //                 reviewId: reviewId,
    //             };
                
    //             console.log("put요청 버튼누름");

    //             const jsonString = JSON.stringify(dto);
    //             const fileName = 'dto.json';
    //             const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

    //             await RNFS.writeFile(filePath, jsonString, 'utf8');

    //             formData.append('dto', {
    //                 uri: `file://${filePath}`,
    //                 type: 'application/json',
    //                 name: fileName
    //             });

    //             this.state.reviews[0].images.forEach((filePath, index) => {
    //             formData.append('photos', {
    //                 uri: filePath,
    //                 name: `image-${index}.jpg`,
    //                 type: imageType || 'image/jpeg',
    //             });
    //             });

    //             for (let pair of formData._parts) {
    //             console.log(pair[0] + ': ' + JSON.stringify(pair[1]));
    //             };

    //             console.log("서버에 요청한 토큰: "+newAccessToken)
    //             const response = await axios.put(`http://223.130.131.166:8080/api/v1/review/${reviewId}`, formData, {
    //                 headers: {
    //                     'Authorization': `Bearer ${newAccessToken}`,
    //                 },
    //                 });
    //             console.log(response.data);
    //             this.props.navigation.navigate('검색',);

    //         }
    //     }
    // }

    ratingCompleted = (rating) => {
        this.setState({ rating: rating });
    };

    changeImage = () => {
        launchImageLibrary({}, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                // 새로운 이미지의 URI 추출
                const newImages = response.assets.map(asset => asset.uri);
                const imageTypes = response.assets.map(asset => asset.type);
    
                // 기존 이미지 목록에 새 이미지 추가
                this.setState(prevState => ({
                    imageType: imageTypes[0],
                    reviews: prevState.reviews.map(review => ({
                        ...review,
                        images: [...review.images, ...newImages] // 기존 이미지에 새 이미지 추가
                    }))
                }));
            }
        });
    };

    removeImage = (index) => {
        this.setState(prevState => ({
            reviews: prevState.reviews.map(review => ({
                ...review,
                images: review.images.filter((_, imgIndex) => imgIndex !== index) 
            }))
        }));
    }
    

    onChangeInput = (text) => {                // 검색하면 inputText에 변경된 값 적용시킬 때 입력한담아두는 함수
        this.setState(prevState => ({
            reviews: prevState.reviews.map(review => ({
                ...review,
                reviewText: text
            }))
        }));
    }
    

  render() {
    const { name } = this.props.route.params;
    // const{
    //     id,
    //     profileName,
    //     reviewText,
    //     reviewScore,
    //     images,
    //     optionsVisible,
    // } = this.state.reviews

    const {
        id,
        profileName,
        reviewText,
        reviewScore,
        images,
        optionsVisible,
    } = this.state.reviews[0] || {};

    const imagesExist = images && images.length > 0;

    return (
        
            <ScrollView style={styles.background} showsHorizontalScrollIndicator={false}>
            <View style={styles.container}>
            <View style={styles.reviewAddView}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                    <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                    </TouchableOpacity>
                    <Text style={styles.reviewModifyText}> 후기 수정하기 </Text>
                </View>
                <View style={styles.grayHorizontalLine}/>

                <View style={styles.reviewScoreView}>
                    <Text style={styles.InterviewText}> {name}님과의 스테이는 어떠셨나요? </Text>
                    <View style={styles.ratingView}>
                    <Rating
                         type='custom'
                         ratingCount={5}
                         imageSize={20}
                         startingValue={this.state.reviews[0].reviewScore}
                         ratingColor={'#F4CD42'}      
                         onFinishRating={this.ratingCompleted}
                         style={styles.rating}
                         />
                    <Text style={styles.ratingText}> {this.state.rating}점 </Text>
                    </View>       
                </View>

                <View style={styles. reviewWriteView}>
                    <Text style={styles.ReviewText} > 아래에 후기를 남겨주세요. </Text>
                    <TouchableOpacity onPress={this.changeImage}>
                        <Text style={styles.addIMGText} >사진 추가</Text>
                    </TouchableOpacity>
                </View>

              <View style={styles.reviewIMGView}>
                    <ScrollView style={styles.addHouseIMGView}  
                        showsHorizontalScrollIndicator={false}  
                        horizontal={true}>
                   {this.state.reviews[0]?.images?.length > 0 ? (
                        this.state.reviews[0].images.map((uri, index) => (
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
                    <TextInput style={styles.reviewTextInput} value={this.state.reviews[0].reviewText} multiline={true} onChangeText={this.onChangeInput}/>
                </View>
                
                <View style={styles.reservationBtnView}>
                <TouchableOpacity style={styles.reservationBtn} onPress={this.putReviewData}>
                <Image style={styles.reviewModifyBtn} source={reviewModifyIcon}/>
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
    reviewModifyText: {                        // 최상단 '후기수정하기' 제목 텍스트
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
        // margin: '2%',
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
    reviewModifyBtn:{                          // '후기작성완료' 버튼
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

export default ReviewModifyScreen;