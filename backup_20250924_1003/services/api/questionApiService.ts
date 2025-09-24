import { Question, QuestionResponse, ApiError } from '../../types/question';
import { API_ENDPOINTS } from '../../config/api';
import apiClient from './apiClient';

class QuestionApiService {

  async getQuestions(): Promise<Question[]> {
    try {
      console.log('API 요청 URL:', API_ENDPOINTS.questions);
      const response = await apiClient.get<any>(API_ENDPOINTS.questions);
      console.log('API 응답:', response.data);
      // 백엔드 응답 구조 확인 후 처리
      if (response.data.questions && Array.isArray(response.data.questions)) {
        return response.data.questions;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  }

  async getQuestionById(id: number): Promise<Question | null> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.question(id));
      // 백엔드 응답 구조: { status: "success", question: Question }
      if (response.status === 'success' && response.question) {
        return response.question;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`Failed to fetch question ${id}:`, error);
      throw error;
    }
  }

  async getQuestionCount(): Promise<number> {
    try {
      const response = await this.request<any>('/api/questions/count');
      // 백엔드 응답 구조: { status: "success", count: number }
      if (response.status === 'success' && response.count !== undefined) {
        return response.count;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch question count:', error);
      throw error;
    }
  }

  async getRandomQuestion(): Promise<Question | null> {
    try {
      const response = await this.request<any>('/api/questions/random');
      // 백엔드 응답 구조: { status: "success", question: Question }
      if (response.status === 'success' && response.question) {
        return response.question;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch random question:', error);
      // 404나 500 에러인 경우 명시적으로 throw
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('500'))) {
        throw new Error('Random question API not available');
      }
      throw error;
    }
  }

  async getQuestionsPaginated(page: number = 0, size: number = 5): Promise<{ questions: Question[], hasMore: boolean }> {
    try {
      const response = await this.request<any>(`/api/questions?page=${page}&size=${size}`);
      console.log('Paginated API 응답:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response.questions:', response.questions);
      console.log('Response.questions length:', response.questions?.length);
      
      // 백엔드 응답 구조에 따라 처리
      if (response.questions && Array.isArray(response.questions)) {
        return {
          questions: response.questions,
          hasMore: response.hasMore || response.questions.length === size
        };
      } else if (Array.isArray(response)) {
        return {
          questions: response,
          hasMore: response.length === size
        };
      } else {
        console.error('Unexpected paginated response format:', response);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch paginated questions:', error);
      // 404나 500 에러인 경우 명시적으로 throw
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('500'))) {
        throw new Error('Pagination API not available');
      }
      throw error;
    }
  }
}

export const questionApiService = new QuestionApiService();
export default questionApiService;
