import React from 'react';
import { Users2Icon, HomeIcon, SettingsIcon } from 'lucide-react';
export const Sidebar = () => {
  return <div className="w-64 h-full bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Organization</h1>
      </div>
      <nav className="px-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg">
              <Users2Icon className="w-5 h-5" />
              <span>People</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50">
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>;
};