import { Diary } from '../../contexts/DiaryContext';
import apiClient from './apiClient';

// 일기 생성 API
export const createDiaryApi = async (diaryData: Omit<Diary, 'id'>): Promise<{ id: number }> => {
    try {
        console.log('백엔드로 일기 생성 요청:', diaryData);
        
        const response = await apiClient.post<{ id: number }>('/api/diaries', diaryData);
        return response.data;
    } catch (error) {
        console.error('일기 생성 실패:', error);
        throw new Error('일기 생성에 실패했습니다.');
    }
};

// 일기 조회 API
export const getDiaryApi = async (id: number): Promise<Diary> => {
    try {
        console.log('백엔드에서 일기 조회 요청:', id);
        
        const response = await apiClient.get<Diary>(`/api/diaries/${id}`);
        return response.data;
    } catch (error) {
        console.error('일기 조회 실패:', error);
        throw new Error('일기를 불러오는데 실패했습니다.');
    }
};

// 일기 목록 조회 API (페이지네이션)
export const getDiariesApi = async (page: number = 1, limit: number = 20): Promise<Diary[]> => {
    try {
        console.log('백엔드에서 일기 목록 조회 요청:', { page, limit });
        
        const response = await apiClient.get<Diary[]>('/api/diaries', {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('일기 목록 조회 실패:', error);
        throw new Error('일기 목록을 불러오는데 실패했습니다.');
    }
};

// 일기 수정 API
export const updateDiaryApi = async (id: number, diaryData: Partial<Diary>): Promise<Diary> => {
    try {
        console.log('백엔드로 일기 수정 요청:', { id, diaryData });
        
        const response = await apiClient.put<Diary>(`/api/diaries/${id}`, diaryData);
        return response.data;
    } catch (error) {
        console.error('일기 수정 실패:', error);
        throw new Error('일기 수정에 실패했습니다.');
    }
};

// 일기 삭제 API
export const deleteDiaryApi = async (id: number): Promise<void> => {
    try {
        console.log('백엔드로 일기 삭제 요청:', id);
        
        await apiClient.delete(`/api/diaries/${id}`);
        console.log('일기 삭제 완료:', id);
    } catch (error) {
        console.error('일기 삭제 실패:', error);
        throw new Error('일기 삭제에 실패했습니다.');
    }
};
