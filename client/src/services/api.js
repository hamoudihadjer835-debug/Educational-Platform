import axios from 'axios';

// Determine the API URL based on the current environment
const determineApiUrl = () => {
  // Check if we're in production mode
  if (import.meta.env.PROD) {
    return '/api'; // Use relative URL in production
  }

  // In development, try to use the proxy from vite.config.js first
  if (window.location.hostname === 'localhost') {
    return '/api'; // This will be proxied by Vite
  }

  // Fallback to explicit localhost URL if needed
  return 'http://localhost:5000/api';
};

const API_URL = determineApiUrl();
console.log('API URL:', API_URL);

// Create axios instance with more robust configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed to false to avoid CORS issues
  timeout: 15000, // Increased timeout for slower networks
  // Retry logic for failed requests
  retry: 3,
  retryDelay: 1000
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Interceptor - Token:', token ? token.substring(0, 10) + '...' : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't modify Content-Type if it's FormData (browser will set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('API Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with retry logic for failed requests
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config } = error;

    // If config is undefined or we've already retried the maximum number of times, reject
    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    // Set the retry count if it doesn't exist
    config.__retryCount = config.__retryCount || 0;

    // If we've reached the max retries, reject
    if (config.__retryCount >= config.retry) {
      console.error(`Maximum retries (${config.retry}) reached for request:`, config.url);
      return Promise.reject(error);
    }

    // Increase the retry count
    config.__retryCount += 1;
    console.log(`Retrying request (${config.__retryCount}/${config.retry}):`, config.url);

    // Create a new promise to handle the retry
    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Retry attempt ${config.__retryCount} after ${config.retryDelay}ms`);
        resolve();
      }, config.retryDelay || 1000);
    });

    // Wait for the backoff time and then retry the request
    await backoff;
    return api(config);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);

    // Check if this is a password change request
    const isPasswordChangeRequest = error.config?.url?.includes('/auth/password');

    if (error.response?.status === 401) {
      console.log('Unauthorized request detected');

      // If it's a password change request, don't redirect or clear auth data
      if (isPasswordChangeRequest) {
        console.log('Password change request - not redirecting');
        // Just return the error to be handled by the component
      } else {
        // For other 401 errors, clear auth data and redirect
        console.log('Other unauthorized request - clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    console.log('Login request:', credentials);
    return api.post('/auth/login', credentials)
      .then(response => {
        console.log('Login response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
      });
  },
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => {
    console.log('Change password API call');
    return api.put('/auth/password', passwordData)
      .then(response => {
        console.log('Change password API response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Change password API error:', error);
        console.error('Error details:', error.response?.data || error.message);

        // If it's a 401 error, it's likely an incorrect password
        if (error.response?.status === 401) {
          error.isPasswordError = true; // Add a flag to identify password errors
        }

        throw error;
      });
  },
  getSecurityQuestions: (username) => {
    console.log('Get security questions API call for username:', username);
    return api.get(`/auth/security-questions/${username}`)
      .then(response => {
        console.log('Get security questions API response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Get security questions API error:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
      });
  },
  resetPasswordWithSecurity: (userId, answer1, answer2, newPassword) => {
    console.log('Reset password with security API call');
    return api.post('/auth/reset-password-with-security', {
      userId,
      answer1,
      answer2,
      newPassword
    })
      .then(response => {
        console.log('Reset password with security API response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Reset password with security API error:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
      });
  },
  setSecurityQuestions: (question1, answer1, question2, answer2, email) => {
    console.log('Set security questions API call');
    const payload = {
      question1,
      answer1,
      question2,
      answer2
    };

    // If email is provided (for registration flow), use the registration-specific endpoint
    const endpoint = email ? '/auth/register-security-questions' : '/auth/security-questions';
    if (email) {
      payload.email = email;
    }

    return api.put(endpoint, payload)
      .then(response => {
        console.log('Set security questions API response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Set security questions API error:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
      });
  },
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getPendingApprovals: () => api.get('/admin/pending-approvals'),
  approveUser: (userId) => {
    // Clean the userId to ensure it's valid
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/admin/approve/${cleanUserId}`);
  },
  getModules: () => api.get('/admin/modules'),
  createModule: (moduleData) => api.post('/admin/modules', moduleData),
  updateModule: (moduleId, moduleData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/admin/modules/${cleanModuleId}`, moduleData);
  },
  assignTeacher: (moduleId, teacherId) => {
    // Clean the IDs to ensure they're valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanTeacherId = teacherId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/admin/modules/${cleanModuleId}/assign-teacher/${cleanTeacherId}`);
  },
  deleteUser: (userId) => {
    // Clean the userId to ensure it's valid
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    return api.delete(`/admin/users/${cleanUserId}`);
  },
  deleteModule: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.delete(`/admin/modules/${cleanModuleId}`);
  },
};

