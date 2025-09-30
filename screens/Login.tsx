import { View, Image, TouchableOpacity, Text, Alert, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { whiteToGreenGradientColors } from '../styles/commonStyles';
import kakaoAuthService from '../services/kakaoAuthService';
import { userService } from '../services/user/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useUser, UserType } from '../contexts/UserContext';
import * as WebBrowser from 'expo-web-browser';

const isWeb = Platform.OS === 'web';

export default function Login() {
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginUser } = useUser();

    // [웹 전용] 페이지 로드 시 URL에 토큰 또는 code가 있으면 로그인 처리
    useEffect(() => {
        if (isWeb) {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const code = urlParams.get('code');
            
            if (token) {
                // 기존 방식: 토큰이 직접 전달된 경우
                handleLoginSuccessWithToken(token);
                // URL에서 토큰 파라미터 정리
                window.history.replaceState({}, '', window.location.pathname);
            } else if (code) {
                // 새로운 방식: code로 토큰 교환
                handleLoginWithCode(code);
                // URL에서 code 파라미터 정리
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    // [웹 전용] code로 토큰 교환 후 로그인 처리
    const handleLoginWithCode = async (code: string) => {
        setIsLoading(true);
        try {
            const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL_DEV_WEB}/api/auth/kakao/exchange-token`;
            console.log('🔍 API URL:', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `code=${encodeURIComponent(code)}`
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '토큰 교환에 실패했습니다.');
            }

            const data = await response.json();
            const token = data.token;
            
            if (!token) {
                throw new Error('토큰을 받아올 수 없습니다.');
            }

            // API에서 직접 받은 사용자 정보 사용
            const userData = {
                id: data.userId,
                userId: data.userId,
                name: data.nickname || '사용자',
                phone: data.phoneNumber || '',
                userType: data.userType ? (data.userType as UserType) : null,
                profileImage: data.profileImageUrl || '',
                token: token,
                gender: data.gender || ''
            };
            
            await loginUser(userData);

            const hasValidUserType = userData.userType && (userData.userType === UserType.SENIOR || userData.userType === UserType.GUARDIAN);
            if (hasValidUserType) {
                navigation.navigate(userData.userType === UserType.SENIOR ? 'MainTabs' : 'GuardianConnection');
            } else {
                navigation.navigate('UserRoleSelection');
            }
        } catch (error: any) {
            console.error('code로 로그인 실패:', error);
            Alert.alert('오류', error.message || '로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // [공통] 최종적으로 토큰을 받아 로그인 상태를 만들고 화면 이동
    const handleLoginSuccessWithToken = async (token: string) => {
        setIsLoading(true);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.userId?.toString();
            if (!userId) throw new Error('JWT 토큰에서 userId를 찾을 수 없습니다.');

            const userResponse = await userService.getUserById(userId, token);
            if (!userResponse.success || !userResponse.user) {
                throw new Error(userResponse.message || '사용자 정보를 가져올 수 없습니다.');
            }
            const user = userResponse.user;
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
            await loginUser(userData);

            const hasValidUserType = userData.userType && (userData.userType === UserType.SENIOR || userData.userType === UserType.GUARDIAN);
            if (hasValidUserType) {
                navigation.navigate(userData.userType === UserType.SENIOR ? 'MainTabs' : 'GuardianConnection');
            } else {
                navigation.navigate('UserRoleSelection');
            }
        } catch (error: any) {
            console.error('최종 로그인 처리 실패:', error);
            Alert.alert('오류', error.message || '사용자 정보를 처리하는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // 💡 [웹/모바일 공용] 로그인 버튼 클릭 시 동작
    const handleKakaoLogin = async () => {
        setIsLoading(true);
        try {
            const authUrl = await kakaoAuthService.getKakaoAuthUrl();

            if (isWeb) {
                // 웹에서는 페이지를 바로 이동시킴
                window.location.href = authUrl;
            } else {
                // 모바일(Expo Go)에서는 openAuthSessionAsync 사용
                const result = await WebBrowser.openAuthSessionAsync(authUrl, 'dearmind://kakao-auth');

                if (result.type === 'success') {
                    // 성공적으로 dearmind:// 주소로 리다이렉트된 경우
                    console.log('로그인 성공 후 리다이렉트:', result.url);
                    const urlParams = new URLSearchParams(result.url.split('?')[1]);
                    const token = urlParams.get('token');
                    if (token) {
                        await handleLoginSuccessWithToken(token);
                    } else {
                        throw new Error('리다이렉트 URL에 토큰이 없습니다.');
                    }
                } else {
                    // 사용자가 웹 브라우저 창을 닫은 경우
                    setIsLoading(false);
                }
            }
        } catch (error: any) {
            console.error('카카오 로그인 실패:', error);
            Alert.alert('오류', error.message || '로그인을 시작할 수 없습니다.');
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[...whiteToGreenGradientColors].reverse() as any}
            locations={[0, 0.9]}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View className="flex-1 items-center w-full px-6 py-20">
                <View className="items-center mb-20">
                    <Image
                        source={require('../assets/logo_white.png')}
                        resizeMode="cover"
                        style={{ width: 300, height: 300 }}
                    />
                </View>
                <View className="w-full mb-10">
                    <Text className="text-5xl font-bold text-left" style={{ lineHeight: 60, color: '#67876C' }}>
                        당신의{'\n'}오래된{'\n'}이야기
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleKakaoLogin}
                    disabled={isLoading}
                    className={`w-full h-16 rounded-2xl justify-center items-center flex-row overflow-hidden ${isLoading ? 'opacity-50' : ''}`}
                >
                    {isLoading ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
                            <Text className="text-lg font-bold" style={{ color: '#000' }}>
                                로그인 중...
                            </Text>
                        </View>
                    ) : (
                        <Image source={require('../assets/kakao_login_medium_wide.png')} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
                    )}
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}