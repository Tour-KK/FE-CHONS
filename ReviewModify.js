import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Rating } from 'react-native-ratings';
import { launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import { getToken } from './token';
import RNFS from 'react-native-fs';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';


class ReviewModifyScreen extends Component {
    state = {
        rating: "만",
        imageType: "",

        reviews: [
            {
                id: 0,
                profileName: "",
                reviewText: "",
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

    putReviewData = async () => {                 // axios를 활용한 api통신을 통해 서버로부터 수정한 리뷰를 서버로 다시 보내주는 함수
        try{
            const {                             	// 서버에 보내야하는 데이터들을 관리
                rating,
                imageType,
                reviewText,
            } = this.state;

            const { reviewId, name } = this.props.route.params;

            const formData = new FormData();

            const dto = {
                content: reviewText,
                star: rating,
                reviewId: reviewId,
            };
            
            console.log("put요청 버튼누름");

            const jsonString = JSON.stringify(dto);
            const fileName = 'dto.json';
            const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

            await RNFS.writeFile(filePath, jsonString, 'utf8');

            formData.append('dto', {
                uri: `file://${filePath}`,
                type: 'application/json',
                name: fileName
            });
    
            this.state.reviews[0].images.forEach((filePath, index) => {
            formData.append('photos', {
                uri: filePath,
                name: `image-${index}.jpg`,
                type: imageType,
            });
            });

            for (let pair of formData._parts) {
            console.log(pair[0] + ': ' + JSON.stringify(pair[1]));
            };

            const token = await getToken();

            const response = await axios.put(`http://223.130.131.166:8080/api/v1/review/${reviewId}`,{
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });
            console.log(response.data);
            this.props.navigation.navigate('검색',);

            } catch(error) {
                if(error.status === '401'){
                    alert("수정권한이 없습니다.");
                }
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
    const{
        id,
        profileName,
        reviewText,
        reviewScore,
        images,
        optionsVisible,
    } = this.state.reviews

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
                    <Text style={styles.reviewWriteText}> 후기 수정하기 </Text>
                </View>

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
                            {this.state.reviews.images.length > 0 ? (
                                this.state.reviews.images.map((uri, index) => (
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

                <View style={styles.reviewTextInpuView} >
                    <TextInput style={styles.reviewTextInput} value={this.state.reviews[0].reviewText} multiline={true} onChangeText={this.onChangeInput}/>
                </View>
                
                <View style={styles.reservationBtnView}>
                <TouchableOpacity style={styles.reservationBtn} onPress={this.putReviewData}>
                    <Text style={styles.reservationBtnText}> 후기 수정 완료</Text>
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
        width: 100,
        height: 100,
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
    reviewTextInpuView:{                    // 후기 textinput 을 담은 View
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
        height: 10,
    },

});

export default ReviewModifyScreen;