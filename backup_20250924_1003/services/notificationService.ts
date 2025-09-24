import { NotificationItem } from '../types/notification';
import notificationApiService from './api/notificationApiService';

class NotificationService {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await notificationApiService.getNotifications();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // 에러 발생 시 기본 알림들 반환
      return this.getDefaultNotifications();
    }
  }

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    try {
      return await notificationApiService.getNotificationById(id);
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      return null;
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      return await notificationApiService.markAsRead(id);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      return await notificationApiService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  // API 연결 전까지 사용할 기본 알림들
  private getDefaultNotifications(): NotificationItem[] {
    return [
      {
        id: '1',
        title: '새로운 질문이 도착했습니다',
        message: '오늘 하루는 어땠나요?',
        time: '방금 전',
        isRead: false,
        category: 'question',
      },
      {
        id: '2',
        title: '앨범이 업데이트되었습니다',
        message: '새로운 사진이 추가되었습니다',
        time: '1시간 전',
        isRead: true,
        category: 'album',
      },
      {
        id: '3',
        title: '일주일 리포트',
        message: '이번 주 기록을 확인해보세요',
        time: '1일 전',
        isRead: true,
        category: 'report',
      },
    ];
  }
}

export const notificationService = new NotificationService();
export default notificationService; 