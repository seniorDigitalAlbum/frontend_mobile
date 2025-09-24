import { NotificationItem, NotificationResponse, NotificationApiError } from '../../types/notification';
import { API_ENDPOINTS } from '../../config/api';
import apiClient from './apiClient';

class NotificationApiService {

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await apiClient.get<NotificationResponse>(API_ENDPOINTS.notifications);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    try {
      const response = await apiClient.get<NotificationResponse>(API_ENDPOINTS.notification(id));
      return response.data.data[0] || null;
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      await this.request<NotificationResponse>(API_ENDPOINTS.markNotificationAsRead(id), {
        method: 'PUT',
      });
      return true;
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await this.request<NotificationResponse>(API_ENDPOINTS.markAllNotificationsAsRead, {
        method: 'PUT',
      });
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }
}

export const notificationApiService = new NotificationApiService();
export default notificationApiService;
