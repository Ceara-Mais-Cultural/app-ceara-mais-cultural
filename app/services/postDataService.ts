import api from './api';

const PostDataService = {
    createIdea: async (formData: FormData) => {
      return await api.post('/projects/', formData);
    },

    editIdea: async (formData: FormData, id: number) => {
      return await api.put(`/projects/${id}/`, formData);
    },

    voteIdea: async (idIdea: number, formData: any) => {
      return await api.post(`/projects/${idIdea}/vote/`, formData);
    },
}

export default PostDataService;