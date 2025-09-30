import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { blueGradientColors, colors, purpleGradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import { SeniorInfo } from '../services/guardianService';

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
            const testSeniors: SeniorInfo[] = [
                {
                    id: 1,
                    name: '김할머니',
                    phoneNumber: '010-1234-5678',
                    profileImage: '',
                    connectionStatus: 'PENDING'
                },
                {
                    id: 2,
                    name: '이할아버지',
                    phoneNumber: '010-9876-5432',
                    profileImage: '',
                    connectionStatus: 'PENDING'
                }
            ];
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
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            <ScrollView className="flex-1">
                <View className="flex-1 px-6 pt-20">
                    {/* 헤더 섹션 */}
                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-center mb-4" style={{ color: colors.darkGreen }}>
                            시니어와 연결하기
                        </Text>
                        <Text className="text-base text-center leading-6" style={{ color: colors.darkGreen }}>
                            카카오 친구 중 우리 앱에 가입된{'\n'}시니어를 찾아 연결할 수 있습니다.
                        </Text>
                    </View>

                    {isLoading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator size="large" color={colors.green} />
                            <Text className="mt-4 text-center" style={{ color: colors.darkGreen }}>
                                카카오톡 사용자 중 가입된{'\n'}시니어를 찾는 중...
                            </Text>
                        </View>
                    ) : seniors.length > 0 ? (
                        <>
                            {/* 시니어 목록 헤더 */}
                            <View className="mb-6">
                                <Text className="text-xl font-bold mb-2" style={{ color: colors.darkGreen }}>
                                    가입된 시니어 ({seniors.length}명)
                                </Text>
                            </View>
                            
                            {/* 시니어 목록 */}
                            <View className="mb-8">
                                {seniors.map((senior) => {
                                    const isSelected = selectedSeniors.some(s => s.id === senior.id);
                                    return (
                                        <TouchableOpacity
                                            key={senior.id}
                                            className="mb-4"
                                            onPress={() => handleSeniorToggle(senior)}
                                        >
                                            {isSelected ? (
                                                <View 
                                                    className="rounded-2xl p-5 shadow-lg"
                                                    style={{
                                                        backgroundColor: colors.green,
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.1,
                                                        shadowRadius: 12,
                                                        elevation: 8,
                                                    }}
                                                >
                                                    <View className="flex-row items-center">
                                                        {/* 체크박스 */}
                                                        <View className="w-7 h-7 rounded-full border-2 mr-4 items-center justify-center border-white bg-white">
                                                            <Text className="text-green-600 text-sm font-bold">✓</Text>
                                                        </View>
                                                        
                                                        {/* 프로필 이미지 */}
                                                        <View className="w-14 h-14 rounded-full bg-white mr-4 items-center justify-center shadow-sm">
                                                            {senior.kakaoProfileImage ? (
                                                                <Text className="text-gray-500 text-xl">👤</Text>
                                                            ) : (
                                                                <Text className="text-gray-500 text-xl">
                                                                    {senior.id === 1 ? '👴' : senior.id === 2 ? '👵' : '🧑‍🦳'}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        
                                                        {/* 사용자 정보 */}
                                                        <View className="flex-1">
                                                            <Text className="text-lg font-bold mb-1 text-white">
                                                                {senior.kakaoNickname || senior.name}
                                                            </Text>
                                                            <Text className="text-sm text-white/80">
                                                                카카오 친구
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View 
                                                    className="rounded-2xl p-5 shadow-sm"
                                                    style={{
                                                        backgroundColor: colors.beige,
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.05,
                                                        shadowRadius: 8,
                                                        elevation: 4,
                                                    }}
                                                >
                                                    <View className="flex-row items-center">
                                                        {/* 체크박스 */}
                                                        <View className="w-7 h-7 rounded-full border-2 mr-4 items-center justify-center border-gray-300 bg-white">
                                                        </View>
                                                        
                                                        {/* 프로필 이미지 */}
                                                        <View className="w-14 h-14 rounded-full bg-white mr-4 items-center justify-center shadow-sm">
                                                            {senior.kakaoProfileImage ? (
                                                                <Text className="text-gray-500 text-xl">👤</Text>
                                                            ) : (
                                                                <Text className="text-gray-500 text-xl">
                                                                    {senior.id === 1 ? '👴' : senior.id === 2 ? '👵' : '🧑‍🦳'}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        
                                                        {/* 사용자 정보 */}
                                                        <View className="flex-1">
                                                            <Text className="text-lg font-bold mb-1" style={{ color: colors.darkGreen }}>
                                                                {senior.kakaoNickname || senior.name}
                                                            </Text>
                                                            <Text className="text-sm" style={{ color: colors.darkGreen }}>
                                                                카카오 친구
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* 연결 버튼 */}
                            <TouchableOpacity
                                className={`w-full h-14 rounded-2xl justify-center items-center mb-4 ${
                                    selectedSeniors.length === 0 ? 'bg-gray-300' : ''
                                }`}
                                onPress={handleTestConnect}
                                disabled={selectedSeniors.length === 0}
                                style={{
                                    backgroundColor: selectedSeniors.length === 0 ? '#D1D5DB' : 'black',
                                }}
                            >
                                <Text className={`text-lg font-bold ${
                                    selectedSeniors.length === 0 ? 'text-gray-500' : 'text-white'
                                }`}>
                                    {selectedSeniors.length === 0 ? '시니어를 선택해주세요' :
                                     `선택한 ${selectedSeniors.length}명과 연결하기`}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="items-center py-12">
                            <View 
                                className="rounded-2xl p-8 mb-6"
                                style={{ backgroundColor: colors.beige }}
                            >
                                <Text className="text-center text-lg mb-4" style={{ color: colors.darkGreen }}>
                                    카카오 친구 중 가입된 시니어를{'\n'}찾을 수 없습니다.
                                </Text>
                                <TouchableOpacity
                                    className="w-full h-12 rounded-xl justify-center items-center"
                                    onPress={loadSeniors}
                                    style={{ backgroundColor: colors.darkGreen }}
                                >
                                    <Text className="text-white text-base font-semibold">
                                        다시 검색하기
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* 건너뛰기 버튼 */}
                    <TouchableOpacity
                        className="w-full h-14 rounded-2xl justify-center items-center"
                        onPress={handleSkip}
                        style={{
                            backgroundColor: '#D1D5DB'
                        }}
                    >
                        <Text className="text-lg font-bold text-gray-500">
                            나중에 할게요
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}
