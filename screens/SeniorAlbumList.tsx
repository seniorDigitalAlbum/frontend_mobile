import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
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
            console.log('시니어 공개 앨범 목록 조회 시작:', seniorName);
            
            // 시니어 ID를 userId로 사용하여 API 호출
            // 테스트 환경에서는 실제 userId를 사용해야 함
            let userId: string;
            if (seniorId === 123) {
                // 테스트 시니어의 실제 userId
                userId = 'test_user_123';
            } else {
                userId = seniorId.toString();
            }
            
            // 시니어의 모든 완료된 대화 조회
            const allAlbums = await conversationApiService.getConversationsByUser(userId);
            console.log('API에서 받은 시니어 대화 목록:', allAlbums);
            
            // COMPLETED 상태이고 공개된 앨범만 필터링
            const publicAlbums = allAlbums.filter(album => 
                album.status === 'COMPLETED' && album.isPublic === true
            );
            console.log('공개된 앨범 목록:', publicAlbums);
            
            setAlbums(publicAlbums);
            console.log('공개 앨범 수:', publicAlbums.length);
        } catch (error) {
            console.error('공개 앨범 목록 조회 실패:', error);
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

    const handleAlbumPress = async (album: Conversation) => {
        console.log('앨범 선택:', generateAlbumTitle(album));
        
        try {
            // 시니어와 동일하게 상세 데이터를 가져와서 AlbumDetail로 이동
            const diaryDetail = await conversationApiService.getDiaryByConversation(album.id);
            
            if (diaryDetail) {
                navigation.navigate('AlbumDetail', {
                    conversationId: diaryDetail.conversationId,
                    diary: diaryDetail.diary,
                    title: diaryDetail.title,
                    finalEmotion: diaryDetail.emotionSummary?.dominantEmotion || '기쁨',
                    musicRecommendations: diaryDetail.musicRecommendations || []
                });
            } else {
                // fallback: 기본 데이터로 이동
                navigation.navigate('AlbumDetail', { 
                    conversationId: album.id,
                    diary: album.diary || `${seniorName}님의 대화 기록`,
                    finalEmotion: '기쁨'
                });
            }
        } catch (error) {
            console.error('앨범 상세 조회 실패:', error);
            // 에러 시에도 기본 데이터로 이동
            navigation.navigate('AlbumDetail', { 
                conversationId: album.id,
                diary: album.diary || `${seniorName}님의 대화 기록`,
                finalEmotion: '기쁨'
            });
        }
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
            className="mb-4"
            onPress={() => handleAlbumPress(album)}
        >
            <View
                className="rounded-2xl p-5 shadow-sm"
                style={{
                    backgroundColor: colors.beige,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <View className="flex-row items-center">
                    {/* 앨범 썸네일 */}
                    <View className="w-16 h-16 rounded-xl bg-white mr-4 items-center justify-center shadow-sm">
                        <Text className="text-xl" style={{ color: colors.green }}>📖</Text>
                    </View>
                    
                    {/* 앨범 정보 */}
                    <View className="flex-1">
                        <Text className="text-lg font-bold mb-1" style={{ color: colors.darkGreen }}>
                            {generateAlbumTitle(album)}
                        </Text>
                        <Text className="text-sm mb-3" style={{ color: colors.darkGreen }}>
                            {formatDate(album.createdAt)}
                        </Text>
                        <View className={`px-3 py-1 rounded-full self-start ${getEmotionColor(album.dominantEmotion)}`}>
                            <Text className="text-xs font-medium">
                                {album.dominantEmotion || '기본'}
                            </Text>
                        </View>
                    </View>
                    
                    {/* 화살표 */}
                    <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                        <Text className="text-lg" style={{ color: colors.green }}>→</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                    <View className="mb-8">
                        <TouchableOpacity
                            className="mb-6"
                            onPress={() => navigation.goBack()}
                        >
                            <View className="flex-row items-center">
                                <Text className="text-lg mr-2" style={{ color: colors.green }}>←</Text>
                                <Text className="text-lg font-medium" style={{ color: colors.green }}>뒤로가기</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <Text className="text-3xl font-bold mb-2" style={{ color: colors.darkGreen }}>
                            {seniorName}님의 앨범
                        </Text>
                        <Text className="text-lg" style={{ color: colors.darkGreen }}>
                            {albums.length}개의 일기가 있습니다
                        </Text>
                    </View>

                    {/* 앨범 목록 */}
                    {isLoading ? (
                        <View className="items-center py-12">
                            <Text className="text-lg" style={{ color: colors.darkGreen }}>앨범 목록을 불러오는 중...</Text>
                        </View>
                    ) : albums.length > 0 ? (
                        <View className="mb-8">
                            {albums.map(renderAlbumItem)}
                        </View>
                    ) : (
                        <View className="items-center py-16 mt-40">
                            <Text className="text-center text-3xl mb-4" style={{ color: 'black' }}>
                                공개된 일기가 없습니다.
                            </Text>
                            <Text className="text-sm text-center">
                                시니어가 대화를 완료하고{'\n'} 공개하면 여기에서 볼 수 있습니다.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
