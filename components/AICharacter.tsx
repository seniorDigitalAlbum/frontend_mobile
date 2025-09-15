import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AICharacter() {
    return (
        <View className="w-32 h-32 justify-center items-center mb-6">
            <Image source={require('../assets/character.png')} className="w-40 h-40" />
        </View>
    );
} 