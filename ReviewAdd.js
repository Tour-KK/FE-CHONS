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


class ReviewAddScreen extends Component {
    state = {
        rating: 3, 
        reviewIMG: houseAddIMG,
    };

    ratingCompleted = (rating) => {
        const roundedRating = parseFloat(rating.toFixed(1));
        this.setState({ rating: roundedRating });
      };

    changeInputText = (inputText) => {
        this.setState({ reviewText: inputText });
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
                    <Text style={styles.reviewWriteText}> 후기 작성하기 </Text>
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
                        <Text style={styles.addIMGText} >사진 추가</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.reviewIMGView}>
                    <ScrollView styels={styles.reviewIMGScrollView}showsHorizontalScrollIndicator={false} horizontal={true}>
                            <Image style={styles.reviewIMG} source={this.state.reviewIMG}/>
                    </ScrollView>
                </View>

                <View style={styles.reviewTextInputView} >
                    <TextInput style={styles.reviewTextInput} placeholder='내용을 입력해주세요..' multiline={true} onChangeText={this.onChangeInput}/>
                </View>
                
                <View style={styles.reservationBtnView}>
                <TouchableOpacity style={styles.reservationBtn} onPress={() => this.props.navigation.goBack()}>
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