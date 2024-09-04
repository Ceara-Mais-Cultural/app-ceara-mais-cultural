import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

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
    if (user?.is_superuser) {
      return 'Comissão';
    } else if (user?.is_staff) {
      return 'Mobilizador';
    } else {
      return 'Agente Cultural';
    }
  },

  getUserId: async () => {
    const userData = await AsyncStorage.getItem('userData');
    const user = JSON.parse(userData as any);

    return user?.id;
  },

  getAuthToken: async () => {
    const token = await AsyncStorage.getItem('authToken');
    return token;
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
    try {
      return await AsyncStorage.getItem('userData');
    } catch (e) {
      console.error('Erro ao recuperar dados do usuário')
    }
  },

  validateCpf: (cpf: any) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
      return false;
    }

    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let primeiroDigito = resto < 2 ? 0 : 11 - resto;

    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let segundoDigito = resto < 2 ? 0 : 11 - resto;

    // Verifica se os dígitos calculados correspondem aos dígitos informados
    return cpf.charAt(9) == primeiroDigito && cpf.charAt(10) == segundoDigito;
  },
};

export default AuthService;
