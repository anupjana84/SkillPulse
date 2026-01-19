
// 1. API Functions (services/api.ts)

import { apiClient } from './client';

// Define your API endpoints
const userApi = {
  getUpcomingTournament: async () => {
    const { data } = await apiClient.get('/api/getUpcomingTournament');
    console.log(data)
    return data;
  },
  getTournaments: async () => {
    const { data } = await apiClient.get('/api/getAllTournament?page=1&limit=10');
    // ?page=$currentPage&limit=$tournamentsPerPage'
    return data;
  },
  joinTournament: async (tournamentId: string) => {
    console.log(tournamentId)
    const { data } = await apiClient.post(`api/joinTournament/${tournamentId}`);
    return data;
  },

  getMyTournamentById: async (id: string) => {
    const { data } = await apiClient.get(`/api/getMyTournamentById/${id}`);
    return data;
  },                
  getPairList: async (id: string) => {
    const { data } = await apiClient.get(`/api/getPairedList/${id}`);
    return data;
  },                
  
};

const postApi = {
  getPosts: async () => {
    const { data } = await apiClient.get('/posts');
    return data;
  },
  
  getPost: async (id: string) => {
    const { data } = await apiClient.get(`/posts/${id}`);
    return data;
  },
  
  createPost: async (postData: any) => {
    const { data } = await apiClient.post('/posts', postData);
    return data;
  },
  
  deletePost: async (id: string) => {
    const { data } = await apiClient.delete(`/posts/${id}`);
    return data;
  },
};

export { userApi, postApi };



