# DearMind Frontend

React Native Expo 앱의 웹 버전입니다. 시니어 사용자를 위한 고급 접근성 기능이 포함되어 있습니다.

## 프로젝트 구조

```
frontend_mobile/
├── App.tsx                          # 앱 진입점
├── package.json                     # 의존성 관리
├── tsconfig.json                    # TypeScript 설정
├── tailwind.config.js               # Tailwind CSS 설정
├── app.json                         # Expo 앱 설정
├── eas.json                         # EAS 빌드 설정
├── babel.config.js                  # Babel 설정
├── metro.config.js                  # Metro 번들러 설정
├── postcss.config.js                # PostCSS 설정
├── global.css                       # 전역 스타일
├── README.md                        # 프로젝트 문서
├── ACCESSIBILITY_GUIDE.md           # 접근성 가이드
│
├── components/                      # 재사용 가능한 UI 컴포넌트
│   ├── AICharacter.tsx              # AI 캐릭터 컴포넌트
│   ├── AlbumCard.tsx                # 앨범 카드
│   ├── AlbumHero.tsx                # 앨범 히어로 섹션
│   ├── AlbumView.tsx                # 앨범 뷰어
│   ├── ChatBallon.tsx               # 채팅 말풍선
│   ├── ConversationFlow.tsx         # 대화 플로우
│   ├── AnswerMic.tsx                # 음성 답변 버튼
│   ├── GuardianDashboard.tsx        # 보호자 대시보드
│   ├── UserTypeSelector.tsx         # 사용자 타입 선택
│   ├── AccessibilityWrapper.tsx     # 접근성 래퍼
│   └── ...                          # 기타 UI 컴포넌트들
│
├── screens/                         # 화면 컴포넌트
│   ├── Home.tsx                     # 메인 홈 화면
│   ├── Chat.tsx                     # 채팅 화면
│   ├── Conversation.tsx             # 대화 화면
│   ├── Album.tsx                    # 앨범 목록
│   ├── AlbumDetail.tsx              # 앨범 상세
│   ├── Login.tsx                    # 로그인 화면
│   ├── KakaoConnection.tsx          # 카카오 연동
│   ├── GuardianMain.tsx             # 보호자 메인
│   ├── DiaryResult.tsx              # 일기 결과
│   └── ...                          # 기타 화면들
│
├── services/                        # 비즈니스 로직 서비스
│   ├── api/                         # API 통신
│   ├── audio/                       # 오디오 처리
│   ├── cameraService.ts             # 카메라 서비스
│   ├── conversationService.ts       # 대화 관리
│   ├── diaryService.ts              # 일기 기능
│   ├── emotionService.ts            # 감정 분석
│   ├── faceDetectionService.ts      # 얼굴 감지
│   ├── faceRecognitionService.ts    # 얼굴 인식
│   ├── firebaseAuthService.ts       # Firebase 인증
│   ├── kakaoAuthService.ts          # 카카오 인증
│   ├── guardianService.ts           # 보호자 기능
│   ├── notificationService.ts       # 알림 서비스
│   └── ...                          # 기타 서비스들
│
├── contexts/                        # React Context 상태 관리
│   ├── UserContext.tsx              # 사용자 상태
│   ├── ConversationContext.tsx      # 대화 상태
│   ├── DiaryContext.tsx             # 일기 상태
│   └── AccessibilityContext.tsx     # 접근성 설정
│
├── hooks/                           # 커스텀 훅
│   ├── useConversation.ts           # 대화 관련 훅
│   ├── useCameraTest.ts             # 카메라 테스트
│   ├── useMicrophoneTest.ts         # 마이크 테스트
│   ├── useAccessibilityStyles.ts    # 접근성 스타일
│   └── ...                          # 기타 커스텀 훅들
│
├── types/                           # TypeScript 타입 정의
│   ├── conversation.ts              # 대화 관련 타입
│   ├── profile.ts                   # 프로필 타입
│   ├── question.ts                  # 질문 타입
│   └── notification.ts              # 알림 타입
│
├── utils/                           # 유틸리티 함수
│   ├── cameraUtils.ts               # 카메라 유틸리티
│   ├── conversationUtils.ts         # 대화 유틸리티
│   ├── microphoneTestUtils.ts       # 마이크 테스트
│   └── userUtils.ts                 # 사용자 유틸리티
│
├── styles/                          # 스타일 관련 파일
├── assets/                          # 이미지, 폰트 등 정적 자원
├── mocks/                           # 테스트용 목 데이터
├── config/                          # 설정 파일들
├── constants/                       # 상수 정의
├── web/                             # 웹 빌드 결과물
└── dist/                            # 배포용 빌드 결과물
```

