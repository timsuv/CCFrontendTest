import React, { useState } from 'react';
import AllCourses from '../components/AllCourses';
import CourseSearch from '../components/CourseSearch';

const CoursesPage: React.FC = () => {
  const [view, setView] = useState<'all' | 'search'>('all');

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('all')}
          className={`px-4 py-2 rounded ${
            view === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Alla kurser
        </button>
        <button
          onClick={() => setView('search')}
          className={`px-4 py-2 rounded ${
            view === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Sök kurser
        </button>
      </div>

      {view === 'all' ? <AllCourses /> : <CourseSearch />}
    </div>
  );
};

export default CoursesPage;