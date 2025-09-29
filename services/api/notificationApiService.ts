import { NotificationItem, NotificationResponse, NotificationApiError } from '../../types/notification';
import { apiClient, API_ENDPOINTS } from '../../config/api';

class NotificationApiService {

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await apiClient.get<NotificationResponse>(API_ENDPOINTS.notifications);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    try {
      const response = await apiClient.get<NotificationResponse>(API_ENDPOINTS.notification(id));
      return response.data[0] || null;
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.put<NotificationResponse>(API_ENDPOINTS.markNotificationAsRead(id));
      return true;
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.put<NotificationResponse>(API_ENDPOINTS.markAllNotificationsAsRead);
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // 읽지 않은 알림 목록 조회
  async getUnreadNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await apiClient.get<NotificationItem[]>('/api/notifications/unread');
      return response;
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      throw error;
    }
  }

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/api/notifications/unread-count');
      return response.count;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }

  // 페이지네이션 알림 조회
  async getNotificationsWithPagination(page: number = 0, size: number = 20): Promise<{
    content: NotificationItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    try {
      const response = await apiClient.get(`/api/notifications/page?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications with pagination:', error);
      throw error;
    }
  }

  // 알림 삭제
  async deleteNotification(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error);
      throw error;
    }
  }

  // 앨범 관련 알림 조회 (사진 업로드, 댓글 추가)
  async getAlbumNotifications(): Promise<NotificationItem[]> {
    try {
      const allNotifications = await this.getNotifications();
      return allNotifications.filter(notification => 
        notification.type === 'PHOTO_UPLOAD' || notification.type === 'COMMENT_ADDED'
      );
    } catch (error) {
      console.error('Failed to fetch album notifications:', error);
      throw error;
    }
  }

  // 읽지 않은 앨범 알림 조회
  async getUnreadAlbumNotifications(): Promise<NotificationItem[]> {
    try {
      const unreadNotifications = await this.getUnreadNotifications();
      return unreadNotifications.filter(notification => 
        notification.type === 'PHOTO_UPLOAD' || notification.type === 'COMMENT_ADDED'
      );
    } catch (error) {
      console.error('Failed to fetch unread album notifications:', error);
      throw error;
    }
  }

  // 읽지 않은 앨범 알림 개수 조회
  async getUnreadAlbumCount(): Promise<number> {
    try {
      const unreadAlbumNotifications = await this.getUnreadAlbumNotifications();
      return unreadAlbumNotifications.length;
    } catch (error) {
      console.error('Failed to fetch unread album count:', error);
      throw error;
    }
  }
}

export const notificationApiService = new NotificationApiService();
export default notificationApiService;
