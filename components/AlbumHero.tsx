import { View, Image, TouchableOpacity } from 'react-native';

interface AlbumHeroProps {
  imageUrl?: string;
  onPress?: () => void;
}

export default function AlbumHero({ imageUrl, onPress }: AlbumHeroProps) {
  const defaultImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.9}
      className="w-full h-80 rounded-b-3xl shadow-xl justify-center items-center overflow-hidden"
    >
      <Image 
        source={{ uri: imageUrl || defaultImageUrl }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
} 