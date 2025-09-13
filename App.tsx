/**
 * App.tsx - 메인 애플리케이션 컴포넌트
 * 
 * React Native 애플리케이션의 진입점입니다.
 * 네비게이션 구조와 Context Provider들을 설정합니다.
 * 
 * 주요 기능:
 * - 네비게이션 구조 설정 (Stack Navigator + Tab Navigator)
 * - Context Provider 설정 (DiaryProvider, ConversationProvider)
 * - 화면 간 네비게이션 타입 정의
 * - 전역 스타일 적용
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { DiaryProvider } from './contexts/DiaryContext';
import { ConversationProvider } from './contexts/ConversationContext';
import './global.css';

import Login from './screens/Login';
import Home from './screens/Home';
import Album from './screens/Album';
import MyPage from './screens/MyPage';
import CameraTest from './screens/CameraTest';
import Notification from './screens/Notification';
// import AIChat from './screens/AIChat'; // 사용되지 않는 화면
// import UserAnswer from './screens/UserAnswer'; // 사용되지 않는 화면
import Conversation from './screens/Conversation';
import Chat from './screens/Chat';
import DiaryResult from './screens/DiaryResult';
import DiaryLoading from './components/DiaryLoading';
import ConversationFlow from './components/ConversationFlow';

/**
 * 루트 스택 네비게이션 파라미터 타입 정의
 * 각 화면으로 전달되는 파라미터들을 타입으로 정의합니다.
 */
export type RootStackParamList = {
  Login: undefined;                    // 로그인 화면 (파라미터 없음)
  MainTabs: undefined;                 // 메인 탭 네비게이터 (파라미터 없음)
  CameraTest: {                        // 카메라 테스트 화면
    questionText: string;              // 질문 텍스트
    questionId?: number;               // 질문 ID (선택사항)
    conversationId?: number;           // 대화 ID (선택사항)
    cameraSessionId?: string;          // 카메라 세션 ID (선택사항)
    microphoneSessionId?: string;      // 마이크 세션 ID (선택사항)
  };
  ConversationFlow: {                  // 대화 플로우 화면
    questionText: string;              // 질문 텍스트
    questionId: number;                // 질문 ID
    conversationId: string;            // 대화 ID
    userId: string;                    // 사용자 ID
  };
  Notification: undefined;
  // AIChat: { // 사용되지 않는 화면
  //   questionText: string;
  //   questionId?: number;
  //   conversationId?: number;
  //   cameraSessionId?: string;
  //   microphoneSessionId?: string;
  // };
  // UserAnswer: { // 사용되지 않는 화면
  //   questionText: string;
  //   questionId?: number;
  //   conversationId?: number;
  //   cameraSessionId?: string;
  //   microphoneSessionId?: string;
  // };
  Conversation: { 
    questionText: string;
    questionId?: number;
    conversationId?: number;
    cameraSessionId?: string;
    microphoneSessionId?: string;
    userId?: string;
  };
  Chat: { 
    chatHistory?: Array<{ id: number; type: string; message: string; timestamp: string }>;
    conversationId?: number;
  };
  DiaryResult: { 
    diary: string;
    conversationId?: number;
    finalEmotion?: string;
    userId?: string;
    musicRecommendations?: Array<{
      id: number;
      title: string;
      artist: string;
      mood: string;
      youtubeLink: string;
      youtubeVideoId: string;
    }>;
  };
  DiaryLoading: undefined;
};

// 네비게이터 인스턴스 생성
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * MainTabs 컴포넌트
 * 
 * 하단 탭 네비게이션을 제공하는 컴포넌트입니다.
 * 메인 화면, 앨범, 마이페이지 탭을 포함합니다.
 * 
 * @returns JSX.Element
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: '메인',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          headerShown: true,
          headerTitle: '',
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
          },
        }}
      />
      <Tab.Screen
        name="Album"
        component={Album}
        options={{
          tabBarLabel: '앨범',
          tabBarIcon: ({ color, size }) => <Ionicons name="images-outline" size={size} color={color} />,
          headerShown: false,
          header: () => null,
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPage}
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * App 컴포넌트 - 애플리케이션의 루트 컴포넌트
 * 
 * 전체 애플리케이션의 구조를 설정하고 Context Provider들을 제공합니다.
 * 네비게이션 구조와 초기 라우트를 정의합니다.
 * 
 * @returns JSX.Element
 */
export default function App() {
  return (
    <DiaryProvider>
      <ConversationProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="MainTabs"
            screenOptions={{
              headerShown: false
            }}
          >
            {/* 로그인 화면 */}
            <Stack.Screen name="Login" component={Login} />
            
            {/* 메인 탭 네비게이터 */}
            <Stack.Screen name="MainTabs" component={MainTabs} />
            
            {/* 대화 플로우 화면 */}
            <Stack.Screen name="ConversationFlow" component={ConversationFlow} />
            
            {/* 카메라 테스트 화면 */}
            <Stack.Screen name="CameraTest" component={CameraTest} />
            
            {/* 통합 대화 화면 */}
            <Stack.Screen name="Conversation" component={Conversation} />
            
            {/* 알림 화면 */}
            <Stack.Screen name="Notification" component={Notification} />
            
            {/* AI 채팅 화면 */}
            {/* <Stack.Screen name="AIChat" component={AIChat} /> 사용되지 않는 화면 */}
            
            {/* 사용자 답변 화면 */}
            {/* <Stack.Screen name="UserAnswer" component={UserAnswer} /> 사용되지 않는 화면 */}
            
            {/* 채팅 화면 */}
            <Stack.Screen name="Chat" component={Chat} />
            
            {/* 일기 결과 화면 */}
            <Stack.Screen name="DiaryResult" component={DiaryResult} />
            
            {/* 일기 생성 로딩 화면 */}
            <Stack.Screen name="DiaryLoading" component={DiaryLoading} />
          </Stack.Navigator>
        </NavigationContainer>
      </ConversationProvider>
    </DiaryProvider>
  );
}
