import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../services/notificationService';
import { NotificationItem } from '../types/notification';

export default function Notification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const fetchedNotifications = await notificationService.getNotifications();
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id);
      if (success) {
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        // 모든 알림을 읽음으로 표시
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      onPress={() => handleMarkAsRead(item.id)}
      className={`flex-row p-4 border-b border-gray-100 bg-white ${!item.isRead ? 'bg-blue-50' : ''}`}
    >
      <View className="flex-1">
        <Text className={`text-base font-semibold mb-1 ${!item.isRead ? 'text-black' : 'text-gray-700'}`}>
          {item.title}
        </Text>
        <Text className="text-sm text-gray-600 mb-2">{item.message}</Text>
        <Text className="text-xs text-gray-500">{item.time}</Text>
      </View>
      {!item.isRead && (
        <View className="w-2 h-2 rounded-full bg-blue-500 ml-3 self-center" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">알림을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black">알림</Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity 
            onPress={handleMarkAllAsRead}
            className="px-3 py-1 bg-blue-500 rounded-lg"
          >
            <Text className="text-white text-sm">모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        className="p-4"
      />
    </SafeAreaView>
  );
} 