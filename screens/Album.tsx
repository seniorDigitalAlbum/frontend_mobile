import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { conversationApiService, Conversation as ConversationType } from '../services/api/albumApiService';
import { useAccessibility } from '../contexts/AccessibilityContext';

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
    const { settings } = useAccessibility();
    const [refreshing, setRefreshing] = useState(false);
    const [albums, setAlbums] = useState<ConversationType[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();
    const isLoadingRef = useRef(false);

    const userId = "1"; // 하드코딩된 사용자 ID

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

            // 대화 데이터를 일기 형태로 변환
            const diaryData = completedAlbums.map(conversation => ({
                id: conversation.id,
                title: `${emotionMap[conversation.dominantEmotion] || conversation.dominantEmotion}의 하루`,
                date: new Date(conversation.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                }),
                preview: conversation.diary ? conversation.diary.substring(0, 100) + '...' : '일기가 생성 중입니다...',
                imageUrl: 'https://picsum.photos/200/200?random=' + conversation.id,
                content: conversation.diary || '일기가 아직 생성되지 않았습니다.',
                isPending: conversation.processingStatus !== 'COMPLETED'
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
        // 일기 상세 화면으로 이동
        console.log('일기 선택:', diary.title);
        
        try {
            // 백엔드에서 일기 상세 정보 조회
            console.log('일기 상세 정보 API 호출:', diary.id);
            const diaryDetail = await conversationApiService.getDiaryByConversation(diary.id);
            
            if (diaryDetail) {
                navigation.navigate('DiaryResult', {
                    diary: diaryDetail.diary,
                    conversationId: diaryDetail.conversationId,
                    finalEmotion: diaryDetail.emotionSummary.dominantEmotion,
                    userId: userId,
                    musicRecommendations: diaryDetail.musicRecommendations
                });
            } else {
                console.error('일기 상세 정보를 찾을 수 없습니다.');
                // Context에서 일기 데이터 확인 (fallback)
                const diaryFromContext = getDiaryById(diary.id);
                if (diaryFromContext && diaryFromContext.content) {
                    navigation.navigate('DiaryResult', { 
                        diary: diaryFromContext.content 
                    });
                }
            }
        } catch (error) {
            console.error('일기 상세 조회 실패:', error);
            // Context에서 일기 데이터 확인 (fallback)
            const diaryFromContext = getDiaryById(diary.id);
            if (diaryFromContext && diaryFromContext.content) {
                navigation.navigate('DiaryResult', { 
                    diary: diaryFromContext.content 
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
            className="flex-1 bg-white rounded-2xl shadow-sm mb-4 mx-2 overflow-hidden"
            activeOpacity={0.8}
        >
            {/* 일기 이미지 */}
            <View className="w-full h-32 bg-gray-200">
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                {/* 저장 중 상태 표시 */}
                {item.isPending && (
                    <View className={`absolute top-2 left-2 bg-yellow-500 rounded-full ${settings.isLargeTextMode ? 'px-3 py-2' : 'px-2 py-1'}`}>
                        <Text className={`text-white font-medium ${settings.isLargeTextMode ? 'text-sm' : 'text-xs'}`}>
                            저장 중...
                        </Text>
                    </View>
                )}
            </View>
            
            {/* 일기 내용 */}
            <View className={`${settings.isLargeTextMode ? 'p-6' : 'p-4'}`}>
                {/* 날짜 */}
                <Text className={`mb-2 ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {item.date}
                </Text>
                
                {/* 제목 */}
                <Text className={`font-semibold mb-2 leading-5 ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`} numberOfLines={2}>
                    {item.title}
                </Text>
                
                {/* 미리보기 */}
                <Text className={`leading-4 ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600'}`} numberOfLines={2}>
                    {item.preview}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${settings.isHighContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
                <Text className={`${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-500'}`}>
                    일기를 불러오는 중...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
            {/* 일기 목록 */}
            <FlatList
                data={state.diaries}
                renderItem={renderDiaryItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ListHeaderComponent={
                    <View className={`${settings.isLargeTextMode ? 'px-6 py-8' : 'px-4 py-6'}`}>
                        <Text className={`font-bold mb-2 ${settings.isLargeTextMode ? 'text-3xl' : 'text-2xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                            나의 일기장
                        </Text>
                        <Text className={`${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            특별한 순간들을 담은 일기들을 확인해보세요
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
