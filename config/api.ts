// 환경변수 사용을 위한 설정
const getEnvVar = (key: string, defaultValue: string) => {
  // React Native에서는 process.env를 직접 사용할 수 없으므로
  // __DEV__ 플래그나 별도 설정 파일을 사용
  return __DEV__ ? defaultValue : defaultValue;
};

// API 설정
export const API_CONFIG = {
  // 개발 환경
  development: {
    baseUrl: getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
    timeout: parseInt(getEnvVar('API_TIMEOUT', '10000')),
  },
  // 스테이징 환경
  staging: {
    baseUrl: getEnvVar('API_BASE_URL', 'https://staging-api.yourdomain.com/api'),
    timeout: parseInt(getEnvVar('API_TIMEOUT', '15000')),
  },
  // 프로덕션 환경
  production: {
    baseUrl: getEnvVar('API_BASE_URL', 'https://api.yourdomain.com/api'),
    timeout: parseInt(getEnvVar('API_TIMEOUT', '20000')),
  },
};

// 현재 환경 (환경변수에서 가져오거나 기본값 사용)
export const CURRENT_ENV = getEnvVar('NODE_ENV', 'development');

export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV as keyof typeof API_CONFIG] || API_CONFIG.development;
};

// API 엔드포인트
export const API_ENDPOINTS = {
  questions: '/questions',
  question: (id: number) => `/questions/${id}`,
  notifications: '/notifications',
  notification: (id: string) => `/notifications/${id}`,
  markNotificationAsRead: (id: string) => `/notifications/${id}/read`,
  markAllNotificationsAsRead: '/notifications/read-all',
  profile: '/profile',
  updateProfile: '/profile',
  updateProfileImage: '/profile/image',
  // 추가 엔드포인트들...
};