// Teacher API calls
export const teacherAPI = {
  getAssignedModules: () => api.get('/teacher/modules'),
  getModuleDetails: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/teacher/modules/${cleanModuleId}`);
  },
  addLesson: async (moduleId, lessonData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');

    // Simple JSON POST request
    return api.post(`/teacher/modules/${cleanModuleId}/lessons`, lessonData);
  },
  updateLesson: (lessonId, lessonData) => {
    // Clean the lessonId to ensure it's valid
    const cleanLessonId = lessonId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/teacher/lessons/${cleanLessonId}`, lessonData);
  },
  getLessonDetails: (lessonId) => {
    // Clean the lessonId to ensure it's valid
    const cleanLessonId = lessonId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/teacher/lessons/${cleanLessonId}`);
  },
  deleteLesson: (lessonId) => {
    // Clean the lessonId to ensure it's valid
    const cleanLessonId = lessonId.replace(/[^a-zA-Z0-9]/g, '');
    return api.delete(`/teacher/lessons/${cleanLessonId}`);
  },
  uploadChapterFile: (lessonId, chapterIndex, formData) => {
    // Clean the lessonId to ensure it's valid
    const cleanLessonId = lessonId.replace(/[^a-zA-Z0-9]/g, '');

    // Create a custom config for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    console.log('Uploading file to chapter:', {
      lessonId: cleanLessonId,
      chapterIndex,
      formDataEntries: Array.from(formData.entries()).map(([key, value]) => {
        return { key, value: value instanceof File ? `${value.name} (${value.size} bytes)` : value };
      })
    });

    return api.post(`/teacher/lessons/${cleanLessonId}/chapters/${chapterIndex}/files`, formData, config);
  },

  // Quiz related API calls
  createQuiz: (moduleId, quizData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.post(`/teacher/modules/${cleanModuleId}/quizzes`, quizData);
  },
  getModuleQuizzes: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/teacher/modules/${cleanModuleId}/quizzes`);
  },
  getQuiz: (quizId) => {
    // Clean the quizId to ensure it's valid
    const cleanQuizId = quizId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/teacher/quizzes/${cleanQuizId}`);
  },
  updateQuiz: (quizId, quizData) => {
    // Clean the quizId to ensure it's valid
    const cleanQuizId = quizId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/teacher/quizzes/${cleanQuizId}`, quizData);
  },
  deleteQuiz: (quizId) => {
    // Clean the quizId to ensure it's valid
    const cleanQuizId = quizId.replace(/[^a-zA-Z0-9]/g, '');
    return api.delete(`/teacher/quizzes/${cleanQuizId}`);
  },
  getQuizSubmissions: (quizId) => {
    // Clean the quizId to ensure it's valid
    const cleanQuizId = quizId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/teacher/quizzes/${cleanQuizId}/submissions`);
  },
  gradeSubmission: (submissionId, gradeData) => {
    // Clean the submissionId to ensure it's valid
    const cleanSubmissionId = submissionId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/teacher/submissions/${cleanSubmissionId}/grade`, gradeData);
  },
};

// Student API calls
export const studentAPI = {
  getAvailableModules: (academicYear) => api.get('/student/available-modules', {
    params: academicYear ? { academicYear } : {}
  }),
  enrollInModule: (moduleId, academicYear) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.post(`/student/enroll/${cleanModuleId}`, {}, {
      params: academicYear ? { academicYear } : {}
    });
  },
  getEnrolledModules: (academicYear) => api.get('/student/my-modules', {
    params: academicYear ? { academicYear } : {}
  }),
  getModuleLessons: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/modules/${cleanModuleId}/lessons`);
  },
  downloadLesson: (lessonId) => {
    // Clean the lessonId to ensure it's valid
    const cleanLessonId = lessonId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/lessons/${cleanLessonId}/download`, {
      responseType: 'blob',
    });
  },

  // Quiz related API calls
  getModuleQuizzes: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/modules/${cleanModuleId}/quizzes`);
  },
  getQuiz: (quizId) => {
    // Clean the quizId to ensure it's valid
    const cleanQuizId = quizId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/quizzes/${cleanQuizId}`);
  },
  getModuleById: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/modules/${cleanModuleId}`);
  },
  submitQuiz: (quizId, answers) => {
    // Clean the quizId to ensure it's valid
    const cleanQuizId = quizId.replace(/[^a-zA-Z0-9]/g, '');
    return api.post(`/student/quizzes/${cleanQuizId}/submit`, { answers });
  },
  getSubmission: (submissionId) => {
    // Clean the submissionId to ensure it's valid
    const cleanSubmissionId = submissionId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/submissions/${cleanSubmissionId}`);
  },
};

export default api;
