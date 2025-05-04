// src/components/CourseSearch.tsx
import React, { useState } from 'react';
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

  const [priceOption, setPriceOption] = useState<'preset' | 'custom'>('preset');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is automatic when filters change
  };

  const handlePriceOptionChange = (option: 'preset' | 'custom') => {
    setPriceOption(option);
    // Clear price filters when switching
    updateFilters({ minPrice: undefined, maxPrice: undefined });
  };

  const handlePresetPriceChange = (value: string) => {
    if (value === "Gratis") {
      updateFilters({ minPrice: 0, maxPrice: 0 });
    } else if (value === "Under 100 kr") {
      updateFilters({ minPrice: 0, maxPrice: 99.99 });
    } else if (value === "100 - 300 kr") {
      updateFilters({ minPrice: 100, maxPrice: 300 });
    } else if (value === "Över 300 kr") {
      updateFilters({ minPrice: 300.01, maxPrice: undefined });
    } else {
      updateFilters({ minPrice: undefined, maxPrice: undefined });
    }
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
          
          <select
            value={searchFilters.category || ''}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="border rounded px-4 py-2"
          >
            <option value="">Alla kategorier</option>
            <option value="Programmering">Programmering</option>
            <option value="Webbutveckling">Webbutveckling</option>
            <option value="Databas">Databas</option>
          </select>
          
          <select
            value={searchFilters.level || ''}
            onChange={(e) => updateFilters({ level: e.target.value })}
            className="border rounded px-4 py-2"
          >
            <option value="">Alla nivåer</option>
            <option value="Nybörjare">Nybörjare</option>
            <option value="Medel">Medel</option>
            <option value="Avancerad">Avancerad</option>
          </select>
          
          <div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => handlePriceOptionChange('preset')}
                className={`px-3 py-1 rounded ${
                  priceOption === 'preset' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Förinställt
              </button>
              <button
                type="button"
                onClick={() => handlePriceOptionChange('custom')}
                className={`px-3 py-1 rounded ${
                  priceOption === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Anpassat
              </button>
            </div>
            
            {priceOption === 'preset' ? (
              <select
                value=""
                onChange={(e) => handlePresetPriceChange(e.target.value)}
                className="border rounded px-4 py-2 w-full"
              >
                <option value="">Alla priser</option>
                <option value="Gratis">Gratis</option>
                <option value="Under 100 kr">Under 100 kr</option>
                <option value="100 - 300 kr">100 - 300 kr</option>
                <option value="Över 300 kr">Över 300 kr</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min pris"
                  value={searchFilters.minPrice !== undefined ? searchFilters.minPrice : ''}
                  onChange={(e) => updateFilters({ 
                    minPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="border rounded px-2 py-2 w-1/2"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max pris"
                  value={searchFilters.maxPrice !== undefined ? searchFilters.maxPrice : ''}
                  onChange={(e) => updateFilters({ 
                    maxPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="border rounded px-2 py-2 w-1/2"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Results Info */}
      <div className="mb-4">
        <p className="text-gray-600">
          Visar {courses.length} av {totalCount} kurser
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar kurser...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {courses.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />

      {/* Page Size Selector */}
      <div className="flex justify-center items-center mb-8">
        <label className="mr-2">Objekt per sida:</label>
        <select
          value={searchFilters.pageSize}
          onChange={(e) => {
            updateFilters({ pageSize: parseInt(e.target.value) });
          }}
          className="border rounded px-2 py-1"
        >
          <option value="2">2</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  );
};

// CourseCard Component
interface CourseCardProps {
  course: CourseSearchDto;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="border rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">{course.category}</span>
          <span className="mx-2">•</span>
          <span className="text-sm text-gray-500">{course.level}</span>
        </div>
        <span className="font-bold text-lg">
          {course.price === 0 ? 'Gratis' : `${course.price} kr`}
        </span>
      </div>
    </div>
  );
};

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage
}) => {
  const renderPageNumbers = (): React.ReactNode[] => {
    const pageNumbers: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded border hover:bg-gray-100"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis1">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded border ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="ellipsis2">...</span>);
      }
      
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded border hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mb-8">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Första
      </button>
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Föregående
      </button>
      
      <div className="flex space-x-1">
        {renderPageNumbers()}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Nästa
      </button>
      
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sista
      </button>
    </div>
  );
};

export default CourseSearch;