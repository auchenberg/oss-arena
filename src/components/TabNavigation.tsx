'use client';

import { ViewMode } from '@/lib/types';

interface TabNavigationProps {
  activeTab: ViewMode;
  onTabChange: (tab: ViewMode) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabChange('contributions')}
        className={`px-6 py-3 text-sm font-medium transition-colors relative ${
          activeTab === 'contributions'
            ? 'text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Code Contributions
        {activeTab === 'contributions' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
      </button>
      <button
        onClick={() => onTabChange('reviews')}
        className={`px-6 py-3 text-sm font-medium transition-colors relative ${
          activeTab === 'reviews'
            ? 'text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Code Reviews
        {activeTab === 'reviews' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
      </button>
    </div>
  );
}
