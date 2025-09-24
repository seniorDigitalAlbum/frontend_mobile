import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'SeniorAlbumList'>;

// 임시 앨범 데이터 타입
interface Album {
  id: number;
  title: string;
  date: string;
  emotion: string;
  thumbnail?: string;
}

export default function SeniorAlbumList({ route, navigation }: Props) {
    const { seniorId, seniorName } = route.params;
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAlbums();
    }, [seniorId]);

    const loadAlbums = async () => {
        setIsLoading(true);
        try {
            console.log('시니어 앨범 목록 조회 시작:', seniorName);
            
            // 임시 데이터 (실제로는 API 호출)
            const mockAlbums: Album[] = [
                {
                    id: 1,
                    title: "어린 시절 추억",
                    date: "2024-01-15",
                    emotion: "행복",
                    thumbnail: undefined
                },
                {
                    id: 2,
                    title: "가족과의 시간",
                    date: "2024-01-10",
                    emotion: "평온",
                    thumbnail: undefined
                },
                {
                    id: 3,
                    title: "첫사랑 이야기",
                    date: "2024-01-05",
                    emotion: "그리움",
                    thumbnail: undefined
                }
            ];
            
            setAlbums(mockAlbums);
            console.log('앨범 수:', mockAlbums.length);
        } catch (error) {
            console.error('앨범 목록 조회 실패:', error);
            Alert.alert('오류', '앨범 목록을 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAlbums();
        setRefreshing(false);
    };

    const handleAlbumPress = (album: Album) => {
        console.log('앨범 선택:', album.title);
        // 앨범 상세 페이지로 이동 (임시 데이터)
        navigation.navigate('AlbumDetail', { 
            conversationId: album.id,
            diary: `${seniorName}님의 ${album.title}`,
            finalEmotion: album.emotion
        });
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case '행복': return 'bg-yellow-100 text-yellow-800';
            case '평온': return 'bg-green-100 text-green-800';
            case '그리움': return 'bg-purple-100 text-purple-800';
            case '슬픔': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderAlbumItem = (album: Album) => (
        <TouchableOpacity
            key={album.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => handleAlbumPress(album)}
        >
            <View className="flex-row items-center">
                {/* 앨범 썸네일 */}
                <View className="w-16 h-16 rounded-lg bg-gray-200 mr-4 items-center justify-center">
                    {album.thumbnail ? (
                        <Image 
                            source={{ uri: album.thumbnail }}
                            className="w-16 h-16 rounded-lg"
                        />
                    ) : (
                        <Text className="text-gray-500 text-lg">📖</Text>
                    )}
                </View>
                
                {/* 앨범 정보 */}
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {album.title}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                        {album.date}
                    </Text>
                    <View className={`px-2 py-1 rounded-full self-start ${getEmotionColor(album.emotion)}`}>
                        <Text className="text-xs font-medium">
                            {album.emotion}
                        </Text>
                    </View>
                </View>
                
                {/* 화살표 */}
                <Text className="text-gray-400 text-lg">→</Text>
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
                        <TouchableOpacity
                            className="mb-4"
                            onPress={() => navigation.goBack()}
                        >
                            <Text className="text-blue-500 text-base">← 뒤로가기</Text>
                        </TouchableOpacity>
                        
                        <Text className="text-2xl font-bold text-gray-800 mb-2">
                            {seniorName}님의 앨범
                        </Text>
                        <Text className="text-gray-600">
                            {albums.length}개의 앨범이 있습니다
                        </Text>
                    </View>

                    {/* 앨범 목록 */}
                    {isLoading ? (
                        <View className="items-center py-8">
                            <Text className="text-gray-600">앨범 목록을 불러오는 중...</Text>
                        </View>
                    ) : albums.length > 0 ? (
                        <View className="mb-6">
                            {albums.map(renderAlbumItem)}
                        </View>
                    ) : (
                        <View className="items-center py-12">
                            <Text className="text-gray-600 text-center mb-4">
                                아직 생성된 앨범이 없습니다.
                            </Text>
                            <Text className="text-sm text-gray-500 text-center">
                                시니어가 대화를 시작하면 앨범이 생성됩니다.
                            </Text>
                        </View>
                    )}

                    {/* 도움말 */}
                    <View className="bg-white rounded-xl p-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">
                            앨범 정보
                        </Text>
                        <Text className="text-sm text-gray-600 mb-2">
                            • 각 앨범은 시니어의 대화 내용을 담고 있습니다
                        </Text>
                        <Text className="text-sm text-gray-600 mb-2">
                            • 감정 분석 결과를 통해 분류됩니다
                        </Text>
                        <Text className="text-sm text-gray-600 mb-2">
                            • 앨범을 탭하면 상세 내용을 볼 수 있습니다
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}
