import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const apiService = {
    // ... existing methods ...

    // Success Stories
    getSuccessStories: async () => {
        try {
            const response = await api.get('/success-stories');
            return response.data;
        } catch (error) {
            console.error('Error fetching success stories:', error);
            throw error;
        }
    },

    submitSuccessStory: async (storyData) => {
        try {
            const response = await api.post('/success-stories', storyData);
            return response.data;
        } catch (error) {
            console.error('Error submitting success story:', error);
            throw error;
        }
    }
};

export default apiService;
