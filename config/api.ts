// API 설정
import { Platform } from 'react-native';
import Constants from 'expo-constants';

//동적 ip 가져오는 함수
export const getDevServerIp = () => {
  // Expo 54에서는 Constants.manifest 사용
  const debuggerHost = (Constants.manifest as any)?.debuggerHost || (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost;
  console.log('🔍 getDevServerIp debuggerHost:', debuggerHost);
  
  if (!debuggerHost) {
    console.log('🔍 debuggerHost가 없음, 172.21.255.132 사용');
    return '172.21.255.132'; // 하드코딩된 IP 사용
  }
  // 포트 번호 제외
  const ip = debuggerHost.split(':')[0];
  console.log('🔍 추출된 IP:', ip);
  return ip;
};

const isDevelopment = __DEV__;
const isWeb = Platform.OS === 'web';


// YOLO 감정 분석 API용 동적 IP 가져오는 함수
// 현재 모바일에서는 로컬로 설정
export const getYoloEmotionApiUrl = () => {
  if (isDevelopment) {
    if (isWeb) {
      return process.env.EXPO_PUBLIC_YOLO_EMOTION_API_URL_DEV_WEB || 'http://localhost:8000';
    } else {
      // 네이티브(Expo Go) 환경일 때 동적 ip 사용
      const devServerIp = getDevServerIp();
      if (devServerIp) {
        return process.env.EXPO_PUBLIC_YOLO_EMOTION_API_URL_DEV || `http://${devServerIp}:8000`;
      }
      return process.env.EXPO_PUBLIC_YOLO_EMOTION_API_URL_DEV || 'http://emotion_yolo:8000';
    }
  } else {
    return process.env.EXPO_PUBLIC_YOLO_EMOTION_API_URL_PROD || 'http://emotion_yolo:8000';
  }
};

// KoBERT 감정 분석 API용 동적 IP 가져오는 함수
export const getKoBERTApiUrl = () => {
  if (isDevelopment) {
    if (isWeb) {
      return process.env.EXPO_PUBLIC_KOBERT_API_URL_DEV_WEB || 'http://localhost:8001';
    } else {
      // 네이티브(Expo Go) 환경일 때 환경변수 우선 확인
      console.log('🔍 KoBERT 환경변수 확인:', process.env.EXPO_PUBLIC_KOBERT_API_URL_DEV);
      if (process.env.EXPO_PUBLIC_KOBERT_API_URL_DEV) {
        console.log('✅ 환경변수 사용:', process.env.EXPO_PUBLIC_KOBERT_API_URL_DEV);
        return process.env.EXPO_PUBLIC_KOBERT_API_URL_DEV;
      }
      
      // 환경변수가 없으면 동적 ip 사용
      const devServerIp = getDevServerIp();
      if (devServerIp) {
        console.log('🔄 동적 IP 사용:', `http://${devServerIp}:8001`);
        return `http://${devServerIp}:8001`;
      }
      console.log('⚠️ Fallback 사용: emotion_kobert:8001');
      return 'http://emotion_kobert:8001';
    }
  } else {
    return process.env.EXPO_PUBLIC_KOBERT_API_URL_PROD || 'http://emotion_kobert:8001';
  }
};


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

/**
 * 공통 API 클라이언트
 * 모든 API 호출에서 JWT 토큰을 자동으로 포함
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * JWT 토큰을 가져오는 함수 (플랫폼별 스토리지에서 가져옴)
   */
  private async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // 웹에서는 localStorage 사용
        const userData = localStorage.getItem('user');
        console.log('🔍 웹에서 토큰 가져오기 시도:', userData ? '데이터 있음' : '데이터 없음');
        console.log('🔍 localStorage 전체 내용:', {
          user: localStorage.getItem('user'),
          userType: localStorage.getItem('userType'),
          keys: Object.keys(localStorage)
        });
        if (userData) {
          const user = JSON.parse(userData);
          const token = user.token || null;
          console.log('🔑 웹에서 토큰 상태:', { hasToken: !!token, tokenLength: token?.length || 0 });
          return token;
        }
      } else {
        // React Native에서는 AsyncStorage 사용
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const userData = await AsyncStorage.default.getItem('user');
        console.log('🔍 네이티브에서 토큰 가져오기 시도:', userData ? '데이터 있음' : '데이터 없음');
        if (userData) {
          const user = JSON.parse(userData);
          const token = user.token || null;
          console.log('🔑 네이티브에서 토큰 상태:', { hasToken: !!token, tokenLength: token?.length || 0 });
          return token;
        }
      }
    } catch (error) {
      console.error('❌ Failed to get token from storage:', error);
    }
    console.log('❌ 토큰을 가져올 수 없음');
    return null;
  }

  /**
   * 공통 요청 메서드
   */
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await this.getToken();
      
      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...(options.headers as Record<string, string>),
      };

      // JWT 토큰이 있으면 Authorization 헤더에 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 API 요청에 JWT 토큰 포함:', endpoint);
      } else {
        console.log('❌ API 요청에 JWT 토큰 없음:', endpoint);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // 401 Unauthorized인 경우 토큰이 무효화된 것으로 간주
        if (response.status === 401) {
          console.log('🔐 401 Unauthorized - 토큰이 무효화됨');
          // 모든 사용자 데이터 제거
          try {
            if (Platform.OS === 'web') {
              // 웹에서는 localStorage 사용 - 모든 사용자 데이터 제거
              localStorage.removeItem('user');
              localStorage.removeItem('userType');
              console.log('🧹 모든 사용자 데이터 제거 완료');
            } else {
              // React Native에서는 AsyncStorage 사용 - 모든 사용자 데이터 제거
              const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
              await AsyncStorage.multiRemove(['user', 'userType']);
              console.log('🧹 모든 사용자 데이터 제거 완료');
            }
          } catch (cleanupError) {
            console.error('❌ 토큰 무효화 후 정리 실패:', cleanupError);
          }
        }
        
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // JSON 파싱 실패 시 원본 텍스트 사용
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// API 클라이언트 인스턴스 생성 및 export
export const apiClient = new ApiClient();
export default apiClient;