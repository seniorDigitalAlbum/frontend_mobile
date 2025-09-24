import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { gradientColors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import conversationApiService from '../services/api/conversationApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'SeniorAlbumList'>;

// Conversation 타입 import
import { Conversation } from '../services/api/conversationApiService';

export default function SeniorAlbumList({ route, navigation }: Props) {
    const { seniorId, seniorName } = route.params;
    const [albums, setAlbums] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAlbums();
    }, [seniorId]);

    const loadAlbums = async () => {
        setIsLoading(true);
        try {
            console.log('시니어 앨범 목록 조회 시작:', seniorName);
            
            // 시니어 ID를 userId로 사용하여 API 호출
            // 테스트 환경에서는 실제 userId를 사용해야 함
            let userId: string;
            if (seniorId === 123) {
                // 테스트 시니어의 실제 userId
                userId = 'test_user_123';
            } else {
                userId = seniorId.toString();
            }
            const seniorAlbums = await conversationApiService.getConversationsByUser(userId);
            console.log('API에서 받은 시니어 대화 목록:', seniorAlbums);
            
            // COMPLETED 상태인 대화만 필터링 (완료된 대화만 앨범으로 표시)
            const completedAlbums = seniorAlbums.filter(conversation => conversation.status === 'COMPLETED');
            console.log('완료된 시니어 대화 목록:', completedAlbums);
            
            setAlbums(completedAlbums);
            console.log('앨범 수:', completedAlbums.length);
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

    const handleAlbumPress = (album: Conversation) => {
        console.log('앨범 선택:', generateAlbumTitle(album));
        // 앨범 상세 페이지로 이동
        navigation.navigate('AlbumDetail', { 
            conversationId: album.id,
            diary: album.diary || `${seniorName}님의 대화 기록`,
            finalEmotion: album.dominantEmotion || '기본'
        });
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'happy': return 'bg-yellow-100 text-yellow-800';
            case 'sad': return 'bg-blue-100 text-blue-800';
            case 'angry': return 'bg-red-100 text-red-800';
            case 'anxious': return 'bg-purple-100 text-purple-800';
            case 'surprised': return 'bg-orange-100 text-orange-800';
            case 'hurt': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const generateAlbumTitle = (album: Conversation) => {
        // 일기 내용이 있으면 첫 번째 문장을 제목으로 사용
        if (album.diary && album.diary.trim()) {
            const firstSentence = album.diary.split('.')[0];
            return firstSentence.length > 20 ? firstSentence.substring(0, 20) + '...' : firstSentence;
        }
        
        // 감정 기반 제목 생성
        if (album.dominantEmotion) {
            const emotionMap: { [key: string]: string } = {
                'happy': '기쁨의 하루',
                'sad': '슬픈 하루',
                'angry': '분노의 하루',
                'anxious': '불안한 하루',
                'surprised': '당황스러운 하루',
                'hurt': '상처받은 하루'
            };
            return emotionMap[album.dominantEmotion] || '특별한 하루';
        }
        
        return '기억의 하루';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderAlbumItem = (album: Conversation) => (
        <TouchableOpacity
            key={album.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => handleAlbumPress(album)}
        >
            <View className="flex-row items-center">
                {/* 앨범 썸네일 */}
                <View className="w-16 h-16 rounded-lg bg-gray-200 mr-4 items-center justify-center">
                    <Text className="text-gray-500 text-lg">📖</Text>
                </View>
                
                {/* 앨범 정보 */}
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {generateAlbumTitle(album)}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                        {formatDate(album.createdAt)}
                    </Text>
                    <View className={`px-2 py-1 rounded-full self-start ${getEmotionColor(album.dominantEmotion)}`}>
                        <Text className="text-xs font-medium">
                            {album.dominantEmotion || '기본'}
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
