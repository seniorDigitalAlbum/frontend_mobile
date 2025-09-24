import { Alert } from 'react-native';
import { UserType } from '../../contexts/UserContext';
import { createTestUserData, createKakaoUserData } from '../../utils/userUtils';
import kakaoAuthService from '../kakaoAuthService';

export class AuthFlowService {
    /**
     * 테스트 로그인 처리
     */
    static async handleTestLogin(
        userType: UserType, 
        login: Function, 
        navigation: any
    ): Promise<void> {
        try {
            const testUserData = createTestUserData(userType);
            await login(testUserData);
            console.log('테스트 로그인 완료:', testUserData);
            
            // 사용자 타입에 따른 분기 처리
            if (userType === UserType.GUARDIAN) {
                navigation.navigate('GuardianConnectionTest');
            } else if (userType === UserType.SENIOR) {
                // 시니어인 경우 메인 화면으로 이동
                console.log('시니어 로그인 완료, MainTabs로 이동');
                navigation.navigate('MainTabs');
            }
        } catch (error) {
            console.error('테스트 로그인 실패:', error);
            Alert.alert('오류', '테스트 로그인 처리 중 오류가 발생했습니다.');
            throw error;
        }
    }

    /**
     * 카카오 로그인 처리
     */
    static async handleKakaoLogin(
        currentUserInfo: any,
        userType: UserType,
        login: Function,
        navigation: any
    ): Promise<void> {
        try {
            // 1. 백엔드에 역할 업데이트 요청
            const updateResult = await kakaoAuthService.updateUserType(
                currentUserInfo.kakaoId.toString(),
                userType
            );

            if (!updateResult.success) {
                Alert.alert('오류', updateResult.message || '역할 업데이트에 실패했습니다.');
                return;
            }

            console.log('백엔드 역할 업데이트 완료:', updateResult);
            
            // 2. UserContext에 사용자 정보 설정
            const loginUserData = createKakaoUserData(currentUserInfo, userType);
            await login(loginUserData);
            console.log('카카오 로그인 완료:', loginUserData);
            
            // 사용자 타입에 따른 분기 처리
            if (userType === UserType.GUARDIAN) {
                // 보호자인 경우: 시니어 연결 화면으로 이동
                navigation.navigate('GuardianConnection');
            } else {
                // 시니어인 경우: 바로 메인 화면으로 이동 (UserContext가 자동으로 처리)
                // 추가 처리 없음
            }
        } catch (error) {
            console.error('카카오 로그인 처리 실패:', error);
            Alert.alert('오류', '로그인 처리 중 오류가 발생했습니다.');
            throw error;
        }
    }

    /**
     * 카카오 사용자 정보 조회
     */
    static async loadKakaoUserInfo(
        code: string,
        setUserData: Function,
        setIsLoading: Function,
        navigation: any
    ): Promise<void> {
        try {
            setIsLoading(true);
            const data = await kakaoAuthService.getUserInfoByCode(code);
            
            if (data.success && data.kakaoUserInfo) {
                setUserData(data);
            } else {
                Alert.alert('오류', '카카오 사용자 정보를 가져올 수 없습니다.');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error('카카오 사용자 정보 조회 실패:', error);
            Alert.alert('오류', '카카오 로그인에 실패했습니다.');
            navigation.navigate('Login');
        } finally {
            setIsLoading(false);
        }
    }
}
