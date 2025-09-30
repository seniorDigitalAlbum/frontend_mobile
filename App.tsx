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

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, ActivityIndicator, LogBox, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { DiaryProvider } from './contexts/DiaryContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import { UserProvider, useUser, UserType } from './contexts/UserContext';
import GlobalAccessibilityWrapper from './components/GlobalAccessibilityWrapper';
import { colors } from './styles/commonStyles';
import './global.css';

import Login from './screens/Login';
import UserRoleSelection from './screens/UserRoleSelection';
import { KakaoUserInfo } from './services/kakaoAuthService';
import { SeniorInfo } from './services/guardianService';
import GuardianConnection from './screens/GuardianConnection';
import GuardianConnectionResult from './screens/GuardianConnectionResult';
import GuardianConnectionTest from './screens/GuardianConnectionTest';
import GuardianMain from './screens/GuardianMain';
import SeniorAlbumList from './screens/SeniorAlbumList';
import KakaoConnection from './screens/KakaoConnection';
import Home from './screens/Home';
import Album from './screens/Album';
import MyPage from './screens/MyPage';
import CameraTest from './screens/CameraTest';
import MicrophoneTest from './screens/MicrophoneTest';
import Notification from './screens/Notification';
import SeniorNotification from './screens/SeniorNotification';
// import AIChat from './screens/AIChat'; // 사용되지 않는 화면
// import UserAnswer from './screens/UserAnswer'; // 사용되지 않는 화면
import Conversation from './screens/Conversation';
import Chat from './screens/Chat';
import DiaryResult from './screens/DiaryResult';
import DiaryLoading from './screens/DiaryLoading';
import ConversationEndLoading from './screens/ConversationEndLoading';
import ConversationFlow from './components/ConversationFlow';
import AlbumDetail from './screens/AlbumDetail';
import TestScreen from './screens/TestScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * 루트 스택 네비게이션 파라미터 타입 정의
 * 각 화면으로 전달되는 파라미터들을 타입으로 정의합니다.
 */
