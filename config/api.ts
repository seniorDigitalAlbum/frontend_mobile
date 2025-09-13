// API 설정
import { Platform } from 'react-native';
import Constants from 'expo-constants';

//동적 ip 가져오는 함수
const getDevServerIp = () => {

  const debuggerHost = Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (!debuggerHost) {
    return null;
  }
  // 포트 번호 제외
  return debuggerHost.split(':')[0];
};

const isDevelopment = __DEV__;
const isWeb = Platform.OS === 'web';

export const API_BASE_URL = (() => {
  if (isDevelopment) {
    if (isWeb) {
      return process.env.EXPO_PUBLIC_API_BASE_URL_DEV_WEB || 'http://localhost:8080';
    } else {
      // 네이티브(Expo Go) 환경일 때 동적 ip get
      const devServerIp = getDevServerIp();
      
      if (devServerIp) {
        return `http://${devServerIp}:8080`;
      }
      
      // 실패 시 fall back
      return process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://172.30.1.81:8080';
    }
  } else {
    // 프로덕션 환경
    return process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://your-backend-domain.com';
  }
})();

// API 엔드포인트
export const API_ENDPOINTS = {
    // TTS 관련
    tts: {
        health: '/api/tts/health',
        simple: '/api/tts/simple',
        synthesize: '/api/tts/synthesize',
    },
    // STT 관련
    stt: {
        health: '/api/stt/health',
        transcribe: '/api/stt/transcribe',
        realtime: '/api/stt/realtime',
    },
    // 질문 관련
    questions: '/api/questions',
    question: (id: number) => `/api/questions/${id}`,
    questionCount: '/api/questions/count',
    randomQuestion: '/api/questions/random',
    // 대화 관련
    conversations: {
        create: '/api/conversations',
        get: (id: number) => `/api/conversations/${id}`,
        getByUser: (userId: string) => `/api/conversations/user/${userId}`,
        getActive: (userId: string) => `/api/conversations/user/${userId}/active`,
        getByQuestion: (questionId: number) => `/api/conversations/question/${questionId}`,
        updateStatus: (id: number) => `/api/conversations/${id}/status`,
        end: (id: number) => `/api/conversations/${id}/end`,
        getMessages: (id: number) => `/api/conversations/${id}/messages`,
        saveUserMessage: (id: number) => `/api/conversations/${id}/messages/user`,
        saveAIMessage: (id: number) => `/api/conversations/${id}/messages/ai`,
        createDummy: (userId: string) => `/api/conversations/dummy/${userId}`,
        getContext: (messageId: number) => `/api/conversations/context/${messageId}`,
        health: '/api/conversations/health',
    },
    // 앨범 관련
    albums: {
        create: '/api/albums',
        get: (id: number) => `/api/albums/${id}`,
        getByUser: (userId: string) => `/api/albums/user/${userId}`,
        getCount: (userId: string) => `/api/albums/user/${userId}/count`,
        getByConversation: (conversationId: number) => `/api/albums/conversation/${conversationId}`,
        update: (id: number) => `/api/albums/${id}`,
        delete: (id: number) => `/api/albums/${id}`,
        getByEmotion: (userId: string, emotion: string) => `/api/albums/user/${userId}/emotion/${emotion}`,
        createDummy: (userId: string) => `/api/albums/dummy/${userId}`,
        health: '/api/albums/health',
    },
    // 카메라 관련
    camera: {
        createSession: '/api/camera/session',
        getSession: (sessionId: string) => `/api/camera/session/${sessionId}`,
        updateStatus: (sessionId: string) => `/api/camera/session/${sessionId}/status`,
        endSession: (sessionId: string) => `/api/camera/session/${sessionId}`,
        getUserSessions: (userId: string) => `/api/camera/sessions/user/${userId}`,
        health: '/api/camera/health',
    },
    // 마이크 관련
    microphone: {
        createSession: '/api/microphone/session',
        getSession: (sessionId: string) => `/api/microphone/session/${sessionId}`,
        updateStatus: (sessionId: string) => `/api/microphone/session/${sessionId}/status`,
        updateSettings: (sessionId: string) => `/api/microphone/session/${sessionId}/settings`,
        endSession: (sessionId: string) => `/api/microphone/session/${sessionId}`,
        getUserSessions: (userId: string) => `/api/microphone/sessions/user/${userId}`,
        startSpeech: '/api/microphone/speech/start',
        endSpeech: '/api/microphone/speech/end',
        health: '/api/microphone/health',
    },
    // 미디어 파일 관련
    media: {
        upload: '/api/media/upload',
        get: '/api/media',
    },
    // 알림 관련
    notifications: '/api/notifications',
    notification: (id: string) => `/api/notifications/${id}`,
    markNotificationAsRead: (id: string) => `/api/notifications/${id}/read`,
    markAllNotificationsAsRead: '/api/notifications/read-all',
    // 프로필 관련
    profile: '/api/profile',
    updateProfile: '/api/profile',
    updateProfileImage: '/api/profile/image',
    // 감정 분석 관련
    emotion: {
        predict: '/predict_emotion',
        health: '/health',
    },
};

// API 설정 가져오기
export const getApiConfig = () => {
    return {
        baseUrl: API_BASE_URL,
        timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
        headers: {
            'Content-Type': 'application/json',
        },
    };
};