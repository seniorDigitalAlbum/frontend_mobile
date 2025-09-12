import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  ConversationState, 
  ConversationAction, 
  ConversationInfo,
  SessionIds,
  PermissionState,
  TestResult,
  UserResponse,
  FlowStep
} from '../types/conversation';
import { STATUS_VALUES } from '../constants/conversation';

/**
 * 대화 플로우의 초기 상태 정의
 * 모든 상태값을 기본값으로 초기화합니다.
 */
const initialState: ConversationState = {
  currentStep: 'permissions',
  isInitialized: false,
  isProcessing: false,
  sessionIds: {
    cameraSessionId: null,
    microphoneSessionId: null,
  },
  isSessionActive: false,
  conversationInfo: {
    questionText: '',
    questionId: 0,
    conversationId: '',
    userId: '',
  },
  userResponse: {
    transcribedText: null,
    emotionAnalysis: null,
    timestamp: null,
  },
  permissions: {
    camera: null,
    microphone: null,
  },
  testResults: {
    cameraTest: STATUS_VALUES.PENDING as TestResult,
    microphoneTest: STATUS_VALUES.PENDING as TestResult,
  },
  error: null,
};

/**
 * 대화 플로우 상태를 관리하는 리듀서 함수
 * 
 * @param state - 현재 상태
 * @param action - 수행할 액션
 * @returns 새로운 상태
 */
function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'INITIALIZE':
      // 대화 플로우 초기화
      return {
        ...state,
        isInitialized: true,
        conversationInfo: action.payload,
        currentStep: 'permissions',
        error: null,
      };
      
    case 'SET_STEP':
      // 현재 플로우 단계 변경
      return {
        ...state,
        currentStep: action.payload,
        error: null,
      };
      
    case 'SET_PROCESSING':
      // 처리 중 상태 변경
      return {
        ...state,
        isProcessing: action.payload,
      };
      
    case 'SET_SESSION_IDS':
      // 세션 ID 설정 및 세션 활성화
      return {
        ...state,
        sessionIds: action.payload,
        isSessionActive: true,
      };
      
    case 'SET_SESSION_ACTIVE':
      // 세션 활성 상태 변경
      return {
        ...state,
        isSessionActive: action.payload,
      };
      
    case 'SET_PERMISSIONS':
      // 권한 상태 설정
      return {
        ...state,
        permissions: action.payload,
      };
      
    case 'SET_CAMERA_TEST_RESULT':
      // 카메라 테스트 결과 설정
      return {
        ...state,
        testResults: {
          ...state.testResults,
          cameraTest: action.payload,
        },
      };
      
    case 'SET_MICROPHONE_TEST_RESULT':
      // 마이크 테스트 결과 설정
      return {
        ...state,
        testResults: {
          ...state.testResults,
          microphoneTest: action.payload,
        },
      };
      
    case 'SET_USER_RESPONSE':
      // 사용자 응답 데이터 설정
      return {
        ...state,
        userResponse: action.payload,
      };
      
    case 'SET_ERROR':
      // 에러 상태 설정 및 처리 중 상태 해제
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
      };
      
    case 'CLEAR_ERROR':
      // 에러 상태 초기화
      return {
        ...state,
        error: null,
      };
      
    case 'RESET':
      // 모든 상태를 초기값으로 리셋
      return initialState;
      
    default:
      // 알 수 없는 액션의 경우 현재 상태 유지
      return state;
  }
}

/**
 * 대화 플로우 Context 생성
 * 상태와 디스패치 함수를 제공하는 Context입니다.
 */
const ConversationContext = createContext<{
  state: ConversationState;
  dispatch: React.Dispatch<ConversationAction>;
} | null>(null);

/**
 * ConversationProvider Props 인터페이스
 */
interface ConversationProviderProps {
  children: ReactNode;
}

/**
 * 대화 플로우 Context Provider 컴포넌트
 * 
 * @param children - Provider로 감쌀 자식 컴포넌트들
 * @returns Context Provider 컴포넌트
 */
