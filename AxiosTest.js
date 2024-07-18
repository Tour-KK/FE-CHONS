import React, {Component, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import axios from "axios";
import { getToken } from './token'

class AxiosTest extends Component {


async postData (){
    try{
        const token = await getToken();
        axios({ 
            method: "POST",
            url: "http://223.130.131.166:8080/api/v1/house",
            data: {
                id: "아이디 보내지나?",
                pw: "비밀번호는?",
            },
            headers:{
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${token}`,
            },
        }).then(response => {
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
        })
    }catch(error){
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

    return (
            <View style={styles.container}>
                <Text style={styles.Text}> Axios 기본문법 예제</Text>
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
    Text: {        
        flex: 0,
        fontSize: 30,
        // backgroundColor: 'gray',
    },  
});

export default AxiosTest;