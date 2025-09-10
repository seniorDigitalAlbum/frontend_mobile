import { Diary } from '../../contexts/DiaryContext';

// 일기 생성 API
export const createDiaryApi = async (diaryData: Omit<Diary, 'id'>): Promise<{ id: number }> => {
    try {
        // TODO: 실제 API 연동
        console.log('백엔드로 일기 생성 요청:', diaryData);
        
        // 시뮬레이션: 2초 후 성공 응답
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return { id: Date.now() };
    } catch (error) {
        console.error('일기 생성 실패:', error);
        throw new Error('일기 생성에 실패했습니다.');
    }
};

// 일기 조회 API
export const getDiaryApi = async (id: number): Promise<Diary> => {
    try {
        // TODO: 실제 API 연동
        console.log('백엔드에서 일기 조회 요청:', id);
        
        // 시뮬레이션: 1초 후 성공 응답
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 임시 데이터 반환
        return {
            id,
            title: `오늘은 정말 특별한 하루였어요 #${id}`,
            date: new Date().toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            }),
            preview: `오늘은 정말 특별한 하루였습니다...`,
            imageUrl: `https://picsum.photos/200/200?random=${id}`,
            content: `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다. 햇살이 따뜻하게 비치는 날씨 속에서 우리는 웃음소리를 내며 뛰어다녔고, 서로를 찾는 과정에서 더욱 친해질 수 있었습니다.`,
        };
    } catch (error) {
        console.error('일기 조회 실패:', error);
        throw new Error('일기를 불러오는데 실패했습니다.');
    }
};

// 일기 목록 조회 API (페이지네이션)
export const getDiariesApi = async (page: number = 1, limit: number = 20): Promise<Diary[]> => {
    try {
        // TODO: 실제 API 연동
        console.log('백엔드에서 일기 목록 조회 요청:', { page, limit });
        
        // 시뮬레이션: 1초 후 성공 응답
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 임시 데이터 생성
        const diaries = [];
        const startId = (page - 1) * limit + 1;
        
        for (let i = 0; i < limit; i++) {
            const id = startId + i;
            diaries.push({
                id,
                title: `오늘은 정말 특별한 하루였어요 #${id}`,
                date: new Date(Date.now() - id * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                }),
                preview: `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다...`,
                imageUrl: `https://picsum.photos/200/200?random=${id}`,
            });
        }
        
        return diaries;
    } catch (error) {
        console.error('일기 목록 조회 실패:', error);
        throw new Error('일기 목록을 불러오는데 실패했습니다.');
    }
};

// 일기 수정 API
export const updateDiaryApi = async (id: number, diaryData: Partial<Diary>): Promise<Diary> => {
    try {
        // TODO: 실제 API 연동
        console.log('백엔드로 일기 수정 요청:', { id, diaryData });
        
        // 시뮬레이션: 1초 후 성공 응답
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 임시 데이터 반환
        return {
            id,
            title: diaryData.title || '수정된 일기',
            date: diaryData.date || new Date().toLocaleDateString('ko-KR'),
            preview: diaryData.preview || '수정된 내용...',
            imageUrl: diaryData.imageUrl || 'https://picsum.photos/200/200',
            content: diaryData.content || '수정된 일기 내용입니다.',
        };
    } catch (error) {
        console.error('일기 수정 실패:', error);
        throw new Error('일기 수정에 실패했습니다.');
    }
};

// 일기 삭제 API
export const deleteDiaryApi = async (id: number): Promise<void> => {
    try {
        // TODO: 실제 API 연동
        console.log('백엔드로 일기 삭제 요청:', id);
        
        // 시뮬레이션: 1초 후 성공 응답
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('일기 삭제 완료:', id);
    } catch (error) {
        console.error('일기 삭제 실패:', error);
        throw new Error('일기 삭제에 실패했습니다.');
    }
};
