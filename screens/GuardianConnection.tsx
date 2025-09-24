import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, FlatList, Image, Linking, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import guardianService, { SeniorInfo } from '../services/guardianService';
import kakaoAuthService from '../services/kakaoAuthService';
import axios from 'axios';

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
            const jwtToken = user?.token || '';
            if (!jwtToken) {
                Alert.alert('오류', '로그인 정보가 없습니다.');
                navigation.navigate('Login');
                return;
            }
            const response = await guardianService.searchKakaoFriends(jwtToken);
            setSeniors(response.seniors || []);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 403 && error.response.data?.error_code === 'NEEDS_CONSENT') {
                    Alert.alert(
                        "추가 동의 필요",
                        "카카오 친구 목록을 불러오려면 추가 정보 제공 동의가 필요합니다. 동의 화면으로 이동하시겠습니까?",
                        [
                            { text: "취소", style: "cancel", onPress: () => {} },
                            { text: "동의", onPress: () => requestAdditionalConsent() }
                        ]
                    );
                } else {
                    Alert.alert('오류', error.response.data?.message || '친구에서 시니어 검색에 실패했습니다.');
                }
            } else {
                console.error('시니어 검색 실패:', error);
                Alert.alert('오류', '알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const requestAdditionalConsent = async () => {
        try {
            const authUrl = await kakaoAuthService.getKakaoAuthUrl('friends');
            await Linking.openURL(authUrl);
        } catch (error) {
            Alert.alert('오류', '동의 화면을 여는 데 실패했습니다.');
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
                Alert.alert('성공', `${successCount}명의 시니어와 연결되었습니다.`, [
                    { text: '확인', onPress: () => navigation.navigate('GuardianMain') }
                ]);
            } else {
                Alert.alert('실패', '일부 시니어 연결에 실패했습니다.');
            }
        } catch (error) {
            Alert.alert('오류', '연결 중 오류가 발생했습니다.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSkip = () => {
        navigation.navigate('GuardianMain');
    };

    const renderSeniorItem = ({ item }: { item: SeniorInfo }) => {
        const isSelected = selectedSeniors.some(s => s.id === item.id);
        
        return (
            <TouchableOpacity
                className={`p-4 rounded-xl border-2 mb-3 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                onPress={() => handleSeniorToggle(item)}
            >
                <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {isSelected && <Text className="text-white text-sm">✓</Text>}
                    </View>
                    
                    <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 items-center justify-center">
                        {item.kakaoProfileImage ? (
                            <Image source={{ uri: item.kakaoProfileImage }} className="w-12 h-12 rounded-full" />
                        ) : (
                            <Text className="text-gray-500 text-lg">{item.name?.charAt(0) || '?'}</Text>
                        )}
                    </View>
                    
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-800 mb-1">{item.kakaoNickname || item.name}</Text>
                        <Text className="text-sm text-gray-600">카카오 친구</Text>
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
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-1">
                <View className="flex-1 px-5 pt-10">
                    <Text className="text-3xl font-bold text-center mb-3 text-gray-800">시니어와 연결하기</Text>
                    <Text className="text-base text-center mb-8 text-gray-600">카카오 친구 중 우리 앱에 가입된 시니어를 찾아 연결할 수 있습니다</Text>

                    {isLoading ? (
                        <View className="items-center py-8"><ActivityIndicator size="large" /></View>
                    ) : seniors.length > 0 ? (
                        <>
                            <Text className="text-lg font-semibold mb-4 text-gray-800">가입된 시니어 ({seniors.length}명)</Text>
                            
                            {selectedSeniors.length > 0 && (
                                <Text className="text-sm text-blue-600 mb-3">{selectedSeniors.length}명 선택됨</Text>
                            )}
                            
                            <FlatList
                                data={seniors}
                                renderItem={renderSeniorItem}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                                className="mb-6"
                            />

                            <TouchableOpacity
                                className={`w-full h-12 bg-blue-500 rounded-xl justify-center items-center mt-5 ${selectedSeniors.length === 0 || isConnecting ? 'bg-gray-400' : ''}`}
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
                            <Text className="text-gray-600 text-center mb-4">카카오 친구 중 가입된 시니어를 찾을 수 없습니다.</Text>
                            <TouchableOpacity
                                className="w-full h-12 bg-blue-500 rounded-xl justify-center items-center mt-5"
                                onPress={loadSeniors}
                            >
                                <Text className="text-white text-base font-semibold">다시 검색하기</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        className="w-full h-12 rounded-xl justify-center items-center mt-3 border border-gray-300 bg-white"
                        onPress={handleSkip}
                        disabled={isConnecting}
                    >
                        <Text className="text-gray-600 text-base">나중에 연결하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}