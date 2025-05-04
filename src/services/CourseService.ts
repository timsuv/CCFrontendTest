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
      console.log('Sending search request with params:', params);
      
      const response = await api.get<CourseSearchResponseDto>('/api/search/courses', { 
        params: {
          search: params.search,
          category: params.category,
          level: params.level,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          page: params.page,
          pageSize: params.pageSize
        }
      });
      
      console.log('Received response:', response.data);
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