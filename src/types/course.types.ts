// src/types/course.types.ts
export interface Course {
    courseId: number;
    title: string;
    description: string;
    category: string;
    level: string;
    price: number;
  }
  
  export interface CourseSearchDto {
    title: string;
    description: string;
    category: string;
    level: string;
    price: number;
  }
  
  export interface CourseSearchRequestDto {
    search?: string;
    category?: string;
    level?: string;
    minPrice?: number;    // For min price
    maxPrice?: number;    // For max price
    page: number;
    pageSize: number;
  }
  
  export interface CourseSearchResponseDto {
    courses: CourseSearchDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }