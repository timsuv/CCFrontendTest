import React from 'react';
import { useCourses } from '../hooks/userCourses';
import { Course } from '../types/course.types';

const AllCourses: React.FC = () => {
  const { courses, loading, error, refetch } = useCourses() as { courses: Course[]; loading: boolean; error: string | null; refetch: () => void };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Laddar kurser...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button 
          onClick={refetch}
          className="ml-4 text-sm underline"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Alla kurser</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

interface CourseCardProps {
  course: Course;
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

export default AllCourses;