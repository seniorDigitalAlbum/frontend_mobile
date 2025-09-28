import { View, Image, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlbumHeroProps {
  imageUrl?: string;
  onPress?: () => void;
  isEmpty?: boolean; // 일기가 없는 상태인지 여부
}

export default function AlbumHero({ imageUrl, onPress, isEmpty }: AlbumHeroProps) {
  const defaultImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
  
  // 일기가 없는 상태일 때
  if (isEmpty) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.9}
        className="w-full h-80 rounded-3xl shadow-xl justify-center items-center overflow-hidden bg-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="items-center px-8">
          <View className="w-20 h-20 bg-gray-300 rounded-full justify-center items-center mb-4">
            <Ionicons name="book-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-3xl font-semibold text-gray-600 mb-2 text-center">
            아직 일기가 없어요
          </Text>
          <Text className="text-lg text-gray-500 text-center leading-6">
            질문을 눌러{'\n'}일기를 만들어주세요
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  // 일기가 있는 상태일 때
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.9}
      className="w-full h-80 rounded-3xl shadow-xl justify-center items-center overflow-hidden"
    >
      <Image 
        source={{ uri: imageUrl || defaultImageUrl }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
} 