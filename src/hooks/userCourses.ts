import { useState, useEffect } from 'react';
import { courseService } from '../services/CourseService';
import { Course } from '../types/course.types';

interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCourses = (): UseCoursesResult => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kunde inte hämta kurser');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
};
