import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert, StatusBar, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { colors } from '../styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import conversationApiService from '../services/api/conversationApiService';
import { useUser } from '../contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SeniorAlbumList'>;

// Conversation 타입 import
import { Conversation } from '../services/api/conversationApiService';

export default function SeniorAlbumList({ route, navigation }: Props) {
    const { seniorId, seniorName } = route.params;
    const { user } = useUser();
    const [albums, setAlbums] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [diaryList, setDiaryList] = useState<any[]>([]);

    // 감정에 따른 이미지 매핑
    const getEmotionImage = (emotion: string) => {
        const emotionMap: Record<string, any> = {
            '기쁨': require('../assets/happy.png'),
            '슬픔': require('../assets/sad.png'),
            '분노': require('../assets/angry.png'),
            '불안': require('../assets/fear.png'),
            '당황': require('../assets/surprised.png'),
            '상처': require('../assets/hurt.png')
        };
        return emotionMap[emotion] || require('../assets/happy.png');
    };

    useEffect(() => {
        loadAlbums();
    }, [seniorId, user?.id]);

    const loadAlbums = async () => {
        if (!user?.id) {
            console.error('사용자 정보가 없습니다.');
            Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
            return;
        }

        setIsLoading(true);
        try {
            console.log('시니어 공개 앨범 목록 조회 시작:', seniorName);
            
            // 새로운 API 사용: 보호자가 연결된 특정 시니어의 대화 목록 조회
            const allAlbums = await conversationApiService.getSeniorConversations(
                seniorId.toString(), 
                user.id
            );
            console.log('API에서 받은 시니어 대화 목록:', allAlbums);
            
            // COMPLETED 상태이고 공개된 앨범만 필터링
            const publicAlbums = allAlbums.filter(album => 
                album.status === 'COMPLETED' && album.isPublic === true
            );
            console.log('공개된 앨범 목록:', publicAlbums);
            
            setAlbums(publicAlbums);
            console.log('공개 앨범 수:', publicAlbums.length);

            // 감정 이름 매핑
            const emotionMap: { [key: string]: string } = {
                'happy': '기쁨',
                'sad': '슬픔',
                'angry': '분노',
                'anxious': '불안',
                'surprised': '당황',
                'hurt': '상처'
            };

            // 대화 데이터를 일기 형태로 변환
            const diaryData = await Promise.all(publicAlbums.map(async (conversation) => {
                // 일기 내용이 없거나 비어있으면 null 반환
                if (!conversation.diary || conversation.diary.trim() === '') {
                    return null;
                }

                // 앨범 표지 사진 조회
                const albumPhotos = await apiClient.get<any[]>(`/api/albums/${conversation.id}/photos`);
                const coverPhoto = albumPhotos.find(photo => photo.isCover);
                
                // 제목과 내용을 분리하는 함수
                const separateTitleAndContent = (diaryContent: string, dominantEmotion: string) => {
                    const lines = diaryContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                    
                    // "제목:" 패턴 찾기
                    const titleIndex = lines.findIndex(line => line.startsWith('제목:'));
                    
                    if (titleIndex !== -1) {
                        // 제목이 있는 경우
                        const title = lines[titleIndex].replace(/^제목:\s*/, '').trim();
                        const contentLines = lines.slice(titleIndex + 1);
                        return {
                            title: title || '특별한 하루',
                            content: contentLines.join(' ').trim() || '일기가 아직 생성되지 않았습니다.'
                        };
                    } else {
                        // 제목이 없는 경우 - 첫 번째 줄을 제목으로, 나머지를 내용으로
                        if (lines.length > 1) {
                            const firstLine = lines[0];
                            const title = firstLine.length > 10 ? firstLine.substring(0, 10) + '...' : firstLine;
                            const content = lines.slice(1).join(' ').trim();
                            return {
                                title: title,
                                content: content || '일기가 아직 생성되지 않았습니다.'
                            };
                        } else {
                            // 한 줄만 있는 경우
                            const singleLine = lines[0];
                            if (singleLine.length > 10) {
                                return {
                                    title: singleLine.substring(0, 10) + '...',
                                    content: singleLine.substring(10).trim() || '일기가 아직 생성되지 않았습니다.'
                                };
                            } else {
                                return {
                                    title: singleLine,
                                    content: '일기가 아직 생성되지 않았습니다.'
                                };
                            }
                        }
                    }
                };
                
                const { title: extractedTitle, content: cleanedContent } = separateTitleAndContent(conversation.diary || '', conversation.dominantEmotion || '기쁨');
                
                return {
                    id: conversation.id,
                    title: extractedTitle,
                    date: new Date(conversation.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                    }),
                    preview: cleanedContent ? cleanedContent.substring(0, 100) + '...' : '일기가 생성 중입니다...',
                    imageUrl: coverPhoto ? coverPhoto.imageUrl : 'https://picsum.photos/200/200?random=' + conversation.id,
                    content: cleanedContent || '일기가 아직 생성되지 않았습니다.',
                    isPending: (conversation as any).processingStatus !== 'COMPLETED',
                    emotion: conversation.dominantEmotion || '기쁨'
                };
            }));

            // null 값 필터링 (일기 내용이 없는 대화 제외)
            const validDiaryData = diaryData.filter(diary => diary !== null);
            
            setDiaryList(validDiaryData);
            console.log('일기 데이터 변환 완료:', validDiaryData);
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

    const handleDiaryPress = async (diary: any) => {
        // Album.tsx와 동일한 방식으로 앨범 선택 처리
        console.log('앨범 선택:', diary.title);
        
        try {
            const diaryDetail = await apiClient.get<any>(`/api/conversations/${diary.id}/diary`);
            
            if (diaryDetail) {
                navigation.navigate('AlbumDetail', {
                    conversationId: diaryDetail.conversationId,
                    diary: diaryDetail.diary,
                    title: diaryDetail.title,
                    finalEmotion: diaryDetail.emotionSummary?.dominantEmotion || '기쁨',
                    musicRecommendations: diaryDetail.musicRecommendations || []
                } as any);
            } else {
                // fallback
                navigation.navigate('AlbumDetail', { 
                    conversationId: diary.id,
                    diary: diary.content,
                    title: diary.title || '특별한 하루',
                    finalEmotion: '기쁨',
                    musicRecommendations: []
                } as any);
            }
        } catch (error) {
            console.error('일기 상세 조회 실패:', error);
            navigation.navigate('AlbumDetail', { 
                conversationId: diary.id,
                diary: diary.content,
                title: diary.title || '특별한 하루',
                finalEmotion: '기쁨'
            } as any);
        }
    };

    const renderDiaryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => handleDiaryPress(item)}
            className="flex-1 mb-6 mx-2"
            activeOpacity={0.8}
        >
            <View
                className="rounded-2xl"
                style={{
                    backgroundColor: colors.beige,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                    minHeight: 200,
                }}
            >
                {/* 일기 내용 */}
                <View className="p-6">
                    {/* 저장 중 상태 표시 */}
                    {item.isPending && (
                        <View className="absolute top-4 right-4 bg-yellow-500 rounded-full px-3 py-1">
                            <Text className="text-white font-medium text-sm">
                                저장 중...
                            </Text>
                        </View>
                    )}
                    
                    {/* 감정 이미지 */}
                    <View className="mb-4">
                            <Image 
                                source={getEmotionImage(item.emotion)} 
                                style={{
                                    width: 60,
                                    height: 60,
                                }}
                                resizeMode="contain"
                            />  
                    </View>
                    
                    {/* 날짜 */}
                    <View className="mb-4">
                        <Text className="text-lg text-gray-500">
                            {item.date}
                        </Text>
                    </View>
                    
                    {/* 제목 */}
                    <Text className="font-bold mb-4 text-4xl leading-10 text-gray-800">
                        {item.title}
                    </Text>
                    
                    {/* 미리보기 */}
                    <Text className="leading-6 text-xl text-gray-600" numberOfLines={3}>
                        {item.preview}
                    </Text>
                    
                    {/* 하단 아이콘과 액션 */}
                    <View className="flex-row items-center justify-between mt-6">
                        <View className="flex-row items-center">
                            <Ionicons 
                                name="heart-outline" 
                                size={16} 
                                color={colors.green} 
                            />
                            <Text className="ml-2 text-sm text-gray-500">
                                특별한 순간
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="mr-2 text-sm text-gray-500">
                                자세히 보기
                            </Text>
                            <Ionicons 
                                name="chevron-forward" 
                                size={20} 
                                color={colors.green} 
                            />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
            
            {/* 헤더 */}
            <View className="px-6 pt-12 pb-4 bg-gray-50">
                <TouchableOpacity
                    className="mb-6"
                    onPress={() => navigation.goBack()}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="arrow-back" size={24} color={colors.green} />
                        <Text className="text-lg font-medium ml-2" style={{ color: colors.green }}>뒤로가기</Text>
                    </View>
                </TouchableOpacity>
                
                <Text className="text-3xl font-bold mb-2 text-gray-800">
                    {seniorName}님의 일기장
                </Text>
                <Text className="text-lg text-gray-600">
                    {diaryList.length}개의 일기
                </Text>
            </View>

            {/* 일기 목록 또는 빈 상태 */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-xl text-gray-500">
                        일기를 불러오는 중...
                    </Text>
                </View>
            ) : diaryList.length > 0 ? (
                <FlatList
                    data={diaryList}
                    renderItem={renderDiaryItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={1}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-8">
                    <View className="items-center">
                        <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
                            <Ionicons name="book-outline" size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-xl font-medium text-gray-600 mb-2">
                            공개된 일기가 없어요
                        </Text>
                        <Text className="text-base text-gray-500 text-center leading-6">
                            시니어가 대화를 완료하고{'\n'}공개하면 여기에서 볼 수 있습니다
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
