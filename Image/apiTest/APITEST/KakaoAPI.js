import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import {
  login,
  logout,
  getProfile as getKakaoProfile,
} from "@react-native-seoul/kakao-login";

const KakaoAPIScreen = () => {
  const [result, setResult] = useState("");

  const signInWithKakao = async () => {
    try {
      const token = await login();
      setResult(JSON.stringify(token));
    } catch (err) {
      console.error("login err", err);
    }
  };

  const signOutWithKakao = async () => {
    try {
      const message = await logout();
      setResult(message);
    } catch (err) {
      console.error("signOut error", err);
    }
  };

  const getProfile = async () => {
    try {
      const profile = await getKakaoProfile();
      setResult(JSON.stringify(profile));
    } catch (err) {
      console.error("signOut error", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <ScrollView>
          <Text>{result}</Text>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
      <Pressable
        style={styles.button}
        onPress={() => {
          signInWithKakao();
        }}
      >
        <Text style={styles.text}>카카오 로그인</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => getProfile()}>
        <Text style={styles.text}>프로필 조회</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => signOutWithKakao()}>
        <Text style={styles.text}>카카오 로그아웃</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
  },
  resultContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 24,
  },
  button: {
    backgroundColor: "#FEE500",
    borderRadius: 40,
    borderWidth: 1,
    width: 250,
    height: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  text: {
    textAlign: "center",
},
});

export default KakaoAPIScreen;