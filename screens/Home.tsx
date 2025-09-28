import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useLayoutEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Album from './Album';
import AlbumHero from '../components/AlbumHero';
import QuestionList from '../components/QuestionList';
import { Question } from '../types/question';
import RecommendedQuestion from '../components/RecommendedQuestion';
import { useUser } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { HomeUtils } from '../utils/homeUtils';
import { useSeniorHome } from '../hooks/useSeniorHome';
import LoadingScreen from '../components/LoadingScreen';
import { colors } from '../styles/commonStyles';

export default function Home() {
    const navigation: any = useNavigation();
    const { user } = useUser();
    const effectiveUser = user || { userId: 'demo-user', phone: '010-0000-0000' };
    
    const {
        questions,
        randomQuestion,
        loading,
        loadingMore,
        hasMore,
        coverPhotoInfo,
        hasDiaries,
        loadInitialQuestions,
        loadMoreQuestions,
        loadRandomQuestion,
        loadCoverPhotoInfo,
        handleQuestionPress,
        handleScroll,
    } = useSeniorHome();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('TestScreen')}
                        className="mr-2"
                    >
                        <Ionicons name="flask-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Notification')}
                        className="mr-4"
                    >
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
            headerStyle: {
                backgroundColor: 'transparent',
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTransparent: true,
        });
    }, [navigation]);

    useEffect(() => {
        loadInitialQuestions();
        loadRandomQuestion();
        loadCoverPhotoInfo();
    }, [loadInitialQuestions, loadRandomQuestion, loadCoverPhotoInfo]);

    // 화면 포커스 시 표지 사진 정보 새로고침
    useFocusEffect(
        useCallback(() => {
                loadCoverPhotoInfo();
        }, [loadCoverPhotoInfo])
    );

    if (loading) {
        return <LoadingScreen message="질문을 불러오는 중..." />;
    }

    console.log(`Rendering ${questions.length} questions`);

    return (
        <ScrollView
            className="flex flex-1 p-8 bg-white"
            onScroll={(event) => handleScroll(event)}
            scrollEventThrottle={400}
        >

            {/* 앨범 표지 */}
            <View className="my-6">
                <Text className="text-3xl font-bold mb-3">내 앨범</Text>
                    <AlbumHero
                        imageUrl={coverPhotoInfo?.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"}
                        onPress={() => navigation.navigate('Album')}
                        isEmpty={!hasDiaries} // 일기가 없으면 빈 상태로 표시
                    />
            </View>

            {/* 추천 질문 */}
                <View className="my-10">
                <Text className="text-3xl font-bold mb-1">
                        이 얘기를 들어보고 싶어요.
                    </Text>
                <Text className="text-lg mb-5">
                    질문을 눌러주세요!
                    </Text>
                    <RecommendedQuestion
                        randomQuestion={randomQuestion}
                    onQuestionPress={(question) => handleQuestionPress(question, navigation, effectiveUser?.userId || "1")}
                    />
                </View>

            {/* 질문 리스트 */}
                <View className="my-3">
                <Text className="text-3xl font-bold mb-1">
                        다른 질문
                    </Text>
                <Text className="text-lg mb-3">
                        대화를 시작해볼까요?
                    </Text>
                    {/* 질문 리스트 */}
                    <View>
                        {questions && questions.length > 0 ? (
                            questions.map((question) => {
                                // question이 유효한지 확인
                            if (!HomeUtils.isValidQuestion(question)) {
                                    return null;
                                }

                                return (
                                    <QuestionList
                                        key={question.id || Math.random()}
                                    onPress={() => handleQuestionPress(question, navigation, effectiveUser?.userId || "1")}
                                    >
                                    {HomeUtils.getQuestionText(question)}
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
