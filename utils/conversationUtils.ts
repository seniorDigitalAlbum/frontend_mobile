/**
 * 대화 플로우 관련 유틸리티 함수들
 * 
 * 이 파일은 대화 세션, 상태 관리, 에러 처리 등
 * 대화 관련 공통 유틸리티 함수들을 제공합니다.
 */

import { Alert } from 'react-native';
import { ERROR_MESSAGES, FLOW_MESSAGES } from '../constants/conversation';

/**
 * 에러 메시지를 표시하는 유틸리티 함수
 * @param error - 에러 객체 또는 메시지
 * @param customMessage - 커스텀 에러 메시지 (선택사항)
 */
export const showErrorAlert = (error: any, customMessage?: string): void => {
  const message = customMessage || error?.message || ERROR_MESSAGES.ERROR;
  console.error('Error:', error);
  Alert.alert('오류', message);
};

/**
 * 성공 메시지를 표시하는 유틸리티 함수
 * @param message - 성공 메시지
 * @param onPress - 확인 버튼 클릭 시 실행할 함수 (선택사항)
 */
export const showSuccessAlert = (message: string, onPress?: () => void): void => {
  Alert.alert('성공', message, [
    { text: '확인', onPress: onPress || (() => {}) }
  ]);
};

/**
 * 확인 다이얼로그를 표시하는 유틸리티 함수
 * @param title - 다이얼로그 제목
 * @param message - 다이얼로그 메시지
 * @param onConfirm - 확인 버튼 클릭 시 실행할 함수
 * @param onCancel - 취소 버튼 클릭 시 실행할 함수 (선택사항)
 */
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(title, message, [
    { text: '취소', onPress: onCancel || (() => {}), style: 'cancel' },
    { text: '확인', onPress: onConfirm, style: 'default' }
  ]);
};

/**
 * 플로우 단계에 따른 메시지를 반환하는 함수
 * @param step - 현재 플로우 단계
 * @returns 해당 단계의 메시지
 */
export const getFlowStepMessage = (step: string): string => {
  switch (step) {
    case 'permissions':
      return FLOW_MESSAGES.PERMISSIONS_REQUEST;
    case 'camera_test':
      return FLOW_MESSAGES.CAMERA_TEST;
    case 'mic_test':
      return FLOW_MESSAGES.MICROPHONE_TEST;
    case 'tts_playback':
      return FLOW_MESSAGES.TTS_PLAYBACK;
    case 'session_create':
      return FLOW_MESSAGES.SESSION_CREATE;
    case 'user_response':
      return FLOW_MESSAGES.USER_RESPONSE;
    case 'session_cleanup':
      return FLOW_MESSAGES.SESSION_CLEANUP;
    case 'complete':
      return FLOW_MESSAGES.COMPLETE;
    default:
      return FLOW_MESSAGES.INITIALIZING;
  }
};

/**
 * 세션 ID 유효성을 검증하는 함수
 * @param sessionIds - 검증할 세션 ID 객체
 * @returns 유효성 검증 결과
 */
export const validateSessionIds = (sessionIds: { cameraSessionId: string | null; microphoneSessionId: string | null }): boolean => {
  return !!(sessionIds.cameraSessionId && sessionIds.microphoneSessionId);
};

/**
 * 대화 정보 유효성을 검증하는 함수
 * @param conversationInfo - 검증할 대화 정보
 * @returns 유효성 검증 결과
 */
export const validateConversationInfo = (conversationInfo: {
  questionText: string;
  questionId: number;
  conversationId: string;
  userId: string;
}): boolean => {
  return !!(
    conversationInfo.questionText &&
    conversationInfo.questionId &&
    conversationInfo.conversationId &&
    conversationInfo.userId
  );
};

/**
 * 권한 상태를 확인하는 함수
 * @param permissions - 확인할 권한 상태
 * @returns 모든 권한이 허용되었는지 여부
 */
export const arePermissionsGranted = (permissions: { camera: boolean | null; microphone: boolean | null }): boolean => {
  return permissions.camera === true && permissions.microphone === true;
};

/**
 * 테스트 결과를 확인하는 함수
 * @param testResults - 확인할 테스트 결과
 * @returns 모든 테스트가 성공했는지 여부
 */
export const areTestsPassed = (testResults: { cameraTest: string; microphoneTest: string }): boolean => {
  return testResults.cameraTest === 'success' && testResults.microphoneTest === 'success';
};

/**
 * 현재 시간을 타임스탬프로 반환하는 함수
 * @returns 현재 시간의 타임스탬프
 */
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

/**
 * 지연 시간을 생성하는 Promise 함수
 * @param ms - 지연할 시간 (밀리초)
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 에러 객체에서 메시지를 추출하는 함수
 * @param error - 에러 객체
 * @returns 에러 메시지
 */
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.error) {
    return error.error;
  }
  return ERROR_MESSAGES.ERROR;
};

/**
 * 로그 메시지를 포맷팅하는 함수
 * @param step - 플로우 단계
 * @param message - 로그 메시지
 * @returns 포맷팅된 로그 메시지
 */
export const formatLogMessage = (step: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${step}: ${message}`;
};

/**
 * 세션 ID를 마스킹하는 함수 (로그용)
 * @param sessionId - 마스킹할 세션 ID
 * @returns 마스킹된 세션 ID
 */
export const maskSessionId = (sessionId: string | null): string => {
  if (!sessionId) return 'null';
  if (sessionId.length <= 8) return sessionId;
  return `${sessionId.substring(0, 4)}...${sessionId.substring(sessionId.length - 4)}`;
};
