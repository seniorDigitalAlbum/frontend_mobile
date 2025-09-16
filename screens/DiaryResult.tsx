import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useDiary } from '../contexts/DiaryContext';
import { useNavigation } from '@react-navigation/native';
import { conversationApiService } from '../services/api/albumApiService';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { commonStyles } from '../styles/commonStyles';

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

        // 일기는 자동으로 생성되므로 로컬에만 추가
        addDiary(tempDiary);

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
        <SafeAreaView 
            className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : ''}`}
            style={!settings.isHighContrastMode ? { backgroundColor: '#FFF8E1' } : {}}
        >
            <ScrollView className="flex-1">
                {/* 상단 감정 이미지 */}
                <View className={`items-center ${settings.isLargeTextMode ? 'pt-20 pb-12' : 'pt-16 pb-10'}`}>
                    <View className={`${settings.isLargeTextMode ? 'w-32 h-32' : 'w-28 h-28'} bg-white rounded-full justify-center items-center mb-6 shadow-lg`}>
                        <Image 
                            source={require('../assets/happy.png')} 
                            className={`${settings.isLargeTextMode ? 'w-20 h-20' : 'w-16 h-16'}`}
                            resizeMode="contain"
                        />
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
                        이 대화를 할 때 행복해 보였어요.
                    </Text>
                </View>

                {/* 일기 내용 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
                    <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
                        <Text className={`leading-7 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-700'}`}>
                            병원 복도에서 오랫동안 기다리던 끝에, 아기가 태어났다는 소식을 들었을 때 가슴이 콩닥콩닥 뛰었다. 간호사가 작은 아기를 내 품에 안겨주었을 때, 그 따뜻하고 작은 몸이 얼마나 소중하게 느껴졌는지 모른다.

손바닥만 한 얼굴에 작은 손가락이 꼼지락거리는 걸 보니, 그냥 웃음이 터져 나왔다. "이 아이가 우리 집에 온 거구나" 하는 생각에 눈물이 핑 돌 정도로 기뻤다.
                        </Text>
                    </View>
                </View>

                {/* 버튼들 */}
                <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'} space-y-4`}>

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
                            📤 일기 공유하기
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