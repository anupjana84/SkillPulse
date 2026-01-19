import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Dimensions,
    ImageBackground,
    Pressable,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const { height: screenHeight } = Dimensions.get('window');

const HomeScreen1 = ({ navigation }: { navigation: any }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Placeholder functions - implement your navigation logic
    const handlePlayOnline = () => {
        console.log('Play Online clicked');
    };

    const handlePlayOffline = () => {
        console.log('Play Offline clicked');
    };

    const handlePuzzles = () => {
        console.log('Puzzles clicked');
    };

    const handleRules = () => {
        console.log('Rules clicked');
    };

    const handleLogin = () => {
        console.log('Login clicked');
        setShowMenu(false);
    };

    const handleRegister = () => {
        console.log('Register clicked');
        setShowMenu(false);
    };

    const handleLogout = () => {
        console.log('Logout clicked');
        setIsLoggedIn(false);
        setShowMenu(false);
    };

    const renderButton = (text: string, iconName: string, onPress: () => void, align: string = 'left') => {
        return (
            <View style={[styles.buttonWrapper, align === 'right' && styles.buttonRight]}>
                <View style={styles.buttonShadow}>
                    <TouchableOpacity style={styles.button} onPress={onPress}>
                        {/* <Icon name={iconName} size={24} color="#fff" style={styles.buttonIcon} /> */}
                        <Text style={styles.buttonText}>{text}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} >

            <View style={styles.shadowLayer1} />
            <Pressable style={styles.button1} onPress={() => {
                navigation.navigate('TournamentList');
            }}>
                {/* <Icon name="play-arrow" size={24} color="#fff" /> */}
                <Text style={styles.buttonText1}>Get Started</Text>
            </Pressable>


        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container1: {
        position: 'relative',
        width: 200, // Adjust based on your layout
        height: 60,
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        paddingHorizontal: 8,
    },
    logoSection: {
        width: '100%',
        height: screenHeight * 0.15,
        marginTop: screenHeight * 0.03,
        position: 'relative',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    menuButton: {
        position: 'absolute',
        top: 10,
        right: 0,
        padding: 8,
    },
    popupMenu: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    titleSection: {
        alignItems: 'center',
        marginTop: 10,
    },
    mainTitle: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 35,
        color: '#fff',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    spacer: {
        flex: 1,
    },
    buttonsContainer: {
        width: '100%',
        marginBottom: 50,
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 0,
    },
    buttonRight: {
        alignItems: 'flex-end',
        paddingRight: 30,
    },
    buttonShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 5,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 1,

        elevation: 6,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        minWidth: 180,
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 20,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '500',
    },
    buttonSpacing: {
        height: 10,
    },
    footer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
    },
    button1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50', // The green from your image
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(26, 6, 6, 0.2)',
        position: 'relative',
        top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        zIndex: 2,
        width: 200,
        height: 60,
        marginLeft: 20,
    },
    shadowLayer1: {
        backgroundColor: '#f6eeee', // The light gray shadow color
        borderRadius: 14,
        position: 'absolute',
        top: 2,   // Offset to create the 3D look
        left: 0,
        right: 0,
        // bottom: 0,
        zIndex: 1,
        width: 205,
        height: 63,
        marginLeft: 20,
    },
    buttonText1: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default HomeScreen1;