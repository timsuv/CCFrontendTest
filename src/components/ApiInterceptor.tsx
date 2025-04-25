import { api } from './AuthContext';
import { NavigateFunction } from 'react-router-dom';

// Setup axios interceptors for handling 401 Unauthorized errors
export const setupInterceptors = (navigate: NavigateFunction): void => {
  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      // Return successful responses as-is
      return response;
    },
    async (error) => {
      if (!error.response) {
        return Promise.reject(error);
      }
      
      const originalRequest = error.config;
      
      // If the error is 401 Unauthorized and we haven't tried to refresh yet
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Call your refresh token endpoint
          const userId = localStorage.getItem('userId');
          
          if (userId) {
            // Try to refresh the token
            await api.post('/refresh-token', { 
              userId: parseInt(userId), 
              refreshToken: localStorage.getItem('refreshToken')
            });
            
            // If token refresh was successful, retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refreshing token fails, redirect to login
          navigate('/login');
          return Promise.reject(refreshError);
        }
      }
      
      // If error is 403 Forbidden, user doesn't have permission
      if (error.response.status === 403) {
        navigate('/access-denied');
      }
      
      return Promise.reject(error);
    }
  );
};