export type RootStackParamList = {
  Login: {                            // 로그인 화면
    code?: string;                    // 카카오 인증 코드
    token?: string;                   // JWT 토큰
    fromDeepLink?: boolean;           // 딥링크로 전달된 여부
  };
  SignUp: undefined;                   // 회원가입 화면 (파라미터 없음)
  UserRoleSelection: {                 // 사용자 역할 선택 화면
    code?: string;                     // 카카오 인증 코드
    token?: string;                    // JWT 토큰
    fromDeepLink?: boolean;            // 딥링크로 전달된 여부
  };
  SignUp2: {                          // 회원가입 2단계 화면
    userType: 'SENIOR' | 'GUARDIAN';  // 사용자 타입
    phoneNumber: string;               // 인증된 전화번호
    isKakao?: boolean;                 // 카카오 로그인 여부
    kakaoName?: string;                // 카카오 이름
    kakaoGender?: string;              // 카카오 성별
  };
  GuardianConnection: undefined;      // 보호자-시니어 연결 화면 (파라미터 없음)
  GuardianConnectionResult: {         // 보호자-시니어 연결 결과 화면
    seniors: SeniorInfo[];
    selectedSeniors: SeniorInfo[];
    onSeniorToggle: (senior: SeniorInfo) => void;
    onConnect: () => void;
    onBack: () => void;
    isConnecting: boolean;
  };
  GuardianConnectionTest: undefined;  // 보호자-시니어 연결 테스트 화면 (파라미터 없음)
  GuardianMain: undefined;            // 보호자 메인 화면
  MyPage: undefined;                  // 마이페이지 화면
  SeniorAlbumList: {                  // 시니어 앨범 목록 화면
    seniorId: number;
    seniorName: string;
  };
  KakaoConnection: {                  // 카카오 시니어 연결 화면
    guardianPhoneNumber: string;       // 보호자 전화번호
  };
  SeniorInfoConfirm: {                // 시니어 정보 확인 화면
    seniorInfo: any;                   // 시니어 정보
    guardianPhoneNumber: string;       // 보호자 전화번호
  };
  MainTabs: undefined;                 // 메인 탭 네비게이터 (파라미터 없음)
  CameraTest: {                        // 카메라 테스트 화면
    questionText: string;              // 질문 텍스트
    questionId?: number;               // 질문 ID (선택사항)
    conversationId?: number;           // 대화 ID (선택사항)
    cameraSessionId?: string;          // 카메라 세션 ID (선택사항)
    microphoneSessionId?: string;      // 마이크 세션 ID (선택사항)
  };
  MicrophoneTest: {                    // 마이크 테스트 화면
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
  SeniorNotification: undefined;
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
  ConversationEndLoading: {
    conversationId?: number;
  };
  AlbumDetail: {
    conversationId: number;
    diary: string;
    finalEmotion: string;
    title?: string;
    musicRecommendations?: any[];
  };
  TestScreen: undefined;
};

// 네비게이터 인스턴스 생성
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 웹에서 URL 라우팅을 위한 linking 설정
const linking = Platform.OS === 'web' ? {
  prefixes: ['http://localhost:8081', 'https://seniordigitalalbum.github.io/frontend_mobile', 'https://seniordigitalalbum.github.io'],
  config: {
    screens: {
      MainTabs: {
        path: '',
        screens: {
          Home: '',
          Album: 'album',
          MyPage: 'mypage',
        },
      },
      Login: 'login',
      SignUp: 'signup',
      UserRoleSelection: 'user-role-selection',
      SignUp2: 'signup2',
      GuardianConnection: 'guardian-connection',
      KakaoConnection: 'kakao-connection',
      SeniorInfoConfirm: 'senior-info-confirm',
      CameraTest: {
        path: 'camera-test',
        parse: {
          questionText: (questionText: string) => decodeURIComponent(questionText),
          questionId: (questionId: string) => questionId ? parseInt(questionId, 10) : undefined,
          conversationId: (conversationId: string) => conversationId ? parseInt(conversationId, 10) : undefined,
        },
        stringify: {
          questionText: (questionText: string) => encodeURIComponent(questionText),
        },
      },
      ConversationFlow: {
        path: 'conversation-flow/:questionId/:conversationId/:userId',
        parse: {
          questionId: (questionId: string) => parseInt(questionId, 10),
          conversationId: (conversationId: string) => conversationId,
          userId: (userId: string) => userId,
        },
      },
      Conversation: {
        path: 'conversation',
        parse: {
          questionId: (questionId: string) => questionId ? parseInt(questionId, 10) : undefined,
          conversationId: (conversationId: string) => conversationId ? parseInt(conversationId, 10) : undefined,
        },
      },
      Notification: 'notification',
      Chat: {
        path: 'chat',
        parse: {
          conversationId: (conversationId: string) => conversationId ? parseInt(conversationId, 10) : undefined,
        },
      },
      DiaryResult: {
        path: 'diary-result',
        parse: {
          conversationId: (conversationId: string) => conversationId ? parseInt(conversationId, 10) : undefined,
        },
      },
      DiaryLoading: 'diary-loading',
      AlbumDetail: {
        path: 'album-detail/:conversationId',
        parse: {
          conversationId: (conversationId: string) => parseInt(conversationId, 10),
        },
      },
      TestScreen: 'test',
    },
  },
} : undefined;

/**
 * ConversationFlow 래퍼 컴포넌트
 * React Navigation Screen으로 사용하기 위해 route params를 props로 변환합니다.
 */
type ConversationFlowScreenProps = NativeStackScreenProps<RootStackParamList, 'ConversationFlow'>;

function ConversationFlowScreen({ route, navigation }: ConversationFlowScreenProps) {
  const { questionText, questionId, conversationId, userId } = route.params;
  
  const handleFlowComplete = (result: any) => {
    // 플로우 완료 시 처리 로직
    // 필요에 따라 다른 화면으로 네비게이션
  };
  
  const handleFlowError = (error: string) => {
    // 플로우 에러 시 처리 로직
    console.error('ConversationFlow 에러:', error);
    // 에러 화면으로 네비게이션하거나 알림 표시
  };
  
  return (
    <ConversationFlow
      questionText={questionText}
      questionId={questionId}
      conversationId={conversationId}
      userId={userId}
      onFlowComplete={handleFlowComplete}
      onFlowError={handleFlowError}
    />
  );
}

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
        tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.6)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 60,
          backgroundColor: 'white',
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.18)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.1,
          shadowRadius: 32,
          elevation: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: 60, marginTop: 18 }}>
              <Ionicons 
                name="ellipsis-horizontal" 
                size={28} 
                color={focused ? "#000000" : "#666666"} 
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Album"
        component={Album}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: 60, marginTop: 18 }}>
              <Ionicons 
                name="images-outline" 
                size={24} 
                color={focused ? "#000000" : "#666666"} 
              />
            </View>
          ),
          headerShown: false,
          header: () => null,
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPage}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: 60, marginTop: 18 }}>
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={focused ? "#000000" : "#666666"} 
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * 보호된 화면 컴포넌트 - 인증된 사용자만 접근 가능 (현재 비활성화)
 */
function ProtectedScreen({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isLoading && (!user || !user.token)) {
      navigation.navigate('Login' as any);
    }
  }, [user, isLoading, navigation]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (isLoading || !user || !user.token) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * 인증 상태에 따른 네비게이션 컴포넌트
 */
