export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: NotificationItem[];
  message?: string;
}

export interface NotificationApiError {
  message: string;
  status?: number;
} 