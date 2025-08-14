import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { Profile } from '../types/profile';

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const fetchedProfile = await profileService.getProfile();
      setProfile(fetchedProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">프로필을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">프로필을 불러올 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center">
          {profile.profileImage ? (
            <Image 
              source={{ uri: profile.profileImage }} 
              className="w-32 h-32 rounded-full mb-6"
            />
          ) : (
            <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="person" size={60} color="#007AFF" />
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-800 mb-2">{profile.name}</Text>
          <Text className="text-gray-500 mb-1">{profile.email}</Text>
          <Text className="text-gray-500 mb-8">{profile.phone}</Text>
          
          <TouchableOpacity 
            onPress={() => console.log('로그아웃')}
            className="px-8 py-3 bg-red-500 rounded-full"
          >
            <Text className="text-white text-lg font-semibold">로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 