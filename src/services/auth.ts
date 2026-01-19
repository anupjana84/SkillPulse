import { apiList } from '../utils/apiList';
import { apiClient } from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    console.log(apiList.auth.login)
    const { data } = await apiClient.post(`${apiList.auth.login}`, { email, password });
    return data;
  },
  
  register: async (userData: any) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },
};