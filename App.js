import React, {Component} from 'react';
import { Text, Image, } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './token';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 파일
import LoginScreen from './Login';
import HomeScreen from './Home';
import SearchScreen from './Search';
import FavoriteListScreen from './FavoriteList';
import MyInfoScreen from './MyInfo';
import MyInfoModifyScreen from './MyInfoModify';
import HouseInfoScreen from './HouseInfo';
import HouseInfoModifyScreen from './HouseInfoModify';
import ReservationScreen from './Reservation';
import HouseAddScreen from './HouseAdd';
import ReviewScreen from './Review';
import ReviewAddScreen from './ReviewAdd';
import ReviewModifyScreen from './ReviewModify';
import HomeSearchScreen from './HomeSearch';
import FestivalInfoScreen from './FestivalInfo';


// 이미지
import HomeIconIMG from './Image/홈_아이콘.png';
import SearchIconIMG from './Image/검색_아이콘.png';
import FavoriteListIconIMG from './Image/찜_아이콘.png';
import MyInfoIconIMG from './Image/내정보_아이콘.png';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarIcon = (focused, name)=>{
    let iconImagePath;

    if(name==='홈'){
        iconImagePath = require('./Image/홈_아이콘.png')
    } else if (name==='검색'){
        iconImagePath = require('./Image/검색_아이콘.png')
    } else if (name==='찜목록'){
        iconImagePath = require('./Image/찜_아이콘.png')
    } else if (name==='내정보'){
        iconImagePath = require('./Image/내정보_아이콘.png')
    }
    return (
        <Image 
        style={{
            opacity: focused ? 1 : 0.5,
            width: focused ? 24 : 22,
            height: focused ? 24 : 22,
        }}
        source = {iconImagePath}/>
    )
}

// const getHouseListData = async () =>{                      // axios를 활용한 api통신을 통해 서버로부터 숙소 리스트들을 불러오는 함수
//     try{
//         const token = await getToken();
        
//         const response = await axios.get('http://223.130.131.166:8080/api/v1/house/list/user',{
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         console.log(response.data);
        
//         const data = response.data.map(item => ({
//             id: item.id,
//             name: item.hostName,
//             address: item.address,
//             price: item.pricePerNight,
//             imageUrl: houseIMG1, 
//             reviewScore: item.starAvg, // 서버 데이터에 따라 수정 필요
//             reviewCount: item.reviewNum, // 서버 데이터에 따라 수정 필요
//             favoriteState: item.liked, 
//             reservationState: false, 
//             clearReservation: false 
//         }));

//         this.setState({ places: data });

//         } catch(error) {
//             if (error.response) {
//             console.log('Error status:', error.response.status);
//             console.log('Error data:', error.response.data);
//             console.log('Error headers:', error.response.headers);
//             } else if (error.request) {
//             console.log('No response received:', error.request);
//             } else {
//             console.log('Error message:', error.message);
//             }
//             console.log('Error config:', error.config);
//         }
// }

// const getFavoriteData = async() => {                          // 즐겨찾기, 나의 예약현황 데이터 axios를 활용한 api 통신을 통해 서버로 부터 불러오기
//     try {
//         const token = await getToken();

//         const response = await axios.get('http://223.130.131.166:8080/api/v1/house/list/like',{
//             headers: { 'Authorization': `Bearer ${token}`}
//         })

//         const { id, hostName, houseIntroduction, freeService, facilityPhotos, 
//             phoneNumber, pricePerNight, registrantId, address,
//             region, maxNumPeople, starAvg, reviewNum, liked } = response.data;

//             console.log(response.data)

                        
//         const houses = response.data.map(house => ({
//             houseID: house.id, 
//             name: house.hostName,
//             houseAddress: house.address,
//             reviewScore: house.starAvg,
//             reviewCount: house.reviewNum,
//             favoriteState: house.liked,
//             price: house.pricePerNight,
//             imageUrl: houseIMG1, 
//         }));

//         this.setState({ places: houses });

//     } catch(error) {
//         if (error.response) {
//           console.log('Error status:', error.response.status);
//           console.log('Error data:', error.response.data);
//           console.log('Error headers:', error.response.headers);
//         } else if (error.request) {
//           console.log('No response received:', error.request);
//         } else {
//           console.log('Error message:', error.message);
//         }
//         console.log('Error config:', error.config);
//       }
// }

MainScreen = () => {                                        // 메인 Tab 화면 stack 네비로 묶는 함수
    return (
            <Tab.Navigator 
            initialRouteName='Home'
            screenOptions={({ route }) => ({
                tabBarLabel: ({ focused }) => (
                    <Text style={{
                        color: focused ? 'black' : 'gray',
                        marginBottom: '5%' }}>
                        {route.name}
                    </Text>
                ),
                tabBarIcon: ({ focused }) => (
                    TabBarIcon(focused, route.name)
                ),
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    zIndex: 1000,
                    height: 60,
                },
                headerShown: false
            })}
            >
                <Tab.Screen name="홈" component={HomeScreen} />
                <Tab.Screen name="검색" component={SearchScreen} />
                <Tab.Screen name="찜목록" component={FavoriteListScreen} />
                <Tab.Screen name="내정보" component={MyInfoScreen} />
            </Tab.Navigator>
    )
}
// listeners={{focus: () => {getHouseListData()}}}

class App extends Component {
    render() {
        return(
            <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName='로그인'  screenOptions={{headerShown: false}}>
                    <Stack.Screen name="메인" component={MainScreen}/>
                    <Stack.Screen name="로그인" component={LoginScreen}/>
                    <Stack.Screen name="홈검색" component={HomeSearchScreen} />
                    <Stack.Screen name="예약" component={ReservationScreen} />
                    <Stack.Screen name="후기" component={ReviewScreen} />
                    <Stack.Screen name="후기작성" component={ReviewAddScreen} />
                    <Stack.Screen name="후기수정" component={ReviewModifyScreen} />
                    <Stack.Screen name="내정보수정" component={MyInfoModifyScreen} />
                    <Stack.Screen name="숙소정보" component={HouseInfoScreen} />
                    <Stack.Screen name="숙소등록" component={HouseAddScreen} />
                    <Stack.Screen name="숙소정보수정" component={HouseInfoModifyScreen} />
                    <Stack.Screen name="축제정보" component={FestivalInfoScreen} />
                </Stack.Navigator>
            </NavigationContainer>
            </SafeAreaProvider>
    )
  }
};

export default App;
