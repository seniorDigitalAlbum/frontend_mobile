import { Question } from '../types/question';
import questionApiService from './api/questionApiService';

class QuestionService {
  async getQuestions(): Promise<Question[]> {
    try {
      console.log('API에서 질문을 가져오는 중...');
      const questions = await questionApiService.getQuestions();
      console.log('API에서 받은 질문들:', questions);
      return questions;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      console.log('기본 질문들을 사용합니다.');
      // 에러 발생 시 기본 질문들 반환
      return this.getDefaultQuestions();
    }
  }

  async getQuestionById(id: number): Promise<Question | null> {
    try {
      return await questionApiService.getQuestionById(id);
    } catch (error) {
      console.error(`Failed to fetch question ${id}:`, error);
      return null;
    }
  }

  // API 연결 전까지 사용할 기본 질문들
  private getDefaultQuestions(): Question[] {
    return [
      { id: 1, content: '오늘 하루는 어땠나요?', category: 'daily' },
      { id: 2, content: '가장 기억에 남는 순간은 언제인가요?', category: 'memory' },
      { id: 3, content: '내일 하고 싶은 일이 있나요?', category: 'future' },
      { id: 4, content: '요즘 가장 고민하는 것은 무엇인가요?', category: 'concern' },
      { id: 5, content: '가장 감사한 사람은 누구인가요?', category: 'gratitude' },
    ];
  }
}

export const questionService = new QuestionService();
export default questionService; 