// screens/MyPage.tsx
import { View, Text, SafeAreaView, TouchableOpacity, Image, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import profileService from '../services/profileService';
import { Profile } from '../types/profile';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useUser } from '../contexts/UserContext';

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, toggleLargeTextMode, toggleHighContrastMode } = useAccessibility();
  const { logout, user } = useUser();
  const navigation: any = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user) {
        const userProfile: Profile = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        setProfile(userProfile);
      } else {
        try {
          const fetchedProfile = await profileService.getProfile();
          setProfile(fetchedProfile);
        } catch (apiError) {
          setProfile({
            id: '1',
            name: '사용자',
            phone: '010-0000-0000',
            profileImage: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // 서버 로그아웃 + 로컬 정리(UserContext)
    } finally {
      // 바로 화면 리셋
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
        {/* 프로필 */}
        <View className="items-center mb-8">
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} className="w-32 h-32 rounded-full mb-6 profile-image" />
          ) : (
            <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="person" size={60} color="#007AFF" />
            </View>
          )}
          <Text className={`text-2xl font-bold mb-2 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            {profile.name}
          </Text>
          <Text className={`mb-1 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-500'}`}>{profile.phone}</Text>
          {user && (
            <Text
              className={`mb-8 px-3 py-1 rounded-full text-sm font-medium ${
                user.userType === 'SENIOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {user.userType === 'SENIOR' ? '시니어' : '가족'}
            </Text>
          )}
        </View>

        {/* 접근성 설정 */}
        <View className="mb-8">
          <Text className={`text-xl font-bold mb-4 ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
            접근성 설정
          </Text>

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
        </View>

        {/* 테스트 화면 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('TestScreen')}
          className={`px-8 py-3 rounded-full mb-4 ${settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500'}`}
        >
          <Text className={`text-lg font-semibold ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
            🧪 테스트 화면
          </Text>
        </TouchableOpacity>

        {/* 로그아웃 */}
        <TouchableOpacity onPress={handleLogout} className={`px-8 py-3 rounded-full ${settings.isHighContrastMode ? 'bg-white' : 'bg-red-500'}`}>
          <Text className={`text-lg font-semibold ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
