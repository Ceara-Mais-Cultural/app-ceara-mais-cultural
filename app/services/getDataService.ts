import { api } from './api';

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
};

export default GetDataService;
