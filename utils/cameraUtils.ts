import { Dimensions } from 'react-native';

/**
 * 카메라 관련 유틸리티 함수들
 */
export class CameraUtils {
    /**
     * 화면 크기 기반 카메라 높이 계산
     */
    static getCameraHeight(ratio: number = 0.67): number {
        const screenHeight = Dimensions.get('window').height;
        return screenHeight * ratio;
    }

    /**
     * 카메라 방향 토글
     */
    static toggleFacing(current: 'front' | 'back'): 'front' | 'back' {
        return current === 'back' ? 'front' : 'back';
    }

    /**
     * 플래시 토글
     */
    static toggleFlash(current: 'off' | 'on'): 'off' | 'on' {
        return current === 'off' ? 'on' : 'off';
    }

    /**
     * 줌 값 제한
     */
    static clampZoom(zoom: number, min: number = 0, max: number = 1): number {
        return Math.max(min, Math.min(max, zoom));
    }

    /**
     * 카메라 설정 유효성 검사
     */
    static validateCameraSettings(settings: any): boolean {
        return settings && typeof settings === 'object';
    }
}
