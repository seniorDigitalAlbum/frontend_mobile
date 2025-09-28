import { Question } from '../types/question';

/**
 * 홈 화면 관련 유틸리티 함수들
 */
export class HomeUtils {
    /**
     * 질문 선택 핸들러
     */
    static handleQuestionPress(question: Question, navigation: any, userId: string) {
        // CameraTest로 이동 (카메라/마이크 테스트 후 대화 시작)
        navigation.navigate('CameraTest', {
            questionText: question.content,
            questionId: question.id,
            userId: userId
        });
    }

    /**
     * 스크롤 이벤트 핸들러 (무한 스크롤)
     */
    static handleScroll(event: any, loadMoreQuestions: () => void) {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;

        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreQuestions();
        }
    }

    /**
     * 질문 유효성 검사
     */
    static isValidQuestion(question: any): question is Question {
        return question && 
               typeof question === 'object' && 
               typeof question.content === 'string' && 
               question.content.length > 0;
    }

    /**
     * 질문 텍스트 정리
     */
    static getQuestionText(question: Question): string {
        return question.content && typeof question.content === 'string'
            ? question.content
            : '질문 내용이 없습니다.';
    }

}
