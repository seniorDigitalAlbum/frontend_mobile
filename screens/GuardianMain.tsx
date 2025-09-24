import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import guardianService, { SeniorInfo } from '../services/guardianService';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianMain'>;

export default function GuardianMain({ navigation }: Props) {
    const { user } = useUser();
    const [connectedSeniors, setConnectedSeniors] = useState<SeniorInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadConnectedSeniors();
    }, []);

    const loadConnectedSeniors = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            console.log('연결된 시니어 목록 조회 시작');
            const seniors = await guardianService.getConnectedSeniors(parseInt(user.id));
            setConnectedSeniors(seniors);
            console.log('연결된 시니어 수:', seniors.length);
        } catch (error) {
            console.error('연결된 시니어 목록 조회 실패:', error);
            Alert.alert('오류', '시니어 목록을 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadConnectedSeniors();
        setRefreshing(false);
    };

    const handleAddSenior = () => {
        navigation.navigate('GuardianConnection');
    };

    const handleSeniorPress = (senior: SeniorInfo) => {
        console.log('시니어 선택:', senior.name);
        // 시니어 앨범 목록으로 이동
        navigation.navigate('SeniorAlbumList', { seniorId: senior.id, seniorName: senior.name });
    };

    const renderSeniorItem = (senior: SeniorInfo) => (
        <TouchableOpacity
            key={senior.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => handleSeniorPress(senior)}
        >
            <View className="flex-row items-center">
                {/* 프로필 이미지 */}
                <View className="w-16 h-16 rounded-full bg-gray-200 mr-4 items-center justify-center">
                    {senior.profileImage ? (
                        <Image 
                            source={{ uri: senior.profileImage }}
                            className="w-16 h-16 rounded-full"
                        />
                    ) : (
                        <Text className="text-gray-500 text-xl">
                            {senior.name?.charAt(0) || '?'}
                        </Text>
                    )}
                </View>
                
                {/* 시니어 정보 */}
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {senior.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                        연결된 시니어
                    </Text>
                    <Text className="text-xs text-blue-600">
                        앨범 보기 →
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={gradientColors as [string, string]}
            style={{ flex: 1 }}
        >
            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="flex-1 px-5 pt-10">
                    {/* 헤더 */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-gray-800 mb-2">
                            연결된 시니어
                        </Text>
                        <Text className="text-gray-600">
                            {connectedSeniors.length}명의 시니어와 연결되어 있습니다
                        </Text>
                    </View>

                    {/* 연결된 시니어 목록 */}
                    {isLoading ? (
                        <View className="items-center py-8">
                            <Text className="text-gray-600">시니어 목록을 불러오는 중...</Text>
                        </View>
                    ) : connectedSeniors.length > 0 ? (
                        <View className="mb-6">
                            {connectedSeniors.map(renderSeniorItem)}
                        </View>
                    ) : (
                        <View className="items-center py-12">
                            <Text className="text-gray-600 text-center mb-6">
                                아직 연결된 시니어가 없습니다.
                            </Text>
                            <TouchableOpacity
                                className="bg-blue-500 px-6 py-3 rounded-xl"
                                onPress={handleAddSenior}
                            >
                                <Text className="text-white font-semibold">
                                    시니어 연결하기
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 추가 시니어 연결 버튼 */}
                    {connectedSeniors.length > 0 && (
                        <TouchableOpacity
                            className="bg-white border border-blue-500 px-6 py-3 rounded-xl items-center mb-6"
                            onPress={handleAddSenior}
                        >
                            <Text className="text-blue-500 font-semibold">
                                + 시니어 추가 연결
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* 도움말 */}
                    <View className="bg-white rounded-xl p-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">
                            연결된 시니어 관리
                        </Text>
                        <Text className="text-sm text-gray-600 mb-2">
                            • 시니어를 탭하면 앨범 목록을 볼 수 있습니다
                        </Text>
                        <Text className="text-sm text-gray-600 mb-2">
                            • 언제든지 새로운 시니어를 추가할 수 있습니다
                        </Text>
                        <Text className="text-sm text-gray-600 mb-2">
                            • 시니어의 대화 기록과 감정 상태를 모니터링할 수 있습니다
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}
