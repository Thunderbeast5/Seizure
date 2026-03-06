import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">Sahara</span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm">
                Empowering doctors with real-time seizure monitoring, patient management, and emergency response tools.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/patients" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Patients
                  </Link>
                </li>
                <li>
                  <Link to="/messages" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Messages
                  </Link>
                </li>
                <li>
                  <Link to="/emergencies" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Emergency Alerts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="mailto:support@seizureguard.com" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">
              © {currentYear} SeizureGuard Doctor Portal. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-2 sm:mt-0">
              HIPAA Compliant • Encrypted Data • Secure Communications
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};