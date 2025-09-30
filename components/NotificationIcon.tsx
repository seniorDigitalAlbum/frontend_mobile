import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    </TouchableOpacity>
  );
}
