import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
// import { Feather } from '@react-native-vector-icons/Feather';

interface ButtonViewProps {
    title: string;
    iconName: string;
    onPress: () => void;
}

const ButtonView: React.FC<ButtonViewProps> = ({ title, iconName, onPress }) => {
    return (
        <>
            <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity style={styles.button} onPress={onPress}>
                    {/* <Feather name={iconName as any} color="#ffffff" size={20} /> */}
                    <Text style={styles.buttonText}>{title}</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: '90%',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        marginLeft: 10,
    },
});
export default ButtonView;  