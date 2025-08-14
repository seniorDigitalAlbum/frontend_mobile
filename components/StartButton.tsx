import { TouchableOpacity, Text } from 'react-native';

interface StartButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

export default function StartButton({ onPress, disabled = false }: StartButtonProps) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            disabled={disabled}
            className={`w-full px-8 py-4 rounded-full items-center ${
                disabled ? 'bg-gray-300' : 'bg-purple-500'
            }`}
            activeOpacity={disabled ? 1 : 0.7}
        >
            <Text className={`text-lg font-semibold ${
                disabled ? 'text-gray-500' : 'text-white'
            }`}>
                {disabled ? "준비 중..." : "시작하기"}
            </Text>
        </TouchableOpacity>
    );
} 