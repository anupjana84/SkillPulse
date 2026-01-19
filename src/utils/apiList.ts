

export const apiList = {
  baseUrl:"https://advancedchess.in",
  auth: {
    login: '/api/login',
    register: '/api/register',
  },
  products: {
    getAll: '/products',
    getById: (id: string) => `/products/${id}`,
  },
};