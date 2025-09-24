import { UserType } from '../contexts/UserContext';
import { MOCK_USERS } from '../mocks/userMockData';

export interface TestUserData {
    id: string;
    userId: string;
    name: string;
    phone: string;
    userType: UserType;
    profileImage: string | null;
    gender: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface KakaoUserData {
    id: string;
    userId: string;
    name: string;
    phone: string;
    userType: UserType;
    profileImage: string | null;
    gender: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * 테스트용 사용자 데이터 생성
 */
export const createTestUserData = (userType: UserType): TestUserData => {
    return {
        ...MOCK_USERS.TEST_USER,
        userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

/**
 * 카카오 사용자 데이터 생성
 */
export const createKakaoUserData = (kakaoInfo: any, userType: UserType): KakaoUserData => {
    return {
        id: kakaoInfo.kakaoId.toString(),
        userId: `kakao_${kakaoInfo.kakaoId}`,
        name: kakaoInfo.nickname || '카카오 사용자',
        phone: '', // 카카오에서는 전화번호를 제공하지 않음
        userType,
        profileImage: kakaoInfo.profileImageUrl,
        gender: kakaoInfo.gender, // 카카오 성별 정보
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

/**
 * 사용자 표시 이름 가져오기
 */
export const getUserDisplayName = (kakaoUserInfo?: any, userData?: any): string => {
    return kakaoUserInfo?.nickname || userData?.kakaoUserInfo?.nickname || '사용자';
};

/**
 * 사용자 데이터 검증
 */
export const isValidUserData = (userData: any): boolean => {
    return userData && userData.id && userData.userId && userData.userType;
};

/**
 * 사용자 타입에 따른 기본 설정 가져오기
 */
export const getUserTypeDefaults = (userType: UserType) => {
    const defaults = {
        [UserType.SENIOR]: {
            profileImage: null,
            phone: '010-0000-0000'
        },
        [UserType.GUARDIAN]: {
            profileImage: null,
            phone: '010-0000-0000'
        }
    };
    
    return defaults[userType] || defaults[UserType.SENIOR];
};
