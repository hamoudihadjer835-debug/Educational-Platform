const About = () => {
  return (
    <div className="space-y-12">
      <section className="bg-primary text-white py-16 rounded-xl shadow-md">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">About Edu CS</h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90">
            Learn more about Edu CS and our mission to provide quality Computer Science education.
          </p>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4">
          <div className="card max-w-4xl mx-auto hover:shadow-md transition-all duration-300">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-dark/70 mb-6">
              Edu CS is dedicated to providing high-quality Computer Science education to students aged 18-60.
              We believe in creating an accessible, interactive, and comprehensive learning environment that connects students with
              qualified teachers and valuable educational resources.
            </p>
            <p className="text-dark/70 mb-6">
              Edu CS facilitates the educational journey by organizing courses by academic year, allowing teachers to create
              and share lessons, and enabling students to access these materials in various formats including videos, PDFs, and
              interactive documents.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/10 py-16 rounded-xl border border-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-dark">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card hover:shadow-md transition-all duration-300">
              <div className="feature-icon feature-icon-primary">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Admin Creates Modules</h3>
              <p className="text-dark/70">
                Administrators create modules for specific academic years and assign them to qualified teachers.
              </p>
            </div>

            <div className="card hover:shadow-md transition-all duration-300">
              <div className="feature-icon feature-icon-secondary">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Teachers Add Lessons</h3>
              <p className="text-dark/70">
                Teachers create and upload lessons in various formats (videos, PDFs, documents) for their assigned modules.
              </p>
            </div>

            <div className="card hover:shadow-md transition-all duration-300">
              <div className="feature-icon feature-icon-accent">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Students Access Content</h3>
              <p className="text-neutral">
                Students enroll in modules for their academic year and access the lessons provided by teachers.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default About;
