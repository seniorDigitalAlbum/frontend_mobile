import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types/question';
import { SeniorQuestionService, SeniorCoverPhotoService } from '../services/seniorHomeService';
import { useDiary } from '../contexts/DiaryContext';
import { HomeUtils } from '../utils/homeUtils';

export interface UseSeniorHomeReturn {
    // 상태
    questions: Question[];
    allQuestions: Question[];
    randomQuestion: Question | null;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    currentPage: number;
    itemsPerPage: number;
    coverPhotoInfo: any;
    hasDiaries: boolean;
    
    // 함수
    loadInitialQuestions: () => Promise<void>;
    loadMoreQuestions: () => Promise<void>;
    loadRandomQuestion: () => Promise<void>;
    loadCoverPhotoInfo: () => Promise<void>;
    handleQuestionPress: (question: Question, navigation: any, userId: string) => void;
    handleScroll: (event: any) => void;
}

export const useSeniorHome = (): UseSeniorHomeReturn => {
    const { state: diaryState } = useDiary();
    
    // 일기가 있는지 확인
    const hasDiaries = diaryState.diaries && diaryState.diaries.length > 0;
    
    // 상태
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [randomQuestion, setRandomQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(5);
    const [coverPhotoInfo, setCoverPhotoInfo] = useState<any>(null);

    // 표지 사진 정보 로드
    const loadCoverPhotoInfo = useCallback(async () => {
        const info = await SeniorCoverPhotoService.loadCoverPhotoInfo();
        setCoverPhotoInfo(info);
    }, []);

    const loadInitialQuestions = useCallback(async () => {
        setLoading(true);
        const result = await SeniorQuestionService.loadInitialQuestions(itemsPerPage);
        setQuestions(result.questions);
        setAllQuestions(result.allQuestions);
        setHasMore(result.hasMore);
        setCurrentPage(result.currentPage);
        setLoading(false);
    }, [itemsPerPage]);

    const loadMoreQuestions = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const result = await SeniorQuestionService.loadMoreQuestions(
            questions, 
            allQuestions, 
            currentPage, 
            itemsPerPage
        );
        setQuestions(result.questions);
        setHasMore(result.hasMore);
        setCurrentPage(result.currentPage);
        setLoadingMore(false);
    }, [loadingMore, hasMore, questions, allQuestions, currentPage, itemsPerPage]);

    const loadRandomQuestion = useCallback(async () => {
        const randomQ = await SeniorQuestionService.loadRandomQuestion();
        setRandomQuestion(randomQ);
    }, []);

    // 이벤트 핸들러들
    const handleQuestionPress = useCallback((question: Question, navigation: any, userId: string) => {
        HomeUtils.handleQuestionPress(question, navigation, userId);
    }, []);

    const handleScroll = useCallback((event: any) => {
        HomeUtils.handleScroll(event, loadMoreQuestions);
    }, [loadMoreQuestions]);

    return {
        // 상태
        questions,
        allQuestions,
        randomQuestion,
        loading,
        loadingMore,
        hasMore,
        currentPage,
        itemsPerPage,
        coverPhotoInfo,
        hasDiaries,
        
        // 함수
        loadInitialQuestions,
        loadMoreQuestions,
        loadRandomQuestion,
        loadCoverPhotoInfo,
        handleQuestionPress,
        handleScroll,
    };
};
