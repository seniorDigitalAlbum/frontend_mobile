import { View, Text, TouchableOpacity } from 'react-native';
import { Question } from '../types/question';
import AICharacter from './AICharacter';
import { commonStyles } from '../styles/commonStyles';

interface RecommendedQuestionProps {
    randomQuestion: Question | null;
    onQuestionPress: (question: Question) => void;
}

export default function RecommendedQuestion({ randomQuestion, onQuestionPress }: RecommendedQuestionProps) {
    return (
            <View className="flex flex-row">
                <View className="flex-2 justify-center items-center">
                    <AICharacter />
                </View>
                {randomQuestion ? (
                    <TouchableOpacity
                        onPress={() => onQuestionPress(randomQuestion)}
                        className="items-center justify-center flex-1"
                    >
                        <View
                            className="rounded-2xl p-4 justify-center items-center"
                            style={commonStyles.cardStyle}
                        >
                            <Text className="text-black font-semibold text-xl leading-8 text-center">
                                {randomQuestion.content || ''}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View className="items-center">
                        <View
                            className="rounded-2xl p-4 max-w-xs relative"
                            style={commonStyles.glassCardStyle}
                        >
                            <Text className="text-gray-500 text-center">추천 질문을 불러오는 중...</Text>
                        </View>
                    </View>
                )}
            </View>

    );
}
