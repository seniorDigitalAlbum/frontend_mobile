import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TempCamera() {
    return (
        <View className="bg-gray-300 rounded-2xl h-80 justify-center items-center overflow-hidden">
            <Ionicons name="camera" size={80} color="#6B7280" />
            <Text className="text-gray-600 mt-4 text-lg font-medium text-center">
                카메라 화면
            </Text>
        </View>
    );
} 