function AppNavigator() {
  const navigationRef = useRef<any>(null);
  const { user, isLoading } = useUser();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // 스토리지에서 사용자 정보를 직접 확인하여 초기 화면 결정
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        let userData: string | null = null;
        
        if (Platform.OS === 'web') {
          // 웹에서는 localStorage 사용
          userData = localStorage.getItem('user');
        } else {
          // React Native에서는 AsyncStorage 사용
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          userData = await AsyncStorage.getItem('user');
        }
        
        if (userData) {
          const user = JSON.parse(userData);
          
          // JWT 토큰이 있어야만 홈으로 이동 가능
          if (user.token) {
            // userType이 유효한 경우에만 홈으로 이동
            const hasValidUserType = user.userType && 
                                  user.userType !== 'null' && 
                                  user.userType !== '' && 
                                  (user.userType === UserType.SENIOR || user.userType === UserType.GUARDIAN);
            
            
            if (hasValidUserType) {
              if (user.userType === UserType.GUARDIAN) {
                setInitialRoute("GuardianMain");
              } else if (user.userType === UserType.SENIOR) {
                setInitialRoute("MainTabs");
              } else {
                setInitialRoute("Login");
              }
            } else {
              setInitialRoute("Login");
            }
          } else {
            setInitialRoute("Login");
          }
        } else {
          setInitialRoute("Login");
        }
      } catch (error) {
        console.error('초기 화면 확인 실패:', error);
        setInitialRoute("Login");
      }
    };

    checkInitialRoute();
  }, []);

  // 딥링크 처리
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      
      if (url.startsWith('dearmind://kakao-auth')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const token = urlParams.get('token');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('카카오 로그인 에러:', error);
          Alert.alert('로그인 실패', error);
          return;
        }
        
        if (token) {
          // UserRoleSelection 화면으로 직접 이동
          navigationRef.current?.navigate('UserRoleSelection' as any, { 
            token,
            fromDeepLink: true 
          });
        }
      }
    };

    // 앱이 실행 중일 때 딥링크 감지
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // 앱이 종료된 상태에서 딥링크로 실행된 경우
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // 초기 화면 결정
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (isLoading || initialRoute === null) {
      return "Login"; // 로딩 중이거나 초기 라우트가 결정되지 않은 경우
    }
    
    return initialRoute as keyof RootStackParamList;
  };

  // 로딩 중이거나 초기 라우트가 결정되지 않은 경우 로딩 화면 표시
  if (isLoading || initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator 
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false
        }}
      >
            {/* 로그인 화면 */}
            <Stack.Screen name="Login" component={Login} />
            
          
            
            {/* 사용자 역할 선택 화면 */}
            <Stack.Screen name="UserRoleSelection" component={UserRoleSelection} />
            
            
            
            {/* 보호자-시니어 연결 화면 (전화번호) */}
            <Stack.Screen name="GuardianConnection" component={GuardianConnection} />
            
            {/* 보호자-시니어 연결 결과 화면 */}
            <Stack.Screen name="GuardianConnectionResult" component={GuardianConnectionResult} />
            
            {/* 보호자-시니어 연결 테스트 화면 */}
            <Stack.Screen name="GuardianConnectionTest" component={GuardianConnectionTest} />
            
            {/* 보호자 메인 화면 */}
            <Stack.Screen name="GuardianMain" component={GuardianMain} />
            
            {/* 마이페이지 화면 */}
            <Stack.Screen name="MyPage" component={MyPage} />
            
            {/* 시니어 앨범 목록 화면 */}
            <Stack.Screen name="SeniorAlbumList" component={SeniorAlbumList} />
            
            {/* 카카오 시니어 연결 화면 */}
            <Stack.Screen name="KakaoConnection" component={KakaoConnection} />

            {/* 메인 탭 네비게이터 - 보호된 화면 */}
            <Stack.Screen name="MainTabs">
              {() => (
                <ProtectedScreen>
                  <MainTabs />
                </ProtectedScreen>
              )}
            </Stack.Screen>
            
            {/* 대화 플로우 화면 */}
            <Stack.Screen name="ConversationFlow" component={ConversationFlowScreen} />
            
            {/* 카메라 테스트 화면 */}
            <Stack.Screen name="CameraTest" component={CameraTest} />
            <Stack.Screen name="MicrophoneTest" component={MicrophoneTest} />
            
            {/* 통합 대화 화면 */}
            <Stack.Screen name="Conversation" component={Conversation} />
            
            {/* 알림 화면 */}
            <Stack.Screen name="Notification" component={Notification} />
            <Stack.Screen name="SeniorNotification" component={SeniorNotification} />
            
            {/* 채팅 화면 */}
            <Stack.Screen name="Chat" component={Chat} />
            
            {/* 일기 결과 화면 */}
            <Stack.Screen name="DiaryResult" component={DiaryResult} />
            
            {/* 일기 생성 로딩 화면 */}
            <Stack.Screen name="DiaryLoading" component={DiaryLoading} />
            
            {/* 대화 종료 로딩 화면 */}
            <Stack.Screen name="ConversationEndLoading" component={ConversationEndLoading} />
            
            {/* 앨범 상세 화면 */}
            <Stack.Screen name="AlbumDetail" component={AlbumDetail} />
            
            {/* 테스트 화면 */}
            <Stack.Screen name="TestScreen" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
  // 오류 메시지 숨기기
  useEffect(() => {
    LogBox.ignoreAllLogs(true);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <AccessibilityProvider>
        <GlobalAccessibilityWrapper>
          <UserProvider>
            <DiaryProvider>
              <ConversationProvider>
                <AppNavigator />
              </ConversationProvider>
            </DiaryProvider>
          </UserProvider>
        </GlobalAccessibilityWrapper>
      </AccessibilityProvider>
    </View>
  );
}
