import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import guardianService, { SeniorInfo } from '../services/guardianService';
import albumApiService from '../services/api/albumApiService';
import { TEST_SENIORS, convertToSeniorInfo } from '../mocks/SeniorMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianMain'>;

export default function GuardianMain({ navigation }: Props) {
    const { user } = useUser();
    const [connectedSeniors, setConnectedSeniors] = useState<SeniorInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [seniorCoverPhotos, setSeniorCoverPhotos] = useState<{[key: string]: string}>({});

    useEffect(() => {
        loadConnectedSeniors();
    }, []);

    const loadConnectedSeniors = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            console.log('연결된 시니어 목록 조회 시작');
            
            let seniors: SeniorInfo[] = [];
            
            // 테스트 로그인인 경우 (test-jwt-token으로 시작하는 경우)
            if (user?.token?.startsWith('test-jwt-token')) {
                console.log('테스트 모드 - 테스트 시니어 목록 로드');
                // 테스트 시니어들을 실제 DB ID와 매핑하여 표시
                const testSeniors = [
                    { ...TEST_SENIORS[2], id: 123 }    // 테스트 시니어 -> DB ID: 123 (test-user-123의 DB ID)
                ].map(convertToSeniorInfo);
                seniors = testSeniors;
                console.log('테스트 연결된 시니어 수:', testSeniors.length);
            } else {
                // 실제 API 호출
                seniors = await guardianService.getConnectedSeniors(parseInt(user.id));
                console.log('연결된 시니어 수:', seniors.length);
            }
            
            setConnectedSeniors(seniors);
            
            // 시니어별 표지 사진 로드
            await loadSeniorCoverPhotos(seniors);
            
        } catch (error) {
            console.error('연결된 시니어 목록 조회 실패:', error);
            Alert.alert('오류', '시니어 목록을 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 시니어별 표지 사진 로드
    const loadSeniorCoverPhotos = async (seniors: SeniorInfo[]) => {
        try {
            const coverPhotos: {[key: string]: string} = {};
            
            for (const senior of seniors) {
                // 테스트 시니어의 경우 test_user_123 형식으로 userId 생성
                const userId = senior.id === 123 ? 'test_user_123' : `senior_${senior.id}`;
                const coverPhoto = await albumApiService.getSeniorCoverPhoto(userId);
                if (coverPhoto) {
                    coverPhotos[senior.id.toString()] = coverPhoto;
                }
            }
            
            setSeniorCoverPhotos(coverPhotos);
            console.log('✅ 시니어별 표지 사진 로드 완료:', coverPhotos);
        } catch (error) {
            console.log('시니어별 표지 사진 로드 실패:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadConnectedSeniors();
        setRefreshing(false);
    };

    const handleAddSenior = () => {
        // 테스트 로그인인 경우 테스트 화면으로 이동
        if (user?.token?.startsWith('test-jwt-token')) {
            navigation.navigate('GuardianConnectionTest');
        } else {
            navigation.navigate('GuardianConnection');
        }
    };

    const handleSeniorPress = (senior: SeniorInfo) => {
        console.log('시니어 선택:', senior.name);
        // 시니어 앨범 목록으로 이동
        navigation.navigate('SeniorAlbumList', { seniorId: senior.id, seniorName: senior.name });
    };

    const renderSeniorItem = (senior: SeniorInfo) => {
        const coverPhoto = seniorCoverPhotos[senior.id.toString()];
        const defaultImage = senior.id === 123 ? 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop' :
                           'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop';
        
        return (
            <TouchableOpacity
                key={senior.id}
                onPress={() => handleSeniorPress(senior)}
                className="w-[100%] mb-4"
            >
                <View
                    className="rounded-3xl shadow-lg overflow-hidden"
                    style={{
                        backgroundColor: colors.beige,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    {/* 표지 사진 */}
                    <View className="h-36 relative">
                        <Image 
                            source={{ uri: coverPhoto || defaultImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent h-8" />
                    </View>
                    
                    {/* 시니어 이름 */}
                    <View className="p-4">
                        <Text className="text-lg font-bold text-center text-black">
                            {senior.name}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="flex-1 px-6 pt-12">
                    {/* 헤더 */}
                    <View className="mb-8 mt-4">
                        <Text className="text-3xl font-bold mb-2" style={{ color: colors.darkGreen }}>
                            시니어 앨범
                        </Text>
                        <Text className="text-lg" style={{ color: colors.darkGreen }}>
                            {connectedSeniors.length}명의 시니어와 연결되어 있습니다
                        </Text>
                    </View>

                    {/* 연결된 시니어 목록 - 2x2 그리드 */}
                    {isLoading ? (
                        <View 
                            className="rounded-3xl p-8 items-center shadow-sm"
                            style={{ backgroundColor: colors.beige }}
                        >
                            <Text style={{ color: colors.darkGreen }}>시니어 목록을 불러오는 중...</Text>
                        </View>
                    ) : connectedSeniors.length > 0 ? (
                        <View className="mb-8">
                            <View className="flex-row flex-wrap justify-between">
                                {connectedSeniors.map(renderSeniorItem)}
                                
                                {/* 시니어 추가 버튼 */}
                                <TouchableOpacity
                                    onPress={handleAddSenior}
                                    className="w-[100%] mb-4"
                                >
                                    <View
                                        className="rounded-3xl p-6 items-center h-48 justify-center shadow-lg"
                                        style={{
                                            backgroundColor: colors.green,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 12,
                                            elevation: 8,
                                        }}
                                    >
                                        <View className="bg-white rounded-full p-4 mb-3">
                                            <Text style={{ fontSize: 32 }}>➕</Text>
                                        </View>
                                        <Text className="text-white font-bold text-center text-lg">시니어 추가 연결</Text>
                                        <Text className="text-white/80 text-base text-center mt-1">새로운 시니어와 연결하세요</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View 
                            className="rounded-3xl p-8 items-center shadow-sm mb-8"
                            style={{ backgroundColor: colors.beige }}
                        >
                            <View className="rounded-full p-6 mb-4" style={{ backgroundColor: colors.green }}>
                                <Text style={{ fontSize: 48, color: 'white' }}>👥</Text>
                            </View>
                            <Text className="text-center text-lg font-semibold mb-2" style={{ color: colors.darkGreen }}>
                                아직 연결된 시니어가 없습니다
                            </Text>
                            <Text className="text-center text-sm mb-6" style={{ color: colors.darkGreen }}>
                                첫 번째 시니어와 연결해보세요
                            </Text>
                            <TouchableOpacity
                                onPress={handleAddSenior}
                                className="rounded-2xl px-8 py-4 shadow-lg"
                                style={{
                                    backgroundColor: colors.darkGreen,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 6,
                                }}
                            >
                                <Text className="text-white font-bold text-base">시니어 연결하기</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                </View>
            </ScrollView>
        </View>
    );
}
