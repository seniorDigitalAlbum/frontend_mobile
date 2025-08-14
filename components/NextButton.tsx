import { TouchableOpacity, Text } from 'react-native';

interface NextButtonProps {
    onPress: () => void;
}

export default function NextButton({ onPress }: NextButtonProps) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="w-full px-8 py-4 rounded-full items-center bg-blue-500 shadow-lg"
            activeOpacity={0.7}
        >
            <Text className="text-lg font-semibold text-white">
                다음으로
            </Text>
        </TouchableOpacity>
    );
} 