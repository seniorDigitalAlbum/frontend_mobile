import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DiaryLoading() {
    return (
        <View className="flex-1 bg-white justify-center items-center px-8">
            {/* 로딩 아이콘 */}
            <View className="mb-6">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
            
            {/* AI 캐릭터 아이콘 */}
            <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-6">
                <Ionicons name="person" size={50} color="#3B82F6" />
            </View>
            
            {/* 메인 텍스트 */}
            <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
                일기를 작성하고 있어요
            </Text>
            
            {/* 서브 텍스트 */}
            <Text className="text-lg text-gray-600 text-center leading-6">
                AI가 오늘의 대화를 바탕으로{'\n'}
                특별한 일기를 만들어드릴게요
            </Text>
            
            {/* 로딩 바 */}
            <View className="w-64 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
                <View className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" />
            </View>
        </View>
    );
} 