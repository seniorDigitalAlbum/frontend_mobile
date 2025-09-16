import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Album from './Album';
import AlbumHero from '../components/AlbumHero';
import QuestionList from '../components/QuestionList';
import questionService from '../services/questionService';
import questionApiService from '../services/api/questionApiService';
import { Question } from '../types/question';
import RecommendedQuestion from '../components/RecommendedQuestion';

export default function Home() {
    const navigation: any = useNavigation();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [randomQuestion, setRandomQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(5);

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
        loadInitialQuestions();
        loadRandomQuestion();
    }, []);

    const loadInitialQuestions = async () => {
        try {
            setLoading(true);
            // 먼저 페이지네이션 API 시도
            try {
                const result = await questionApiService.getQuestionsPaginated(0, itemsPerPage);
                console.log('Pagination API result:', result);
                console.log('Questions count:', result.questions?.length);

                // API가 모든 질문을 반환하는 경우 클라이언트 사이드에서 나누기
                if (result.questions && result.questions.length > itemsPerPage) {
                    console.log('API returned all questions, using client-side pagination');
                    setAllQuestions(result.questions);
                    const initialQuestions = result.questions.slice(0, itemsPerPage);
                    setQuestions(initialQuestions);
                    setHasMore(result.questions.length > itemsPerPage);
                } else {
                    setQuestions(result.questions);
                    setHasMore(result.hasMore);
                    setAllQuestions(result.questions);
                }
                setCurrentPage(0);
                return;
            } catch (paginationError) {
                console.log('Pagination API not available, falling back to full list:', paginationError);
            }

            // fallback: 모든 질문을 가져와서 클라이언트 사이드에서 페이지네이션
            const fetchedQuestions = await questionService.getQuestions();
            setAllQuestions(fetchedQuestions);

            // 첫 번째 페이지만 표시 (5개)
            const initialQuestions = fetchedQuestions.slice(0, itemsPerPage);
            console.log(`Initial load: ${initialQuestions.length} questions (itemsPerPage: ${itemsPerPage})`);
            setQuestions(initialQuestions);
            setHasMore(fetchedQuestions.length > itemsPerPage);
            setCurrentPage(0);

        } catch (error) {
            console.error('Failed to load questions:', error);
            setQuestions([]);
            setAllQuestions([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreQuestions = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;

            // 페이지네이션 API가 사용 가능한 경우
            if (allQuestions.length === questions.length) {
                try {
                    const result = await questionApiService.getQuestionsPaginated(nextPage, itemsPerPage);
                    setQuestions(prev => [...prev, ...result.questions]);
                    setHasMore(result.hasMore);
                    setCurrentPage(nextPage);
                    return;
                } catch (paginationError) {
                    console.log('Pagination API failed, using client-side pagination:', paginationError);
                }
            }

            // 클라이언트 사이드 페이지네이션 (5개씩)
            const startIndex = (nextPage) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const nextQuestions = allQuestions.slice(startIndex, endIndex);

            if (nextQuestions.length > 0) {
                console.log(`Loading more: ${nextQuestions.length} questions (page: ${nextPage})`);
                setQuestions(prev => [...prev, ...nextQuestions]);
                setCurrentPage(nextPage);
                setHasMore(endIndex < allQuestions.length);
            } else {
                setHasMore(false);
            }

        } catch (error) {
            console.error('Failed to load more questions:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const loadRandomQuestion = async () => {
        try {
            const randomQ = await questionApiService.getRandomQuestion();
            setRandomQuestion(randomQ);
        } catch (error) {
            console.log('Random question API not available, using fallback:', error);
            // fallback: 모든 질문에서 랜덤하게 선택
            try {
                const allQuestions = await questionService.getQuestions();
                if (allQuestions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * allQuestions.length);
                    setRandomQuestion(allQuestions[randomIndex]);
                }
            } catch (fallbackError) {
                console.error('Failed to load random question with fallback:', fallbackError);
            }
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

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;

        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreQuestions();
        }
    };

    console.log(`Rendering ${questions.length} questions`);

    return (
        <ScrollView
            className="flex flex-1 bg-white p-8"
            onScroll={handleScroll}
            scrollEventThrottle={400}
        >
            {/* 앨범 표지 */}
            <View className="my-3">
                <Text className="text-2xl font-bold mb-3">내 앨범</Text>
                <AlbumHero
                    imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                    onPress={() => navigation.navigate('Album')}
                />
            </View>

            {/* 추천 질문 영역 */}
            <View className="my-10">
                <Text className="text-2xl font-bold mb-5">이 얘기를 들어보고 싶어요.</Text>
                <RecommendedQuestion
                    randomQuestion={randomQuestion}
                    onQuestionPress={handleQuestionPress}
                />
            </View>

            {/* 모든 리스트 */}
            <View className="my-3">
                <Text className="text-2xl font-bold">다른 질문</Text>
                <Text className="text-base mb-3">대화를 시작해볼까요?</Text>
                {/* 질문 리스트 */}
                <View>
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

                {/* 무한 스크롤 로딩 인디케이터 */}
                {loadingMore && (
                    <View className="items-center py-4">
                        <ActivityIndicator size="small" color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2">추가 질문을 불러오는 중...</Text>
                    </View>
                )}

                {/* 더 이상 로드할 질문이 없을 때 */}
                {!hasMore && questions.length > 0 && (
                    <View className="items-center py-4">
                        <Text className="text-gray-400 text-sm">모든 질문을 불러왔습니다</Text>
                    </View>
                )}

            </View>
        </ScrollView >
    );
}
