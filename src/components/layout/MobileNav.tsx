import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Target, FileText, BarChart3, Users, Bell } from 'lucide-react';

const MobileNav: React.FC = () => {
  const navItems = [
    { path: '/scheduling', label: 'Schedule', icon: <Calendar size={20} />, accent: 'teal' },
    { path: '/goals', label: 'Goals', icon: <Target size={20} />, accent: 'green' },
    { path: '/reports', label: 'Reports', icon: <FileText size={20} />, accent: 'gold' },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, accent: 'purple' },
    { path: '/my-meetings', label: 'Meetings', icon: <Users size={20} />, accent: 'blue' },
    { path: '/inbox', label: 'Inbox', icon: <Bell size={20} />, accent: 'orange' },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border z-30">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? `text-${item.accent === 'orange' ? 'orange-500' : item.accent}` : 'text-text-secondary'
              }`
            }
            end
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MobileNav;