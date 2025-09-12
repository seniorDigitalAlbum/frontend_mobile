/**
 * 대화 플로우 관련 상수 정의
 * 
 * 이 파일은 대화 세션, API 엔드포인트, 설정값 등
 * 대화 관련 모든 상수를 중앙에서 관리합니다.
 */

// API 엔드포인트
export const API_ENDPOINTS = {
  // 카메라 세션 관련
  CAMERA_SESSION: '/camera-sessions',
  CAMERA_SESSION_END: (sessionId: string) => `/camera-sessions/${sessionId}`,
  
  // 마이크 세션 관련
  MICROPHONE_SESSION: '/mic-sessions',
  MICROPHONE_SESSION_END: (sessionId: string) => `/mic-sessions/${sessionId}`,
  
  // 대화 관련
  CONVERSATION: '/conversations',
  CONVERSATION_MESSAGE: '/conversation-messages',
  
  // GPT 관련
  GPT_GENERATE: '/gpt/generate-conversation',
  
  // STT/TTS 관련
  STT_TRANSCRIBE: '/stt/transcribe',
  TTS_SYNTHESIZE: '/tts/synthesize',
  
  // 감정 분석 관련
  EMOTION_ANALYSIS: '/user-emotion-analysis/analyze',
} as const;

// 세션 설정 기본값
export const SESSION_DEFAULTS = {
  // 카메라 설정
  CAMERA: {
    RESOLUTION: '1280x720',
    FRAME_RATE: 30,
  },
  
  // 마이크 설정
  MICROPHONE: {
    AUDIO_FORMAT: 'WAV',
    SAMPLE_RATE: 44100,
  },
} as const;

// 플로우 단계별 메시지
export const FLOW_MESSAGES = {
  INITIALIZING: '초기화 중...',
  PERMISSIONS_REQUEST: '카메라와 마이크 권한을 요청합니다.',
  PERMISSIONS_DENIED: '카메라와 마이크 권한이 필요합니다.',
  CAMERA_TEST: '카메라 프리뷰 테스트',
  CAMERA_TEST_DESCRIPTION: '카메라가 정상적으로 작동하는지 확인합니다.',
  MICROPHONE_TEST: '마이크 테스트',
  MICROPHONE_TEST_DESCRIPTION: '마이크가 정상적으로 작동하는지 확인합니다.',
  TTS_PLAYBACK: 'AI 질문 재생 중...',
  SESSION_CREATE: '세션 생성 중...',
  USER_RESPONSE: '사용자 답변 처리 중...',
  SESSION_CLEANUP: '세션 정리 중...',
  COMPLETE: '대화 완료',
  ERROR: '오류가 발생했습니다.',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  FLOW_INITIALIZATION_FAILED: '플로우 초기화에 실패했습니다.',
  PERMISSIONS_REQUIRED: '카메라와 마이크 권한이 필요합니다.',
  SESSION_CREATION_FAILED: '세션 생성에 실패했습니다.',
  USER_RESPONSE_PROCESSING_FAILED: '사용자 답변 처리에 실패했습니다.',
  SESSION_CLEANUP_FAILED: '세션 정리에 실패했습니다.',
  TTS_PLAYBACK_FAILED: 'TTS 재생에 실패했습니다.',
  STT_TRANSCRIPTION_FAILED: 'STT 변환에 실패했습니다.',
  EMOTION_ANALYSIS_FAILED: '감정 분석에 실패했습니다.',
} as const;

// 타이밍 설정
export const TIMING = {
  TTS_PLAYBACK_DELAY: 2000, // TTS 재생 완료 대기 시간 (ms)
  MICROPHONE_TEST_DURATION: 1000, // 마이크 테스트 녹음 시간 (ms)
  COUNTDOWN_DURATION: 3000, // 카운트다운 시간 (ms)
} as const;

// 오디오 설정
export const AUDIO_SETTINGS = {
  // iOS 오디오 세션 설정
  IOS_PLAYBACK_MODE: {
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  },
  
  IOS_RECORD_MODE: {
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  },
} as const;

// 파일 형식
export const FILE_FORMATS = {
  AUDIO: {
    MP3: 'mp3',
    WAV: 'wav',
    AAC: 'aac',
  },
  VIDEO: {
    MP4: 'mp4',
    MOV: 'mov',
  },
} as const;

// 상태 값
export const STATUS_VALUES = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;
