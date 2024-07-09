import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Rating } from 'react-native-ratings';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

//이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import houseAddIMG from './Image/사진추가_아이콘.png';
import houseIMG1 from './Image/여행지1.png';
import houseIMG2 from './Image/여행지2.png';
import houseIMG3 from './Image/여행지3.png';
import houseIMG4 from './Image/여행지4.png';
import houseIMG5 from './Image/여행지5.png';
import houseIMG6 from './Image/여행지6.png';
import houseIMG7 from './Image/여행지7.png';
import houseIMG8 from './Image/여행지8.png';
import houseIMG9 from './Image/여행지9.png';


class ReviewModifyScreen extends Component {
    state = {
        rating: 3, 
        reviewIMG: houseAddIMG,

        reviews: [
            {
                id: 1,
                profileName: '안철수',
                reviewText: '강원도에서 귀농생각중이라 체험해볼겸 1박2일로 여행 갔다왔는데 정말 좋네요.\n\n 특히 어르신께서 오랜만에 오는 손님이라고 이것저것 엄청 챙겨주시고 65년 토박이라고 하시면서 주변 볼거리들도 추천해줬는데 강원도에 이렇게 자연경관이 아름다운 곳이 있었나 감탄만 하고 왔습니다... \n\n그리고 시골이라 쾌적한 숙소는 사실 기대안했는데 생각보다 내부는 엄청 깔끔해서 너무 잘 잤습니다. \n\n근데 확실히 시골이라 벌레가 많긴하더라구요 참고하시면 좋을 것 같아요.',
                reviewScore: 4.3,
                images: [houseIMG1],
                optionsVisible: false,
            },
            {
                id: 2,
                profileName: '이지수',
                reviewText: '확실히 강원도에 오래사신분이랑 스테이하니까 이것저것 새로 알게되는 것도 많네요. 어르신 덕분에 잘 쉬다갑니다!',
                reviewScore: 4.7,
                images: [houseIMG5, houseIMG6, houseIMG2,],
                optionsVisible: false,
            },
            {
                id: 3,
                profileName: '박민철',
                reviewText: '생각보다 내부가 깔끔했고, 어르신이 요리를 너무 잘하셔서 놀랬어요 자연즐기면서 쉬고싶은분들은 꼭 한번 가보십쇼',
                reviewScore: 4.,
                images: [],
                optionsVisible: false,
            },
            {
                id: 4,
                profileName: '김지석',
                reviewText: '숙소는 적당히 쉴만한데 가격이 너무 가성비라 여기서  시골스테이 한번 해보시는거 강추드립니다',
                reviewScore: 4.4,
                images: [ houseIMG3, houseIMG4,houseIMG9],
                optionsVisible: false,
            },
            {
                id: 5,
                profileName: '오영수',
                reviewText: '어르신이 너무 적극적으로 여행지나, 맛집등등 이것저것 알려주셔서 정말 편하게 여행도하고 시골생활도 즐기다 왔네요',
                reviewScore: 4.7,
                images: [],
                optionsVisible: false,
            },
        ]
    };

    ratingCompleted = (rating) => {
        const roundedRating = parseFloat(rating.toFixed(1));
        this.setState({ rating: roundedRating });
      };


      constructor(props) {
        super(props);
        const reviewId = this.props.route.params.reviewId;
        const reviewData = this.findReviewById(reviewId);
        this.state = {
            rating: reviewData.reviewScore,
            reviewIMG: reviewData.images.length > 0 ? reviewData.images[0] : houseAddIMG, // 첫 번째 이미지 사용
            reviewText: reviewData.reviewText,
            reviewId: reviewId,
        };
    }
    
    findReviewById = (id) => {
        const { reviews } = this.state;
        return reviews.find(review => review.id === id);
    };

    addImage = () => {

        launchImageLibrary({}, response => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else if (response.customButton) {
                    console.log('User tapped custom button: ', response.customButton);
                } else {
                    const source = { uri: response.assets[0].uri };
                    this.setState({ reviewIMG: source });
                }
            });
    };

    onChangeInput = (event)=>{                      // 검색하면 inputText에 변경된 값 적용시킬 때 입력한담아두는 함수
        this.setState({
            reviewText: event 
        })
    }
    

  render() {

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
                    <Text style={styles.InterviewText}> 박양순님과의 스테이는 어떠셨나요? </Text>
                    <View style={styles.ratingView}>
                    <Rating
                         type='custom'
                         ratingCount={5}
                         imageSize={20}
                         startingValue={this.state.rating}
                         ratingColor={'#F4CD42'}      
                         fractions={2}             
                         onFinishRating={this.ratingCompleted}
                         style={styles.rating}
                         />
                    <Text style={styles.ratingText}> {this.state.rating}점 </Text>
                    </View>       
                </View>

                <View style={styles. reviewWriteView}>
                    <Text style={styles.ReviewText} > 아래에 후기를 남겨주세요. </Text>
                    <TouchableOpacity onPress={this.addImage}>
                        <Text style={styles.addIMGText} >사진 변경</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.reviewIMGView}>
                    <ScrollView styels={styles.reviewIMGScrollView}showsHorizontalScrollIndicator={false} horizontal={true}>
                            <Image style={styles.reviewIMG} source={this.state.reviewIMG}/>
                    </ScrollView>
                </View>

                <View style={styles.reviewTextInpuView} >
                    <TextInput style={styles.reviewTextInput} value={this.state.reviewText} multiline={true} onChangeText={this.onChangeInput}/>
                </View>
                
                <View style={styles.reservationBtnView}>
                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.props.navigation.goBack()}>
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


    barMargin: {                    // 스클롤 탭바 마진
        height: 10,
    },

});

export default ReviewModifyScreen;