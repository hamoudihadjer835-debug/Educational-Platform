import { Link } from 'react-router-dom';

const ChooseRole = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-center text-3xl font-bold mb-2">Choose Your Role</h1>
      <p className="text-center text-neutral mb-8">Select the role that best describes you to get started</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="feature-icon feature-icon-primary w-20 h-20 mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Student</h2>
          <p className="text-neutral mb-6 text-center">
            Register as a student to access courses, lessons, and educational materials.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-neutral">
              <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Access courses based on your academic year</span>
            </li>
            <li className="flex items-center text-neutral">
              <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Download and stream lesson materials</span>
            </li>
            <li className="flex items-center text-neutral">
              <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Track your enrolled modules</span>
            </li>
          </ul>
          <div className="text-center">
            <Link to="/register?role=student" className="btn btn-primary py-3 px-6">
              Register as Student
            </Link>
          </div>
          <div className="mt-5 text-center text-sm text-muted bg-primary/5 p-3 rounded-md">
            <p className="font-medium mb-1">Requirements:</p>
            <p>- Age between 18 and 60</p>
            <p>- Computer Science field of study</p>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="feature-icon feature-icon-secondary w-20 h-20 mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Teacher</h2>
          <p className="text-neutral mb-6 text-center">
            Register as a teacher to create and manage lessons for assigned modules.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-neutral">
              <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Create and upload lessons</span>
            </li>
            <li className="flex items-center text-neutral">
              <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Manage assigned modules</span>
            </li>
            <li className="flex items-center text-neutral">
              <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Provide educational materials in various formats</span>
            </li>
          </ul>
          <div className="text-center">
            <Link to="/register?role=teacher" className="btn btn-secondary py-3 px-6">
              Register as Teacher
            </Link>
          </div>
          <div className="mt-5 text-center text-sm text-muted bg-secondary/5 p-3 rounded-md">
            <p className="font-medium mb-1">Note:</p>
            <p>Teacher accounts require admin approval before accessing the platform.</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 border-t border-border pt-8">
        <p className="text-neutral mb-4">Already have an account?</p>
        <Link to="/login" className="btn btn-outline-primary px-8">
          Login to Your Account
        </Link>
      </div>
    </div>
  );
};

export default ChooseRole;
