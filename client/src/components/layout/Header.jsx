import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Handle clicks outside the user dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownRef]);

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">Edu CS</Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            {!user && (
              <>
                <Link to="/" className="text-dark hover:text-primary transition-colors font-medium">Home</Link>
                <Link to="/about" className="text-dark hover:text-primary transition-colors font-medium">About</Link>
              </>
            )}

            {user ? (
              <>
                {/* Admin Navigation */}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="hover:text-neutral transition-colors">Dashboard</Link>
                    <Link to="/admin/users" className="hover:text-neutral transition-colors">Manage Users</Link>
                    <Link to="/admin/modules" className="hover:text-neutral transition-colors">Manage Modules</Link>
                  </>
                )}

                {/* Teacher Navigation */}
                {user.role === 'teacher' && (
                  <>
                    <Link to="/teacher" className="hover:text-neutral transition-colors">Dashboard</Link>
                    <Link to="/teacher/modules" className="hover:text-neutral transition-colors">My Modules</Link>
                  </>
                )}

                {/* Student Navigation */}
                {user.role === 'student' && (
                  <>
                    <Link to="/student" className="hover:text-neutral transition-colors">Dashboard</Link>
                    <Link to="/student/modules?tab=enrolled" className="hover:text-neutral transition-colors">My Modules</Link>
                  </>
                )}

                {/* User dropdown */}
                <div className="relative ml-4" ref={userDropdownRef}>
                  <button
                    className="flex items-center hover:text-neutral transition-colors focus:outline-none bg-primary/10 px-3 py-1 rounded-md border border-primary/20"
                    onClick={toggleUserDropdown}
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="mr-1 text-dark">{user.username || `${user.firstName} ${user.lastName}`}</span>
                    <svg
                      className={`w-4 h-4 text-primary transition-transform ${isUserDropdownOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-border">
                      <div className="px-4 py-2 text-sm border-b border-border">
                        <div className="font-medium text-dark">{user.firstName} {user.lastName}</div>
                        <div className="text-neutral">{user.email}</div>
                      </div>
                      <Link
                        to={user.role === 'admin' ? '/admin/settings' : '/settings'}
                        className="block w-full text-left px-4 py-2 text-sm text-dark hover:bg-primary/5 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-accent hover:bg-accent/5 transition-colors border-t border-border"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-dark hover:text-primary transition-colors font-medium">Login</Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3">
            {!user && (
              <>
                <Link to="/" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>Home</Link>
                <Link to="/about" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>About</Link>
              </>
            )}

            {user ? (
              <>
                {/* User info */}
                <div className="bg-primary/10 p-3 rounded-md mb-3 border border-primary/20">
                  <div className="font-medium text-dark">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-neutral">{user.email}</div>
                </div>

                {/* Admin Navigation */}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>Dashboard</Link>
                    <Link to="/admin/users" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>Manage Users</Link>
                    <Link to="/admin/modules" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>Manage Modules</Link>
                  </>
                )}

                {/* Teacher Navigation */}
                {user.role === 'teacher' && (
                  <>
                    <Link to="/teacher" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>Dashboard</Link>
                    <Link to="/teacher/modules" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>My Modules</Link>
                  </>
                )}

                {/* Student Navigation */}
                {user.role === 'student' && (
                  <>
                    <Link to="/student" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>Dashboard</Link>
                    <Link to="/student/modules?tab=enrolled" className="block hover:text-neutral transition-colors" onClick={toggleMenu}>My Modules</Link>
                  </>
                )}

                <Link to={user.role === 'admin' ? '/admin/settings' : '/settings'} className="block hover:text-primary mt-3" onClick={toggleMenu}>Settings</Link>

                <div className="pt-3 border-t border-border mt-3">
                  <button
                    onClick={() => {
                      logout();
                      toggleMenu();
                      setIsUserDropdownOpen(false);
                    }}
                    className="text-accent hover:text-accent/80 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-border flex flex-col space-y-2">
                <Link to="/login" className="block hover:text-primary" onClick={toggleMenu}>Login</Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-center"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
