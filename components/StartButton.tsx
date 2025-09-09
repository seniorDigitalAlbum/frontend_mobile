import { TouchableOpacity, Text } from 'react-native';

interface StartButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

export default function StartButton({ onPress, disabled = false }: StartButtonProps) {
    if (disabled) {
        return null;
    }

    return (
        <TouchableOpacity 
            onPress={onPress}
            className="w-full px-8 py-4 rounded-full items-center bg-purple-500"
            activeOpacity={0.7}
        >
            <Text className="text-lg font-semibold text-white">
                시작하기
            </Text>
        </TouchableOpacity>
    );
} 