// ========================================
// STEP 1: Create Splash Screen
// ========================================
// src/screens/SplashScreen.tsx

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

const SplashScreen = ({ navigation }: any) => {

    useEffect(() => {

        checkLogin();         // Simulate a 2-second loading time

    }, []);

    const checkLogin = async () => {
        try {

            await new Promise(resolve => setTimeout(() => resolve(undefined), 2000));

            // Check if token exists in AsyncStorage
            const token = await AsyncStorage.getItem('token');
            const user = await AsyncStorage.getItem('user');

            if (token && user) {
                // User is logged in
                // Restore data to store
                useAuthStore.setState({
                    token: token,
                    user: JSON.parse(user)
                });

                // Go to Home screen
                navigation.replace('Home1');
            } else {
                // User is not logged in
                // Go to Login screen
                navigation.replace('Login');
            }
        } catch (error) {
            console.log('Error checking login:', error);
            // If error, go to Login
            navigation.replace('Login');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My App</Text>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.text}>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
});

export default SplashScreen;
