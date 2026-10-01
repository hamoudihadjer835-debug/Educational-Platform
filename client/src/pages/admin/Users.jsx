import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const Users = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'all'); // 'all' or 'pending'
  const [successMessage, setSuccessMessage] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'student', 'teacher', 'admin'
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', 'lmd1', 'lmd2', 'lmd3', 'ing1', 'ing2'
  const [rankFilter, setRankFilter] = useState('all'); // 'all', 'professor', 'assistant professor', etc.

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both all users and pending approvals in parallel
        const [usersResponse, pendingResponse] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getPendingApprovals()
        ]);

        setUsers(usersResponse.data.data);
        setPendingApprovals(pendingResponse.data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);

      // Update the UI
      setPendingApprovals(prev => prev.filter(user => user._id !== userId));
      setUsers(prev => prev.map(user =>
        user._id === userId ? { ...user, isApproved: true } : user
      ));

      setSuccessMessage('User approved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);

      // Update the UI
      setUsers(prev => prev.filter(user => user._id !== userId));
      setPendingApprovals(prev => prev.filter(user => user._id !== userId));

      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = user.email.toLowerCase();
      const searchMatch =
        searchTerm === '' ||
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      // Role filter
      const roleMatch =
        roleFilter === 'all' ||
        user.role === roleFilter;

      // Level filter (only applies to students)
      const levelMatch =
        levelFilter === 'all' ||
        (user.role !== 'student' || user.level === levelFilter);

      // Rank filter (only applies to teachers)
      const rankMatch =
        rankFilter === 'all' ||
        (user.role !== 'teacher' || user.academicRank === rankFilter);

      return searchMatch && roleMatch && levelMatch && rankMatch;
    });
  }, [users, searchTerm, roleFilter, levelFilter, rankFilter]);

  // Filter pending approvals based on search term and filters
  const filteredPendingApprovals = useMemo(() => {
    return pendingApprovals.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = user.email.toLowerCase();
      const searchMatch =
        searchTerm === '' ||
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      // Role filter
      const roleMatch =
        roleFilter === 'all' ||
        user.role === roleFilter;

      // Level filter (only applies to students)
      const levelMatch =
        levelFilter === 'all' ||
        (user.role !== 'student' || user.level === levelFilter);

      // Rank filter (only applies to teachers)
      const rankMatch =
        rankFilter === 'all' ||
        (user.role !== 'teacher' || user.academicRank === rankFilter);

      return searchMatch && roleMatch && levelMatch && rankMatch;
    });
  }, [pendingApprovals, searchTerm, roleFilter, levelFilter, rankFilter]);

  // Using static academic ranks as specified

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#004080]">Manage Users</h1>
        <Link
          to="/admin"
          className="inline-flex items-center bg-gray-100 text-[#004080] px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-start text-sm">
          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 flex items-start text-sm">
          <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search and Filters - Compact Design */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row md:items-end space-y-3 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-xs font-medium text-gray-600 mb-1">Search Users</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-[#004080] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <label htmlFor="roleFilter" className="block text-xs font-medium text-gray-600 mb-1">Filter by Role</label>
            <div className="relative">
              <select
                id="roleFilter"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-[#004080]"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  if (e.target.value !== 'student') setLevelFilter('all');
                  if (e.target.value !== 'teacher') setRankFilter('all');
                }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Level Filter */}
          <div className={`w-full md:w-48 ${roleFilter === 'student' || roleFilter === 'all' ? '' : 'opacity-50'}`}>
            <label htmlFor="levelFilter" className="block text-xs font-medium text-gray-600 mb-1">Filter by Level</label>
            <div className="relative">
              <select
                id="levelFilter"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-[#004080]"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                disabled={roleFilter !== 'student' && roleFilter !== 'all'}
              >
                <option value="all">All Levels</option>
                <option value="lmd1">LMD 1</option>
                <option value="ing1">ING 1</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Rank Filter */}
          <div className={`w-full md:w-48 ${roleFilter === 'teacher' || roleFilter === 'all' ? '' : 'opacity-50'}`}>
            <label htmlFor="rankFilter" className="block text-xs font-medium text-gray-600 mb-1">Filter by Rank</label>
            <div className="relative">
              <select
                id="rankFilter"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-[#004080]"
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                disabled={roleFilter !== 'teacher' && roleFilter !== 'all'}
              >
                <option value="all">All Ranks</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Teaching Assistant">Teaching Assistant</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-[#004080] text-[#004080] font-semibold'
                : 'border-transparent text-gray-500 hover:text-[#004080] hover:border-gray-300'
            }`}
          >
            All Users ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'border-[#004080] text-[#004080] font-semibold'
                : 'border-transparent text-gray-500 hover:text-[#004080] hover:border-gray-300'
            }`}
          >
            Pending Approvals ({filteredPendingApprovals.length})
          </button>
        </nav>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'all' ? (
              filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-gray-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email.split('@')[0]}
                      </div>
                      {user.role === 'student' && user.level && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Level: <span className="font-medium uppercase">{user.level}</span>
                        </div>
                      )}
                      {user.role === 'teacher' && user.academicRank && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Rank: <span className="font-medium">{user.academicRank}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isApproved ? (
                        <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!user.isApproved && user.role !== 'admin' && (
                        <button
                          onClick={() => handleApproveUser(user._id)}
                          className="bg-[#004080] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[#003366] transition-colors mr-2"
                        >
                          Approve
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-[#e14177] font-medium hover:text-[#c13166] transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <p className="text-gray-600 font-medium text-sm">No users found matching the current filters</p>
                      <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )
            ) : filteredPendingApprovals.length > 0 ? (
              filteredPendingApprovals.map(user => (
                <tr key={user._id} className="border-b border-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email.split('@')[0]}
                    </div>
                    {user.role === 'student' && user.level && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Level: <span className="font-medium uppercase">{user.level}</span>
                      </div>
                    )}
                    {user.role === 'teacher' && user.academicRank && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Rank: <span className="font-medium">{user.academicRank}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleApproveUser(user._id)}
                      className="bg-[#004080] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[#003366] transition-colors mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-[#e14177] font-medium hover:text-[#c13166] transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-gray-600 font-medium text-sm">No pending approvals matching the current filters</p>
                    <p className="text-gray-400 text-xs mt-1">All users have been approved or try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
