import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { commonStyles } from '../styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import { conversationApiService, AlbumComment, AlbumPhoto } from '../services/api/albumApiService';
import { imageUploadService } from '../services/imageUploadService';

type Props = NativeStackScreenProps<RootStackParamList, 'AlbumDetail'>;

// 인터페이스는 API 서비스에서 import하므로 제거

export default function AlbumDetail({ route, navigation }: Props) {
  const { settings } = useAccessibility();
  const { conversationId, diary, finalEmotion } = route.params;
  
  const [comments, setComments] = useState<AlbumComment[]>([]);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadAlbumData();
  }, [conversationId]);

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      const [commentsData, photosData] = await Promise.all([
        conversationApiService.getAlbumComments(conversationId),
        conversationApiService.getAlbumPhotos(conversationId)
      ]);
      
      setComments(commentsData);
      setPhotos(photosData);
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
      const comment = await conversationApiService.addAlbumComment(
        conversationId, 
        newComment.trim(), 
        '가족'
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
          
          // 1. S3에 이미지 업로드
          const uploadedImageUrl = await imageUploadService.uploadImage(result.assets[0].uri);
          
          // 2. 업로드된 이미지 URL로 앨범 사진 추가
          const photo = await conversationApiService.addAlbumPhoto(
            conversationId,
            uploadedImageUrl, // S3 URL 사용
            '가족'
          );
          
          if (photo) {
            setPhotos(prev => [photo, ...prev]);
            
            // 첫 번째 사진이면 표지로 설정
            if (photos.length === 0) {
              await conversationApiService.setAlbumCover(conversationId, photo.id);
              setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === photo.id })));
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
      const success = await conversationApiService.setAlbumCover(conversationId, photoId);
      
      if (success) {
        setPhotos(prev => prev.map(photo => ({
          ...photo,
          isCover: photo.id === photoId
        })));
        Alert.alert('성공', '앨범 표지가 설정되었습니다.');
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
    <View style={[commonStyles.cardStyle, { marginBottom: 12, padding: 16 }]}>
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
    <View style={[commonStyles.cardStyle, { marginBottom: 12, padding: 8 }]}>
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

  return (
    <SafeAreaView className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* 헤더 */}
      <View className={`flex-row items-center justify-between ${settings.isLargeTextMode ? 'px-6 py-4' : 'px-4 py-3'} ${settings.isHighContrastMode ? 'bg-black' : 'bg-white'} border-b border-gray-200`}>
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
          앨범 상세
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1">
        {/* 일기 내용 */}
        <View style={[commonStyles.cardStyle, { margin: 16, padding: 20 }]}>
          <Text className={`font-bold mb-3 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            일기 내용
          </Text>
          <Text className={`${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-700'} leading-6`}>
            {diary}
          </Text>
        </View>

        {/* 사진 섹션 */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`font-bold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
              사진 ({photos.length})
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
            <View style={[commonStyles.cardStyle, { padding: 40, alignItems: 'center' }]}>
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

        {/* 댓글 섹션 */}
        <View className="px-4 mb-6">
          <Text className={`font-bold mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            댓글 ({comments.length})
          </Text>

          {/* 댓글 입력 */}
          <View style={[commonStyles.cardStyle, { padding: 16, marginBottom: 16 }]}>
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
            <View style={[commonStyles.cardStyle, { padding: 40, alignItems: 'center' }]}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
