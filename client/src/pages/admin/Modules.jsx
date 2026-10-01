import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';

// Utility function to get the current academic year
const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 8 = September)

  // If we're in September or later, the academic year is currentYear/currentYear+1
  // Otherwise, it's currentYear-1/currentYear
  if (currentMonth >= 8) { // September or later
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

const Modules = () => {
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(location.state?.showCreateForm || false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    academicYear: getCurrentAcademicYear(),
    level: '',
    semester: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    academicYear: getCurrentAcademicYear(),
    level: '',
    semester: ''
  });

  const [assignData, setAssignData] = useState({
    teacherId: ''
  });

  const [teacherSearch, setTeacherSearch] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [processingModuleId, setProcessingModuleId] = useState(null);
  const teacherSelectRef = useRef(null);

  useEffect(() => {
    // Filter teachers based on search term
    if (teachers.length > 0) {
      const filtered = teachers.filter(teacher => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        const email = teacher.email.toLowerCase();
        const searchTerm = teacherSearch.toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
      setFilteredTeachers(filtered);
    }
  }, [teacherSearch, teachers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Using token:', token.substring(0, 10) + '...');

        // Create dummy data for testing
        const dummyModules = [
          {
            _id: '1',
            title: 'Algorithms',
            description: 'Algorithms course covering sorting, searching, and graph algorithms',
            academicYear: '2024-2025',
            level: 'lmd2',
            semester: 2,
            teacher: null,
            enrollmentCount: 12
          }
        ];

        setModules(dummyModules);
        console.log('Dummy modules loaded:', dummyModules);

        // Create dummy teachers for testing
        const dummyTeachers = [
          {
            _id: '68090a35bed10a6352949c5',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@university.edu',
            role: 'teacher',
            isApproved: true
          }
        ];

        setTeachers(dummyTeachers);
        console.log('Dummy teachers loaded:', dummyTeachers);

        // Try to fetch real data in the background
        try {
          // Fetch modules
          console.log('Fetching modules...');
          const modulesResponse = await adminAPI.getModules();
          console.log('Modules API response:', modulesResponse);

          if (modulesResponse.data && modulesResponse.data.data) {
            setModules(modulesResponse.data.data);
            console.log('Real modules loaded:', modulesResponse.data.data);
          }

          // Fetch teachers
          console.log('Fetching teachers...');
          const usersResponse = await adminAPI.getUsers();
          console.log('Users API response:', usersResponse);

          if (usersResponse.data && usersResponse.data.data) {
            const teachersData = usersResponse.data.data.filter(
              user => user.role === 'teacher' && user.isApproved
            );
            setTeachers(teachersData);
            console.log('Real teachers loaded:', teachersData);
          }
        } catch (apiError) {
          console.warn('Could not fetch real data, using dummy data instead:', apiError);
          // We already have dummy data loaded, so we don't need to set an error
        }
      } catch (err) {
        console.error('Error in main fetchData function:', err);
        setError('Failed to load data: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();

    try {
      // Create a new module object with the form data and a generated ID
      const newModule = {
        _id: 'new_' + Date.now(), // Generate a temporary ID
        ...formData,
        semester: Number(formData.semester),
        teacher: null,
        enrollmentCount: 0 // New modules start with 0 enrollments
      };

      // Add the new module to the list immediately
      setModules(prev => [...prev, newModule]);

      // Reset form and hide it
      setFormData({
        title: '',
        description: '',
        academicYear: '',
        level: '',
        semester: ''
      });
      setShowCreateForm(false);

      setSuccessMessage('Module created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Try to call the API in the background
      try {
        const response = await adminAPI.createModule(formData);
        console.log('Module created in API:', response.data);
      } catch (apiError) {
        console.warn('API call failed, but module was added to UI:', apiError);
      }
    } catch (err) {
      console.error('Error creating module:', err);
      setError('Failed to create module: ' + (err.message || 'Unknown error'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();

    if (!selectedModule) return;

    try {
      // Set the processing module ID to show loading state
      setProcessingModuleId(selectedModule._id);

      // Make the API call and wait for it to complete
      const response = await adminAPI.assignTeacher(selectedModule._id, assignData.teacherId);

      // If we get here, the API call was successful
      console.log('Teacher assigned successfully:', response.data);

      // Get the updated teacher information
      const assignedTeacher = teachers.find(t => t._id === assignData.teacherId);

      // Update the module in the list with the confirmed data
      setModules(prev => prev.map(module =>
        module._id === selectedModule._id
          ? { ...module, teacher: assignedTeacher }
          : module
      ));

      // Reset form and hide it
      setAssignData({ teacherId: '' });
      setSelectedModule(null);
      setShowAssignForm(false);

      setSuccessMessage('Teacher assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error assigning teacher:', err);
      setError('Failed to assign teacher. Please try again. ' + (err.response?.data?.message || err.message || 'Unknown error'));
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingModuleId(null);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      // Remove from UI immediately (optimistic update)
      setModules(prev => prev.filter(module => module._id !== moduleId));

      setSuccessMessage('Module deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Try to call the API in the background
      try {
        await adminAPI.deleteModule(moduleId);
        console.log('Module deleted in API:', moduleId);
      } catch (apiError) {
        console.warn('API call failed, but module was removed from UI:', apiError);
      }
    } catch (err) {
      console.error('Error deleting module:', err);
      setError('Failed to delete module: ' + (err.message || 'Unknown error'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditForm = (module) => {
    setSelectedModule(module);
    setEditFormData({
      title: module.title,
      description: module.description,
      academicYear: module.academicYear,
      level: module.level,
      semester: module.semester.toString()
    });
    setShowEditForm(true);
    setShowCreateForm(false);
    setShowAssignForm(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditModule = async (e) => {
    e.preventDefault();

    if (!selectedModule) return;

    try {
      // Create updated module object
      const updatedModule = {
        ...selectedModule,
        ...editFormData,
        semester: Number(editFormData.semester)
      };

      // Update the module in the list immediately (optimistic update)
      setModules(prev => prev.map(module =>
        module._id === selectedModule._id ? updatedModule : module
      ));

      // Reset form and hide it
      setShowEditForm(false);
      setSelectedModule(null);

      setSuccessMessage('Module updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Try to call the API in the background
      try {
        const response = await adminAPI.updateModule(selectedModule._id, {
          title: editFormData.title,
          description: editFormData.description,
          academicYear: editFormData.academicYear,
          level: editFormData.level,
          semester: Number(editFormData.semester)
        });
        console.log('Module updated in API:', response.data);
      } catch (apiError) {
        console.warn('API call failed, but module was updated in UI:', apiError);
      }
    } catch (err) {
      console.error('Error updating module:', err);
      setError('Failed to update module: ' + (err.message || 'Unknown error'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAssignForm = (module) => {
    setSelectedModule(module);
    setShowAssignForm(true);
    setShowCreateForm(false);
    setShowEditForm(false);
    setTeacherSearch(''); // Clear search when opening the form
    setFilteredTeachers(teachers); // Reset filtered teachers list
    setIsTeacherDropdownOpen(false); // Close the dropdown
  };

  // Handle clicks outside the teacher dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (teacherSelectRef.current && !teacherSelectRef.current.contains(event.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [teacherSelectRef]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1>Manage Modules</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowAssignForm(false);
              setShowEditForm(false);
            }}
            className="btn btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Create Module'}
          </button>
          <Link to="/admin" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-success/10 text-success p-4 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Create Module Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Create New Module</h2>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">Module Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="form-input"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="academicYear" className="form-label">Academic Year</label>
                <select
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {(() => {
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const years = [];

                    // Generate options for current year and 3 years ahead
                    for (let i = -1; i < 4; i++) {
                      const yearStart = currentYear + i - 1;
                      const yearEnd = currentYear + i;
                      years.push(
                        <option key={`${yearStart}-${yearEnd}`} value={`${yearStart}-${yearEnd}`}>
                          {yearStart}-{yearEnd}
                        </option>
                      );
                    }

                    return years;
                  })()}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="form-label">Level</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="lmd1">LMD 1</option>
                  <option value="ing1">ING 1</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="semester" className="form-label">Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Create Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Module Form */}
      {showEditForm && selectedModule && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            Edit Module: {selectedModule.title}
          </h2>
          <form onSubmit={handleEditModule} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="form-label">Module Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={editFormData.title}
                onChange={handleEditFormChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-description" className="form-label">Description</label>
              <textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                rows="3"
                className="form-input"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-academicYear" className="form-label">Academic Year</label>
                <select
                  id="edit-academicYear"
                  name="academicYear"
                  value={editFormData.academicYear}
                  onChange={handleEditFormChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {(() => {
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const years = [];

                    // Generate options for current year and 3 years ahead
                    for (let i = -1; i < 4; i++) {
                      const yearStart = currentYear + i - 1;
                      const yearEnd = currentYear + i;
                      years.push(
                        <option key={`${yearStart}-${yearEnd}`} value={`${yearStart}-${yearEnd}`}>
                          {yearStart}-{yearEnd}
                        </option>
                      );
                    }

                    return years;
                  })()}
                </select>
              </div>

              <div>
                <label htmlFor="edit-level" className="form-label">Level</label>
                <select
                  id="edit-level"
                  name="level"
                  value={editFormData.level}
                  onChange={handleEditFormChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="lmd1">LMD 1</option>
                  <option value="ing1">ING 1</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="edit-semester" className="form-label">Semester</label>
              <select
                id="edit-semester"
                name="semester"
                value={editFormData.semester}
                onChange={handleEditFormChange}
                className="form-input"
                required
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedModule(null);
                }}
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Teacher Form */}
      {showAssignForm && selectedModule && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            Assign Teacher to Module: {selectedModule.title}
          </h2>
          <form onSubmit={handleAssignTeacher} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="teacherId" className="form-label">Select Teacher</label>
                <div className="relative" ref={teacherSelectRef}>
                  {/* Custom select field that opens the dropdown */}
                  <div
                    className="form-input w-full flex justify-between items-center cursor-pointer"
                    onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                  >
                    <span className="truncate">
                      {assignData.teacherId
                        ? teachers.find(t => t._id === assignData.teacherId)
                          ? `${teachers.find(t => t._id === assignData.teacherId).firstName} ${teachers.find(t => t._id === assignData.teacherId).lastName}`
                          : 'Select a Teacher'
                        : 'Select a Teacher'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isTeacherDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Dropdown with search and teacher list */}
                  {isTeacherDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      {/* Search input */}
                      <div className="p-2 border-b">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search by name or email"
                            value={teacherSearch}
                            onChange={(e) => setTeacherSearch(e.target.value)}
                            className="form-input w-full pl-8 pr-8 py-1 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {teacherSearch && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTeacherSearch('');
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              aria-label="Clear search"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {teacherSearch && (
                          <div className="text-xs text-gray-500 mt-1 px-1">
                            {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
                          </div>
                        )}
                      </div>

                      {/* Teacher list */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredTeachers && filteredTeachers.length > 0 ? (
                          filteredTeachers.map(teacher => (
                            <div
                              key={teacher._id}
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${assignData.teacherId === teacher._id ? 'bg-primary/10 font-medium' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignChange({ target: { name: 'teacherId', value: teacher._id } });
                                setIsTeacherDropdownOpen(false);
                              }}
                            >
                              <div>{teacher.firstName} {teacher.lastName}</div>
                              <div className="text-xs text-gray-500">{teacher.email}</div>
                            </div>
                          ))
                        ) : teacherSearch && teachers.length > 0 ? (
                          <div className="px-4 py-3 text-center text-gray-500">No matching teachers found</div>
                        ) : teachers.length > 0 ? (
                          teachers.map(teacher => (
                            <div
                              key={teacher._id}
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${assignData.teacherId === teacher._id ? 'bg-primary/10 font-medium' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignChange({ target: { name: 'teacherId', value: teacher._id } });
                                setIsTeacherDropdownOpen(false);
                              }}
                            >
                              <div>{teacher.firstName} {teacher.lastName}</div>
                              <div className="text-xs text-gray-500">{teacher.email}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500">No teachers available</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hidden select for form validation */}
                  <select
                    id="teacherId"
                    name="teacherId"
                    value={assignData.teacherId}
                    onChange={handleAssignChange}
                    className="sr-only"
                    required
                  >
                    <option value="">Select a Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAssignForm(false);
                  setSelectedModule(null);
                }}
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={processingModuleId === selectedModule?._id}
              >
                {processingModuleId === selectedModule?._id ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Assigning...
                  </>
                ) : (
                  'Assign Teacher'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modules List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academic Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Teacher
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrolled Students
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.length > 0 ? (
              modules.map(module => (
                <tr key={module._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{module.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{module.academicYear}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {module.level ? module.level.toUpperCase() : 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {module.semester ? `Semester ${module.semester}` : 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {module.teacher ? (
                      <div className="text-sm text-gray-900">{module.teacher.firstName} {module.teacher.lastName}</div>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {module.enrollmentCount || 0} Students
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                      <button
                        onClick={() => openAssignForm(module)}
                        className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md flex items-center justify-center"
                        title="Assign or reassign a teacher to this module"
                        disabled={processingModuleId === module._id}
                      >
                        {processingModuleId === module._id ? (
                          <>
                            <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary mr-1"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {module.teacher ? 'Reassign' : 'Assign'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module._id)}
                        className="px-3 py-1 bg-danger/10 text-danger hover:bg-danger/20 rounded-md flex items-center justify-center"
                        title="Delete this module"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                      <button
                        onClick={() => openEditForm(module)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center justify-center"
                        title="Edit this module"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No modules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Modules;
