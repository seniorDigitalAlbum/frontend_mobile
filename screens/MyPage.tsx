import { View, Text, SafeAreaView, TouchableOpacity, Image, Switch, Alert, Platform } from 'react-native';
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
  const { settings, /* toggleLargeTextMode, */ toggleHighContrastMode } = useAccessibility();
  const { logout, user } = useUser();
  const navigation: any = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // UserContext에서 사용자 정보 가져오기
      if (user) {
        const userProfile: Profile = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        setProfile(userProfile);
        console.log('🧪 UserContext에서 프로필 로드:', userProfile);
      } else {
        // UserContext에 사용자 정보가 없으면 API에서 가져오기 시도
        try {
          const fetchedProfile = await profileService.getProfile();
          setProfile(fetchedProfile);
        } catch (apiError) {
          console.error('API에서 프로필 로드 실패:', apiError);
          // 기본값 설정
          setProfile({
            id: '1',
            name: '사용자',
            phone: '010-0000-0000',
            profileImage: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 handleLogout 함수 호출됨');
    
    // 웹 환경에서는 window.confirm 사용, 모바일에서는 Alert.alert 사용
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      const shouldLogout = window.confirm('정말로 로그아웃하시겠습니까?');
      if (!shouldLogout) {
        console.log('🚪 로그아웃 취소됨');
        return;
      }
    } else {
      // 모바일에서는 Alert.alert 사용
      Alert.alert(
        '로그아웃',
        '정말로 로그아웃하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              console.log('🚪 로그아웃 취소됨');
            },
          },
          {
            text: '로그아웃',
            style: 'destructive',
            onPress: async () => {
              await performLogout();
            },
          },
        ]
      );
      return; // Alert.alert는 비동기이므로 여기서 return
    }
    
    // 웹에서는 바로 로그아웃 실행
    await performLogout();
  };

  const performLogout = async () => {
    try {
      console.log('🚪 로그아웃 시작');
      
      // UserContext의 logout 함수 호출 (카카오 로그아웃 + 데이터 정리 포함)
      await logout();
      console.log('✅ 로그아웃 완료');
      
      // 로그인 화면으로 이동
      setTimeout(() => {
        try {
          console.log('🧭 로그인 화면으로 이동 시도');
          
          // 최상위 네비게이션 찾기
          let parent = navigation.getParent();
          while (parent?.getParent()) {
            parent = parent.getParent();
          }
          
          if (parent) {
            // 네비게이션 스택을 완전히 리셋하고 로그인 화면으로 이동
            parent.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            console.log('✅ 로그인 화면으로 이동 완료');
          } else {
            // 최상위 네비게이션을 찾을 수 없는 경우 직접 navigate
            navigation.navigate('Login');
            console.log('✅ 직접 navigate로 로그인 화면 이동');
          }
        } catch (navError) {
          console.error('❌ 네비게이션 실패:', navError);
          // 네비게이션 실패 시 앱을 새로고침하거나 다른 방법 시도
          Alert.alert('알림', '로그아웃되었습니다. 앱을 다시 시작해주세요.');
        }
      }, 500); // 로그아웃 완료 후 0.5초 대기
      
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
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
              className="w-32 h-32 rounded-full mb-6 profile-image"
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
            {profile.phone}
          </Text>
          {user && (
            <Text className={`mb-8 px-3 py-1 rounded-full text-sm font-medium ${
              user.userType === 'SENIOR' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
                {user.userType === 'SENIOR' ? '시니어' : '가족'}
            </Text>
          )}
        </View>

        {/* 접근성 설정 섹션 */}
        {/* <View className="mb-8">
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

          <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-1">
              <Text className={`text-lg font-medium ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
                야간
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
        </View> */}

        {/* 테스트 화면 버튼 */}
        {/* <TouchableOpacity 
          onPress={() => navigation.navigate('TestScreen')}
          className={`px-8 py-3 rounded-full mb-4 ${settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500'}`}
        >
          <Text className={`text-lg font-semibold ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
            🧪 테스트 화면
          </Text>
        </TouchableOpacity> */}

        {/* 로그아웃 버튼 */}
        <TouchableOpacity 
          onPress={() => {
            console.log('🧪 버튼 클릭됨!');
            console.log('🧪 handleLogout 함수:', typeof handleLogout);
            if (typeof handleLogout === 'function') {
              handleLogout();
            } else {
              console.error('🧪 handleLogout이 함수가 아님!');
            }
          }}
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