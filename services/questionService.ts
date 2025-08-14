import { Question, QuestionResponse, ApiError } from '../types/question';
import { getApiConfig, API_ENDPOINTS } from '../config/api';

const apiConfig = getApiConfig();

class QuestionService {
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
      const response = await this.request<QuestionResponse>(API_ENDPOINTS.questions);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      // 에러 발생 시 기본 질문들 반환
      return this.getDefaultQuestions();
    }
  }

  async getQuestionById(id: number): Promise<Question | null> {
    try {
      const response = await this.request<QuestionResponse>(API_ENDPOINTS.question(id));
      return response.data[0] || null;
    } catch (error) {
      console.error(`Failed to fetch question ${id}:`, error);
      return null;
    }
  }

  // API 연결 전까지 사용할 기본 질문들
  private getDefaultQuestions(): Question[] {
    return [
      { id: 1, text: '오늘 하루는 어땠나요?', category: 'daily' },
      { id: 2, text: '가장 기억에 남는 순간은 언제인가요?', category: 'memory' },
      { id: 3, text: '내일 하고 싶은 일이 있나요?', category: 'future' },
      { id: 4, text: '요즘 가장 고민하는 것은 무엇인가요?', category: 'concern' },
      { id: 5, text: '가장 감사한 사람은 누구인가요?', category: 'gratitude' },
    ];
  }
}

export const questionService = new QuestionService();
export default questionService; 