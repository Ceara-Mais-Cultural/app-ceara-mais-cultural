import { api } from './api';
import * as FileSystem from 'expo-file-system';

const GetDataService = {
  getCities: async () => {
    return await api.get('/cities/');
  },
  getNeighborhoods: async (idCity: any) => {
    return await api.get(`/cities/${idCity}/neighborhoods/`);
  },
  getProjects: async (idUser?: any, idCity?: any) => {
    const isPromoter = !!idUser && !!idCity;
    if (isPromoter) {
      return await api.get(`/projects/?promoter=${idUser}&city=${idCity}`); // Todos os projetos que o **mobilizador** mobilizou (na cidade dele)
    } else if (idUser) {
      return await api.get(`/projects/?author=${idUser}`); // Todos os projetos de determinado **agente cultural**
    } else {
      return await api.get(`/projects/`); // Todos os projetos de todas as cidades **comissão**
    }
  },
  getCategories: async () => {
    return await api.get(`/categories/`);
  },
  getPromoters: async () => {
    return await api.get(`/users/?is_staff=True&is_superuser=False`);
  },
  getAgents: async () => {
    return await api.get(`/users/?is_staff=False&is_superuser=False`);
  },
  getIdeaVotes: async (ideaId: number) => {
    return await api.get(`/projects-votes/?project=${ideaId}`);
  },
  getUserName: async (userId: number) => {
    return await api.get(`/users/${userId}`);
  },
  deleteFile: async (fileName: string) => {
    const fileUri = FileSystem.documentDirectory + fileName;
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.error('Arquivo apagado com sucesso.')
      } else {
        console.error('Arquivo não encontrado.')

      }
    } catch (error) {
      console.error('Erro ao apagar arquivo.')
    }
  },
  deleteAllFiles: async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory as string);

      for (const file of files) {
        const fileUri = FileSystem.documentDirectory + file;
        await FileSystem.deleteAsync(fileUri);
      }
      console.log('Arquivos apagados com sucesso.')
    } catch (error) {
      console.error('Erro ao apagar arquivos.')
    }
  }
};

export default GetDataService;
