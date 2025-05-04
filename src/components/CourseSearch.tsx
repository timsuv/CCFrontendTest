import React from 'react';
import { useCourseSearch } from '../hooks/useCourseSearch';
import { CourseSearchDto } from '../types/course.types';

const CourseSearch: React.FC = () => {
  const {
    courses,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    searchFilters,
    handlePageChange,
    updateFilters
  } = useCourseSearch();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is automatic when filters change
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Sök kurser</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Sök kurser..."
            value={searchFilters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="border rounded px-4 py-2"
          />
          
          {/* Other filter inputs... */}
        </div>
      </form>

      {/* Loading, error, and results display... */}
      
      {/* Pagination controls... */}
    </div>
  );
};

export default CourseSearch;