import { TouchableOpacity, Text } from 'react-native';

interface AnswerButtonProps {
    onPress: () => void;
}

export default function AnswerButton({ onPress }: AnswerButtonProps) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="w-full px-8 py-4 rounded-full items-center bg-purple-500"
            activeOpacity={0.7}
        >
            <Text className="text-lg font-semibold text-white">
                답변하기
            </Text>
        </TouchableOpacity>
    );
} 