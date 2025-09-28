import { Alert } from 'react-native';

/**
 * 카메라 테스트 관련 유틸리티 함수들
 */
export class CameraTestUtils {
    /**
     * 에러 알림 표시
     */
    static showErrorAlert(message: string) {
        Alert.alert('오류', message);
    }

    /**
     * 성공 알림 표시
     */
    static showSuccessAlert(message: string) {
        Alert.alert('성공', message);
    }

    /**
     * 파라미터 유효성 검사
     */
    static validateParams(params: any): boolean {
        return params && typeof params === 'object' && params.questionText;
    }

    /**
     * 기본 파라미터 생성
     */
    static getDefaultParams() {
        return { questionText: '질문이 없습니다.' };
    }

    /**
     * 안전한 파라미터 추출
     */
    static extractParams(routeParams: any) {
        if (!this.validateParams(routeParams)) {
            return this.getDefaultParams();
        }
        
        return {
            questionText: routeParams.questionText || '질문이 없습니다.',
            questionId: routeParams.questionId,
            conversationId: routeParams.conversationId,
            cameraSessionId: routeParams.cameraSessionId,
            microphoneSessionId: routeParams.microphoneSessionId
        };
    }
}
