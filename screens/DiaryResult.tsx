import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, Linking, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';
import conversationApiService from '../services/api/conversationApiService';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useUser } from '../contexts/UserContext';
import { commonStyles } from '../styles/commonStyles';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'DiaryResult'>;

// 인터페이스는 albumApiService에서 import

export default function DiaryResult({ route }: Props) {
    const { settings } = useAccessibility();
    const { 
        diary, 
        conversationId, 
        finalEmotion = '기쁨',
        userId: routeUserId = "1", // route.params에서 받은 userId (fallback: "1")
        musicRecommendations = []
    } = route.params || { diary: '일기가 생성되지 않았습니다.' };
    const { addDiary, updateDiary, removeDiary } = useDiary();
    const { user } = useUser();
    const navigation = useNavigation();
    
    // UserContext에서 실제 사용자 ID 가져오기 (route.params보다 우선)
    const userId = user?.userId || routeUserId;
    
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [diaryData, setDiaryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentMusicIndex, setCurrentMusicIndex] = useState(0);

    // 일기 데이터 로드
    useEffect(() => {
        const loadDiaryData = async () => {
            if (conversationId) {
                try {
                    setLoading(true);
                    const diaryResponse = await conversationApiService.getDiaryByConversation(conversationId);
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

    // YouTube 비디오 ID 추출 함수
    const extractYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // YouTube 임베드 URL 생성 함수
    const getYouTubeEmbedUrl = (videoId: string) => {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1`;
    };

    // 음악 자동 재생
    useEffect(() => {
        const playBackgroundMusic = async () => {
            const musicList = diaryData?.musicRecommendations || musicRecommendations;
            if (musicList.length > 0) {
                try {
                    // 첫 번째 추천 음악 재생
                    const firstMusic = musicList[0];
                    console.log('배경음악 재생 시작:', firstMusic.title);
                    
                    // 오디오 모드 설정
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        staysActiveInBackground: true,
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                    
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

    // 감정에 따른 이미지 매핑
    const getEmotionImage = (emotion: string) => {
        const emotionMap: Record<string, any> = {
            '기쁨': require('../assets/happy.png'),
            '슬픔': require('../assets/sad.jpg'),
            '분노': require('../assets/angry.png'),
            '두려움': require('../assets/fear.png'),
            '놀람': require('../assets/surprised.png'),
            '행복': require('../assets/happy.png'),
            '화남': require('../assets/angry.png'),
            '불안': require('../assets/fear.png'),
            '당황': require('../assets/surprised.png'),
            '상처': require('../assets/sad.jpg')
        };
        return emotionMap[emotion] || require('../assets/happy.png');
    };

    // 감정에 따른 배경색 매핑
    const getEmotionBackgroundColor = (emotion: string) => {
        const colorMap: Record<string, string> = {
            '기쁨': '#FFF8E1', // 밝은 노란색
            '슬픔': '#E3F2FD', // 밝은 파란색
            '분노': '#FFEBEE', // 밝은 빨간색
            '불안': '#F3E5F5', // 밝은 보라색
            '당황': '#E8F5E8', // 밝은 초록색
            '상처': '#FFF3E0', // 밝은 주황색
            '행복': '#FFF8E1', // 기쁨과 동일
            '화남': '#FFEBEE', // 분노와 동일
            '두려움': '#F3E5F5', // 불안과 동일
            '놀람': '#E8F5E8' // 당황과 동일
        };
        return colorMap[emotion] || '#FFF8E1'; // 기본값
    };

    const handleSaveDiary = async () => {
        try {
            const diaryContent = diaryData?.diary || diary;
            const emotion = finalEmotion; // 백엔드에서 emotionSummary가 제거됨
            
            if (!conversationId) {
                throw new Error('대화 ID가 없습니다');
            }

            // 로컬에 일기 추가 (이미 백엔드에서 생성된 일기)
            const savedDiary = {
                id: conversationId || Date.now(),
                title: `오늘은 ${emotion}한 하루였어요`,
                date: new Date().toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                }),
                preview: diaryContent.substring(0, 100) + '...',
                imageUrl: 'https://picsum.photos/200/200?random=' + Date.now(),
                content: diaryContent,
                isPending: false,
            };

            addDiary(savedDiary);

            // 앨범 페이지로 이동
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
            console.error('일기 저장 실패:', error);
            // 에러 발생 시에도 앨범으로 이동
            navigation.navigate('MainTabs' as never);
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

    const currentEmotion = displayData.emotionSummary?.dominantEmotion || finalEmotion;
    const backgroundColor = getEmotionBackgroundColor(currentEmotion);

    return (
        <SafeAreaView 
            className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : ''}`}
            style={!settings.isHighContrastMode ? { backgroundColor: backgroundColor } : {}}
        >
            <ScrollView className="flex-1">
                {/* 상단 감정 이미지 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'pt-20 pb-12' : 'pt-16 pb-10'}`}>
                    <View className={`${settings.isLargeTextMode ? 'w-32 h-32' : 'w-28 h-28'} bg-white rounded-full justify-center items-center mb-6 shadow-lg`}>
                        <Image 
                            source={getEmotionImage(displayData.emotionSummary?.dominantEmotion || finalEmotion)} 
                            className={`${settings.isLargeTextMode ? 'w-20 h-20' : 'w-16 h-16'}`}
                            resizeMode="contain"
                        />
                    </View>
                    {/* 음악 재생 상태 표시 */}
                    {isPlaying && displayData.musicRecommendations.length > 0 && (
                        <View className={`bg-green-100 rounded-full mb-2 ${settings.isLargeTextMode ? 'px-6 py-3' : 'px-4 py-2'}`}>
                            <Text className={`text-green-600 font-medium ${settings.isLargeTextMode ? 'text-base' : 'text-sm'}`}>
                                🎵 {displayData.musicRecommendations[currentMusicIndex].title} - {displayData.musicRecommendations[currentMusicIndex].artist}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 제목 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'mb-8' : 'mb-6'}`}>
                    <Text className={`font-bold ${settings.isLargeTextMode ? 'text-3xl' : 'text-2xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                        이 대화를 할 때 {displayData.emotionSummary?.dominantEmotion || finalEmotion}해 보였어요.
                    </Text>
                </View>

                {/* 일기 내용 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
                    <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
                        {/* 일기 제목 표시 */}
                        {displayData.title && (
                            <Text className={`font-bold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                                {displayData.title}
                            </Text>
                        )}
                        <Text className={`leading-7 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-700'}`}>
                            {displayData.diary || diary}
                        </Text>
                    </View>
                </View>

                {/* YouTube 음악 플레이어 */}
                {displayData.musicRecommendations.length > 0 && (
                    <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
                        <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
                            <Text className={`font-semibold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                                🎵 추천 음악
                            </Text>
                            <WebView
                                style={{ height: 200, width: '100%' }}
                                source={{ 
                                    uri: getYouTubeEmbedUrl(
                                        displayData.musicRecommendations[currentMusicIndex]?.youtubeVideoId || 
                                        extractYouTubeId(displayData.musicRecommendations[currentMusicIndex]?.youtubeLink || '') || 
                                        'dQw4w9WgXcQ'
                                    )
                                }}
                                allowsInlineMediaPlayback={true}
                                mediaPlaybackRequiresUserAction={false}
                                onError={(error) => console.error('YouTube 플레이어 오류:', error)}
                                onLoad={() => console.log('YouTube 플레이어 로드 완료')}
                            />
                            <Text className={`mt-2 text-center ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-600'}`}>
                                {displayData.musicRecommendations[currentMusicIndex]?.title} - {displayData.musicRecommendations[currentMusicIndex]?.artist}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 버튼들 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'} space-y-4`}>

                    <TouchableOpacity
                        onPress={handleSaveDiary}
                        className={`w-full items-center ${settings.isLargeTextMode ? 'py-6' : 'py-4'}`}
                        activeOpacity={0.8}
                        style={[
                            commonStyles.cardStyle, 
                            { 
                                backgroundColor: '#4F46E5',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                            }
                        ]}
                    >
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} text-white`}>
                            💾 일기 저장하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('일기 공유하기')}
                        className={`w-full items-center ${settings.isLargeTextMode ? 'py-6' : 'py-4'}`}
                        activeOpacity={0.8}
                        style={[
                            commonStyles.cardStyle, 
                            { 
                                backgroundColor: '#F5F5F5',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                            }
                        ]}
                    >
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} text-gray-800`}>
                            일기 공유하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleBackToHome}
                        className={`w-full items-center ${settings.isLargeTextMode ? 'py-6' : 'py-4'}`}
                        activeOpacity={0.8}
                        style={[
                            commonStyles.cardStyle, 
                            { 
                                backgroundColor: '#E5E5E5',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                            }
                        ]}
                    >
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} text-gray-800`}>
                            처음 화면으로 돌아가기
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 