import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthLayout = () => {
    const segments = useSegments();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged returns an unsubscriber
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Unsubscribe to the listener when component unmounts
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (user && inAuthGroup) {
            // Check user type and redirect accordingly
            const checkUserType = async () => {
                const userType = await AsyncStorage.getItem('userType');
                if (userType === 'teacher') {
                    router.replace('/(teacher)/dashboard');
                } else {
                    router.replace('/(tabs)/map');
                }
            };
            checkUserType();
        } else if (!user && !inAuthGroup) {
            // If the user is not signed in and not in the auth group, redirect to the login screen
            router.replace('/(auth)/login');
        }

    }, [user, segments, loading, router]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2E8B57" />
            </View>
        );
    }

    return (
        <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default AuthLayout;