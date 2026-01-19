import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { apiList } from '../utils/apiList';
import AsyncStorage from '@react-native-async-storage/async-storage';

let navigation: any = null; // Store navigation reference

// Function to set navigation (call this from App.tsx)
export const setApiClientNavigation = (nav: any) => {
  navigation = nav;
};

export const apiClient = axios.create({
  baseURL: `${apiList.baseUrl}`,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = ` ${token}`;
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Token expired
    if (error.response?.status === 401) {
      console.log('Token expired!');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Clear store
      useAuthStore.setState({ token: null, user: null });
      
      // Navigate to Login if navigation is set
      if (navigation) {
        navigation.replace('Login');
      }
    }
    
    return Promise.reject(error);
  }
);