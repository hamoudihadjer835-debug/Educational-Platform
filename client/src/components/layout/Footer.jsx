import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Edu CS</h3>
            <p className="text-white/80">
              A comprehensive platform for Computer Science students and teachers.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors">About</Link>
              </li>

              <li>
                <Link to="/choose-role" className="text-white/80 hover:text-white transition-colors">Register</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Contact Us</h3>
            <address className="not-italic text-white/80">
              <p className="text-white/80">Email: info@educs.com</p>
              <p className="text-white/80">Phone: +1 (123) 456-7890</p>
              <p className="text-white/80">Address: 123 Education St, Learning City</p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/70">
          <p>&copy; {currentYear} Edu CS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
