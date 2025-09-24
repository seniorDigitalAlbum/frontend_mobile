import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, FlatList, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { commonStyles } from '../styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import albumApiService, { AlbumComment, AlbumPhoto } from '../services/api/albumApiService';
import conversationApiService from '../services/api/conversationApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'AlbumDetail'>;

// 인터페이스는 API 서비스에서 import하므로 제거

export default function AlbumDetail({ route, navigation }: Props) {
  const { settings } = useAccessibility();
  const { conversationId, diary, title, finalEmotion = '기쁨' } = route.params;
  
  const [comments, setComments] = useState<AlbumComment[]>([]);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [diaryData, setDiaryData] = useState<any>(null);
  const [displayTitle, setDisplayTitle] = useState<string>(title);

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

  // YouTube 임베드 URL 생성 함수
  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1`;
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadAlbumData();
  }, [conversationId]);

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
        { content: newComment.trim(), author: '가족' }
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
            '가족'
          );
          
          if (photo) {
            // 현재 사진 개수 확인 (업데이트 전)
            const currentPhotoCount = photos.length;
            setPhotos(prev => [photo, ...prev]);
            
            // 첫 번째 사진이면 표지로 설정
            if (currentPhotoCount === 0) {
              try {
                await albumApiService.setCoverPhoto(conversationId, photo.id);
                setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === photo.id })));
              } catch (error) {
                console.error('표지 설정 실패:', error);
                // 표지 설정 실패해도 사진 추가는 성공으로 처리
              }
            }
            
            Alert.alert('성공', '사진이 성공적으로 추가되었습니다.');
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
      await albumApiService.setCoverPhoto(conversationId, photoId);
      
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        isCover: photo.id === photoId
      })));
      Alert.alert('성공', '앨범 표지가 설정되었습니다.');
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
          {item.createdAt}
        </Text>
      </View>
      <Text className={`${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {item.content}
      </Text>
    </View>
  );

  // 사진 렌더링
  const renderPhoto = ({ item }: { item: AlbumPhoto }) => (
    <View className="mb-4">
      <Image 
        source={{ uri: item.imageUrl }}
        className="w-full h-48 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-row justify-between items-center mt-2">
        <View>
          <Text className={`font-medium ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            {item.uploadedBy}
          </Text>
          <Text className={`${settings.isLargeTextMode ? 'text-sm' : 'text-xs'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {item.createdAt}
          </Text>
        </View>
        <View className="flex-row space-x-2">
          {item.isCover && (
            <View className="bg-yellow-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium">표지</Text>
            </View>
          )}
          {!item.isCover && (
            <TouchableOpacity
              onPress={() => handleSetAsCover(item.id)}
              className="bg-blue-500 rounded-full px-3 py-1"
            >
              <Text className="text-white text-xs font-medium">표지로 설정</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

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
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1">
        {/* 상단 감정 이미지 */}
        <View className={`items-center ${settings.isLargeTextMode ? 'pt-20 pb-12' : 'pt-16 pb-10'}`}>
          <View className={`${settings.isLargeTextMode ? 'w-32 h-32' : 'w-28 h-28'} bg-white rounded-full justify-center items-center mb-6 shadow-lg`}>
            <Image 
              source={getEmotionImage(finalEmotion)} 
              className={`${settings.isLargeTextMode ? 'w-20 h-20' : 'w-16 h-16'}`}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 제목 */}
        <View className={`items-center ${settings.isLargeTextMode ? 'mb-8' : 'mb-6'}`}>
          <Text className={`font-bold ${settings.isLargeTextMode ? 'text-3xl' : 'text-2xl'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            이 대화를 할 때 {finalEmotion}해 보였어요.
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
        {diaryData?.musicRecommendations && diaryData.musicRecommendations.length > 0 && (
          <View className={`${settings.isLargeTextMode ? 'px-8 mb-10' : 'px-6 mb-8'}`}>
            <View style={[commonStyles.cardStyle, { padding: settings.isLargeTextMode ? 32 : 24 }]}>
              <Text className={`font-semibold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                🎵 추천 음악
              </Text>
              <WebView
                style={{ height: 200, width: '100%' }}
                source={{ 
                  uri: getYouTubeEmbedUrl(
                    diaryData.musicRecommendations[0]?.youtubeVideoId || 
                    extractYouTubeId(diaryData.musicRecommendations[0]?.youtubeLink || '') || 
                    'dQw4w9WgXcQ'
                  )
                }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onError={(error) => console.error('YouTube 플레이어 오류:', error)}
                onLoad={() => console.log('YouTube 플레이어 로드 완료')}
              />
              <Text className={`mt-2 text-center ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-600'}`}>
                {diaryData.musicRecommendations[0]?.title} - {diaryData.musicRecommendations[0]?.artist}
              </Text>
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
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
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
