import questionService from './questionService';
import questionApiService from './api/questionApiService';
import { Question } from '../types/question';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CoverPhotoInfo {
    imageUrl: string;
    conversationId: number;
    diary: string;
    finalEmotion: string;
    createdAt: string;
}

/**
 * 시니어 홈 화면용 질문 서비스
 */
export class SeniorQuestionService {
    /**
     * 초기 질문 목록 로드 (페이지네이션)
     */
    static async loadInitialQuestions(itemsPerPage: number = 5) {
        try {
            // 먼저 페이지네이션 API 시도
            try {
                const result = await questionApiService.getQuestionsPaginated(0, itemsPerPage);

                // API가 모든 질문을 반환하는 경우 클라이언트 사이드에서 나누기
                if (result.questions && result.questions.length > itemsPerPage) {
                    return {
                        questions: result.questions.slice(0, itemsPerPage),
                        allQuestions: result.questions,
                        hasMore: result.questions.length > itemsPerPage,
                        currentPage: 0
                    };
                } else {
                    return {
                        questions: result.questions,
                        allQuestions: result.questions,
                        hasMore: result.hasMore,
                        currentPage: 0
                    };
                }
            } catch (paginationError) {
            }

            // fallback: 모든 질문을 가져와서 클라이언트 사이드에서 페이지네이션
            const fetchedQuestions = await questionService.getQuestions();
            const initialQuestions = fetchedQuestions.slice(0, itemsPerPage);
            
            return {
                questions: initialQuestions,
                allQuestions: fetchedQuestions,
                hasMore: fetchedQuestions.length > itemsPerPage,
                currentPage: 0
            };
        } catch (error) {
            console.error('Failed to load questions:', error);
            return {
                questions: [],
                allQuestions: [],
                hasMore: false,
                currentPage: 0
            };
        }
    }

    /**
     * 추가 질문 로드 (무한 스크롤)
     */
    static async loadMoreQuestions(
        currentQuestions: Question[],
        allQuestions: Question[],
        currentPage: number,
        itemsPerPage: number = 5
    ) {
        try {
            const nextPage = currentPage + 1;

            // 페이지네이션 API가 사용 가능한 경우
            if (allQuestions.length === currentQuestions.length) {
                try {
                    const result = await questionApiService.getQuestionsPaginated(nextPage, itemsPerPage);
                    return {
                        questions: [...currentQuestions, ...result.questions],
                        hasMore: result.hasMore,
                        currentPage: nextPage
                    };
                } catch (paginationError) {
                }
            }

            // 클라이언트 사이드 페이지네이션 (5개씩)
            const startIndex = nextPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const nextQuestions = allQuestions.slice(startIndex, endIndex);

            if (nextQuestions.length > 0) {
                return {
                    questions: [...currentQuestions, ...nextQuestions],
                    hasMore: endIndex < allQuestions.length,
                    currentPage: nextPage
                };
            } else {
                return {
                    questions: currentQuestions,
                    hasMore: false,
                    currentPage: currentPage
                };
            }
        } catch (error) {
            return {
                questions: currentQuestions,
                hasMore: false,
                currentPage: currentPage
            };
        }
    }

    /**
     * 랜덤 질문 로드
     */
    static async loadRandomQuestion(): Promise<Question | null> {
        try {
            const randomQ = await questionApiService.getRandomQuestion();
            return randomQ;
        } catch (error) {
            // fallback: 모든 질문에서 랜덤하게 선택
            try {
                const allQuestions = await questionService.getQuestions();
                if (allQuestions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * allQuestions.length);
                    return allQuestions[randomIndex];
                }
                return null;
            } catch (fallbackError) {
                console.error('Failed to load random question with fallback:', fallbackError);
                return null;
            }
        }
    }
}

/**
 * 시니어 홈 화면용 표지 사진 서비스
 */
export class SeniorCoverPhotoService {
    /**
     * 표지 사진 정보 로드
     */
    static async loadCoverPhotoInfo(): Promise<CoverPhotoInfo | null> {
        try {
            const storedInfo = await AsyncStorage.getItem('latestCoverPhoto');
            
            if (storedInfo) {
                const parsedInfo = JSON.parse(storedInfo);
                return parsedInfo;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}
