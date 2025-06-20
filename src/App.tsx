import React from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { SearchBar } from './components/SearchBar';
import { PeopleGrid } from './components/PeopleGrid';
export function App() {
  return <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <main className="h-full p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <SearchBar />
            <PeopleGrid />
          </div>
        </main>
      </div>
    </div>;
}