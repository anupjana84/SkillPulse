import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import ChessBoard from './ChessBoard';

const OfflineChessScreen = () => {
    const [gameStatus, setGameStatus] = useState("White's turn");

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => { /* handle back */ }}>
                    <Text style={styles.backButton}>←</Text>
                </Pressable>
                <Text style={styles.title}>DYNAMO CHESS</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.statusText}>{gameStatus}</Text>
                    <Pressable onPress={() => { /* handle refresh */ }}>
                        <Text style={styles.refreshButton}>🔄</Text>
                    </Pressable>
                </View>
            </View>

            <ChessBoard onStatusChange={setGameStatus} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#000',
    },
    backButton: {
        color: '#FFF',
        fontSize: 24,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        color: '#FFF',
    },
    refreshButton: {
        color: '#FFF',
        fontSize: 20,
    },
});

export default OfflineChessScreen;