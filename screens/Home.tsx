import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Album from './Album';
import AlbumHero from '../components/AlbumHero';
import QuestionList from '../components/QuestionList';
import questionService from '../services/questionService';
import { Question } from '../types/question';

export default function Home() {
    const navigation: any = useNavigation();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Notification')}
                    className="mr-4"
                >
                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                </TouchableOpacity>
            ),
            headerStyle: {
                backgroundColor: 'transparent', // 헤더를 투명하게
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTransparent: true, // 헤더를 완전히 투명하게
        });
    }, [navigation]);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const fetchedQuestions = await questionService.getQuestions();
            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionPress = (question: Question) => {
        // CameraTest로 이동 (카메라/마이크 테스트 후 대화 시작)
        navigation.navigate('CameraTest', { 
            questionText: question.content,
            questionId: question.id,
            userId: "1"
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <Text className="text-gray-500">질문을 불러오는 중...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* 앨범 표지 */}
            <AlbumHero 
                imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                onPress={() => navigation.navigate('Album')}
            />
            {/* 오늘의 질문 */}
            <View className="flex-1 justify-start items-start mt-4 ml-4">
                <Text className="text-2xl font-bold">오늘의 질문</Text>
                <Text className="mt-2 opacity-90">질문을 눌러 하나씩 답해보세요.</Text>
            </View>
            {/* 질문 리스트 */}
            <View className="m-4">
                {questions && questions.length > 0 ? (
                    questions.map((question) => {
                        // question이 유효한지 확인
                        if (!question || typeof question !== 'object') {
                            return null;
                        }
                        
                        // content가 유효한 문자열인지 확인
                        const questionText = question.content && typeof question.content === 'string' 
                            ? question.content 
                            : '질문 내용이 없습니다.';
                        
                        return (
                            <QuestionList 
                                key={question.id || Math.random()}
                                onPress={() => handleQuestionPress(question)}
                            >
                                {questionText}
                            </QuestionList>
                        );
                    })
                ) : (
                    <View className="items-center py-8">
                        <Text className="text-gray-500">질문을 불러오는 중...</Text>
                    </View>
                )}
            </View>
        </ScrollView >
    );
}
