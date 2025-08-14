import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AICharacter() {
    return (
        <View className="w-32 h-32 bg-blue-100 rounded-full justify-center items-center mb-6">
            <Ionicons name="person" size={80} color="#3B82F6" />
        </View>
    );
} 