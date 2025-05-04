export interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    level: string;
    price: number;
    // Add other properties from your CourseDto
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
    priceRange?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
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