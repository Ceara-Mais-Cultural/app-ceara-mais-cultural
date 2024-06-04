import api from './api';

const PostDataService = {
    createIdea: async (formData: any) => {
      return await api.post('/projects/', formData);
    },

    voteIdea: async (idIdea: any, formData: any) => {
      return await api.post(`/projects/${idIdea}/vote/`, formData);
    },
}

export default PostDataService;