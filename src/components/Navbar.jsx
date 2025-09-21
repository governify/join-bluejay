import { Redo2, WandSparkles, Award } from 'lucide-react';

import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600">BluejayJoin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {/* Join */}
            <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              <Redo2 className="w-5 h-5 mr-1" />
              Join
            </Link>

            {/* Wizard */}
            <Link to="/workInProgress" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              <WandSparkles className="w-5 h-5 mr-1" />
              Wizard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
