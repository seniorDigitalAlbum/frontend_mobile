import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import * as Linking from 'expo-linking';

import { DiaryProvider } from './contexts/DiaryContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { UserProvider, useUser, UserType } from './contexts/UserContext';
import GlobalAccessibilityWrapper from './components/GlobalAccessibilityWrapper';
import './global.css';

import Login from './screens/Login';
import SignUp from './screens/SignUp';
import UserRoleSelection from './screens/UserRoleSelection';
import SignUp2 from './screens/SignUp2';
import GuardianConnection from './screens/GuardianConnection';
import GuardianMain from './screens/GuardianMain';
import SeniorAlbumList from './screens/SeniorAlbumList';
import KakaoConnection from './screens/KakaoConnection';
import SeniorInfoConfirm from './screens/SeniorInfoConfirm';
import Home from './screens/Home';
import Album from './screens/Album';
import MyPage from './screens/MyPage';
import CameraTest from './screens/CameraTest';
import MicrophoneTest from './screens/MicrophoneTest';
import Notification from './screens/Notification';
import Conversation from './screens/Conversation';
import Chat from './screens/Chat';
import DiaryResult from './screens/DiaryResult';
import DiaryLoading from './screens/DiaryLoading';
import ConversationEndLoading from './screens/ConversationEndLoading';
import ConversationFlow from './components/ConversationFlow';
import AlbumDetail from './screens/AlbumDetail';
import TestScreen from './screens/TestScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  UserRoleSelection: {
    token: string;
    nickname: string;
    error?: string;
  };
  SignUp2: {
    userType: 'SENIOR' | 'GUARDIAN';
    phoneNumber: string;
    isKakao?: boolean;
    kakaoName?: string;
    kakaoGender?: string;
  };
  GuardianConnection: undefined;
  GuardianMain: undefined;
  SeniorAlbumList: {
    seniorId: number;
    seniorName: string;
  };
  KakaoConnection: {
    guardianPhoneNumber: string;
  };
  SeniorInfoConfirm: {
    seniorInfo: any;
    guardianPhoneNumber: string;
  };
  MainTabs: undefined;
  CameraTest: {
    questionText: string;
    questionId?: number;
    conversationId?: number;
    cameraSessionId?: string;
    microphoneSessionId?: string;
  };
  MicrophoneTest: {
    questionText: string;
    questionId?: number;
    conversationId?: number;
    cameraSessionId?: string;
    microphoneSessionId?: string;
  };
  ConversationFlow: {
    questionText: string;
    questionId: number;
    conversationId: string;
    userId: string;
  };
  Notification: undefined;
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
  };
  TestScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const prefix = Linking.createURL('/');
const linking = {
  prefixes: [
    prefix,
    'http://localhost:8081',
    'https://seniordigitalalbum.github.io'
  ],
  config: {
    screens: {
      UserRoleSelection: 'UserRoleSelection',
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
      SignUp2: 'signup2',
      GuardianConnection: 'guardian-connection',
    },
  },
};

function ConversationFlowScreen({ route }: NativeStackScreenProps<RootStackParamList, 'ConversationFlow'>) {
    const { questionText, questionId, conversationId, userId } = route.params;
    return <ConversationFlow questionText={questionText} questionId={questionId} conversationId={conversationId} userId={userId} onFlowComplete={() => {}} onFlowError={() => {}} />;
}

function MainTabs() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#000', tabBarStyle: { position: 'absolute', bottom: 20, left: 20, right: 20, height: 60, backgroundColor: 'white', borderTopWidth: 0, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 32, elevation: 8 }, tabBarShowLabel: false }}>
            <Tab.Screen name="Home" component={Home} options={{ tabBarIcon: ({ focused }) => (<View style={{ justifyContent: 'center', alignItems: 'center', height: 60, marginTop: 18 }}><Ionicons name="ellipsis-horizontal" size={28} color={focused ? "#000000" : "#666666"} /></View>) }} />
            <Tab.Screen name="Album" component={Album} options={{ tabBarIcon: ({ focused }) => (<View style={{ justifyContent: 'center', alignItems: 'center', height: 60, marginTop: 18 }}><Ionicons name="images-outline" size={24} color={focused ? "#000000" : "#666666"} /></View>) }} />
            <Tab.Screen name="MyPage" component={MyPage} options={{ tabBarIcon: ({ focused }) => (<View style={{ justifyContent: 'center', alignItems: 'center', height: 60, marginTop: 18 }}><Ionicons name="person-outline" size={24} color={focused ? "#000000" : "#666666"} /></View>) }} />
        </Tab.Navigator>
    );
}

function AppNavigator() {
  const { user, isLoading } = useUser();
  const navigationRef = useRef<any>(null);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking} fallback={<Text>Loading...</Text>}>
      <Stack.Navigator
        initialRouteName={user ? (user.userType === UserType.GUARDIAN ? "GuardianMain" : "MainTabs") : "Login"}
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="UserRoleSelection" component={UserRoleSelection} />
        <Stack.Screen name="SignUp2" component={SignUp2} />
        <Stack.Screen name="GuardianConnection" component={GuardianConnection} />
        <Stack.Screen name="GuardianMain" component={GuardianMain} />
        <Stack.Screen name="SeniorAlbumList" component={SeniorAlbumList} />
        <Stack.Screen name="KakaoConnection" component={KakaoConnection} />
        <Stack.Screen name="SeniorInfoConfirm" component={SeniorInfoConfirm} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ConversationFlow" component={ConversationFlowScreen} />
        <Stack.Screen name="CameraTest" component={CameraTest} />
        <Stack.Screen name="MicrophoneTest" component={MicrophoneTest} />
        <Stack.Screen name="Conversation" component={Conversation} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="DiaryResult" component={DiaryResult} />
        <Stack.Screen name="DiaryLoading" component={DiaryLoading} />
        <Stack.Screen name="ConversationEndLoading" component={ConversationEndLoading} />
        <Stack.Screen name="AlbumDetail" component={AlbumDetail} />
        <Stack.Screen name="TestScreen" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
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
  );
}