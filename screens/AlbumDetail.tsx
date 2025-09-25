import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, FlatList, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { commonStyles } from '../styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import albumApiService, { AlbumComment, AlbumPhoto } from '../services/api/albumApiService';
import conversationApiService from '../services/api/conversationApiService';
import { useUser, UserType } from '../contexts/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AlbumDetail'>;

// 인터페이스는 API 서비스에서 import하므로 제거

export default function AlbumDetail({ route, navigation }: Props) {
  const { settings } = useAccessibility();
  const { userType, user } = useUser();
  const { conversationId, diary, title, finalEmotion = '기쁨', musicRecommendations = [] } = route.params;
  
  const [comments, setComments] = useState<AlbumComment[]>([]);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [diaryData, setDiaryData] = useState<any>(null);
  const [displayTitle, setDisplayTitle] = useState<string>(title);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPublic, setIsPublic] = useState(false); // 앨범 공개 상태

  // 일기 내용에서 제목을 제거하고 순수 내용만 추출하는 함수
  const extractContentWithoutTitle = (diaryContent: string): string => {
    if (!diaryContent) return diaryContent;
    
    // "제목:" 패턴이 있는지 확인
    const titleMatch = diaryContent.match(/제목:\s*(.+?)(?:\n|$)/);
    if (titleMatch) {
      // 제목 부분을 제거하고 나머지 내용 반환
      return diaryContent.replace(/제목:\s*(.+?)(?:\n|$)/, '').trim();
    }
    
    return diaryContent;
  };

  // YouTube 비디오 ID 추출 함수
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // YouTube 임베드 URL 생성 함수 (Expo Go 최적화)
  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=*&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`;
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadAlbumData();
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
      '상처': require('../assets/hurt.jpg')
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

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      const [commentsData, photosData, diaryDetailData] = await Promise.all([
        albumApiService.getComments(conversationId),
        albumApiService.getPhotos(conversationId),
        conversationApiService.getDiaryByConversation(conversationId)
      ]);
      
      setComments(commentsData);
      setPhotos(photosData);
      setDiaryData(diaryDetailData);
      
      // API에서 받은 제목이 있으면 업데이트
      if (diaryDetailData?.title) {
        setDisplayTitle(diaryDetailData.title);
      }
      
      console.log('앨범 데이터 로드 완료:', diaryDetailData);
    } catch (error) {
      console.error('앨범 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 추가
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await albumApiService.addComment(
        conversationId, 
        { content: newComment.trim(), author: user?.name || '가족' }
      );
      
      if (comment) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
      } else {
        Alert.alert('오류', '댓글 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      Alert.alert('오류', '댓글을 추가하는 중 오류가 발생했습니다.');
    }
  };

  // 사진 추가
  const handleAddPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          setUploading(true);
          
          // 새로운 업로드 API 사용 (S3 업로드 + 앨범 추가를 한 번에)
          const photo = await albumApiService.addPhotoWithUpload(
            conversationId,
            result.assets[0].uri,
            user?.name || '가족'
          );
          
          if (photo) {
            // 현재 사진 개수 확인 (업데이트 전)
            const currentPhotoCount = photos.length;
            
            // 사진 목록에 추가
            setPhotos(prev => [photo, ...prev]);
            
            // 첫 번째 사진이면 표지로 설정 (사진 추가 전에 확인)
            if (currentPhotoCount === 0) {
              console.log('첫 번째 사진 - 표지로 설정 시도:', photo.id);
              const coverSetSuccess = await albumApiService.setCoverPhoto(conversationId, photo.id);
              
              if (coverSetSuccess) {
                setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === photo.id })));
                console.log('표지 설정 완료');
              } else {
                console.log('표지 설정 실패 (무시됨) - 사진은 정상 추가됨');
                // 표지 설정 실패해도 사진 추가는 성공으로 처리
              }
            } else {
              console.log('추가 사진 - 표지 설정 안함, 현재 사진 수:', currentPhotoCount);
            }
            
            // 사진 추가 성공 메시지 (표지 설정 실패는 언급하지 않음)
            Alert.alert('완료!', '사진을 올렸어요.');
          } else {
            Alert.alert('오류', '사진 추가에 실패했습니다.');
          }
        } catch (error) {
          console.error('사진 추가 실패:', error);
          Alert.alert('오류', '사진을 추가하는 중 오류가 발생했습니다.');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('사진 선택 실패:', error);
      Alert.alert('오류', '사진을 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 앨범 표지 설정
  const handleSetAsCover = async (photoId: number) => {
    try {
      const success = await albumApiService.setCoverPhoto(conversationId, photoId);
      if (success) {
        setPhotos(prev => prev.map(photo => ({
          ...photo,
          isCover: photo.id === photoId
        })));
        Alert.alert('완료!', '표지로 설정 되었어요. 처음 화면에서 확인 해보세요.');
        
        // Home의 albumHero 업데이트를 위한 정보 저장
        const coverPhoto = photos.find(p => p.id === photoId);
        if (coverPhoto) {
          try {
            const { setItem } = await import('@react-native-async-storage/async-storage');
            await setItem('latestCoverPhoto', JSON.stringify({
              conversationId,
              imageUrl: coverPhoto.imageUrl,
              title: displayTitle,
              timestamp: Date.now()
            }));
            console.log('✅ 표지 사진 정보 저장 완료:', coverPhoto.imageUrl);
          } catch (storageError) {
            console.log('Storage 업데이트 실패 (무시됨):', storageError);
          }
        }
      } else {
        Alert.alert('오류', '앨범 표지 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('앨범 표지 설정 실패:', error);
      Alert.alert('오류', '앨범 표지를 설정하는 중 오류가 발생했습니다.');
    }
  };

  // 댓글 렌더링
  const renderComment = ({ item }: { item: AlbumComment }) => (
    <View className="bg-gray-50 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
          {item.author}
        </Text>
        <Text className={`${settings.isLargeTextMode ? 'text-sm' : 'text-xs'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
          {formatDateTime(item.createdAt)}
        </Text>
      </View>
      <Text className={`${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {item.content}
      </Text>
    </View>
  );

  // 사진 렌더링 (수평 스크롤용)
  const renderPhoto = ({ item }: { item: AlbumPhoto }) => (
    <View style={{ width: 200, marginRight: 12 }}>
      <View className="relative">
        <Image 
          source={{ uri: item.imageUrl }}
          style={{ width: 200, height: 200, borderRadius: 12 }}
          resizeMode="cover"
        />
        {item.isCover && (
          <View 
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#F59E0B',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text className="text-white text-xs font-medium">표지</Text>
          </View>
        )}
      </View>
      
      <View className="mt-3">
        <Text className={`font-medium ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
          {item.uploadedBy}
        </Text>
        <Text className={`${settings.isLargeTextMode ? 'text-sm' : 'text-xs'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
          {formatDateTime(item.createdAt)}
        </Text>
        
        {!item.isCover && (
          <TouchableOpacity
            onPress={() => handleSetAsCover(item.id)}
            className="bg-blue-500 rounded-full px-3 py-1 mt-2"
            style={{ alignSelf: 'flex-start' }}
          >
            <Text className="text-white text-xs font-medium">표지로 설정</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // 앨범 공개 상태 설정 함수
  const handleSetVisibility = async (publicStatus: boolean) => {
    try {
      await albumApiService.updateAlbumVisibility(conversationId, publicStatus);
      setIsPublic(publicStatus);
      
      Alert.alert(
        '앨범 설정 변경',
        publicStatus ? '앨범이 가족에게 공개되었습니다.' : '앨범이 가족에게 비공개로 설정되었습니다.'
      );
    } catch (error) {
      console.error('앨범 공개 상태 변경 실패:', error);
      Alert.alert('오류', '앨범 설정을 변경할 수 없습니다.');
    }
  };

  // 시간 포맷팅 함수
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return '방금 전';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
      } else if (diffInMinutes < 1440) { // 24시간
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}시간 전`;
      } else if (diffInMinutes < 10080) { // 7일
        const days = Math.floor(diffInMinutes / 1440);
        return `${days}일 전`;
      } else {
        // 7일 이상은 날짜로 표시
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return dateTimeString;
    }
  };

  // 감정을 자연스러운 문장으로 매핑하는 함수
  const getEmotionDescription = (emotion: string) => {
    const emotionMap: { [key: string]: string } = {
      '기쁨': '행복해',
      '슬픔': '슬퍼',
      '분노': '화가 나',
      '불안': '불안해',
      '상처': '상처받',
      '당황': '당황해',
      '기본': '평온해'
    };
    return emotionMap[emotion] || '평온해';
  };

  const currentEmotion = finalEmotion;
  const backgroundColor = getEmotionBackgroundColor(currentEmotion);

  return (
    <SafeAreaView 
      className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : ''}`}
      style={!settings.isHighContrastMode ? { backgroundColor: backgroundColor } : {}}
    >
      {/* 헤더 */}
      <View className={`flex-row items-center justify-between ${settings.isLargeTextMode ? 'px-6 py-4' : 'px-4 py-3'} ${settings.isHighContrastMode ? 'bg-black' : 'bg-transparent'}`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons 
            name="arrow-back" 
            size={settings.isLargeTextMode ? 28 : 24} 
            color={settings.isHighContrastMode ? 'white' : 'black'} 
          />
        </TouchableOpacity>
                <Text className={`font-bold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                  {displayTitle || '앨범 상세'}
                </Text>
        
        {/* 공개/비공개 버튼들 - 시니어만 표시 */}
        {userType === UserType.SENIOR && (
        <View className="flex-row space-x-2">
          {/* 공개 버튼 */}
          <TouchableOpacity
            onPress={() => handleSetVisibility(true)}
            className={`rounded-lg px-3 py-2 ${isPublic ? 'bg-green-500' : 'bg-gray-300'}`}
            disabled={isPublic}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name="eye" 
                size={16} 
                color={isPublic ? "white" : "gray"} 
              />
              <Text className={`font-medium ml-1 ${isPublic ? 'text-white' : 'text-gray-500'}`}>
                공개
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* 비공개 버튼 */}
          <TouchableOpacity
            onPress={() => handleSetVisibility(false)}
            className={`rounded-lg px-3 py-2 ${!isPublic ? 'bg-red-500' : 'bg-gray-300'}`}
            disabled={!isPublic}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name="eye-off" 
                size={16} 
                color={!isPublic ? "white" : "gray"} 
              />
              <Text className={`font-medium ml-1 ${!isPublic ? 'text-white' : 'text-gray-500'}`}>
                비공개
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        )}
      </View>

      <ScrollView className="flex-1">
        {/* 상단 감정 이미지 */}
        <View className={`items-center ${settings.isLargeTextMode ? 'pt-20 pb-12' : 'pt-16 pb-10'}`}>
          <View className={`${settings.isLargeTextMode ? 'w-32 h-32' : 'w-28 h-28'} bg-white rounded-full justify-center items-center mb-6 shadow-lg`}>
            <Image 
              source={getEmotionImage(finalEmotion)} 
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
          <Text className={`font-bold ${settings.isLargeTextMode ? 'text-3xl' : 'text-2xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            이 대화를 할 때 {getEmotionDescription(finalEmotion)} 보였어요.
          </Text>
        </View>

        {/* 일기 내용 */}
        <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
          <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
            {displayTitle && (
              <Text className={`font-bold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                {displayTitle}
              </Text>
            )}
            <Text className={`leading-7 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-700'}`}>
              {extractContentWithoutTitle(diaryData?.diary || diary)}
            </Text>
          </View>
        </View>

        {/* YouTube 음악 플레이어 */}
        {(() => {
          const musicList = diaryData?.musicRecommendations || musicRecommendations;
          return musicList && musicList.length > 0;
        })() && (
          <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
            <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
              <Text className={`font-semibold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                🎵 추천 음악
              </Text>
              {(() => {
                const musicList = diaryData?.musicRecommendations || musicRecommendations;
                const firstMusic = musicList[0];
                const videoId = firstMusic?.youtubeVideoId || extractYouTubeId(firstMusic?.youtubeLink || '') || 'dQw4w9WgXcQ';
                const embedUrl = getYouTubeEmbedUrl(videoId);
                
                console.log('🎵 AlbumDetail 유튜브 정보:', {
                  musicList,
                  firstMusic,
                  videoId,
                  embedUrl
                });
                
                return (
                  <WebView
                    style={{ height: 200, width: '100%', backgroundColor: '#000' }}
                    source={{ uri: embedUrl }}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsFullscreenVideo={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={false}
                    mixedContentMode="compatibility"
                    userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                    onError={(error) => {
                      console.error('YouTube 플레이어 오류:', error);
                      Alert.alert('재생 오류', '동영상을 재생할 수 없습니다. YouTube 앱에서 시도해보세요.');
                    }}
                    onLoad={() => console.log('YouTube 플레이어 로드 완료')}
                    onHttpError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.error('WebView HTTP 오류:', nativeEvent);
                    }}
                    onMessage={(event) => {
                      console.log('WebView 메시지:', event.nativeEvent.data);
                    }}
                    injectedJavaScript={`
                      // YouTube 플레이어 로드 확인
                      window.addEventListener('load', function() {
                        console.log('YouTube iframe 로드됨');
                      });
                      
                      // 에러 처리
                      window.addEventListener('error', function(e) {
                        console.log('YouTube 에러:', e.error);
                      });
                    `}
                  />
                );
              })()}
            </View>
          </View>
        )}

        {/* 사진 섹션 */}
        <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
          <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                📸 사진 ({photos.length})
              </Text>
              <TouchableOpacity
                onPress={handleAddPhoto}
                disabled={uploading}
                className={`rounded-full px-4 py-2 ${uploading ? 'bg-gray-400' : 'bg-blue-500'}`}
              >
                <Text className="text-white font-medium">
                  {uploading ? '업로드 중...' : '+ 사진 추가'}
                </Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 ? (
              <FlatList
                data={photos}
                renderItem={renderPhoto}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                contentContainerStyle={{ paddingRight: 16 }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              />
            ) : (
              <View className="items-center py-8">
                <Ionicons 
                  name="camera-outline" 
                  size={48} 
                  color={settings.isHighContrastMode ? 'white' : 'gray'} 
                />
                <Text className={`mt-3 ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  아직 추가된 사진이 없습니다
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
          <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
            <Text className={`font-semibold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
              💬 댓글 ({comments.length})
            </Text>

            {/* 댓글 입력 */}
            <View className="mb-6">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="댓글을 입력하세요..."
                placeholderTextColor={settings.isHighContrastMode ? '#666' : '#999'}
                multiline
                className={`${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'} border border-gray-200 rounded-lg px-3 py-2 mb-3`}
                style={{
                  minHeight: 60,
                  textAlignVertical: 'top',
                  color: settings.isHighContrastMode ? 'white' : 'black',
                  backgroundColor: settings.isHighContrastMode ? '#333' : 'white'
                }}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newComment.trim()}
                className={`rounded-lg py-3 ${newComment.trim() ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <Text className="text-white text-center font-medium">댓글 추가</Text>
              </TouchableOpacity>
            </View>

            {/* 댓글 목록 */}
            {comments.length > 0 ? (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View className="items-center py-8">
                <Ionicons 
                  name="chatbubble-outline" 
                  size={48} 
                  color={settings.isHighContrastMode ? 'white' : 'gray'} 
                />
                <Text className={`mt-3 ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  첫 번째 댓글을 작성해보세요
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
