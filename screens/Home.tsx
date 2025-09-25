import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Album from './Album';
import AlbumHero from '../components/AlbumHero';
import QuestionList from '../components/QuestionList';
import questionService from '../services/questionService';
import questionApiService from '../services/api/questionApiService';
import { Question } from '../types/question';
import RecommendedQuestion from '../components/RecommendedQuestion';
import GuardianDashboard from '../components/GuardianDashboard';
import { useUser, UserType } from '../contexts/UserContext';
import { guardianApiService } from '../services/api/guardianApiService';
import albumApiService from '../services/api/albumApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface LinkedSenior {
    id: number;
    guardianUserId: string;
    seniorUserId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function Home() {
    const navigation: any = useNavigation();
    const { userType, user } = useUser();
    
    // 로그인 우회를 위해 기본값 설정
    const effectiveUserType = userType || UserType.SENIOR;
    const effectiveUser = user || { userId: 'demo-user', phone: '010-0000-0000' };
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [randomQuestion, setRandomQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(5);
    const [linkedSeniors, setLinkedSeniors] = useState<LinkedSenior[]>([]);
    const [loadingSeniors, setLoadingSeniors] = useState(false);
    const [coverPhotoInfo, setCoverPhotoInfo] = useState<any>(null);

    // 표지 사진 정보 로드
    const loadCoverPhotoInfo = useCallback(async () => {
        try {
            const storedInfo = await AsyncStorage.getItem('latestCoverPhoto');
            if (storedInfo) {
                const parsedInfo = JSON.parse(storedInfo);
                setCoverPhotoInfo(parsedInfo);
                console.log('✅ 표지 사진 정보 로드:', parsedInfo);
            }
        } catch (error) {
            console.log('표지 사진 정보 로드 실패:', error);
        }
    }, []);

    const loadInitialQuestions = useCallback(async () => {
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
    }, [itemsPerPage]);

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

    const loadRandomQuestion = useCallback(async () => {
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
    }, []);

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
        loadCoverPhotoInfo(); // 표지 사진 정보 로드
        
        // 가족인 경우 연결된 시니어 목록 로드
        if (effectiveUserType === UserType.GUARDIAN) {
            loadLinkedSeniors();
        }
    }, [effectiveUserType, loadInitialQuestions, loadRandomQuestion, loadCoverPhotoInfo]); // 메모이제이션된 함수들 추가

    // 화면 포커스 시 표지 사진 정보 새로고침 (시니어용)
    useFocusEffect(
        useCallback(() => {
            if (effectiveUserType === UserType.SENIOR) {
                loadCoverPhotoInfo();
            }
        }, [loadCoverPhotoInfo, effectiveUserType])
    );

    const loadLinkedSeniors = async () => {
        if (!effectiveUser?.userId) return;
        
        try {
            setLoadingSeniors(true);
            // API가 없으므로 목업 데이터 사용
            const mockSeniors = generateMockLinkedSeniors();
            setLinkedSeniors(mockSeniors);
            console.log('🧪 목업 시니어 목록 사용:', mockSeniors);
        } catch (error) {
            console.error('연결된 시니어 목록 로드 실패:', error);
            // 에러 시에도 목업 데이터 사용
            const mockSeniors = generateMockLinkedSeniors();
            setLinkedSeniors(mockSeniors);
            console.log('🧪 에러로 인한 목업 시니어 목록 사용:', mockSeniors);
        } finally {
            setLoadingSeniors(false);
        }
    };

    // 목업 시니어 데이터 생성
    const generateMockLinkedSeniors = () => {
        return [
            {
                id: 1,
                guardianUserId: effectiveUser?.userId || 'guardian-1',
                seniorUserId: 'senior-1',
                status: 'ACTIVE',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                guardianUserId: effectiveUser?.userId || 'guardian-1',
                seniorUserId: 'senior-2',
                status: 'ACTIVE',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                guardianUserId: effectiveUser?.userId || 'guardian-1',
                seniorUserId: 'senior-3',
                status: 'ACTIVE',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
                updatedAt: new Date().toISOString()
            }
        ];
    };

    const handleQuestionPress = (question: Question) => {
        // CameraTest로 이동 (카메라/마이크 테스트 후 대화 시작)
        navigation.navigate('CameraTest', {
            questionText: question.content,
            questionId: question.id,
            userId: effectiveUser?.userId || "1"
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

            {/* 앨범 표지 - 사용자 타입별 다른 제목 */}
            <View className="my-3">
                <Text className="text-2xl font-bold mb-3">
                    {effectiveUserType === UserType.GUARDIAN ? '시니어의 앨범' : '내 앨범'}
                </Text>
                
                {effectiveUserType === UserType.GUARDIAN ? (
                    // 가족: 연결된 시니어들의 앨범 목록
                    <View>
                        {loadingSeniors ? (
                            <View className="bg-gray-100 rounded-2xl p-8 items-center">
                                <ActivityIndicator size="large" color="#007AFF" />
                                <Text className="text-gray-500 mt-2">시니어 목록을 불러오는 중...</Text>
                            </View>
                        ) : linkedSeniors.length > 0 ? (
                            <View className="space-y-3">
                                {linkedSeniors.map((senior, index) => {
                                    // 목업 시니어 이름과 앨범 수 생성
                                    const seniorNames = ['김할머니', '이할아버지', '박할머니'];
                                    const albumCounts = [5, 3, 8];
                                    const lastActivity = ['2시간 전', '1일 전', '30분 전'];
                                    
                                    return (
                                        <TouchableOpacity
                                            key={senior.id}
                                            onPress={() => navigation.navigate('Album', { seniorUserId: senior.seniorUserId })}
                                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
                                        >
                                            <View className="flex-row items-center">
                                                <View className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full items-center justify-center mr-4">
                                                    <Ionicons name="person" size={28} color="#007AFF" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-lg font-semibold text-gray-800">
                                                        {seniorNames[index] || `시니어 ${index + 1}`}
                                                    </Text>
                                                    <Text className="text-sm text-gray-500 mb-1">
                                                        연결일: {new Date(senior.createdAt).toLocaleDateString()}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                                                        <Text className="text-xs text-gray-400 ml-1">
                                                            {lastActivity[index] || '방금 전'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="items-center">
                                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                                    <Text className="text-xs text-gray-400 mt-1">앨범 보기</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                                
                                {/* 시니어 추가 버튼 */}
                                <TouchableOpacity
                                    onPress={() => {
                                        // 시니어 연결 화면으로 이동
                                        navigation.navigate('GuardianConnection', {
                                            guardianPhoneNumber: effectiveUser?.phone || ''
                                        });
                                    }}
                                    className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 items-center"
                                >
                                    <Ionicons name="add-circle-outline" size={32} color="#007AFF" />
                                    <Text className="text-blue-600 font-medium mt-2">시니어 추가 연결</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // 연결된 시니어가 없는 경우
                            <View className="bg-gray-50 rounded-2xl p-8 items-center">
                                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 text-center mt-3 mb-4">
                                    아직 연결된 시니어가 없습니다.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('GuardianConnection', {
                                            guardianPhoneNumber: effectiveUser?.phone || ''
                                        });
                                    }}
                                    className="bg-blue-500 px-6 py-3 rounded-full"
                                >
                                    <Text className="text-white font-semibold">시니어 연결하기</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ) : (
                    // 시니어: 기존 앨범 표지
                    <AlbumHero
                        imageUrl={coverPhotoInfo?.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"}
                        onPress={() => navigation.navigate('Album')}
                    />
                )}
            </View>

            {/* 시니어만 추천 질문을 볼 수 있음 */}
            {effectiveUserType === UserType.SENIOR && (
                <View className="my-10">
                    <Text className="text-2xl font-bold mb-5">
                        이 얘기를 들어보고 싶어요.
                    </Text>
                    <RecommendedQuestion
                        randomQuestion={randomQuestion}
                        onQuestionPress={handleQuestionPress}
                    />
                </View>
            )}

            {/* 시니어만 질문 리스트를 볼 수 있음 */}
            {effectiveUserType === UserType.SENIOR && (
                <View className="my-3">
                    <Text className="text-2xl font-bold">
                        다른 질문
                    </Text>
                    <Text className="text-base mb-3">
                        대화를 시작해볼까요?
                    </Text>
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
            )}
        </ScrollView >
    );
}
