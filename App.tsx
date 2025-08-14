import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { DiaryProvider } from './contexts/DiaryContext';

import Login from './screens/Login';
import Home from './screens/Home';
import Album from './screens/Album';
import MyPage from './screens/MyPage';
import CameraTest from './screens/CameraTest';
import Notification from './screens/Notification';
import AIChat from './screens/AIChat';
import UserAnswer from './screens/UserAnswer';
import Chat from './screens/Chat';
import DiaryResult from './screens/DiaryResult';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CameraTest: { questionText: string };
  Notification: undefined;
  AIChat: { questionText: string };
  UserAnswer: { questionText: string };
  Chat: { chatHistory: Array<{ id: number; type: string; message: string; timestamp: string }> };
  DiaryResult: { diary: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

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

export default function App() {
  return (
    <DiaryProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CameraTest" component={CameraTest} />
          <Stack.Screen name="Notification" component={Notification} />
          <Stack.Screen name="AIChat" component={AIChat} />
          <Stack.Screen name="UserAnswer" component={UserAnswer} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="DiaryResult" component={DiaryResult} />
        </Stack.Navigator>
      </NavigationContainer>
    </DiaryProvider>
  );
}
