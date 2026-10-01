import axios from 'axios';

// Use relative URL in production, localhost in development
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
console.log('API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Log the API configuration
console.log('API Configuration:', {
  baseURL: API_URL,
  withCredentials: true
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
  updateProfile: (userData) => {
    console.log('Updating profile with data:', userData);
    return api.put('/auth/profile', userData)
      .then(response => {
        console.log('Profile update response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Profile update error:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
      });
  },
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
  getAssignedModules: () => {
    console.log('Fetching assigned modules');
    return api.get('/teacher/modules');
  },
  getModuleDetails: (moduleId) => {
    // Validate the moduleId
    if (!moduleId) {
      console.error('Invalid module ID: null or undefined');
      return Promise.reject(new Error('Invalid module ID: null or undefined'));
    }

    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');

    // Check if the cleaned ID is valid (24 characters for MongoDB ObjectId)
    if (cleanModuleId.length !== 24) {
      console.error(`Invalid module ID length: ${cleanModuleId.length}, expected 24`);
      return Promise.reject(new Error(`Invalid module ID format: ${moduleId}`));
    }

    console.log('Making API request for module details with ID:', cleanModuleId);
    return api.get(`/teacher/modules/${cleanModuleId}`);
  },
  addChapter: (moduleId, chapterData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.post(`/teacher/modules/${cleanModuleId}/chapters`, chapterData);
  },
  updateModuleChapters: (moduleId, chaptersData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/teacher/modules/${cleanModuleId}/chapters`, chaptersData);
  },
  deleteChapter: (moduleId, chapterIndex) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.delete(`/teacher/modules/${cleanModuleId}/chapters/${chapterIndex}`);
  },
  uploadChapterFile: (moduleId, chapterIndex, formData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');

    // Create a custom config for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    console.log('Uploading file to chapter:', {
      moduleId: cleanModuleId,
      chapterIndex,
      formDataEntries: Array.from(formData.entries()).map(([key, value]) => {
        return { key, value: value instanceof File ? `${value.name} (${value.size} bytes)` : value };
      })
    });

    return api.post(`/teacher/modules/${cleanModuleId}/chapters/${chapterIndex}/files`, formData, config);
  },
  updateSyllabus: (moduleId, syllabusData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/teacher/modules/${cleanModuleId}/syllabus`, syllabusData);
  },
  uploadSyllabusFile: (moduleId, formData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');

    // Create a custom config for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    return api.post(`/teacher/modules/${cleanModuleId}/syllabus/files`, formData, config);
  },
  addReference: (moduleId, referenceData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.post(`/teacher/modules/${cleanModuleId}/references`, referenceData);
  },
  updateReference: (moduleId, referenceIndex, referenceData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.put(`/teacher/modules/${cleanModuleId}/references/${referenceIndex}`, referenceData);
  },
  deleteReference: (moduleId, referenceIndex) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.delete(`/teacher/modules/${cleanModuleId}/references/${referenceIndex}`);
  },
  uploadReferenceFile: (moduleId, referenceIndex, formData) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');

    // Create a custom config for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    return api.post(`/teacher/modules/${cleanModuleId}/references/${referenceIndex}/files`, formData, config);
  },

  discardTemporaryFiles: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.post(`/teacher/modules/${cleanModuleId}/discard-temp-files`);
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
  getModuleDetails: (moduleId) => {
    // Validate the moduleId
    if (!moduleId) {
      console.error('Invalid module ID: null or undefined');
      return Promise.reject(new Error('Invalid module ID: null or undefined'));
    }

    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');

    // Check if the cleaned ID is valid (24 characters for MongoDB ObjectId)
    if (cleanModuleId.length !== 24) {
      console.error(`Invalid module ID length: ${cleanModuleId.length}, expected 24`);
      return Promise.reject(new Error(`Invalid module ID format: ${moduleId}`));
    }

    console.log('Making API request for student module details with ID:', cleanModuleId);
    return api.get(`/student/modules/${cleanModuleId}`);
  },
  downloadFile: (moduleId, fileType, fileId) => {
    // Clean the IDs to ensure they're valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanFileId = fileId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/files/${cleanModuleId}/${fileType}/${cleanFileId}`, {
      responseType: 'blob',
    });
  },

  // Quiz related API calls
  getModuleQuizzes: (moduleId) => {
    // Clean the moduleId to ensure it's valid
    const cleanModuleId = moduleId.replace(/[^a-zA-Z0-9]/g, '');
    return api.get(`/student/modules/${cleanModuleId}/quizzes`);
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
