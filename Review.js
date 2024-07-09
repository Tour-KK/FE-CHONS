import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// 이미지
import backBtnIMG from './Image/뒤로가기_아이콘.png';
import profileIMG from './Image/프로필_아이콘.png';
import reviewScoreIcon from './Image/별_아이콘.png';
import reviewMenuIcon from './Image/목록_아이콘.png';
import houseIMG1 from './Image/여행지1.png';
import houseIMG2 from './Image/여행지2.png';
import houseIMG3 from './Image/여행지3.png';
import houseIMG4 from './Image/여행지4.png';
import houseIMG5 from './Image/여행지5.png';
import houseIMG6 from './Image/여행지6.png';
import houseIMG7 from './Image/여행지7.png';
import houseIMG8 from './Image/여행지8.png';
import houseIMG9 from './Image/여행지9.png';

class ReviewScreen extends Component {
    state = {
              places: [                                   // 목록에 띄울 데이터들 관
            { id: 1, name: "김갑순님의 거주지", address:'강원도 속초시 신림면', streetAddress: '강원도 속초시 중도문길 95', reviewScore: "4.2", reviewCount: 48, imageUrl: require('./Image/여행지1.png'), favoriteState: true, price: 43000, reservaionState: false, clearReservation: false, phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "#와이파이 #침대, 욕실, 음료, 세면도구, 드라이기 # 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 2, name: "김경민님의 거주지", address:'강원도 원주시 신림면', streetAddress: '강원도 원주시 신림면 치악로 28',reviewScore: "3.8", reviewCount: 23, imageUrl: require('./Image/여행지2.png'), favoriteState: true, price: 38000, reservaionState: false,  clearReservation: false, phoneNumber: '010-6543-4567', clearReservation: false, maximumGuestNumber: 3, freeService:  "##음료 #세면도구, 드라이기 #냉장고", introText: "강원도에서 나고 자라서 서울에서 직장생활하고 다시 귀농하러 온지 2년째입니다. 귀농 생활 미리 체험해보고 싶은분들 많이 놀러와주세요!"},
            { id: 3, name: "강진석님의 거주지", address:'강원도 철원군 동송읍', streetAddress: '강원도 철원군 동송읍 양지길 45',reviewScore: "4.0", reviewCount: 31, imageUrl: require('./Image/여행지3.png'), favoriteState: false, price: 88000, reservaionState: false,  clearReservation: false, phoneNumber: '010-4321-5678', clearReservation: false, maximumGuestNumber: 2,  freeService:  ",,#와이파이, #음료, 세면도구, 드라이기# 냉장고", introText: "3회 숙식제공은 힘들어서 아침만 식사제공해드리고 점심,저녁은 주변 맛집 추천해드립니다. "},
            { id: 4, name: "오진태님의 거주지", address:'강원도 강릉시 옥계면', streetAddress: '강원도 강릉시 입암로 16-21 ', reviewScore: "4.4", reviewCount: 18, imageUrl: require('./Image/여행지4.png'), favoriteState: true, price: 26000, reservaionState: false,  clearReservation: false, phoneNumber: '010-5678-9876', clearReservation: false, maximumGuestNumber: 4,  freeService:  ",,##와이파이, 세면도구, 드라이기, 냉장고", introText: "겉은 허름해보여도 내부는 깔끔하고 근방에서 가장 관리 잘 된 집입니다."},
            { id: 5, name: "박경숙님의 거주지", address: '경상남도 부산광역시 김해시 진영읍', streetAddress: '강원도 속초시 중도문길 95', reviewScore: "4.2", reviewCount: 66, imageUrl: require('./Image/여행지5.png'), favoriteState: false, price: 40000, reservaionState: true,  clearReservation: true,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 7, name: "이창민님의 거주지", address:'경상남도 부산광역시 금정구 구서2동',streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지6.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 9, name: "오경숙님의 거주지", address:'경상북도 울산광역시 울주군 둔기리', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지8.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 8, name: "양민우님의 거주지", address:'전라남도 전주시 덕진구', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지7.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 10, name: "이정민님의 거주지", address:'경기도 화성시 남양읍', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지9.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 11, name: "박범석님의 거주지", address:'제주도 서귀포시 남원읍', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지10.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 12, name: "황진영님의 거주지", address:'전라남도 광주광역시 북구 오치1동', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지11.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 13, name: "박우석님의 거주지", address:'전라남도 나주시 영강동', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지12.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false ,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 14, name: "이현숙님의 거주지", address:'충천남도 공주시 우성면', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지13.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 15, name: "황지석님의 거주지", address:'충천남도 아산시 신창면 남성리', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지14.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
            { id: 16, name: "이미연님의 거주지", address:'충천남도 당진시 순성면', streetAddress: '강원도 속초시 중도문길 95',reviewScore: "4.6", reviewCount: 20, imageUrl: require('./Image/여행지15.png'), favoriteState: false, price: 54000, reservaionState: false,  clearReservation: false,phoneNumber: '010-1122-3344', clearReservation: false , maximumGuestNumber: 2, freeService: "와이파이, 침대, 욕실, 음료, 세면도구, 드라이기, 냉장고", introText: "강원도 60년 토박이 생활로 어지간한 맛집, 관광지, 자연경관들은 꿰고 있고, 식사는 강원도 현지 음식으로 삼시세끼 대접해드립니다. 자세한 내용은 아래 연락처로 문의 부탁드려요."},
        ],
        reviews: [
            {
                id: 1,
                profileName: '황철수',
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

    changeOptionState = (id) => {
        this.setState(prevState => ({
            reviews: prevState.reviews.map(review =>
                review.id === id ? { ...review, optionsVisible: !review.optionsVisible } : review
            )
        }));
    };

    reviewModifyDelivery = (reviewId) => {             // 후기수정버튼시 후기수정화면으로 이동
        this.props.navigation.navigate('후기수정', { reviewId });
    }
   
    renderReviews = () => {
        return this.state.reviews.map((review, index) => (
            <View key={index} style={styles.reviewView}>
                <View style={styles.profileView}>
                    <Image source={profileIMG} style={styles.profileIMG} />
                    <View style={styles.profileInfoView}>
                        <Text style={styles.profileName}>{review.profileName}</Text>
                        {/* <Text style={styles.reviewText}>{review.reviewText}</Text> */}
                    </View>
                    <View style={styles.reviewScoreView}>
                        <Image style={styles.reviewScore} source={reviewScoreIcon}/>
                        <Text style={styles.reviewScoreText}> {review.reviewScore} </Text>
                    </View>
                    <TouchableOpacity onPress={() => this.changeOptionState(review.id)}>
                        <Image source={reviewMenuIcon} style={styles.reviewMenu} />
                    </TouchableOpacity>
                </View>
                {review.optionsVisible && (
                    <View style={styles.optionsView}>
                        <TouchableOpacity style={styles.optionButton} onPress={() => this.reviewModifyDelivery(review.id)}>
                            <Text style={styles.ButtonText}>수정하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionButton} onPress={()=>alert('권한이 없습니다.')}>
                            <Text style={styles.ButtonText}>삭제하기</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.reviewIMGView}>
                <ScrollView horizontal style={styles.imageScrollView} showsHorizontalScrollIndicator={false}>
                    {review.images.map((image, index) => (
                        <Image key={index} source={image} style={styles.reviewIMG} />
                    ))}
                </ScrollView>
                </View>
                <View style={styles.reviewTextView}>
                <Text style={styles.reviewText}>{review.reviewText}</Text>
                </View>
            </View>

        ));
    };

    render() {

          const { name } = this.props.route.params;

        return (
            <LinearGradient
            colors={['#E8ECFF', '#FFFFFF']} 
            style={styles.linearGradient} 
            start={{ x: 0, y: 1 }} 
            end={{ x: 0, y: 0}} >
                <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.titleView}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Image style={styles.backBtnIcon} source={backBtnIMG} />  
                        </TouchableOpacity>
                        <Text style={styles.reservationText}> {name} </Text>
                        <TouchableOpacity onPress={ () => this.props.navigation.navigate('후기작성')}>
                            <Text style={styles.reviewWriteText}> 후기작성 </Text>
                        </TouchableOpacity>
                    </View>
                    {this.renderReviews()}
                    <View style={styles.barMargin}><Text> </Text></View>
                </View>
                </ScrollView>


            </LinearGradient>
        );
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
          alignItems: 'flex-end', 
          justifyContent: 'flex-start',
          marginLeft: '4.4%',
          width: '100%',
          height: 50,
          // backgroundColor: 'yellow',
          
      },  
      backBtnIcon: {                  // 뒤로가기 버튼
          resizeMode: 'contain',
          opacity: 0.38,
          width: 26,
          height: 26,
          // marginRight:'2%',
          // backgroundColor: 'green',
          
      },
      reservationText: {              // 후기 제목 텍스트  (박양순님의 거주지)
          fontSize: 24,
          width: '66%',
        //   backgroundColor: 'white',
      },  
      reviewWriteText: {              // 후기 작성하기 버튼 텍스트
          fontSize:20,
      },
      reviewView: {                   // 후기들 담는 View
          width: '90%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        //   backgroundColor: 'gray',
          marginTop: '5%',
      },  
      profileView: {                  // 프로필 정보 담는 View
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '98%',
          height: 70,
        //   backgroundColor: 'yellow',
      },
      profileIMG: {                         // 프로필 사진
          width: 50,
          height:50,
          borderWidth: 1,
          borderRadius: 50,
          borderColor: 'gray',
      },
      profileInfoView: {                    // 프로필 정보 (이름, 나이, 성별) 담는 View
          flexDirection: 'column',
          justifyContent: 'center',
          width: '62%',
      },
      profileName: {                        // 프로필 이름(김철수) 텍스트 
          fontSize: 20,
          marginLeft: '3.3%',
          marginBottom: '2.2%',
          color: '#8D8D8D',
      },
      profileDetail: {                      // 프로필 세부 정보 (27세, 남성) 텍스트
          fontSize: 12,
          marginLeft: '3%',
          color: '#8D8D8D',
          marginBottom: '1.5%',
      },
      reviewScoreView: {                    // 후기 평점 및 평점 점수 텍스트 담는 View
          flexDirection: 'row',
          width:'16%',
          justifyContent: 'center',
          alignItems: 'center',
      },
      reviewScore: {                        // 후기 평점 별 아이콘
          width: 20,
          height: 20,
          opacity: 0.5,
      },
      reviewScoreText: {                    // 후기 평점 텍스트
          fontSize: 18,
      },
      reviewMenu: {                         // 후기 수정 및 삭제 버튼 담는 목록 아이콘
          width: 28,
          height: 28,
          opacity: 0.6,
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

      barMargin: {                    // 스클롤 탭바 마진
        height: 40,
    },


  
  });
  
  export default ReviewScreen;