export function ConversationProvider({ children }: ConversationProviderProps) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  return (
    <ConversationContext.Provider value={{ state, dispatch }}>
      {children}
    </ConversationContext.Provider>
  );
}

/**
 * 대화 플로우 Context를 사용하는 커스텀 Hook
 * 
 * @returns 상태와 디스패치 함수
 * @throws Error - ConversationProvider 외부에서 사용 시 에러 발생
 */
export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}

/**
 * 대화 플로우 액션 크리에이터 함수들
 * 타입 안전성을 보장하는 액션 생성 함수들을 제공합니다.
 */
export const conversationActions = {
  /**
   * 대화 플로우 초기화 액션 생성
   * @param payload - 대화 정보
   * @returns 초기화 액션
   */
  initialize: (payload: ConversationInfo) => ({
    type: 'INITIALIZE' as const,
    payload,
  }),
  
  /**
   * 플로우 단계 설정 액션 생성
   * @param step - 설정할 플로우 단계
   * @returns 단계 설정 액션
   */
  setStep: (step: FlowStep) => ({
    type: 'SET_STEP' as const,
    payload: step,
  }),
  
  /**
   * 처리 중 상태 설정 액션 생성
   * @param processing - 처리 중 여부
   * @returns 처리 상태 설정 액션
   */
  setProcessing: (processing: boolean) => ({
    type: 'SET_PROCESSING' as const,
    payload: processing,
  }),
  
  /**
   * 세션 ID 설정 액션 생성
   * @param sessionIds - 설정할 세션 ID들
   * @returns 세션 ID 설정 액션
   */
  setSessionIds: (sessionIds: SessionIds) => ({
    type: 'SET_SESSION_IDS' as const,
    payload: sessionIds,
  }),
  
  /**
   * 세션 활성 상태 설정 액션 생성
   * @param active - 세션 활성 여부
   * @returns 세션 활성 상태 설정 액션
   */
  setSessionActive: (active: boolean) => ({
    type: 'SET_SESSION_ACTIVE' as const,
    payload: active,
  }),
  
  /**
   * 권한 상태 설정 액션 생성
   * @param permissions - 설정할 권한 상태
   * @returns 권한 상태 설정 액션
   */
  setPermissions: (permissions: PermissionState) => ({
    type: 'SET_PERMISSIONS' as const,
    payload: permissions,
  }),
  
  /**
   * 카메라 테스트 결과 설정 액션 생성
   * @param result - 테스트 결과
   * @returns 카메라 테스트 결과 설정 액션
   */
  setCameraTestResult: (result: TestResult) => ({
    type: 'SET_CAMERA_TEST_RESULT' as const,
    payload: result,
  }),
  
  /**
   * 마이크 테스트 결과 설정 액션 생성
   * @param result - 테스트 결과
   * @returns 마이크 테스트 결과 설정 액션
   */
  setMicrophoneTestResult: (result: TestResult) => ({
    type: 'SET_MICROPHONE_TEST_RESULT' as const,
    payload: result,
  }),
  
  /**
   * 사용자 응답 설정 액션 생성
   * @param response - 사용자 응답 데이터
   * @returns 사용자 응답 설정 액션
   */
  setUserResponse: (response: UserResponse) => ({
    type: 'SET_USER_RESPONSE' as const,
    payload: response,
  }),
  
  /**
   * 에러 상태 설정 액션 생성
   * @param error - 에러 메시지
   * @returns 에러 상태 설정 액션
   */
  setError: (error: string | null) => ({
    type: 'SET_ERROR' as const,
    payload: error,
  }),
  
  /**
   * 에러 상태 초기화 액션 생성
   * @returns 에러 초기화 액션
   */
  clearError: () => ({
    type: 'CLEAR_ERROR' as const,
  }),
  
  /**
   * 모든 상태 초기화 액션 생성
   * @returns 리셋 액션
   */
  reset: () => ({
    type: 'RESET' as const,
  }),
};
