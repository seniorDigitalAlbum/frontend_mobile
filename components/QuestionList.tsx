import { View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

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
            className="mb-4"
        >
            <View 
                className="h-20 w-full rounded-2xl justify-center items-start px-6"
                style={{
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0)',
                    shadowColor: '#999',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 32,
                    elevation: 8,
                }}
            >
                
                <View className="flex-row items-center w-full">
                    {/* 왼쪽 동그란 원 */}
                    <View 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{
                            backgroundColor: '#fad0c4',
                        }}
                    />
                    
                    <View className="flex-1 mx-2">
                        <Text className="text-black text-base font-medium leading-5">
                            {displayText}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}