import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNavigation } from '@react-navigation/native';

interface NotificationIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: any;
}

export default function NotificationIcon({ 
  size = 24, 
  color = "#000", 
  className = "",
  style 
}: NotificationIconProps) {
  const { unreadCount } = useWebSocket();
  const navigation = useNavigation();

  const handlePress = () => {
    // 사용자 타입에 따라 다른 알림 화면으로 이동
    navigation.navigate('SeniorNotification' as never);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`relative ${className}`}
      style={style}
    >
      <Ionicons name="notifications-outline" size={size} color={color} />
      
      {/* 읽지 않은 알림 개수 표시 */}
      {unreadCount > 0 && (
        <View
          className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
        >
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
