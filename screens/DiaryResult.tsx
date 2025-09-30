import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, Linking, TextInput, FlatList, Alert, Platform } from 'react-native';
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

    // 감정을 자연스러운 문장으로 매핑하는 함수
    const getEmotionDescription = (emotion: string) => {
        const emotionMap: { [key: string]: string } = {
            '기쁨': '행복해',
            '슬픔': '슬퍼',
            '분노': '화가 나',
            '불안': '불안해',
            '상처': '상처받',
            '당황': '당황해'
        };
        return emotionMap[emotion] || '감정이 드러나';
    };

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

    // 감정에 따른 YouTube Embed URL 매핑 (자동재생 포함)
    const getEmotionVideoUrl = (emotion: string) => {
        const videoMap: Record<string, string> = {
            '기쁨': 'https://www.youtube.com/embed/WvP1g7eic0U?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0',
            '슬픔': 'https://www.youtube.com/embed/72IuThAlcII?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0',
            '분노': 'https://www.youtube.com/embed/J-RSBdXwZFE?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0',
            '불안': 'https://www.youtube.com/embed/pAMl_bWWZnA?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0',
            '당황': 'https://www.youtube.com/embed/Lj-L6-O62RA?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0',
            '상처': 'https://www.youtube.com/embed/vnzyC8Lwtik?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0',
        };
        return videoMap[emotion] || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0'; // 기본값
    };

    // YouTube 임베드 URL 생성 함수
    const getYouTubeEmbedUrl = (videoUrl: string) => {
        const videoId = extractYouTubeId(videoUrl);
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`;
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
            '슬픔': require('../assets/sad.png'),
            '분노': require('../assets/angry.png'),
            '불안': require('../assets/fear.png'),
            '당황': require('../assets/surprised.png'),
            '상처': require('../assets/hurt.png')
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
        };
        return colorMap[emotion] || '#FFF8E1'; // 기본값
    };

    // 제목과 내용을 분리하는 함수
    const separateTitleAndContent = (diaryContent: string) => {
        if (!diaryContent) {
            return {
                title: '특별한 하루',
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
            // 에러 발생 시에도 홈으로 이동 (스택 초기화)
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        }
    };

    const handleBackToHome = () => {
        // 모든 화면 스택을 초기화하고 MainTabs로 이동
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    if (loading) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${settings.isHighContrastMode ? 'bg-black' : 'bg-white'}`}>
                <Text className={`${settings.isLargeTextMode ? 'text-2xl' : 'text-xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-500'}`}>
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
            <ScrollView className="flex-1 p-5">
                {/* 상단 감정 이미지 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'pt-20 pb-12' : 'pt-16 pb-10'}`}>
                    <View className={`${settings.isLargeTextMode ? 'w-32 h-32' : 'w-28 h-28'} bg-white rounded-full justify-center items-center mb-6 shadow-lg`}>
                        <Image
                            source={getEmotionImage(displayData.emotionSummary?.dominantEmotion || finalEmotion)}
                            style={{
                                width: settings.isLargeTextMode ? 80 : 64,
                                height: settings.isLargeTextMode ? 80 : 64,
                            }}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* 제목 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'mb-8' : 'mb-6'}`}>
                    <Text className={`font-bold ${settings.isLargeTextMode ? 'text-4xl' : 'text-3xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                        이 대화를 할 때{'\n'}{getEmotionDescription(displayData.emotionSummary?.dominantEmotion || finalEmotion)} 보였어요.
                    </Text>
                </View>
                <View className="items-center py-8 px-5">
                    <Text className={`font-bold mb-2 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                        음악이 재생 중입니다
                    </Text>

                    {/* 로딩 바 */}
                    <View className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <View
                            className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full"
                            style={{
                                width: '100%',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}
                        />
                    </View>

                    <View className="flex-row items-center space-x-2">
                        <View className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                        <View className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <View className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </View>
                </View>
                {/* 일기 내용 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
                    <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
                        {(() => {
                            const diaryContent = displayData.diary || diary;
                            const { title, content } = separateTitleAndContent(diaryContent);

                            return (
                                <>
                                    {/* 일기 제목 표시 */}
                                    <Text className={`font-bold mb-4 ${settings.isLargeTextMode ? 'text-2xl' : 'text-xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                                        {title}
                                    </Text>
                                    {/* 일기 내용 표시 */}
                                    <Text className={`leading-8 ${settings.isLargeTextMode ? 'text-2xl' : 'text-xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-700'}`}>
                                        {content}
                                    </Text>
                                </>
                            );
                        })()}
                    </View>
                </View>

                {/* YouTube 음악 플레이어 */}
                {displayData.musicRecommendations.length > 0 && (
                    <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>

                            {/* 숨겨진 YouTube 플레이어 */}
                            <View style={{ position: 'absolute', left: -9999, top: -9999, width: 1, height: 1, opacity: 0 }}>
                                {Platform.OS === 'web' ? (
                                    <iframe
                                        width="1"
                                        height="1"
                                        src={getEmotionVideoUrl(currentEmotion)}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <WebView
                                        style={{ width: 1, height: 1 }}
                                        source={{ 
                                            uri: getEmotionVideoUrl(currentEmotion)
                                        }}
                                        allowsInlineMediaPlayback={true}
                                        mediaPlaybackRequiresUserAction={false}
                                        onError={(error) => console.error('YouTube 플레이어 오류:', error)}
                                        onLoad={() => console.log('YouTube 플레이어 로드 완료')}
                                    />
                                )}
                            </View>
                        </View>
                )}

                {/* 버튼들 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'} space-y-4`}>

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
                        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-2xl' : 'text-xl'} text-gray-800`}>
                            처음 화면으로 돌아가기
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 