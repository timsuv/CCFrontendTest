import { api } from '../components/AuthContext';
import { 
  Course, 
  CourseSearchRequestDto, 
  CourseSearchResponseDto 
} from '../types/course.types';

class CourseService {
  // Get all courses (without pagination)
  async getAllCourses(): Promise<Course[]> {
    try {
      const response = await api.get<Course[]>('/api/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      throw error;
    }
  }

  // Search courses with pagination and filters
  async searchCourses(params: CourseSearchRequestDto): Promise<CourseSearchResponseDto> {
    try {
      const response = await api.get<CourseSearchResponseDto>('/api/search/courses', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  // Get course by ID
  async getCourseById(id: number): Promise<Course> {
    try {
      const response = await api.get<Course>(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService();