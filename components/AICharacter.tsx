import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AICharacter() {
    return (
        <View className="w-20 h-20 justify-center items-center overflow-hidden">
            <Image 
                source={require('../assets/character.png')} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
            />
        </View>
    );
} 