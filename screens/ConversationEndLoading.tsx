import { View, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationEndLoading'>;

export default function ConversationEndLoading({ route, navigation }: Props) {
    const { settings } = useAccessibility();
    const { conversationId } = route.params || {};

    useEffect(() => {
        // 2초 후 Chat 화면으로 이동
        const timer = setTimeout(() => {
            navigation.navigate('Chat', {
                conversationId: conversationId
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation, conversationId]);

    return (
        <SafeAreaView className={`flex-1 justify-center items-center ${settings.isHighContrastMode ? 'bg-black' : 'bg-white'}`}>
            <View className="items-center">
                {/* 로딩 애니메이션 */}
                <View className={`${settings.isLargeTextMode ? 'w-24 h-24' : 'w-20 h-20'} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-8`} />
                
                {/* 로딩 텍스트 */}
                <Text className={`${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} font-medium ${settings.isHighContrastMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                    대화를 정리하고 있어요
                </Text>
                <Text className={`${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'} text-center px-8`}>
                    잠시만 기다려주세요...
                </Text>
            </View>
        </SafeAreaView>
    );
}
