import { Question, QuestionResponse, ApiError } from '../../types/question';
import { getApiConfig, API_ENDPOINTS } from '../../config/api';

const apiConfig = getApiConfig();

class QuestionApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // 인증이 필요한 경우
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getQuestions(): Promise<Question[]> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.questions);
      // 백엔드 응답 구조: { status: "success", questions: Question[], count: number }
      if (response.status === 'success' && response.questions) {
        return response.questions;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  }

  async getQuestionById(id: number): Promise<Question | null> {
    try {
      const response = await this.request<QuestionResponse>(API_ENDPOINTS.question(id));
      return response.data[0] || null;
    } catch (error) {
      console.error(`Failed to fetch question ${id}:`, error);
      throw error;
    }
  }
}

export const questionApiService = new QuestionApiService();
export default questionApiService;
