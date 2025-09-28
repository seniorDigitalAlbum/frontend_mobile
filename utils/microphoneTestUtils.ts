import { Alert } from 'react-native';
import { colors } from '../styles/commonStyles';

/**
 * 마이크 테스트 관련 유틸리티 함수들
 */
export class MicrophoneTestUtils {
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

    /**
     * 오디오 레벨 시뮬레이션
     */
    static generateAudioLevel(): number {
        return Math.random() * 0.8 + 0.2;
    }

    /**
     * 녹음 상태에 따른 아이콘 이름 반환
     */
    static getIconName(isRecording: boolean, isMicTested: boolean): string {
        if (isRecording) return "stop";
        if (isMicTested) return "checkmark-circle";
        return "mic";
    }

    /**
     * 녹음 상태에 따른 아이콘 색상 반환
     */
    static getIconColor(isRecording: boolean, isMicTested: boolean): string {
        if (isMicTested) return "#FFFFFF"; // 테스트 완료 시 흰색
        return colors.green; // 기본 상태와 녹음 중일 때 모두 green
    }

    /**
     * 녹음 상태에 따른 배경 색상 반환
     */
    static getBackgroundColor(isRecording: boolean, isMicTested: boolean): string | { backgroundColor: string } {
        if (isMicTested) return { backgroundColor: colors.green }; // 테스트 완료 시 colors.green 사용
        return 'bg-green-100'; // 기본 상태와 녹음 중일 때는 연한 초록색
    }

    /**
     * 시작하기 버튼 색상 반환 (실제 colors.green 값 사용)
     */
    static getStartButtonColor(): { backgroundColor: string } {
        return { backgroundColor: colors.green }; // 실제 colors.green (#67876C) 사용
    }
}
