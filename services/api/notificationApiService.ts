import { NotificationItem, NotificationResponse, NotificationApiError } from '../../types/notification';
import { getApiConfig, API_ENDPOINTS } from '../../config/api';

const apiConfig = getApiConfig();

class NotificationApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // 인증이 필요한 경우
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await this.request<NotificationResponse>(API_ENDPOINTS.notifications);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    try {
      const response = await this.request<NotificationResponse>(API_ENDPOINTS.notification(id));
      return response.data[0] || null;
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
