import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, FlatList, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import guardianService, { SeniorInfo } from '../services/guardianService';
import kakaoAuthService from '../services/kakaoAuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianConnection'>;

export default function GuardianConnection({ navigation }: Props) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [seniors, setSeniors] = useState<SeniorInfo[]>([]);
    const [selectedSeniors, setSelectedSeniors] = useState<SeniorInfo[]>([]);

    useEffect(() => {
        loadSeniors();
    }, []);

    const loadSeniors = async () => {
        setIsLoading(true);
        try {
            console.log('카카오 친구에서 시니어 검색 시작');
            
            // 1. JWT 토큰 가져오기
            const jwtToken = user?.token || '';
            
            if (!jwtToken) {
                Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인해주세요.');
                navigation.navigate('Login');
                return;
            }
            
            console.log('JWT 토큰으로 친구 검색');

            // 2. 카카오 친구 중 우리 앱에 가입된 시니어 검색
            const registeredSeniors = await guardianService.searchKakaoFriends(jwtToken);
            setSeniors(registeredSeniors);
            
            console.log('검색된 시니어 수:', registeredSeniors.length);
        } catch (error) {
            console.error('카카오 친구 중 시니어 검색 실패:', error);
            Alert.alert('오류', '카카오 친구에서 시니어 검색에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
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
        if (selectedSeniors.length === 0) {
            Alert.alert('오류', '연결할 시니어를 선택해주세요.');
            return;
        }

        setIsConnecting(true);
        try {
            console.log('시니어 연결 시작:', selectedSeniors.map(s => s.name));
            
            // 선택된 모든 시니어와 연결
            const results = await Promise.all(
                selectedSeniors.map(senior => 
                    guardianService.connectSenior(
                        parseInt(user?.id || '0'), 
                        senior.id
                    )
                )
            );

            const successCount = results.filter(r => r.success).length;
            
            if (successCount === selectedSeniors.length) {
                console.log('모든 시니어 연결 완료');
                Alert.alert('성공', `${successCount}명의 시니어와 연결되었습니다.`, [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('GuardianMain')
                    }
                ]);
            } else if (successCount > 0) {
                Alert.alert('부분 성공', `${successCount}명 연결 성공, ${selectedSeniors.length - successCount}명 연결 실패`, [
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

    const handleSkip = () => {
        console.log('나중에 연결하기 선택');
        navigation.navigate('GuardianMain');
    };

    const renderSeniorItem = ({ item }: { item: SeniorInfo }) => {
        const isSelected = selectedSeniors.some(s => s.id === item.id);
        
        return (
            <TouchableOpacity
                className={`p-4 rounded-xl border-2 mb-3 ${
                    isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                }`}
                onPress={() => handleSeniorToggle(item)}
            >
                <View className="flex-row items-center">
                    {/* 체크박스 */}
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                        {isSelected && (
                            <Text className="text-white text-sm">✓</Text>
                        )}
                    </View>
                    
                    {/* 프로필 이미지 */}
                    <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 items-center justify-center">
                        {item.kakaoProfileImage ? (
                            <Image 
                                source={{ uri: item.kakaoProfileImage }}
                                className="w-12 h-12 rounded-full"
                            />
                        ) : (
                            <Text className="text-gray-500 text-lg">
                                {item.name?.charAt(0) || '?'}
                            </Text>
                        )}
                    </View>
                    
                    {/* 사용자 정보 */}
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-800 mb-1">
                            {item.kakaoNickname || item.name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                            카카오 친구
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={gradientColors as [string, string]}
            style={{ flex: 1 }}
        >
            <ScrollView className="flex-1">
                <View className="flex-1 px-5 pt-10">
                    <Text className="text-3xl font-bold text-center mb-3 text-gray-800">
                        시니어와 연결하기
                </Text>
                    <Text className="text-base text-center mb-8 text-gray-600">
                        카카오 친구 중 우리 앱에 가입된 시니어를 찾아 연결할 수 있습니다
                    </Text>

                    {isLoading ? (
                        <View className="items-center py-8">
                            <Text className="text-gray-600">시니어 검색 중...</Text>
                </View>
                    ) : seniors.length > 0 ? (
                        <>
                            <Text className="text-lg font-semibold mb-4 text-gray-800">
                                가입된 시니어 ({seniors.length}명)
                            </Text>
                            
                            {selectedSeniors.length > 0 && (
                                <Text className="text-sm text-blue-600 mb-3">
                                    {selectedSeniors.length}명 선택됨
                                </Text>
                            )}
                            
                            <FlatList
                                data={seniors}
                                renderItem={renderSeniorItem}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                                className="mb-6"
                            />

                {/* 연결 버튼 */}
                <TouchableOpacity
                                className={`w-full h-12 bg-blue-500 rounded-xl justify-center items-center mt-5 ${
                                    selectedSeniors.length === 0 || isConnecting ? 'bg-gray-400' : ''
                                }`}
                    onPress={handleConnect}
                                disabled={selectedSeniors.length === 0 || isConnecting}
                            >
                                <Text className="text-white text-base font-semibold">
                                    {isConnecting ? '연결 중...' : 
                                     selectedSeniors.length === 0 ? '시니어를 선택해주세요' :
                                     `선택한 ${selectedSeniors.length}명과 연결하기`}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="items-center py-8">
                            <Text className="text-gray-600 text-center mb-4">
                                카카오 친구 중 가입된 시니어를 찾을 수 없습니다.
                            </Text>
                            <TouchableOpacity
                                className="w-full h-12 bg-blue-500 rounded-xl justify-center items-center mt-5"
                                onPress={loadSeniors}
                            >
                                <Text className="text-white text-base font-semibold">
                                    다시 검색하기
                    </Text>
                </TouchableOpacity>
                        </View>
                    )}

                {/* 건너뛰기 버튼 */}
                <TouchableOpacity
                        className="w-full h-12 rounded-xl justify-center items-center mt-3 border border-gray-300 bg-white"
                    onPress={handleSkip}
                    disabled={isConnecting}
                >
                        <Text className="text-gray-600 text-base">
                            나중에 연결하기
                        </Text>
                </TouchableOpacity>

                {/* 도움말 */}
                    <View className="mt-10">
                        <Text className="text-lg font-semibold mb-4 text-gray-800">
                            연결 후 할 수 있는 것
                        </Text>
                        <Text className="text-base text-gray-600 mb-2">
                            • 시니어의 대화 기록 확인
                        </Text>
                        <Text className="text-base text-gray-600 mb-2">
                            • 감정 분석 결과 모니터링
                        </Text>
                        <Text className="text-base text-gray-600 mb-2">
                            • 진행 상황 추적
                        </Text>
                        <Text className="text-base text-gray-600 mb-2">
                            • 알림 및 경고 수신
                        </Text>
                </View>
            </View>
        </ScrollView>
        </LinearGradient>
    );
}
