import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TempMicTestProps {
    isTested: boolean;
    onTest: () => void;
}

export default function TempMicTest({ isTested, onTest }: TempMicTestProps) {
    return (
        <TouchableOpacity 
            onPress={onTest}
            className={`w-24 h-24 rounded-full justify-center items-center mb-4 ${
                isTested ? 'bg-green-100' : 'bg-blue-100'
            }`}
            activeOpacity={0.7}
        >
            <Ionicons 
                name={isTested ? "checkmark-circle" : "mic"} 
                size={40} 
                color={isTested ? "#10B981" : "#3B82F6"} 
            />
            <Text className={`text-xs mt-1 font-medium ${
                isTested ? 'text-green-700' : 'text-blue-700'
            }`}>
                {isTested ? "완료" : "테스트"}
            </Text>
        </TouchableOpacity>
    );
} 