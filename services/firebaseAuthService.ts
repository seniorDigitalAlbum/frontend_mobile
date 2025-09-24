import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface VerificationResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

interface VerifyCodeResponse {
  success: boolean;
  message: string;
  isVerified: boolean;
  user?: any;
}

class FirebaseAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  // reCAPTCHA 초기화 (웹용)
  initializeRecaptcha(containerId: string = 'recaptcha-container') {
    if (typeof window !== 'undefined') {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }
  }

  // 전화번호 인증번호 전송
  async sendVerificationCode(phoneNumber: string): Promise<VerificationResponse> {
    try {
      // 전화번호 형식 변환 (+82 10-1234-5678 -> +821012345678)
      const formattedPhone = this.formatPhoneNumberForFirebase(phoneNumber);
      
      console.log('Firebase SMS 전송:', formattedPhone);

      // reCAPTCHA 초기화 (웹에서만)
      if (typeof window !== 'undefined' && !this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }

      // Firebase SMS 전송
      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier!
      );

      return {
        success: true,
        message: '인증번호가 전송되었습니다.',
        verificationId: 'firebase_verification'
      };

    } catch (error: any) {
      console.error('Firebase SMS 전송 실패:', error);
      
      let errorMessage = '인증번호 전송에 실패했습니다.';
      
      // Firebase 에러 코드별 메시지
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = '올바르지 않은 전화번호 형식입니다.';
          break;
        case 'auth/too-many-requests':
          errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = '일일 SMS 전송 한도를 초과했습니다.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // 인증번호 검증
  async verifyCode(code: string): Promise<VerifyCodeResponse> {
    try {
      if (!this.confirmationResult) {
        throw new Error('인증번호 전송을 먼저 해주세요.');
      }

      console.log('Firebase 인증번호 검증:', code);

      // Firebase 인증번호 검증
      const result = await this.confirmationResult.confirm(code);
      
      return {
        success: true,
        message: '인증이 완료되었습니다.',
        isVerified: true,
        user: result.user
      };

    } catch (error: any) {
      console.error('Firebase 인증번호 검증 실패:', error);
      
      let errorMessage = '인증번호가 올바르지 않습니다.';
      
      // Firebase 에러 코드별 메시지
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = '인증번호가 올바르지 않습니다.';
          break;
        case 'auth/code-expired':
          errorMessage = '인증번호가 만료되었습니다. 다시 전송해주세요.';
          break;
        case 'auth/session-expired':
          errorMessage = '인증 세션이 만료되었습니다. 다시 전송해주세요.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
        isVerified: false
      };
    }
  }

  // 전화번호를 Firebase 형식으로 변환
  private formatPhoneNumberForFirebase(phoneNumber: string): string {
    // 010-1234-5678 -> +821012345678
    const numbers = phoneNumber.replace(/[^0-9]/g, '');
    
    if (numbers.startsWith('010')) {
      return `+82${numbers.substring(1)}`;
    } else if (numbers.startsWith('82')) {
      return `+${numbers}`;
    } else {
      return `+82${numbers}`;
    }
  }

  // reCAPTCHA 정리
  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }

  // 전화번호 형식 검증
  isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  // 전화번호 정규화 (하이픈 제거)
  normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^0-9]/g, '');
  }

  // 전화번호 포맷팅
  formatPhoneNumber(phoneNumber: string): string {
    const numbers = phoneNumber.replace(/[^0-9]/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  }
}

export default new FirebaseAuthService();
