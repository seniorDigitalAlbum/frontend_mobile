import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// 기존 스크린들 import
import Album from './Album';


const TestScreen: React.FC = () => {
  const { settings } = useAccessibility();
  const navigation: any = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'album' | 'conversation' | 'chat'>('album');



  return (
    <SafeAreaView className={`flex-1 ${settings.isHighContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* 헤더 */}
      <View className={`${settings.isHighContrastMode ? 'bg-black' : 'bg-gradient-to-b from-blue-500 to-blue-600'} px-6 py-8`}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={settings.isHighContrastMode ? '#fff' : '#fff'} 
            />
          </TouchableOpacity>
          <Text className={`font-bold ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-white'}`}>
            🧪 테스트 화면
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <Text className={`${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-blue-100'}`}>
          기존 스크린 UI 테스트
        </Text>
      </View>

      {/* 탭 네비게이션 */}
      <View className={`flex-row mx-4 mt-4 ${settings.isHighContrastMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-1`}>
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-xl ${selectedTab === 'album' ? (settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500') : ''}`}
          onPress={() => setSelectedTab('album')}
        >
          <Text className={`text-center font-semibold ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${
            selectedTab === 'album' 
              ? (settings.isHighContrastMode ? 'text-black' : 'text-white')
              : (settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600')
          }`}>
            앨범
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-xl ${selectedTab === 'conversation' ? (settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500') : ''}`}
          onPress={() => setSelectedTab('conversation')}
        >
          <Text className={`text-center font-semibold ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${
            selectedTab === 'conversation' 
              ? (settings.isHighContrastMode ? 'text-black' : 'text-white')
              : (settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600')
          }`}>
            대화
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-xl ${selectedTab === 'chat' ? (settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500') : ''}`}
          onPress={() => setSelectedTab('chat')}
        >
          <Text className={`text-center font-semibold ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${
            selectedTab === 'chat' 
              ? (settings.isHighContrastMode ? 'text-black' : 'text-white')
              : (settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600')
          }`}>
            채팅
          </Text>
        </TouchableOpacity>
      </View>

      {/* 기존 스크린들 렌더링 */}
      <View className="flex-1">
        {selectedTab === 'album' && <Album />}
        {selectedTab === 'conversation' && (
          <View className="flex-1 justify-center items-center px-8">
            <Text className={`font-bold text-center mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
              🤖 대화 화면
            </Text>
            <Text className={`text-center mb-8 leading-6 ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
              실제 Conversation.tsx 화면을 테스트하려면{'\n'}
              네비게이션으로 이동해주세요.
            </Text>
            <TouchableOpacity 
              className={`px-8 py-4 rounded-full ${settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500'}`}
              onPress={() => navigation.navigate('Conversation', {
                questionText: '오늘 하루는 어떠셨나요?',
                questionId: 1,
                conversationId: 1,
                userId: '1'
              })}
            >
              <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
                대화 화면으로 이동
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedTab === 'chat' && (
          <View className="flex-1 justify-center items-center px-8">
            <Text className={`font-bold text-center mb-4 ${settings.isLargeTextMode ? 'text-xl' : 'text-lg'} ${settings.isHighContrastMode ? 'text-white' : 'text-gray-800'}`}>
              💬 채팅 화면
            </Text>
            <Text className={`text-center mb-8 leading-6 ${settings.isLargeTextMode ? 'text-base' : 'text-sm'} ${settings.isHighContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
              실제 Chat.tsx 화면을 테스트하려면{'\n'}
              네비게이션으로 이동해주세요.
            </Text>
            <TouchableOpacity 
              className={`px-8 py-4 rounded-full ${settings.isHighContrastMode ? 'bg-white' : 'bg-blue-500'}`}
              onPress={() => navigation.navigate('Chat', {
                conversationId: 1
              })}
            >
              <Text className={`font-semibold ${settings.isLargeTextMode ? 'text-lg' : 'text-base'} ${settings.isHighContrastMode ? 'text-black' : 'text-white'}`}>
                채팅 화면으로 이동
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};



export default TestScreen;