## 🌟 주요 기능

### 시니어 접근성 기능
- **큰 글씨 모드**: 텍스트와 UI 요소 크기를 1.4배로 확대
- **스마트 레이아웃 자동 조절**: 큰 글씨 모드에서 가로 배치를 세로 스택 레이아웃으로 자동 변환
- **아이콘 크기 자동 조정**: 큰 글씨 모드에서 아이콘 크기 자동 조정
- **고대비 모드**: 시각 장애인을 위한 고대비 색상 테마
- **터치 영역 확대**: 최소 3.5em × 3.5em 터치 영역 보장
- **설정 영구 저장**: AsyncStorage를 통한 접근성 설정 저장

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 웹 개발 서버 실행
npx expo start --web
```

## ♿ 접근성 기능 사용법

### 설정 방법
1. 앱 실행 후 **MyPage** 화면으로 이동
2. **"접근성 설정"** 섹션에서 원하는 설정 조절:
   - **큰 글씨 모드**: 스위치로 토글 (자동으로 레이아웃 조정)
   - **고대비 모드**: 스위치로 토글

### 자동 적용 기능
- **큰 글씨 모드** 활성화 시:
  - 가로 배치 요소들이 자동으로 세로 스택 레이아웃으로 변환
  - 그리드 레이아웃이 세로 스택으로 자동 변환
  - 아이콘과 버튼 크기가 글씨 크기에 비례하여 자동 조정
  - 터치 영역이 자동으로 확대

### 기술적 특징
- **전역 CSS 클래스**: `!important` 플래그로 기존 스타일 강제 오버라이드
- **React Context**: 전역 접근성 설정 상태 관리
- **AsyncStorage**: 설정 영구 저장
- **반응형 레이아웃**: 모든 화면 크기에 대응

## 🛠️ 빌드

```bash
# 웹용 빌드
npx expo export --platform web
```

## 📦 배포

GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

- 메인 브랜치에 푸시하면 자동으로 배포됩니다.
- 배포된 사이트: https://[username].github.io/[repository-name]

## 📚 추가 문서

- [접근성 기능 상세 가이드](./ACCESSIBILITY_GUIDE.md) - 시니어 접근성 기능의 상세한 사용법과 기술적 구현 내용

## 🎯 타겟 사용자

이 앱은 특히 다음 사용자들을 위해 설계되었습니다:
- **시니어 사용자**: 큰 글씨와 간단한 레이아웃을 선호하는 고령자
- **시각 장애인**: 고대비 모드와 확대된 텍스트가 필요한 사용자
- **모바일 접근성**: 터치 영역이 확대된 모바일 친화적 인터페이스

## 🔧 개발자 정보

### 주요 기술 스택
- **React Native + Expo**: 크로스 플랫폼 모바일 앱 개발
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **TypeScript**: 타입 안전성 보장
- **AsyncStorage**: 로컬 데이터 저장

### 접근성 구현 방식
- **전역 CSS 오버라이드**: `global.css`에서 `!important` 플래그 사용
- **Context API**: React Context를 통한 전역 상태 관리
- **자동 레이아웃 변환**: CSS 클래스 기반 자동 스타일 적용