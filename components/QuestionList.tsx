import { View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    onPress?: () => void;
}

export default function QuestionList({ children, onPress }: Props) {
    return (
        <TouchableOpacity 
            onPress={onPress} 
            activeOpacity={0.7}
            className="mb-3"
        >
            <View className="h-20 w-full bg-white border border-gray-200 rounded-full justify-center items-start px-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <View className="flex-row items-center w-full">
                    <View className="w-2 h-2 bg-purple-500 rounded-full mr-4" />
                    <Text className="text-black text-base font-medium flex-1">{children}</Text>
                    <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center">
                        <Text className="text-purple-600 text-xs">→</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
