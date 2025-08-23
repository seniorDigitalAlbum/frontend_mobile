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
        navigation.navigate('CameraTest', { questionText: question.content });
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
            <AlbumHero 
                imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                onPress={() => navigation.navigate('Album')}
            />
            <View className="flex-1 justify-start items-start mt-4 ml-4">
                <Text className="text-2xl font-bold">오늘의 질문</Text>
                <Text className="mt-2 opacity-90">질문을 눌러 하나씩 답해보세요</Text>
            </View>
            <View className="flex-1 m-4">
                {questions.map((question) => (
                    <QuestionList 
                        key={question.id}
                        onPress={() => handleQuestionPress(question)}
                    >
                        {question.content}
                    </QuestionList>
                ))}
            </View>
        </ScrollView >
    );
}
