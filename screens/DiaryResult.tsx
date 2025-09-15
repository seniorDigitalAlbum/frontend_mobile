import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';
import { albumApiService } from '../services/api/albumApiService';
import conversationApiService from '../services/api/conversationApiService';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

type Props = NativeStackScreenProps<RootStackParamList, 'DiaryResult'>;

export default function DiaryResult({ route }: Props) {
    const { settings } = useAccessibility();
    const { 
        diary, 
        conversationId, 
        finalEmotion = '기쁨',
        userId = "1", // 하드코딩된 사용자 ID
        musicRecommendations = []
    } = route.params || { diary: '일기가 생성되지 않았습니다.' };
    const { addDiary, updateDiary, removeDiary } = useDiary();
    const navigation = useNavigation();
    
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [diaryData, setDiaryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 일기 데이터 로드
    useEffect(() => {
        const loadDiaryData = async () => {
            if (conversationId) {
                try {
                    setLoading(true);
                    const diaryResponse = await conversationApiService.getDiary(conversationId);
                    if (diaryResponse) {
                        setDiaryData(diaryResponse);
                        console.log('일기 데이터 로드됨:', diaryResponse);
                    }
                } catch (error) {
                    console.error('일기 데이터 로드 실패:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadDiaryData();
    }, [conversationId]);

    // 음악 자동 재생
    useEffect(() => {
        const playBackgroundMusic = async () => {
            const musicList = diaryData?.musicRecommendations || musicRecommendations;
            if (musicList.length > 0) {
                try {
                    // 첫 번째 추천 음악 재생
                    const firstMusic = musicList[0];
                    console.log('배경음악 재생 시작:', firstMusic.title);
                    
                    // YouTube 링크를 직접 재생할 수 없으므로, 
                    // 실제 구현에서는 YouTube API나 다른 음악 서비스를 사용해야 합니다.
                    // 여기서는 시뮬레이션으로 처리합니다.
                    
                    // 오디오 모드 설정
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        staysActiveInBackground: true,
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                    
                    // 실제 구현에서는 YouTube 링크를 오디오 스트림으로 변환하거나
                    // 다른 음악 서비스 API를 사용해야 합니다.
                    console.log('음악 재생 준비 완료:', firstMusic.youtubeLink);
                    setIsPlaying(true);
                    
                } catch (error) {
                    console.error('배경음악 재생 실패:', error);
                }
            }
        };

        if (diaryData) {
            playBackgroundMusic();
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [diaryData]);

    // 감정에 따른 이모티콘 매핑
    const getEmotionEmoji = (emotion: string) => {
        const emotionMap: Record<string, string> = {
            '기쁨': '😊',
            '슬픔': '😢',
            '분노': '😠',
            '두려움': '😨',
            '놀람': '😲',
            '혐오': '🤢',
            '그리움': '🥺',
            '평온': '😌',
            '설렘': '🥰',
            '우울': '😔',
            '행복': '😄',
            '불안': '😰',
            '화남': '😡',
            '걱정': '😟',
            '만족': '😌',
            '감사': '🙏',
            '사랑': '❤️',
            '희망': '🌟',
            '평범': '😐',
            '피곤': '😴'
        };
        return emotionMap[emotion] || '😊';
    };

    const handleSaveDiary = async () => {
        const diaryContent = diaryData?.diary || diary;
        const emotion = diaryData?.emotionSummary?.dominantEmotion || finalEmotion;
        
        // 임시 일기 데이터 생성 (프론트엔드에 즉시 추가)
        const tempDiary = {
            id: Date.now(), // 임시 ID
            title: '오늘은 정말 특별한 하루였어요',
            date: new Date().toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            }),
            preview: diaryContent.substring(0, 100) + '...',
            imageUrl: 'https://picsum.photos/200/200?random=' + Date.now(),
            content: diaryContent, // 일기 전체 내용 저장
            isPending: true, // 백엔드 저장 중 상태
        };

        // 프론트엔드에 즉시 추가 (Optimistic Update)
        addDiary(tempDiary);

        try {
            // 앨범 생성 API 호출
            console.log('앨범 생성 중...');
            const album = await albumApiService.createAlbum({
                userId,
                conversationId: conversationId || 1, // 임시 대화 ID
                finalEmotion: emotion,
                diaryContent: diaryContent
            });

            console.log('앨범 생성 완료:', album);

            // 저장 성공 시 임시 데이터를 실제 데이터로 교체
            const savedDiary = {
                ...tempDiary,
                id: album.id, // 실제 앨범 ID로 교체
                isPending: false, // 저장 완료 상태
            };
            updateDiary(tempDiary.id, savedDiary);

            console.log('일기 저장 완료!');
            
            // 앨범 페이지로 이동하면서 저장된 일기 정보 전달
            navigation.reset({
                index: 0,
                routes: [
                    { 
                        name: 'MainTabs' as never,
                        params: { 
                            screen: 'Album' as never,
                        }
                    }
                ],
            });
        } catch (error) {
            console.error('앨범 생성 실패:', error);
            
            // 실패 시 임시 데이터 제거
            removeDiary(tempDiary.id);
            
            // 에러 처리
            alert('일기 저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleBackToHome = () => {
        // 홈으로 돌아가기
        navigation.navigate('MainTabs' as never);
    };

    if (loading) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${settings.isHighContrastMode ? 'bg-black' : 'bg-white'}`}>
                <Text className={`${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-500'}`}>
                    일기를 불러오는 중...
                </Text>
            </SafeAreaView>
        );
    }

    const displayData = diaryData || {
        diary: diary,
        emotionSummary: { dominantEmotion: finalEmotion },
        musicRecommendations: musicRecommendations
    };

    return (
        <SafeAreaView className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : 'bg-white'}`}>
            <ScrollView className="flex-1">
                {/* 상단 감정 이모티콘 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'pt-16 pb-8' : 'pt-12 pb-6'}`}>
                    <View className={`${settings.isLargeTextMode ? 'w-28 h-28' : 'w-24 h-24'} bg-yellow-100 rounded-full justify-center items-center mb-4`}>
                        <Text className={`${settings.isLargeTextMode ? 'text-5xl' : 'text-4xl'}`}>{getEmotionEmoji(displayData.emotionSummary.dominantEmotion)}</Text>
                    </View>
                    {/* 음악 재생 상태 표시 */}
                    {isPlaying && displayData.musicRecommendations.length > 0 && (
                        <View className={`bg-green-100 rounded-full mb-2 ${settings.isLargeTextMode ? 'px-6 py-3' : 'px-4 py-2'}`}>
                            <Text className={`text-green-600 font-medium ${settings.isLargeTextMode ? 'text-base' : 'text-sm'}`}>
                                🎵 {displayData.musicRecommendations[0].title} - {displayData.musicRecommendations[0].artist}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 제목 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'mb-8' : 'mb-6'}`}>
                    <Text className={`font-bold ${settings.isLargeTextMode ? 'text-3xl' : 'text-2xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                        오늘의 일기
                    </Text>
                </View>

                {/* 구분선 */}
                <View className={`${settings.isLargeTextMode ? 'mx-8 mb-10' : 'mx-6 mb-8'}`}>
                    <View className={`h-px ${settings.isHighContrastMode ? 'bg-white' : 'bg-gray-200'}`} />
                </View>

                {/* 일기 내용 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
                    <View className={`border rounded-2xl shadow-sm ${settings.isLargeTextMode ? 'p-8' : 'p-6'} ${settings.isHighContrastMode ? 'bg-black border-white' : 'bg-white border-gray-200'}`}>
                        <Text className={`leading-7 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-700'}`}>
                            {displayData.diary}
                        </Text>
                    </View>
                </View>

                {/* 버튼들 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'} space-y-4`}>
                    <TouchableOpacity
                        onPress={handleSaveDiary}
                        className={`w-full rounded-2xl items-center shadow-lg ${settings.isLargeTextMode ? 'py-6' : 'py-4'} ${settings.isHighContrastMode ? 'bg-white' : 'bg-green-500'}`}
                        activeOpacity={0.8}
                        style={settings.isHighContrastMode ? { borderWidth: 2, borderColor: '#ffffff' } : {}}
                    >
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
                            💾 일기 저장하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('일기 공유하기')}
                        className={`w-full rounded-2xl items-center shadow-lg ${settings.isLargeTextMode ? 'py-6' : 'py-4'} ${settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500'}`}
                        activeOpacity={0.8}
                        style={settings.isHighContrastMode ? { borderWidth: 2, borderColor: '#ffffff' } : {}}
                    >
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
                            📤 일기 공유하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleBackToHome}
                        className={`w-full rounded-2xl items-center shadow-lg ${settings.isLargeTextMode ? 'py-6' : 'py-4'} ${settings.isHighContrastMode ? 'bg-white' : 'bg-purple-500'}`}
                        activeOpacity={0.8}
                        style={settings.isHighContrastMode ? { borderWidth: 2, borderColor: '#ffffff' } : {}}
                    >
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
                            🏠 홈으로 돌아가기
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 