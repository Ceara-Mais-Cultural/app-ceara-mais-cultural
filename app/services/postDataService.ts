import api from './api';

const PostDataService = {
    createIdea: async (formData: any) => {
      return await api.post('/projects/', formData);
    },
}

export default PostDataService;