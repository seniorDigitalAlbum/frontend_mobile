import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { UserType, useUser } from '../contexts/UserContext';
import { getUserDisplayName } from '../utils/userUtils';
import { AuthFlowService } from '../services/user/authFlowService';

interface UseUserRoleSelectionProps {
    route: any;
    navigation: any;
}

export const useUserRoleSelection = ({ route, navigation }: UseUserRoleSelectionProps) => {
    const { user, login, updateUser } = useUser();
    const { kakaoUserInfo, jwtToken, code } = route.params || {};
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        // code가 있으면 카카오 사용자 정보 조회
        if (code && !kakaoUserInfo) {
            loadKakaoUserInfo();
        }
    }, [code]);

    // userType이 이미 있는 경우 해당 홈으로 이동
    useEffect(() => {
        if (user?.userType) {
            // userType이 유효한 경우에만 홈으로 이동
            const hasValidUserType = user.userType && 
                                  user.userType !== 'null' && 
                                  user.userType !== '' && 
                                  (user.userType === UserType.SENIOR || user.userType === UserType.GUARDIAN);
            
            if (hasValidUserType) {
                console.log('✅ 이미 userType이 설정됨:', user.userType);
                if (user.userType === UserType.GUARDIAN) {
                    navigation.navigate('GuardianMain');
                } else if (user.userType === UserType.SENIOR) {
                    navigation.navigate('MainTabs');
                }
            } else {
                console.log('🆕 userType이 유효하지 않음 - 역할 선택 화면 유지');
            }
        }
    }, [user, navigation]);

    const loadKakaoUserInfo = async () => {
        await AuthFlowService.loadKakaoUserInfo(code, setUserData, setIsLoading, navigation);
    };

    const handleComplete = async () => {
        if (!selectedUserType) {
            Alert.alert('오류', '사용자 유형을 선택해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            
            // UserContext에 사용자가 있는 경우 (카카오 로그인 후)
            if (user) {
                // 사용자 타입 업데이트
                await updateUser({ userType: selectedUserType });
                
                // 다음 화면으로 이동
                if (selectedUserType === UserType.GUARDIAN) {
                    navigation.navigate('GuardianMain');
                } else {
                    navigation.navigate('MainTabs');
                }
                return;
            }
            
            // 테스트 로그인의 경우 (카카오 정보가 없는 경우)
            if (!kakaoUserInfo && !userData?.kakaoUserInfo && !code) {
                await AuthFlowService.handleTestLogin(selectedUserType, login, navigation);
                return;
            }
            
            // 사용자 정보 가져오기 (code에서 로드했거나 기존 파라미터 사용)
            const currentUserInfo = userData?.kakaoUserInfo || kakaoUserInfo;
            
            if (!currentUserInfo) {
                Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
                return;
            }

            await AuthFlowService.handleKakaoLogin(currentUserInfo, selectedUserType, login, navigation);
        } catch (error) {
            console.error('로그인 처리 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getUserDisplayNameValue = () => {
        return getUserDisplayName(kakaoUserInfo, userData);
    };

    return {
        selectedUserType,
        setSelectedUserType,
        isLoading,
        userData,
        handleComplete,
        loadKakaoUserInfo,
        getUserDisplayName: getUserDisplayNameValue
    };
};
