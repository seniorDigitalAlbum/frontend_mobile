import { View, Text, SafeAreaView, TouchableOpacity, Image, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import profileService from '../services/profileService';
import { Profile } from '../types/profile';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, toggleLargeTextMode, toggleHighContrastMode } = useAccessibility();

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
    <SafeAreaView className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
      <View className="flex-1 px-6 py-8">
        {/* 프로필 섹션 */}
        <View className="items-center mb-8">
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
          <Text className={`text-2xl font-bold mb-2 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            {profile.name}
          </Text>
          <Text className={`mb-1 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-500'}`}>
            {profile.email}
          </Text>
          <Text className={`mb-8 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-500'}`}>
            {profile.phone}
          </Text>
        </View>

        {/* 접근성 설정 섹션 */}
        <View className="mb-8">
          <Text className={`text-xl font-bold mb-4 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            접근성 설정
          </Text>
          
          {/* 큰 글씨 모드 토글 */}
          <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-1">
              <Text className={`text-lg font-medium ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                큰 글씨 모드
              </Text>
              <Text className={`text-sm mt-1 ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
                텍스트와 버튼 크기를 크게 표시합니다
              </Text>
            </View>
            <Switch
              value={settings.isLargeTextMode}
              onValueChange={toggleLargeTextMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.isLargeTextMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {/* 고대비 모드 토글 */}
          <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-1">
              <Text className={`text-lg font-medium ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                고대비 모드
              </Text>
              <Text className={`text-sm mt-1 ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>
                화면의 대비를 높여 가독성을 개선합니다
              </Text>
            </View>
            <Switch
              value={settings.isHighContrastMode}
              onValueChange={toggleHighContrastMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.isHighContrastMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>


        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity 
          onPress={() => console.log('로그아웃')}
          className={`px-8 py-3 rounded-full ${settings.isHighContrastMode ? 'bg-white' : 'bg-red-500'}`}
        >
          <Text className={`text-lg font-semibold ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
            로그아웃
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 