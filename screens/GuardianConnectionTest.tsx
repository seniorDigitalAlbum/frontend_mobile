import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import { SeniorInfo } from '../services/guardianService';
import { TEST_SENIORS, convertToSeniorInfo } from '../mocks/SeniorMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianConnectionTest'>;

export default function GuardianConnectionTest({ navigation }: Props) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [seniors, setSeniors] = useState<SeniorInfo[]>([]);
    const [selectedSeniors, setSelectedSeniors] = useState<SeniorInfo[]>([]);

    useEffect(() => {
        loadSeniors();
    }, []);

    const loadSeniors = async () => {
        setIsLoading(true);
        try {
            console.log('카카오톡 사용자 중 가입된 시니어를 찾는 중...');
            
            // 2초 대기 (로딩 시뮬레이션)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 테스트 시니어 데이터 로드
            const testSeniors = TEST_SENIORS.map(convertToSeniorInfo);
            setSeniors(testSeniors);
            
            console.log('검색된 시니어 수:', testSeniors.length);
        } catch (error) {
            console.error('시니어 검색 실패:', error);
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

    const handleSkip = () => {
        console.log('나중에 연결할게요');
        navigation.navigate('GuardianMain');
    };

    const handleTestConnect = async () => {
        if (selectedSeniors.length === 0) {
            Alert.alert('오류', '연결할 시니어를 선택해주세요.');
            return;
        }

        try {
            console.log('시니어 연결 시작:', selectedSeniors.map(s => s.name));
            
            // 테스트 시니어와의 연결 처리
            const results = selectedSeniors.map(senior => {
                // userMockData의 test-user-123과 연결되는 시니어인지 확인
                if (senior.id === 999) {
                    console.log('테스트 시니어(ID: 999)와 연결 - userMockData의 test-user-123과 매칭');
                    return { success: true, seniorName: senior.name };
                } else {
                    console.log(`일반 테스트 시니어(ID: ${senior.id})와 연결`);
                    return { success: true, seniorName: senior.name };
                }
            });

            const successCount = results.filter(r => r.success).length;
            
            if (successCount === selectedSeniors.length) {
                console.log('모든 시니어 연결 완료');
                Alert.alert('성공', `${successCount}명의 시니어와 연결되었습니다.`, [
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
        }
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
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className="text-gray-600 mt-4">카카오톡 사용자 중 가입된 시니어를 찾는 중...</Text>
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
                            
                            {seniors.map((senior) => {
                                const isSelected = selectedSeniors.some(s => s.id === senior.id);
                                return (
                                    <TouchableOpacity
                                        key={senior.id}
                                        className={`p-4 rounded-xl border-2 mb-3 ${
                                            isSelected 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 bg-white'
                                        }`}
                                        onPress={() => handleSeniorToggle(senior)}
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
                                                {senior.kakaoProfileImage ? (
                                                    <Text className="text-gray-500 text-lg">👤</Text>
                                                ) : (
                                                    <Text className="text-gray-500 text-lg">
                                                        {senior.id === 1 ? '👴' : senior.id === 2 ? '👵' : '🧑‍🦳'}
                                                    </Text>
                                                )}
                                            </View>
                                            
                                            {/* 사용자 정보 */}
                                            <View className="flex-1">
                                                <Text className="text-lg font-semibold text-gray-800 mb-1">
                                                    {senior.kakaoNickname || senior.name}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    카카오 친구
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* 연결 버튼 */}
                            <TouchableOpacity
                                className={`w-full h-12 bg-blue-500 rounded-xl justify-center items-center mt-5 ${
                                    selectedSeniors.length === 0 ? 'bg-gray-400' : ''
                                }`}
                                onPress={handleTestConnect}
                                disabled={selectedSeniors.length === 0}
                            >
                                <Text className="text-white text-base font-semibold">
                                    {selectedSeniors.length === 0 ? '시니어를 선택해주세요' :
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
                    >
                        <Text className="text-gray-600 text-base">
                            나중에 할게요
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </LinearGradient>
    );
}
