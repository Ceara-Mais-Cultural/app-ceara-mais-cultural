import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';


const AuthService = {
  login: async (formData: any) => {
    return await api.post('/login/', formData);
  },

  signUp: async (formData: any) => {
    return await api.post('/users/', formData);
  },

  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },

  getPermissionLevel: (user: any) => {
    if (user.is_superuser) {
      return 'Comissão';
    } else if (user.is_staff) {
      return 'Mobilizador';
    } else {
      return 'Agente Cultural';
    }
  },

  getUserId: async () => {
    const userData = await AsyncStorage.getItem('userData');
    const user = JSON.parse(userData as any);

    return user.id;
  },

  getAuthStatus: async () => {
    const token = await AsyncStorage.getItem('authToken');
    const permissionLevel = await AsyncStorage.getItem('permissionLevel');
    return {
      isLoggedIn: !!token,
      permissionLevel: permissionLevel,
    };
  },

  getUserData: async () => {
    return await AsyncStorage.getItem('userData');
  },
};

export default AuthService;
