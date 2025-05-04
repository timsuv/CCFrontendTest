import { useState, useEffect } from 'react';
import { courseService } from '../services/CourseService';
import { 
  CourseSearchDto, 
  CourseSearchRequestDto, 
  CourseSearchResponseDto 
} from '../types/course.types';

interface UseCourseSearchResult {
  courses: CourseSearchDto[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  searchFilters: Partial<CourseSearchRequestDto>;
  handlePageChange: (page: number) => void;
  updateFilters: (filters: Partial<CourseSearchRequestDto>) => void;
  refetch: () => Promise<void>;
}

export const useCourseSearch = (
  initialFilters: Partial<CourseSearchRequestDto> = {}
): UseCourseSearchResult => {
  const [courses, setCourses] = useState<CourseSearchDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<Partial<CourseSearchRequestDto>>({
    pageSize: 10,
    ...initialFilters
  });

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: CourseSearchRequestDto = {
        page: currentPage,
        pageSize: searchFilters.pageSize || 10,
        ...searchFilters
      };

      const data = await courseService.searchCourses(params);
      setCourses(data.courses);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setHasNextPage(data.hasNextPage);
      setHasPreviousPage(data.hasPreviousPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kunde inte söka kurser');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchFilters]);

  const handlePageChange = (newPage: number): void => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateFilters = (newFilters: Partial<CourseSearchRequestDto>): void => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  return {
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
    updateFilters,
    refetch: fetchCourses
  };
};
