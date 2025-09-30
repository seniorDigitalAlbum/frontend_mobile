import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import NotificationIcon from '../components/NotificationIcon';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import guardianService, { SeniorInfo } from '../services/guardianService';
import apiClient from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianMain'>;

export default function GuardianMain({ navigation }: Props) {
    const { user } = useUser();
    const [connectedSeniors, setConnectedSeniors] = useState<SeniorInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [seniorCoverPhotos, setSeniorCoverPhotos] = useState<{[key: string]: string}>({});


    useEffect(() => {
        // 사용자 인증 상태 확인
        if (!user || !user.token) {
            console.log('사용자 인증 정보 없음 - 로그인 화면으로 이동');
            Alert.alert('인증 필요', '로그인이 필요합니다.', [
                {
                    text: '확인',
                    onPress: () => navigation.navigate('Login' as any)
                }
            ]);
            return;
        }

        loadConnectedSeniors();
        
        // 전역 로그아웃 이벤트 리스너 (React Native용)
        const handleLogout = () => {
            navigation.navigate('Login' as any);
        };
        
        // React Native 환경에서는 window 객체가 다르게 동작할 수 있으므로 더 안전하게 체크
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('auth:logout', handleLogout);
        }
        
        return () => {
            if (typeof window !== 'undefined' && window.removeEventListener) {
                window.removeEventListener('auth:logout', handleLogout);
            }
        };
    }, [user]);

    // 화면 포커스 시 표지 사진 새로고침
    useFocusEffect(
        React.useCallback(() => {
            if (connectedSeniors.length > 0) {
                loadSeniorCoverPhotos(connectedSeniors);
            }
        }, [connectedSeniors])
    );

    const loadConnectedSeniors = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            console.log('시니어 목록 조회 시작');
            
            let seniors: SeniorInfo[] = [];
            
            // 실제 API 호출 - 승인된 시니어만 조회
            seniors = await guardianService.getConnectedSeniors(parseInt(user.id));
            console.log('전체 시니어 수:', seniors.length);
            
            setConnectedSeniors(seniors);
            
            // 시니어별 표지 사진 로드
            await loadSeniorCoverPhotos(seniors);
            
        } catch (error) {
            console.error('시니어 목록 조회 실패:', error);
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
                try {
                    const coverPhoto = await apiClient.get<any>(`/api/albums/senior/${senior.id}/cover-photo`);
                    if (coverPhoto && coverPhoto.imageUrl) {
                        coverPhotos[senior.id.toString()] = coverPhoto.imageUrl;
                    }
                } catch (error) {
                    console.log(`시니어 ${senior.id}의 표지 사진 없음`);
                    // 표지 사진이 없는 경우 무시하고 계속 진행
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
        navigation.navigate('GuardianConnection');
    };

    const handleSeniorPress = (senior: SeniorInfo) => {
        console.log('시니어 선택:', senior.name);
        navigation.navigate('SeniorAlbumList', { seniorId: senior.id, seniorName: senior.name });
    };

    const renderSeniorItem = (senior: SeniorInfo) => {
        const coverPhoto = seniorCoverPhotos[senior.id.toString()];
        const defaultImage = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop';
        
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
                    <View className="h-100 relative">
                        <Image 
                            source={{ uri: coverPhoto || defaultImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20" />
                        
                        {/* 시니어 이름 표시 */}
                        <View className="absolute bottom-0 left-0 right-0 p-4">
                            <Text className="text-white text-4xl font-bold">
                                {senior.name}
                            </Text>
                        </View>
                    </View>
                    
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            
            {/* 알림 아이콘 */}
            <View
                className="absolute top-12 right-6 z-10 bg-white rounded-full p-3 shadow-lg"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                }}
            >
                <NotificationIcon size={24} color="#000" />
            </View>
            
            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="flex-1 px-6 pt-12 pb-20">
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
                            <Text style={{ color: 'black' }}>시니어 목록을 불러오는 중...</Text>
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
                                            backgroundColor: colors.beige,
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
                        >
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
            
            {/* 하단 네비게이션 바 */}
            <View 
                className="absolute bottom-5 left-5 right-5 flex-row justify-around items-center"
                style={{
                    height: 60,
                    backgroundColor: 'white',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.18)',
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 32,
                    elevation: 8,
                }}
            >
                {/* 홈 버튼 */}
                <TouchableOpacity 
                    className="flex-1 items-center justify-center py-2"
                    onPress={() => {
                        // 현재 화면이므로 아무것도 하지 않음
                    }}
                >
                    <View className="w-8 h-8 items-center justify-center mb-1">
                        <Text className="text-2xl">🏠</Text>
                    </View>
                    <Text className="text-xs font-medium" style={{ color: '#000' }}>
                        홈
                    </Text>
                </TouchableOpacity>

                {/* 마이페이지 버튼 */}
                <TouchableOpacity 
                    className="flex-1 items-center justify-center py-2"
                    onPress={() => navigation.navigate('MyPage')}
                >
                    <View className="w-8 h-8 items-center justify-center mb-1">
                        <Text className="text-2xl">👤</Text>
                    </View>
                    <Text className="text-xs font-medium" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                        마이페이지
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
