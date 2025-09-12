import { View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    onPress?: () => void;
}

export default function QuestionList({ children, onPress }: Props) {
    // children을 안전하게 문자열로 변환
    let displayText = '';
    
    try {
        if (children === null || children === undefined) {
            displayText = '';
        } else if (typeof children === 'string') {
            displayText = children;
        } else if (typeof children === 'number') {
            displayText = children.toString();
        } else if (Array.isArray(children)) {
            displayText = children.map(child => {
                if (typeof child === 'string') return child;
                if (typeof child === 'number') return child.toString();
                return '';
            }).join('');
        } else {
            displayText = String(children);
        }
    } catch (error) {
        console.error('Error processing children:', error);
        displayText = '질문 내용을 표시할 수 없습니다.';
    }

    return (
        <TouchableOpacity 
            onPress={onPress} 
            activeOpacity={0.7}
            className="mb-3"
        >
            <View className="h-20 w-full bg-white border border-gray-200 rounded-full justify-center items-start px-6 shadow-sm">
                <View className="flex-row items-center w-full">
                    <View className="w-2 h-2 bg-purple-500 rounded-full mr-4" />
                    <View className="flex-1">
                        <Text className="text-black text-base font-medium">
                            {displayText}
                        </Text>
                    </View>
                    <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center">
                        <Text className="text-purple-600 text-xs">→</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}