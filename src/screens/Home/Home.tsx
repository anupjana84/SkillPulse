import { View, Text, StyleSheet, Image } from 'react-native';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Feather } from '@react-native-vector-icons/Feather';
import { logo } from '../../utils/constants';
import ButtonView from './componts/ButtonView';

const Home = () => {
    return (
        <>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <View style={{
                        width: '10%', height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}></View>
                    <View style={{
                        width: '80%', height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        {/* ✓ CORRECT - use myImage directly, no require */}
                        <Image source={logo} style={{ width: 125, height: 125 }} />
                    </View>
                    <View style={{
                        width: '10%', height: '100%',
                        paddingTop: 25,
                        alignItems: 'center',
                    }}>
                        <FontAwesome6 name="ellipsis-vertical" color="#ffffff" size={20}
                            iconStyle="solid" style={{ marginLeft: 10 }} />
                    </View>
                </View>

                <View style={{
                    width: '100%', height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text style={styles.title}>DYNAMO CHESS </Text>
                    <Text style={styles.title}>dynamo Mind </Text>
                </View>
                <ButtonView title="Play" iconName="wifi-off" onPress={() => { /* handle play */ }} />
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    logoContainer: {
        flexDirection: 'row',
        width: "100%",
        height: 150,
        marginBottom: 20,
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Rambejajin',
    },
})
export default Home;