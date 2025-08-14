import { TouchableOpacity, Text } from 'react-native';

interface EndChatButtonProps {
    onPress: () => void;
}

export default function EndChatButton({ onPress }: EndChatButtonProps) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="w-full px-8 py-4 rounded-full items-center bg-gray-500 shadow-lg"
            activeOpacity={0.7}
        >
            <Text className="text-lg font-semibold text-white">
                이 대화를 끝낼래요
            </Text>
        </TouchableOpacity>
    );
} 