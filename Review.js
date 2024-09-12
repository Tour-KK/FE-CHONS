import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { getToken } from './token';

// 이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import profileIMG from './Image/프로필_아이콘.png';
import reviewScoreIcon from './Image/평점_별아이콘.png';
import reviewMenuIcon from './Image/목록_아이콘.png';
import reviewWriteBtn from './Image/후기작성버튼_아이콘.png';


class ReviewScreen extends Component {
    state = {
        reviews: [
            {
                id: 0,
                profileName: "이민규",
                reviewText: "으아악",
                reviewScore: 4.3,
                images: [],
                optionsVisible: false,
            },
            {
                id: 1,
                profileName: "이민규",
                reviewText: "으아악",
                reviewScore: 4.3,
                images: [],
                optionsVisible: false,
            },
            {
                id: 2,
                profileName: "이민규",
                reviewText: "으아악",
                reviewScore: 4.3,
                images: [],
                optionsVisible: false,
            },
        ],
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            console.log('DOM에서 먼저 렌더링 완료');
            this.getReviewList();
        });
    }
    
    componentWillUnmount() {
        if (this.focusListener) {
            console.log('DOM에서 해당 리스너 제거완료');
            this.focusListener();
        }
    }

    changeOptionState = (id) => {
        this.setState(prevState => ({
            reviews: prevState.reviews.map(review =>
                review.id === id ? { ...review, optionsVisible: !review.optionsVisible } : review
            )
        }));
    };

    modifyReview = (reviewId, houseId) => {             // 후기수정버튼시 후기수정화면으로 이동
        this.props.navigation.navigate('후기수정', { reviewId, houseId });
    }

    async getReviewList() {                      // axios를 활용한 api통신을 통해 서버로부터 해당숙소의 리뷰 리스트들을 불러오는 함수
        try{
            const { houseId } = this.props.route.params;

            const token = await getToken();

            const response = await axios.get(`http://223.130.131.166:8080/api/v1/review/house/${houseId}`,{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            
            
            this.setState({ reviews: response.data.map(review => ({
                id: review.reviewId,
                profileName: review.userName,
                reviewText: review.content,
                reviewScore: parseFloat(review.star.toFixed(1)),
                images: review.photos
            }))}, () => {
                console.log("현재 reviews state:", this.state.reviews);
            });

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


    async deleteReview(id) {
        try {
            const token = await getToken();  
            
            const response = await axios.delete(`http://223.130.131.166:8080/api/v1/review/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            this.getReviewList();
        } catch(error) {
            if (error.response) {
              alert(error.response.data.message);
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
    };
   
    renderReviews = () => {
        const { houseId } = this.props.route.params;

        return this.state.reviews.map((review, index) => (
            <View key={index} style={styles.reviewView}>
                <View style={styles.profileView}>
                    <Image source={profileIMG} style={styles.profileIMG} />
                    <View style={styles.profileInfoView}>
                        <Text style={styles.profileName}>{review.profileName}</Text>
                        {/* <Text style={styles.reviewText}>{review.reviewText}</Text> */}
                        <View style={styles.reviewScoreView}>
                            <Image style={styles.reviewScore} source={reviewScoreIcon}/>
                            <Text style={styles.reviewScoreText}> {review.reviewScore} </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => this.changeOptionState(review.id)}>
                        <Image source={reviewMenuIcon} style={styles.reviewMenu} />
                    </TouchableOpacity>
                </View>
                {review.optionsVisible && (
                    <View style={styles.optionsView}>
                        <TouchableOpacity style={styles.optionButton} onPress={() => this.modifyReview(review.id, houseId)}>
                            <Text style={styles.ButtonText}>수정하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionButton} onPress={()=>this.deleteReview(review.id)}>
                            <Text style={styles.ButtonText}>삭제하기</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.reviewIMGView}>
                <ScrollView horizontal style={styles.imageScrollView} showsHorizontalScrollIndicator={false}>
                    {review.images && review.images.map((image, index) => (
                        image ? <Image key={index} source={{ uri: image }} style={styles.reviewIMG} /> : null
                    ))}
                </ScrollView>
                </View>
                <View style={styles.reviewTextView}>
                    <Text style={styles.reviewText}>{review.reviewText}</Text>
                </View>
                <View style={styles.grayHorizontalLine2}/>
            </View>

        ));
    };

    render() {
        const { houseId, name } = this.props.route.params;
        return (
            <View style={styles.backgroundView}>
                <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.titleView}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => this.props.navigation.goBack()}>    
                            <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                        </TouchableOpacity>
                        <Text style={styles.reviewHouseText}> {name}님의 거주지 <Text></Text></Text>
                        {/* <Text style={styles.reviewHouseText}>{name}님의 거주지<Text style={styles.PriceSubText}> ()</Text></Text> */}
                    </View>
                    <View style={styles.grayHorizontalLine}/>

                    {this.renderReviews()}
                    <View style={styles.barMargin}><Text> </Text></View>
                </View>
                </ScrollView>

                <TouchableOpacity style={styles.fixedButton} onPress={ () => this.props.navigation.navigate('후기작성',  { houseId: houseId, name: name })}>
                    <Image style={styles.reviewAddIcon} source={reviewWriteBtn}/>
                </TouchableOpacity>
            </View>
        );
    }
}

// 스타일 시트
const styles = StyleSheet.create({
    backgroundView:{                  // 전체화면 세팅 ( 숙소등록버튼떄문에 View로 감싸줌)         
        flex: 1,
        width: '100%',
        height: '100%',
    },
    background: {                                // 전체화면 세팅                     
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
    },
    container : {                             // 컴포넌트들 가운데 정렬
        alignItems: 'center', 
        width: '100%',
        height: '100%',
    },
    titleView: {                             // 뒤로가기버튼, 예약하기 텍스트 담는 View
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
    reviewHouseText: {                      // 'ㅇㅇㅇ님의 거주지' 텍스트  
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
    grayHorizontalLine2: {                  // 회색 가로선
        width: '100%',
        height: 1,
        backgroundColor: '#BFBFBF',
        marginTop: "6.6%",
    },  
    reviewView: {                   // 후기들 담는 View
        width: '90%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '5%',
        // backgroundColor: 'gray',
    },  
    profileView: {                  // 프로필 정보 담는 View
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '98%',
        height: 70,
        // backgroundColor: 'yellow',
    },
    profileIMG: {                         // 프로필 사진
        width: 50,
        height:50,
        borderRadius: 50,
        borderColor: 'gray',
    },
    profileInfoView: {                    // 프로필 정보 (이름, 나이, 성별) 담는 View
        flexDirection: 'column',
        justifyContent: 'center',
        width: '74%',
    },
    profileName: {                        // 프로필 이름(김철수) 텍스트 
        fontSize: 18,
        marginLeft: '4.6%',
        color: 'black',
        fontFamily: 'Pretendard-Bold',
    },
    profileDetail: {                      // 프로필 세부 정보 (27세, 남성) 텍스트
        fontSize: 12,
        marginLeft: '3%',
        color: '#8D8D8D',
        marginBottom: '1.5%',
    },
    reviewScoreView: {                    // 후기 평점 및 평점 점수 텍스트 담는 View
        marginLeft: '4.6%',
        flexDirection: 'row',
        width:'40%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        // backgroundColor: 'gray',
    },
    reviewScore: {                        // 후기 평점 별 아이콘
        width: 14,
        height: 14,
        opacity: 0.5,
        // backgroundColor: 'green',
    },
    reviewScoreText: {                    // 후기 평점 텍스트
        fontSize: 16,
        // backgroundColor: 'white',
    },
    reviewMenu: {                         // 후기 수정 및 삭제 버튼 담는 목록 아이콘
        width: 28,
        height: 28,
        opacity: 0.6,
        backgroundColor: 'white',
    },
    optionsView: {                     // 목록 버튼 누르며 나오는 수정 ,삭제버튼 감싸는 View
        width: '100%',
        alignItems: 'center',
        justifyContent: "center",
        borderRadius: 20,
        borderColor: '#EDEDED', 
        flexDirection:'row',
        //   backgroundColor: 'yellow',
    },
    ButtonText: {                           // 후기 목록버튼 누르면 나오는 수정하기 삭제하기 버튼 텍스트
        fontSize: 14,
        textAlign: "center",
        textAlignVertical: 'top',
    },
    optionButton: {                         // 목록버튼 누르면 나오는 수정하기, 삭제하기 버튼
        width: '46%',
        marginBottom: "4.4%",
        marginLeft: "2%",
        marginRight: "2%",
        padding: '1.5%',
        backgroundColor:'white',
        borderWidth: 1,          
        borderColor: '#D0D0D0', 
        borderRadius: 8,
    },
    reviewIMGView: {                       // 리뷰 이미지 담는 Scroll View 대신 스타일링
        width: '98%',
    },
    reviewIMGScrollView: {                 // 후기 이미지 담는 스크롤 뷰
        flexDirection: 'row',
    },
    reviewIMG: {                           // 리뷰 이미지 
        width: 160,
        height: 160,
    },
    reviewTextView: {                      //  후기 본문 담는 View
        width: '98%',
        marginTop: '5%',
    },
    reviewText: {                          // 후기 본문 내용 텍스트
        fontSize: 16,
    },
    fixedButton: {                         // 숙소등록 버튼 고정시키는 View
        position: 'absolute',
        bottom: 50,
        width: '100%',
        justifyContent: 'center', 
        alignItems: 'center',     
        // backgroundColor: "gray"
    },
    reviewAddIcon: {                        // 호스트 숙소등록 버튼
        width: 150,
        height: 50,  
        resizeMode: 'cover',
        // backgroundColor: "green",
    },
    barMargin: {                              // 스클롤 탭바 마진
        height: 40,
    },
  });
  
  export default ReviewScreen;