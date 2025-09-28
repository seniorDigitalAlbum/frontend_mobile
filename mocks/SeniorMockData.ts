import { SeniorInfo } from '../services/guardianService';

export interface TestSeniorInfo {
    id: number;
    name: string;
    kakaoNickname?: string;
    kakaoProfileImage?: string;
}

export const TEST_SENIORS: TestSeniorInfo[] = [
    {
        id: 1,
        name: '김할아버지',
        kakaoNickname: '김할아버지',
        kakaoProfileImage: undefined
    },
    {
        id: 2,
        name: '이할머니',
        kakaoNickname: '이할머니',
        kakaoProfileImage: undefined
    },
    {
        id: 999, // userMockData의 test-user-123과 연결
        name: '나림',
        kakaoNickname: '나림',
        kakaoProfileImage: undefined
    }
];

/**
 * 테스트 시니어 데이터를 SeniorInfo 형태로 변환
 */
export const convertToSeniorInfo = (testSenior: TestSeniorInfo): SeniorInfo => {
    return {
        id: testSenior.id,
        name: testSenior.name,
        kakaoNickname: testSenior.kakaoNickname,
        kakaoProfileImage: testSenior.kakaoProfileImage
    };
};
