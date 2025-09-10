// API 설정
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const isWeb = typeof window !== 'undefined';

export const API_BASE_URL = (() => {
    if (isWeb) {
        return isDevelopment 
            ? process.env.EXPO_PUBLIC_API_BASE_URL_DEV_WEB || 'http://localhost:8080'
            : process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://your-backend-domain.com';
    } else {
        return isDevelopment 
            ? process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://172.30.1.81:8080'
            : process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://your-backend-domain.com';
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
    // 질문 관련
    questions: '/api/questions',
    question: (id: number) => `/api/questions/${id}`,
    // 대화 관련
    conversations: {
        create: '/api/conversations',
        get: '/api/conversations',
        update: '/api/conversations',
    },
    // 앨범 관련
    albums: {
        create: '/api/albums',
        get: '/api/albums',
        update: '/api/albums',
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