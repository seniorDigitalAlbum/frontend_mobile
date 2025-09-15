import { View, Text, TouchableOpacity } from 'react-native';
import { Question } from '../types/question';
import AICharacter from './AICharacter';

interface RecommendedQuestionProps {
    randomQuestion: Question | null;
    onQuestionPress: (question: Question) => void;
}

export default function RecommendedQuestion({ randomQuestion, onQuestionPress }: RecommendedQuestionProps) {
    return (
        <View className="m-4">
            <Text className="text-2xl font-bold mb-4">오늘의 추천 질문</Text>
            <View className="bg-gray-50 rounded-lg p-4"
                style={{
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    shadowColor: '#999',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 32,
                    elevation: 8,
                }}>
                <View className="items-center mb-3">
                    <AICharacter />
                </View>
                {randomQuestion ? (
                    <TouchableOpacity
                        onPress={() => onQuestionPress(randomQuestion)}
                        className="items-center"
                    >
                        <View
                            className="rounded-2xl p-4 w-full relative"
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
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
                            <Text className="text-gray-800 text-base leading-6 text-center">
                                {randomQuestion.content}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View className="items-center">
                        <View
                            className="rounded-2xl p-4 max-w-xs relative"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
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
                            <Text className="text-gray-500 text-center">추천 질문을 불러오는 중...</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
