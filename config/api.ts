// API 설정
// 개발 시: 컴퓨터의 실제 IP 주소 사용 (예: 192.168.1.100)
// 프로덕션 시: 실제 서버 URL 사용
export const API_BASE_URL = 'http://172.30.1.81:8080';

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
        timeout: 30000, // 30초
        headers: {
            'Content-Type': 'application/json',
        },
    };
};