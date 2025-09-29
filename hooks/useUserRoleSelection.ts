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
    const { kakaoUserInfo, jwtToken, code, token, fromDeepLink } = route.params || {};
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        // 딥링크로 전달된 token이 있으면 바로 로그인 처리
        if (fromDeepLink && token && code) {
            handleDeepLinkLogin(code, token);
        }
        // code가 있으면 카카오 사용자 정보 조회
        else if (code && !kakaoUserInfo) {
            loadKakaoUserInfo();
        }
    }, [code, token, fromDeepLink]);

    // userType이 이미 있는 경우 해당 홈으로 이동
    useEffect(() => {
        if (user?.userType) {
            // userType이 유효한 경우에만 홈으로 이동
            const hasValidUserType = user.userType && 
                                  user.userType !== null && 
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

    const handleDeepLinkLogin = async (code: string, token: string) => {
        try {
            console.log('딥링크 로그인 처리 시작:', code, token);
            setIsLoading(true);
            
            // JWT 토큰에서 userId 추출
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('JWT 토큰 페이로드:', payload);
            
            const userId = payload.userId?.toString();
            if (!userId) {
                throw new Error('JWT 토큰에서 userId를 찾을 수 없습니다.');
            }
            
            // API로 사용자 정보 조회
            const { userService } = await import('../services/user/userService');
            const userResponse = await userService.getUserById(userId, token);
            
            if (userResponse.success && userResponse.user) {
                const user = userResponse.user;
                console.log('사용자 정보 조회 성공:', user);
                
                // 사용자 정보를 UserContext에 저장
                const userData = {
                    id: user.id.toString(),
                    userId: user.id.toString(),
                    name: user.nickname || '사용자',
                    phone: user.phoneNumber || '',
                    userType: user.userType ? (user.userType as UserType) : null,
                    profileImage: user.profileImageUrl || '',
                    token: token,
                    gender: user.gender || ''
                };
                
                console.log('저장할 사용자 데이터:', userData);
                await login(userData);
                console.log('사용자 정보가 UserContext에 저장되었습니다.');
                
                // userType이 있으면 해당 홈으로, 없으면 역할 선택 화면 유지
                if (userData.userType && 
                    userData.userType !== null && 
                    (userData.userType === UserType.SENIOR || userData.userType === UserType.GUARDIAN)) {
                    
                    if (userData.userType === UserType.SENIOR) {
                        navigation.navigate('MainTabs');
                    } else if (userData.userType === UserType.GUARDIAN) {
                        navigation.navigate('GuardianMain');
                    }
                }
                // userType이 없으면 역할 선택 화면에서 계속 진행
            } else {
                console.error('사용자 정보 조회 실패:', userResponse.message);
                Alert.alert('로그인 실패', userResponse.message || '사용자 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('딥링크 로그인 처리 실패:', error);
            Alert.alert('오류', '로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
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
                // 토큰이 없으면 로그인 화면으로 이동
                if (!user.token) {
                    console.log('토큰이 없어서 로그인 화면으로 이동');
                    Alert.alert('인증 오류', '로그인 정보가 없습니다. 다시 로그인해주세요.', [
                        {
                            text: '확인',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]);
                    return;
                }
                
                // 시니어는 바로 역할 업데이트하고 홈으로 이동
                if (selectedUserType === UserType.SENIOR) {
                    await updateUser({ userType: selectedUserType });
                    navigation.navigate('MainTabs');
                } else if (selectedUserType === UserType.GUARDIAN) {
                    // 보호자는 역할 업데이트 없이 연결 화면으로 이동
                    navigation.navigate('GuardianConnection');
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
