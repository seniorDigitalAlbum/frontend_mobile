/**
 * 대화 플로우 관련 타입 정의
 * 
 * 이 파일은 대화 세션, 플로우 상태, 사용자 응답 등
 * 대화 관련 모든 타입을 중앙에서 관리합니다.
 */

// 대화 플로우 단계 정의
export type FlowStep = 
  | 'permissions'      // B-1: 카메라/마이크 권한 요청
  | 'camera_test'      // B-2: 카메라 프리뷰 테스트
  | 'mic_test'         // B-3: 마이크 1초 녹음 테스트
  | 'tts_playback'     // C-1: AI 질문 TTS 재생
  | 'session_create'   // D-1: 카메라·마이크 세션 생성
  | 'user_response'    // D-2: 사용자 답변 처리
  | 'session_cleanup'  // 세션 종료
  | 'complete';        // 완료

// 테스트 결과 상태
export type TestResult = 'pending' | 'success' | 'failed';

// 권한 상태
export interface PermissionState {
  camera: boolean | null;
  microphone: boolean | null;
}

// 세션 ID 정보
export interface SessionIds {
  cameraSessionId: string | null;
  microphoneSessionId: string | null;
}

// 대화 정보
export interface ConversationInfo {
  questionText: string;
  questionId: number;
  conversationId: string;
  userId: string;
}

// 사용자 응답 데이터
export interface UserResponse {
  transcribedText: string | null;
  emotionAnalysis: any | null;
  timestamp: number | null;
}

// 테스트 결과
export interface TestResults {
  cameraTest: TestResult;
  microphoneTest: TestResult;
}

// 대화 상태 (Context에서 사용)
export interface ConversationState {
  // 플로우 상태
  currentStep: FlowStep;
  isInitialized: boolean;
  isProcessing: boolean;
  
  // 세션 정보
  sessionIds: SessionIds;
  isSessionActive: boolean;
  
  // 대화 정보
  conversationInfo: ConversationInfo;
  
  // 사용자 응답 데이터
  userResponse: UserResponse;
  
  // 권한 상태
  permissions: PermissionState;
  
  // 테스트 결과
  testResults: TestResults;
  
  // 에러 상태
  error: string | null;
}

// Context 액션 타입
export type ConversationAction =
  | { type: 'INITIALIZE'; payload: ConversationInfo }
  | { type: 'SET_STEP'; payload: FlowStep }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SESSION_IDS'; payload: SessionIds }
  | { type: 'SET_SESSION_ACTIVE'; payload: boolean }
  | { type: 'SET_PERMISSIONS'; payload: PermissionState }
  | { type: 'SET_CAMERA_TEST_RESULT'; payload: TestResult }
  | { type: 'SET_MICROPHONE_TEST_RESULT'; payload: TestResult }
  | { type: 'SET_USER_RESPONSE'; payload: UserResponse }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// ConversationFlow 컴포넌트 Props
export interface ConversationFlowProps {
  questionText: string;
  questionId: number;
  conversationId: string;
  userId: string;
  onFlowComplete: (result: any) => void;
  onFlowError: (error: string) => void;
}

// 세션 생성 요청 파라미터
export interface SessionCreateParams {
  userId: string;
  conversationId: string;
  resolution: string;
  frameRate: number;
  audioFormat: string;
  sampleRate: number;
}

// 세션 생성 결과
export interface SessionCreateResult {
  success: boolean;
  cameraSessionId?: string;
  microphoneSessionId?: string;
  error?: string;
}

// 사용자 응답 처리 파라미터
export interface UserResponseParams {
  cameraSessionId: string;
  microphoneSessionId: string;
  conversationId: string;
  userId: string;
}

// 사용자 응답 처리 결과
export interface UserResponseResult {
  success: boolean;
  transcribedText?: string;
  emotionAnalysis?: any;
  error?: string;
}
