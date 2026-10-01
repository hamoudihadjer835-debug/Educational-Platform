import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 rounded-xl shadow-md">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Welcome to Edu CS</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
            A comprehensive learning platform for Computer Science students and teachers.
            Access courses, lessons, and educational resources all in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Get Started
            </Link>
            <Link to="/about" className="btn bg-transparent border-2 border-white hover:bg-white/10 text-white">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-md transition-all duration-300 border-t-4 border-t-primary">
              <div className="feature-icon bg-primary/10">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">Student Enrollment and Course Access</h3>
              <p className="text-dark/70">
                Students can register for Mathematics and Algorithmics support modules and join scheduled sessions.
              </p>
            </div>

            <div className="card text-center hover:shadow-md transition-all duration-300 border-t-4 border-t-secondary">
              <div className="feature-icon bg-secondary/10">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">Teacher Content Management</h3>
              <p className="text-dark/70">
                Teachers can upload course materials (videos, documents, exercises) and organize virtual or in-person sessions.
              </p>
            </div>

            <div className="card text-center hover:shadow-md transition-all duration-300 border-t-4 border-t-accent">
              <div className="feature-icon bg-accent/10">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">Access to Modules and Download</h3>
              <p className="text-dark/70">
                Students can access course modules and download educational materials including documents, presentations, and exercises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-secondary/10 py-16 rounded-xl shadow-sm border border-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-dark">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-dark/70">
            Join our platform today and get access to quality educational resources.
          </p>
          <Link to="/register" className="btn bg-accent text-white hover:bg-accent/90 px-8 py-3 text-base">
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
