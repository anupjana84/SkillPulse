import { apiClient } from './client';

export const productApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/products');
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },
};