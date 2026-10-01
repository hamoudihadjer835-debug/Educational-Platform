import React from 'react';
import { Link } from 'react-router-dom';

const SimulatedEmail = ({ email, resetToken, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Email Header */}
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-sm">From: noreply@theplatform.edu</div>
            <div className="text-gray-500 text-sm">To: {email}</div>
            <div className="font-medium mt-1">Password Reset Request</div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Email Body */}
        <div className="p-6">
          <p className="mb-4">Dear User,</p>
          
          <p className="mb-4">We received a request to reset your password for your account at The Platform. Please click the button below to reset your password:</p>
          
          <div className="my-6 text-center">
            <Link 
              to={`/reset-password/${resetToken}`}
              className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90"
            >
              Reset Your Password
            </Link>
          </div>
          
          <p className="mb-4">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          
          <p className="mb-4">If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
          
          <div className="bg-gray-100 p-3 rounded-md mb-4 break-all">
            <code className="text-sm">http://localhost:5174/reset-password/{resetToken}</code>
          </div>
          
          <p className="mb-4">Regards,<br />The Platform Team</p>
          
          <div className="mt-8 pt-4 border-t text-gray-500 text-sm">
            <p>This is a simulated email for demonstration purposes only.</p>
            <p>In a production environment, a real email would be sent to the user's email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatedEmail;
