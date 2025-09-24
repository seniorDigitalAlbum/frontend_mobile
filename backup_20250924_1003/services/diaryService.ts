import { Diary } from '../contexts/DiaryContext';
import { 
    createDiaryApi, 
    getDiaryApi, 
    getDiariesApi, 
    updateDiaryApi, 
    deleteDiaryApi 
} from './api/diaryApiService';

// 일기 생성
export const createDiary = async (diaryData: Omit<Diary, 'id'>): Promise<{ id: number }> => {
    return await createDiaryApi(diaryData);
};

// 일기 조회
export const getDiary = async (id: number): Promise<Diary> => {
    return await getDiaryApi(id);
};

// 일기 목록 조회 (페이지네이션)
export const getDiaries = async (page: number = 1, limit: number = 20): Promise<Diary[]> => {
    return await getDiariesApi(page, limit);
};

// 일기 수정
export const updateDiary = async (id: number, diaryData: Partial<Diary>): Promise<Diary> => {
    return await updateDiaryApi(id, diaryData);
};

// 일기 삭제
export const deleteDiary = async (id: number): Promise<void> => {
    return await deleteDiaryApi(id);
}; 