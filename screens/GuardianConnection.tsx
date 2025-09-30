import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, TextInput, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
import { useUser, UserType } from '../contexts/UserContext';
import guardianService, { SeniorInfo } from '../services/guardianService';
import kakaoAuthService from '../services/kakaoAuthService';
import { userService } from '../services/user/userService';
import { API_BASE_URL } from '../config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianConnection'>;

export default function GuardianConnection({ navigation }: Props) {
    const { user, updateUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [seniors, setSeniors] = useState<SeniorInfo[]>([]);
    const [selectedSeniors, setSelectedSeniors] = useState<SeniorInfo[]>([]);
    
    // 검색 관련 상태
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);

    // 전화번호 포맷팅 함수
    const formatPhoneNumber = (text: string) => {
        // 숫자만 추출
        const numbers = text.replace(/[^0-9]/g, '');
        
        // 길이에 따라 포맷팅
        if (numbers.length <= 3) {
            setSearchPhone(numbers);
        } else if (numbers.length <= 7) {
            setSearchPhone(`${numbers.slice(0, 3)}-${numbers.slice(3)}`);
        } else if (numbers.length <= 11) {
            setSearchPhone(`${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`);
        } else {
            // 11자리 초과시 11자리까지만
            const limitedNumbers = numbers.slice(0, 11);
            setSearchPhone(`${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`);
        }
    };

    // 컴포넌트 마운트 시 사용자 인증 상태 확인
    useEffect(() => {
        if (!user || !user.token) {
            console.log('사용자 인증 정보 없음 - 로그인 화면으로 이동');
            Alert.alert('인증 필요', '로그인이 필요합니다.', [
                {
                    text: '확인',
                    onPress: () => navigation.navigate('Login' as any)
                }
            ]);
        } else {
            console.log('사용자 인증 정보 확인됨:', {
                userId: user.id,
                hasToken: !!user.token,
                userType: user.userType,
                tokenPreview: user.token ? user.token.substring(0, 20) + '...' : '없음'
            });
        }
    }, [user, navigation]);

    // 이름과 전화번호 모두로 시니어 검색
    const searchSeniorsByBoth = async () => {
        if (!searchName.trim() || !searchPhone.trim()) {
            Alert.alert('오류', '이름과 전화번호를 모두 입력해주세요.');
            return;
        }

        // JWT 토큰 확인
        const jwtToken = user?.token;
        if (!jwtToken) {
            console.log('❌ JWT 토큰이 없음 - 로그인 화면으로 이동');
            Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인해주세요.');
            navigation.navigate('Login' as any);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        try {
            console.log('🔍 이름과 전화번호로 시니어 검색 시작:', { searchName, searchPhone });
            console.log('🔑 JWT 토큰 상태:', {
                hasToken: !!jwtToken,
                tokenLength: jwtToken.length,
                tokenPreview: jwtToken.substring(0, 20) + '...'
            });
            
            // JWT 토큰 디코딩해서 내용 확인
            try {
                const tokenParts = jwtToken.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('🎫 JWT 토큰 페이로드:', payload);
                    console.log('⏰ 토큰 만료 시간:', new Date(payload.exp * 1000));
                    console.log('⏰ 현재 시간:', new Date());
                    console.log('⏰ 토큰 만료 여부:', new Date(payload.exp * 1000) < new Date());
                }
            } catch (e) {
                console.error('JWT 토큰 디코딩 실패:', e);
            }
            
            // apiClient 대신 직접 fetch 사용 (포맷팅된 전화번호 그대로 사용)
            const response = await fetch(`${API_BASE_URL}/api/users/search/seniors/exact?name=${encodeURIComponent(searchName)}&phoneNumber=${encodeURIComponent(searchPhone)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const foundSeniors = await response.json();
            
            // User[]를 SeniorInfo[]로 변환
            const seniorInfos: SeniorInfo[] = foundSeniors.map((user: any) => {
                console.log('🔍 검색된 사용자 데이터:', {
                    id: user.id,
                    nickname: user.nickname,
                    profileImageUrl: user.profileImageUrl,
                    kakaoId: user.kakaoId,
                    phoneNumber: user.phoneNumber
                });
                
                return {
                    id: user.id,
                    name: user.nickname || '이름 없음',
                    profileImage: user.profileImageUrl || '',
                    kakaoId: user.kakaoId || '',
                    phoneNumber: user.phoneNumber || ''
                };
            });
            
            setSeniors(seniorInfos);
            console.log('이름과 전화번호로 검색된 시니어 수:', seniorInfos.length);

            // 검색 결과가 있으면 결과 화면으로 이동
            if (seniorInfos.length > 0) {
                navigation.navigate('GuardianConnectionResult' as any, {
                    seniors: seniorInfos,
                    selectedSeniors: selectedSeniors,
                    onSeniorToggle: handleSeniorToggle,
                    onConnect: handleConnect,
                    onBack: () => navigation.goBack(),
                    isConnecting: isConnecting
                });
            }
        } catch (error) {
            console.error('이름과 전화번호로 시니어 검색 실패:', error);
            Alert.alert('오류', '이름과 전화번호로 시니어 검색에 실패했습니다.');
        } finally {
            setIsSearching(false);
        }
    };

    // 검색 실행
    const handleSearch = () => {
        Keyboard.dismiss(); // 키보드 내리기
        searchSeniorsByBoth();
    };

    const handleSeniorToggle = (senior: SeniorInfo) => {
        setSelectedSeniors(prev => {
            const isSelected = prev.some(s => s.id === senior.id);
            if (isSelected) {
                return prev.filter(s => s.id !== senior.id);
            } else {
                return [...prev, senior];
            }
        });
    };

    const handleConnect = async () => {
        // selectedSeniors가 비어있으면 모든 시니어를 자동으로 선택
        const seniorsToConnect = selectedSeniors.length > 0 ? selectedSeniors : seniors;
        
        if (seniorsToConnect.length === 0) {
            Alert.alert('오류', '연결할 시니어가 없습니다.');
            return;
        }
        
        console.log('🔗 연결할 시니어:', seniorsToConnect.map(s => s.name));

        setIsConnecting(true);
        try {
            console.log('시니어 연결 시작:', seniorsToConnect.map(s => s.name));
            
            // 선택된 모든 시니어와 연결
            const results = await Promise.all(
                seniorsToConnect.map(senior => 
                    guardianService.connectSenior(
                        parseInt(user?.id || '0'), 
                        senior.id
                    )
                )
            );

            const successCount = results.filter(r => r.success).length;
            
            if (successCount === seniorsToConnect.length) {
                console.log('모든 시니어 연결 완료');
                
                // 보호자 역할 업데이트
                await updateUser({ userType: UserType.GUARDIAN });
                
                Alert.alert('성공', `${successCount}명의 시니어와 연결되었습니다.`, [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('GuardianMain')
                    }
                ]);
            } else if (successCount > 0) {
                // 부분 성공이어도 보호자 역할 업데이트
                await updateUser({ userType: UserType.GUARDIAN });
                
                Alert.alert('부분 성공', `${successCount}명 연결 성공, ${seniorsToConnect.length - successCount}명 연결 실패`, [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('GuardianMain')
                    }
                ]);
                    } else {
                Alert.alert('실패', '시니어 연결에 실패했습니다.');
                }
        } catch (error) {
            console.error('시니어 연결 실패:', error);
            Alert.alert('오류', '연결에 실패했습니다.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSkip = async () => {
        console.log('나중에 연결하기 선택');
        
        // 보호자 역할 업데이트
        await updateUser({ userType: UserType.GUARDIAN });
        
        navigation.navigate('GuardianMain');
    };


    return (
        <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            <View 
                className="flex-1 flex-col px-6 py-0 justify-center gap-8"
            >
                    {/* 헤더 섹션 */}
                <View className="items-center">
                    <Image 
                        source={require('../assets/Phone.png')} 
                        className="w-full h-40 mt-10" 
                        resizeMode="contain"
                        style={{ 
                            width: 200, 
                            height: 160, 
                            maxWidth: '100%' 
                        }} 
                    />
                </View>

                <View className="items-center mb-6">
                    <Text className="text-4xl font-bold text-center mb-5" style={{ color: colors.darkGreen }}>
                            시니어와 연결하기
                        </Text>
                    <Text className="text-lg text-center leading-6" style={{ color: colors.darkGreen }}>
                            시니어의 이름과 전화번호를{'\n'}입력하여 검색할 수 있습니다.
                        </Text>
                    </View>

                    {/* 검색 입력 */}
                <View>
                        <View 
                        className="rounded-2xl p-5"
                        >
                            <TextInput
                            className="border rounded-3xl px-6 py-4 mb-4 bg-white text-base"
                                placeholder="이름을 입력하세요"
                                value={searchName}
                                onChangeText={setSearchName}
                                onFocus={() => setNameFocused(true)}
                                onBlur={() => setNameFocused(false)}
                                keyboardType="default"
                                editable={true}
                                selectTextOnFocus={true}
                                style={{ 
                                    fontSize: 16,
                                    borderColor: nameFocused ? colors.green : '#D1D5DB',
                                    borderWidth: nameFocused ? 2 : 1,
                                    ...(Platform.OS === 'web' && {
                                        outline: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'textfield',
                                        cursor: 'text',
                                        pointerEvents: 'auto'
                                    })
                                }}
                            />
                            <TextInput
                            className="border rounded-3xl px-6 py-4 mb-4 bg-white text-base"
                            placeholder="전화번호를 입력하세요"
                                value={searchPhone}
                                onChangeText={formatPhoneNumber}
                                onFocus={() => setPhoneFocused(true)}
                                onBlur={() => setPhoneFocused(false)}
                                keyboardType="phone-pad"
                                editable={true}
                                selectTextOnFocus={true}
                                style={{ 
                                    fontSize: 16,
                                    borderColor: phoneFocused ? colors.green : '#D1D5DB',
                                    borderWidth: phoneFocused ? 2 : 1,
                                    ...(Platform.OS === 'web' && {
                                        outline: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'textfield',
                                        cursor: 'text',
                                        pointerEvents: 'auto'
                                    })
                                }}
                            />
                        
                        {/* 검색 결과 메시지 - 입력필드와 검색버튼 사이 */}
                        {isSearching ? (
                            <View className="items-center mb-4">
                                <ActivityIndicator size="large" color={colors.green} />
                            </View>
                        ) : hasSearched && seniors.length === 0 ? (
                            <Text className="text-center text-base mb-4" style={{ color: colors.darkGreen }}>
                                입력하신 정보와 일치하는 시니어를 찾을 수 없습니다.{'\n'}이름과 전화번호를 다시 확인해주세요.
                            </Text>
                        ) : (
                            <View className="mb-4" />
                        )}
                        
                            <TouchableOpacity
                            className="w-full h-12 rounded-xl justify-center items-center"
                                onPress={handleSearch}
                                disabled={isSearching || !searchName.trim() || !searchPhone.trim()}
                                style={{
                                    backgroundColor: (!searchName.trim() || !searchPhone.trim()) ? '#D1D5DB' : 'black'
                                }}
                            >
                            <Text className={`text-base font-bold ${(!searchName.trim() || !searchPhone.trim()) ? 'text-gray-500' : 'text-white'
                                }`}>
                                    {isSearching ? '검색 중...' : '검색'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                {/* 건너뛰기 버튼 */}
                <View className="mt-4">
                    <TouchableOpacity
                        className="h-10 justify-center items-center"
                        onPress={handleSkip}
                        disabled={isConnecting}
                        style={{ opacity: 0.6 }}
                    >
                        <Text className="text-sm text-gray-500 font-bold">
                            나중에 할게요
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
