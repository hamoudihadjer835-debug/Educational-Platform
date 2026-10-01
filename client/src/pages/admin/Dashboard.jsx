import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 text-danger p-4 rounded-md border border-danger/20">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-primary text-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/80">Manage your educational platform from one place</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/admin/users" className="btn bg-secondary text-primary hover:bg-secondary/90 font-medium">
              Manage Users
            </Link>
            <Link to="/admin/modules" className="btn bg-white/20 text-white hover:bg-white/30 border border-white/30">
              Manage Modules
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-md transition-all duration-300 border-l-4 border-l-primary">
          <div className="flex items-center mb-3">
            <div className="feature-icon-primary p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
        </div>

        <div className="card hover:shadow-md transition-all duration-300 border-l-4 border-l-secondary">
          <div className="flex items-center mb-3">
            <div className="feature-icon-secondary p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Total Teachers</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{stats?.totalTeachers || 0}</p>
        </div>

        <div className="card hover:shadow-md transition-all duration-300 border-l-4 border-l-accent">
          <div className="flex items-center mb-3">
            <div className="feature-icon-accent p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{stats?.totalStudents || 0}</p>
        </div>

        <div className="card hover:shadow-md transition-all duration-300 border-l-4 border-l-accent">
          <div className="flex items-center mb-3">
            <div className="bg-accent/10 text-accent p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
          </div>
          <p className="text-3xl font-bold text-accent">{stats?.pendingApprovals || 0}</p>
          {stats?.pendingApprovals > 0 && (
            <Link to="/admin/users" className="text-sm text-primary font-medium hover:text-primary/80 mt-2 inline-flex items-center">
              Review pending approvals
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* More Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-bold mb-6 pb-2 border-b border-border">Content Statistics</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-dark font-medium">Total Modules</span>
              </div>
              <span className="text-xl font-bold text-primary">{stats?.totalModules || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg">
              <div className="flex items-center">
                <div className="bg-secondary/10 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-dark font-medium">Total Lessons</span>
              </div>
              <span className="text-xl font-bold text-secondary">{stats?.totalLessons || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <div className="flex items-center">
                <div className="bg-accent/10 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-dark font-medium">Total Enrollments</span>
              </div>
              <span className="text-xl font-bold text-accent">{stats?.totalEnrollments || 0}</span>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
          <div className="flex items-center mb-6 pb-2 border-b border-blue-200">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            <Link
              to="/admin/modules"
              state={{ showCreateForm: true }}
              className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-blue-50 transition-all duration-300 text-center"
            >
              <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium text-lg text-gray-800 group-hover:text-primary transition-colors duration-300">Add New Module</span>
            </Link>
            <Link
              to="/admin/users"
              state={{ activeTab: 'pending' }}
              className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 text-center"
            >
              <div className="bg-accent/10 p-4 rounded-full mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="font-medium text-lg text-gray-800 group-hover:text-accent transition-colors duration-300">Approve Users</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
