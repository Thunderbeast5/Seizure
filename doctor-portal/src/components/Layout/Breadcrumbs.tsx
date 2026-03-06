import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  search: 'Search',
  messages: 'Messages',
  emergencies: 'Emergency Alerts',
  connections: 'Connections',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const crumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[segment] || segment;
    const isLast = index === pathSegments.length - 1;

    return { name, path, isLast };
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
        <HomeIcon className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <React.Fragment key={crumb.path}>
          <ChevronRightIcon className="w-3 h-3 text-gray-400" />
          {crumb.isLast ? (
            <span className="text-gray-900 font-medium">{crumb.name}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-blue-600 transition-colors">
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};