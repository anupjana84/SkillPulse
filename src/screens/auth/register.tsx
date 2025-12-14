import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
// import {logoImage} from '../../images/image';


const LoginScreen = () => {
  // console.log(logoImage)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    // Handle login logic here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  const handleForgotPassword = () => {
    // Handle forgot password
    console.log('Forgot password pressed');
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    console.log('Google login pressed');
  };

  const handleAppleLogin = () => {
    // Handle Apple login
    console.log('Apple login pressed');
  };

  const handleSignUp = () => {
    // Handle sign up navigation
    console.log('Sign up pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../images/pp.png")}
            style={[styles.logo, { width: 100, height: 100 }]}
          />
        </View>
        {/* <Text style={styles.title}>Welcome Back</Text> */}



      </View>
      <View style={styles.header}>
        <Image
          source={require("../../images/header.png")}
          style={{ width: "80%", height: 50, resizeMode: 'cover' }}
        />
      </View>
      {/* Form */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          {/* <Image
            source={require('./assets/email-icon.png')} 
            style={styles.icon}
          /> */}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          {/* <Image
            source={require('./assets/password-icon.png')} // Replace with actual icon path
            style={styles.icon}
          /> */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            {/* <Image
              source={
                showPassword
                  ? require('./assets/eye-open.png') // Replace with actual icon path
                  : require('./assets/eye-closed.png') // Replace with actual icon path
              }
              style={styles.eyeIconImage}
            /> */}
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>

          <FontAwesome6 name="arrow-right-long" color="#ffff00" size={20}
            iconStyle="solid" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        {/* Or continue with */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            {/* <Image
              source={require('./assets/google-logo.png')} // Replace with actual logo path
              style={styles.socialIcon}
            /> */}
            {/* <FontAwesome5 name="home" iconType="solid" /> */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
            {/* <Image
              source={require('./assets/apple-logo.png')} // Replace with actual logo path
              style={styles.socialIcon}
            /> */}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C14', // Dark background color
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  logoContainer: {
    marginBottom: 5,
    alignItems: 'center',
    borderRadius: 75,
    padding: 10,
    backgroundColor: '',
    width: 150,
    height: 150,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'cover',


  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2730',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#4D4D4D',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  eyeIconImage: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#6B8EFF',
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#5E5AFF',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#4D4D4D',
  },
  orText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginHorizontal: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 30,
    height: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signUpText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  signUpLink: {
    color: '#6B8EFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;