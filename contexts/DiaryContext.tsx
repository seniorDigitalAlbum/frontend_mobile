import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Diary {
    id: number;
    title: string;
    date: string;
    preview: string;
    imageUrl: string;
    content?: string; // 일기 전체 내용 추가
    isPending?: boolean;
}

interface DiaryState {
    diaries: Diary[];
    loading: boolean;
    error: string | null;
}

type DiaryAction =
    | { type: 'ADD_DIARY'; payload: Diary }
    | { type: 'UPDATE_DIARY'; payload: { id: number; diary: Diary } }
    | { type: 'REMOVE_DIARY'; payload: number }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_DIARIES'; payload: Diary[] }
    | { type: 'CLEAR_DIARIES' };

const initialState: DiaryState = {
    diaries: [],
    loading: false,
    error: null,
};

// 최대 10개 일기만 유지하는 헬퍼 함수
const limitDiaries = (diaries: Diary[], maxCount: number = 10): Diary[] => {
    return diaries.slice(0, maxCount);
};

function diaryReducer(state: DiaryState, action: DiaryAction): DiaryState {
    switch (action.type) {
        case 'ADD_DIARY':
            // 새 일기를 맨 앞에 추가하고 최대 10개만 유지
            const newDiaries = [action.payload, ...state.diaries];
            return {
                ...state,
                diaries: limitDiaries(newDiaries),
            };
        case 'UPDATE_DIARY':
            return {
                ...state,
                diaries: state.diaries.map(diary =>
                    diary.id === action.payload.id ? action.payload.diary : diary
                ),
            };
        case 'REMOVE_DIARY':
            return {
                ...state,
                diaries: state.diaries.filter(diary => diary.id !== action.payload),
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        case 'SET_DIARIES':
            return {
                ...state,
                diaries: limitDiaries(action.payload),
            };
        case 'CLEAR_DIARIES':
            return {
                ...state,
                diaries: [],
            };
        default:
            return state;
    }
}

interface DiaryContextType {
    state: DiaryState;
    addDiary: (diary: Diary) => void;
    updateDiary: (id: number, diary: Diary) => void;
    removeDiary: (id: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setDiaries: (diaries: Diary[]) => void;
    clearDiaries: () => void;
    getDiaryById: (id: number) => Diary | undefined;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export function DiaryProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(diaryReducer, initialState);

    const addDiary = (diary: Diary) => {
        dispatch({ type: 'ADD_DIARY', payload: diary });
    };

    const updateDiary = (id: number, diary: Diary) => {
        dispatch({ type: 'UPDATE_DIARY', payload: { id, diary } });
    };

    const removeDiary = (id: number) => {
        dispatch({ type: 'REMOVE_DIARY', payload: id });
    };

    const setLoading = (loading: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: loading });
    };

    const setError = (error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    };

    const setDiaries = (diaries: Diary[]) => {
        dispatch({ type: 'SET_DIARIES', payload: diaries });
    };

    const clearDiaries = () => {
        dispatch({ type: 'CLEAR_DIARIES' });
    };

    const getDiaryById = (id: number): Diary | undefined => {
        return state.diaries.find(diary => diary.id === id);
    };

    const value = {
        state,
        addDiary,
        updateDiary,
        removeDiary,
        setLoading,
        setError,
        setDiaries,
        clearDiaries,
        getDiaryById,
    };

    return (
        <DiaryContext.Provider value={value}>
            {children}
        </DiaryContext.Provider>
    );
}

export function useDiary() {
    const context = useContext(DiaryContext);
    if (context === undefined) {
        throw new Error('useDiary must be used within a DiaryProvider');
    }
    return context;
} 