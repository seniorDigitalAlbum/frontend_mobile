import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase 설정
// 실제 프로젝트에서는 환경변수로 관리해야 함
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Auth 인스턴스 생성
export const auth = getAuth(app);

export default app;
