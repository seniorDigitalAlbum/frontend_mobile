import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import conversationApiService, { Conversation as ConversationType } from '../services/api/conversationApiService';
import albumApiService from '../services/api/albumApiService';
import { MockService, shouldUseMock } from '../services/mockService';
import { useUser } from '../contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/commonStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 임시 일기 데이터 (나중에 API로 연결)
const generateMockDiaries = () => {
    const diaries = [];
    for (let i = 1; i <= 20; i++) {
        diaries.push({
            id: i,
            title: `오늘은 정말 특별한 하루였어요 #${i}`,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            }),
            preview: `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다...`,
            imageUrl: `https://picsum.photos/200/200?random=${i}`,
            content: `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다. 햇살이 따뜻하게 비치는 날씨 속에서 우리는 웃음소리를 내며 뛰어다녔고, 서로를 찾는 과정에서 더욱 친해질 수 있었습니다.`,
            isPending: false
        });
    }
    return diaries;
};

export default function Album() {
    const { state, setDiaries, getDiaryById } = useDiary();
    const [refreshing, setRefreshing] = useState(false);
    const [albums, setAlbums] = useState<ConversationType[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();
    const isLoadingRef = useRef(false);

    const { user } = useUser();
    const userId = user?.userId || "1"; // UserContext에서 가져온 실제 사용자 ID

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

    // 초기 데이터 로드 - 실제 API 호출
    useEffect(() => {
        console.log('Album 컴포넌트 마운트됨');
        loadAlbumsFromAPI();
    }, []);

    const loadAlbumsFromAPI = async () => {
        try {
            setLoading(true);
            console.log('사용자 대화 목록 API 호출 시작:', userId);
            
            const userAlbums = await conversationApiService.getConversationsByUser(userId);
            console.log('API에서 받은 대화 목록:', userAlbums);
            
            // COMPLETED 상태인 대화만 필터링
            const completedAlbums = userAlbums.filter(conversation => conversation.status === 'COMPLETED');
            console.log('완료된 대화 목록:', completedAlbums);
            
            setAlbums(completedAlbums);
            
            // 감정 이름 매핑
            const emotionMap: { [key: string]: string } = {
                'happy': '기쁨',
                'sad': '슬픔',
                'angry': '분노',
                'anxious': '불안',
                'surprised': '당황',
                'hurt': '상처'
            };

            // 대화 데이터를 일기 형태로 변환 (앨범 표지 정보 포함)
            const diaryData = await Promise.all(completedAlbums.map(async (conversation) => {
                // 앨범 표지 사진 조회
                const albumPhotos = await albumApiService.getPhotos(conversation.id);
                const coverPhoto = albumPhotos.find(photo => photo.isCover);
                
                // 제목과 내용을 분리하는 함수
                const separateTitleAndContent = (diaryContent: string, dominantEmotion: string) => {
                    if (!diaryContent) {
                        return {
                            title: dominantEmotion && emotionMap[dominantEmotion] 
                                ? `${emotionMap[dominantEmotion]}의 하루` 
                                : '특별한 하루',
                            content: '일기가 아직 생성되지 않았습니다.'
                        };
                    }

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
                
                const { title: extractedTitle, content: cleanedContent } = separateTitleAndContent(conversation.diary, conversation.dominantEmotion);
                
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
                    isPending: conversation.processingStatus !== 'COMPLETED',
                    emotion: conversation.dominantEmotion || '기쁨'
                };
            }));
            
            setDiaries(diaryData);
            console.log('일기 데이터 변환 완료:', diaryData);
            
        } catch (error) {
            console.error('앨범 데이터 로드 실패:', error);
            // API 실패 시 목업 데이터 사용
            setDiaries(generateMockDiaries());
        } finally {
            setLoading(false);
        }
    };

    const handleDiaryPress = async (diary: any) => {
        // 앨범 상세 화면으로 이동
        console.log('앨범 선택:', diary.title);
        
        try {
            // 백엔드에서 일기 상세 정보 조회
            console.log('일기 상세 정보 API 호출:', diary.id);
            const diaryDetail = await conversationApiService.getDiaryByConversation(diary.id);
            
            if (diaryDetail) {
                // 앨범 상세 페이지로 이동
                navigation.navigate('AlbumDetail', {
                    conversationId: diaryDetail.conversationId,
                    diary: diaryDetail.diary,
                    title: diaryDetail.title, // 생성된 제목 전달
                    finalEmotion: diaryDetail.emotionSummary?.dominantEmotion || '기쁨',
                    musicRecommendations: diaryDetail.musicRecommendations || []
                });
            } else {
                console.error('일기 상세 정보를 찾을 수 없습니다.');
                // Context에서 일기 데이터 확인 (fallback)
                const diaryFromContext = getDiaryById(diary.id);
                if (diaryFromContext && diaryFromContext.content) {
                    navigation.navigate('AlbumDetail', { 
                        conversationId: diary.id,
                        diary: diaryFromContext.content,
                        title: diaryFromContext.title || '특별한 하루', // fallback 제목
                        finalEmotion: '기쁨',
                        musicRecommendations: []
                    });
                }
            }
        } catch (error) {
            console.error('일기 상세 조회 실패:', error);
            // Context에서 일기 데이터 확인 (fallback)
            const diaryFromContext = getDiaryById(diary.id);
            if (diaryFromContext && diaryFromContext.content) {
                navigation.navigate('AlbumDetail', { 
                    conversationId: diary.id,
                    diary: diaryFromContext.content,
                    title: diaryFromContext.title || '특별한 하루', // fallback 제목
                    finalEmotion: '기쁨'
                });
            }
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            console.log('앨범 새로고침 시작');
            await loadAlbumsFromAPI();
        } catch (error) {
            console.error('앨범 새로고침 실패:', error);
        } finally {
            setRefreshing(false);
        }
    }, [userId]);

    const loadMoreDiaries = useCallback(() => {
        // 무한 스크롤을 위한 추가 데이터 로드 (나중에 API 연동)
        console.log('추가 일기 로드 중...');
    }, []);

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

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-xl text-gray-500">
                    일기를 불러오는 중...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 일기 목록 */}
            <FlatList
                data={state.diaries}
                renderItem={renderDiaryItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={1}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ListHeaderComponent={
                    <View className="px-4 py-6">
                        <Text className="text-3xl font-bold mb-3 text-gray-800">
                            나의 일기장
                        </Text>
                    </View>
                }
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onEndReached={loadMoreDiaries}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
