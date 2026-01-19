// src/store/useAuthStore.ts
import { create } from 'zustand';
import { authApi} from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;     
  error: string | null;  
  login: (e: string, p: string) => Promise<boolean | void>;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
token: null,
  user: null,
  isLoading: false,       // Initial state
  error: null,
  // LOGIN ACTION
  login: async (email: string, password:string) => {
   
    
   set({ isLoading: true, error: null }); // Start loading, clear errors
    try {
      const {data} = await authApi.login(email, password);
      console.log(data,'da')
       await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
       set({ token: data.token, user: data, isLoading: false });
      return true; 
    } catch (err: any) {
      console.log(err,'er')
      set({ error: err.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  

  
  logout:async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    set({ token: null, user: null })},
}));