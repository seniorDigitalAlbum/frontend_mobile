import { View, Image, TouchableOpacity, Text, Linking, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { colors, whiteToGreenGradientColors } from '../styles/commonStyles';
import kakaoAuthService from '../services/kakaoAuthService';
import { userService } from '../services/user/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { useUser, UserType } from '../contexts/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation: propNavigation }: Props) {
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginUser } = useUser();

    // URL 파라미터에서 code 추출하여 콜백 처리
    useEffect(() => {
        const handleUrl = (url: string) => {
            console.log('URL 처리:', url);
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const code = urlParams.get('code');
            const token = urlParams.get('token');
            const error = urlParams.get('error');
            
            if (error) {
                console.error('카카오 로그인 에러:', error);
                Alert.alert('로그인 실패', error);
                return;
            }
            
            if (code && token) {
                console.log('카카오 콜백 코드와 토큰:', code, token);
                handleKakaoCallbackWithToken(code, token);
            } else if (code) {
                console.log('카카오 콜백 코드만 있음:', code);
                handleKakaoCallback(code);
            }
        };

        // 웹 환경에서는 페이지 로드 시 URL 확인
        if (typeof window !== 'undefined') {
            const currentUrl = window.location.href;
            console.log('현재 웹 URL:', currentUrl);
            
            if (currentUrl.includes('code=')) {
                console.log('웹에서 카카오 콜백 코드 발견:', currentUrl);
                handleUrl(currentUrl);
            }
        } else {
            // 모바일 환경에서는 기존 방식 사용
            Linking.getInitialURL().then((url) => {
                if (url) {
                    handleUrl(url);
                }
            });

            // 앱이 실행 중일 때 URL 변경 감지
            const subscription = Linking.addEventListener('url', (event) => {
                handleUrl(event.url);
            });

            return () => {
                subscription?.remove();
            };
        }
    }, []);

    const handleKakaoCallbackWithToken = async (code: string, token: string) => {
        try {
            console.log('카카오 콜백 처리 시작 (토큰 포함):', code, token);
            console.log('현재 환경:', typeof window !== 'undefined' ? '웹' : '모바일');
            setIsLoading(true);
            
            // JWT 토큰에서 userId 추출
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('JWT 토큰 페이로드:', payload);
                
                const userId = payload.userId?.toString();
                if (!userId) {
                    throw new Error('JWT 토큰에서 userId를 찾을 수 없습니다.');
                }
                
                // API로 사용자 정보 조회
                console.log('사용자 정보 조회 시작:', userId);
                const userResponse = await userService.getUserById(userId, token);
                
                if (userResponse.success && userResponse.user) {
                    const user = userResponse.user;
                    console.log('사용자 정보 조회 성공:', user);
                    console.log('🔍 백엔드에서 받은 userType:', user.userType);
                    console.log('🔍 userType 타입:', typeof user.userType);
                    
                    // 사용자 정보를 UserContext에 저장 (userType은 UserRoleSelection에서 선택)
                    const userData = {
                        id: user.id.toString(),
                        userId: user.id.toString(),
                        name: user.nickname || '사용자',
                        phone: user.phoneNumber || '',
                        userType: user.userType ? (user.userType as UserType) : null, // DB에서 가져온 값 또는 null
                        profileImage: user.profileImageUrl || '',
                        token: token,
                        gender: user.gender || ''
                    };
                    
                    console.log('저장할 사용자 데이터:', userData);
                    console.log('🔍 매핑된 userType:', userData.userType);
                    console.log('🔍 매핑된 userType 타입:', typeof userData.userType);
                    await loginUser(userData);
                    console.log('사용자 정보가 UserContext에 저장되었습니다.');
                    
                    // 로그인 성공 후 다음 화면으로 이동
                    // 웹에서는 URL을 정리하고 리다이렉트
                    if (typeof window !== 'undefined') {
                        // URL에서 code와 token 파라미터 제거
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, '', newUrl);
                        console.log('URL 정리 완료:', newUrl);
                    }
                    
                    // userType에 따른 네비게이션 로직
                    console.log('🚀 네비게이션 로직 시작');
                    console.log('🚀 userData.userType 값:', userData.userType);
                    console.log('🚀 userData.userType 타입:', typeof userData.userType);
                    
                    // userType이 null, undefined, 빈 문자열이 아닌 경우에만 홈으로 이동
                    const hasValidUserType = userData.userType && 
                                          userData.userType !== 'null' && 
                                          userData.userType !== '' && 
                                          (userData.userType === UserType.SENIOR || userData.userType === UserType.GUARDIAN);
                    
                    console.log('🚀 hasValidUserType:', hasValidUserType);
                    
                    if (hasValidUserType) {
                        console.log('✅ 기존 사용자 - userType:', userData.userType);
                        
                        if (userData.userType === UserType.SENIOR) {
                            console.log('🏠 시니어 홈으로 이동');
                            navigation.navigate('MainTabs');
                        } else if (userData.userType === UserType.GUARDIAN) {
                            console.log('🏠 보호자 홈으로 이동');
                            navigation.navigate('GuardianMain');
                        } else {
                            console.log('⚠️ 알 수 없는 userType - UserRoleSelection으로 이동');
                            navigation.navigate('UserRoleSelection');
                        }
                    } else {
                        console.log('🆕 신규 사용자 또는 userType 없음 - UserRoleSelection으로 이동');
                        navigation.navigate('UserRoleSelection');
                    }
                } else {
                    console.error('사용자 정보 조회 실패:', userResponse.message);
                    Alert.alert('로그인 실패', userResponse.message || '사용자 정보를 가져올 수 없습니다.');
                }
                
            } catch (jwtError) {
                console.error('JWT 토큰 디코딩 실패:', jwtError);
                Alert.alert('오류', '사용자 정보를 가져올 수 없습니다.');
            }
            
        } catch (error) {
            console.error('카카오 콜백 처리 실패:', error);
            Alert.alert('오류', '카카오 로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKakaoCallback = async (code: string) => {
        try {
            console.log('카카오 콜백 처리 시작:', code);
            console.log('현재 환경:', typeof window !== 'undefined' ? '웹' : '모바일');
            setIsLoading(true);
            
            // 카카오 콜백 처리
            const result = await kakaoAuthService.handleKakaoCallback(code);
            console.log('카카오 콜백 결과:', result);
            
            if (result.success) {
                console.log('카카오 로그인 성공:', result);
                
                // 사용자 정보를 UserContext에 저장
                if (result.user && result.token) {
                    const userData = {
                        id: result.user.kakaoId.toString(),
                        userId: result.user.kakaoId.toString(),
                        name: result.user.nickname || '사용자',
                        phone: '', // 카카오에서는 전화번호를 제공하지 않음
                        userType: UserType.SENIOR, // 기본값으로 설정, UserRoleSelection에서 변경 가능
                        profileImage: result.user.profileImageUrl,
                        token: result.token,
                        gender: result.user.gender
                    };
                    
                    console.log('저장할 사용자 데이터:', userData);
                    await loginUser(userData);
                    console.log('사용자 정보가 UserContext에 저장되었습니다.');
                }
                
                // 로그인 성공 후 다음 화면으로 이동
                // 웹에서는 URL을 정리하고 리다이렉트
                if (typeof window !== 'undefined') {
                    // URL에서 code 파라미터 제거
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                    console.log('URL 정리 완료:', newUrl);
                }
                
                console.log('UserRoleSelection으로 네비게이션 시작');
                navigation.navigate('UserRoleSelection');
                console.log('UserRoleSelection으로 네비게이션 완료');
            } else {
                console.error('카카오 로그인 실패:', result.message);
                Alert.alert('로그인 실패', result.message || '카카오 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('카카오 콜백 처리 실패:', error);
            Alert.alert('오류', '카카오 로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        try {
            console.log('카카오 로그인 시작');
            setIsLoading(true);
            
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('kakaoAuthService.baseUrl:', kakaoAuthService.baseUrl);
            console.log('전체 요청 URL:', `${kakaoAuthService.baseUrl}/kakao/login-url`);
            
            // 백엔드에서 카카오 로그인 URL 가져오기
            const authUrl = await kakaoAuthService.getKakaoAuthUrl();
            console.log('카카오 로그인 URL:', authUrl);
            
            // authUrl이 유효한지 확인
            if (!authUrl || authUrl === 'undefined' || !authUrl.startsWith('http')) {
                console.error('유효하지 않은 카카오 로그인 URL:', authUrl);
                Alert.alert('오류', '카카오 로그인 URL을 가져올 수 없습니다.');
                return;
            }
            
            // 웹 환경에서는 현재 창에서 카카오 로그인 페이지로 이동
            if (typeof window !== 'undefined') {
                console.log('현재 창에서 카카오 로그인 페이지로 이동');
                window.location.href = authUrl;
            } else {
                // 모바일 환경에서는 기존 방식 사용
                const supported = await Linking.canOpenURL(authUrl);
                if (supported) {
                    await Linking.openURL(authUrl);
                } else {
                    Alert.alert('오류', '카카오 로그인을 실행할 수 없습니다.');
                }
            }
        } catch (error) {
            console.error('카카오 로그인 실패:', error);
            Alert.alert('오류', '카카오 로그인을 시작할 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestLogin = () => {
        console.log('테스트 로그인 시작');
        
        // 사용자 역할 선택 화면으로 바로 이동
        navigation.navigate('UserRoleSelection');
    };


    return (
        <LinearGradient
            colors={[...whiteToGreenGradientColors].reverse() as any} // 색상 순서 반전
            locations={[0, 0.9]}
            style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                paddingHorizontal: 24,
            }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View className="flex-1 items-center w-full px-6 py-20">
                {/* 상단 영역 */}
                <View className="items-center mb-20">
                    {/* 로고 */}
                    <Image
                        source={require('../assets/logo_white.png')}
                        resizeMode="cover"
                        style={{
                            width: 300,
                            height: 300,
                        }}
                    />
                </View>
                
                {/* 텍스트 영역 */}
                <View className="w-full mb-10">
                     <Text 
                         className="text-5xl font-bold text-left"
                         style={{ 
                             lineHeight: 60,
                             color: '#67876C'
                         }}
                     >
                        당신의{'\n'}오래된{'\n'}이야기
                    </Text>
                </View>
                
                {/* 카카오 로그인 버튼 */}
                <TouchableOpacity 
                    onPress={handleKakaoLogin} 
                    disabled={isLoading}
                    className={`w-full h-16 rounded-2xl justify-center items-center flex-row overflow-hidden ${
                        isLoading ? 'opacity-50' : ''
                    }`}
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