import { UserType } from '../contexts/UserContext';

export interface MockUserData {
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

export const MOCK_USERS = {
    TEST_USER: {
        id: 'test-user-123',
        userId: 'test_user_123',
        name: '나림',
        phone: '010-0000-0000',
        profileImage: null,
        gender: null,
        token: 'test-jwt-token-123'
    },
    
    KAKAO_USER: {
        id: 'kakao-user-456',
        userId: 'kakao_456',
        name: '카카오 사용자',
        phone: '',
        profileImage: 'https://example.com/profile.jpg',
        gender: 'male'
    }
};

export const MOCK_KAKAO_INFO = {
    kakaoId: 123456789,
    nickname: '카카오닉네임',
    profileImageUrl: 'https://example.com/kakao-profile.jpg',
    thumbnailImageUrl: 'https://example.com/kakao-thumbnail.jpg',
    gender: 'female'
};
