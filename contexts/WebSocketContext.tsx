import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import webSocketService, { WebSocketNotification, WebSocketRelationshipRequest } from '../services/websocketService';
import { useUser } from './UserContext';

interface WebSocketContextType {
  isConnected: boolean;
  notifications: WebSocketNotification[];
  unreadCount: number;
  relationshipRequests: WebSocketRelationshipRequest[];
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  markNotificationAsRead: (notificationId: number) => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [relationshipRequests, setRelationshipRequests] = useState<WebSocketRelationshipRequest[]>([]);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter(n => !n.isRead).length;

  /**
   * 웹소켓 연결
   */
  const connectWebSocket = async (): Promise<void> => {
    if (!user?.token) {
      console.log('토큰이 없어서 웹소켓 연결을 건너뜀');
      return;
    }

    try {
      await webSocketService.connect(user.token);
      setIsConnected(true);
      console.log('웹소켓 연결 성공');
    } catch (error) {
      console.error('웹소켓 연결 실패:', error);
      setIsConnected(false);
    }
  };

  /**
   * 웹소켓 연결 해제
   */
  const disconnectWebSocket = (): void => {
    webSocketService.disconnect();
    setIsConnected(false);
    console.log('웹소켓 연결 해제');
  };

  /**
   * 알림을 읽음으로 표시
   */
  const markNotificationAsRead = (notificationId: number): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  /**
   * 모든 알림 제거
   */
  const clearNotifications = (): void => {
    setNotifications([]);
  };

  /**
   * 앱 상태 변경 처리
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('앱 상태 변경:', appState, '->', nextAppState);
      
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // 앱이 포그라운드로 돌아왔을 때 웹소켓 재연결
        if (user?.token && !isConnected) {
          connectWebSocket();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // 앱이 백그라운드로 갈 때는 연결 유지 (선택사항)
        console.log('앱이 백그라운드로 이동');
      }
      
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, user?.token, isConnected]);

  /**
   * 사용자 로그인 시 웹소켓 연결
   */
  useEffect(() => {
    if (user?.token) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user?.token]);

  /**
   * 웹소켓 이벤트 리스너 설정
   */
  useEffect(() => {
    if (!isConnected) return;

    // 알림 수신 이벤트
    const handleNotificationReceived = (notification: WebSocketNotification) => {
      console.log('새 알림 수신:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // 알림 토스트 표시 (선택사항)
      // Toast.show({
      //   type: 'info',
      //   text1: notification.title,
      //   text2: notification.content,
      // });
    };

    // 관계 요청 수신 이벤트
    const handleRelationshipRequest = (request: WebSocketRelationshipRequest) => {
      console.log('관계 요청 수신:', request);
      setRelationshipRequests(prev => [request, ...prev]);
      
      // 시니어인 경우 알림으로도 추가
      if (user?.userType === 'SENIOR') {
        const notification: WebSocketNotification = {
          id: request.id,
          type: 'GUARDIAN_REQUEST',
          title: '시니어 연결 요청',
          content: `${request.guardianName || '보호자'}님이 연결을 요청했습니다`,
          userId: request.seniorId,
          senderId: request.guardianId,
          isRead: false,
          relatedId: request.id,
          createdAt: request.createdAt
        };
        handleNotificationReceived(notification);
      }
    };

    // 관계 승인 수신 이벤트
    const handleRelationshipApproved = (request: WebSocketRelationshipRequest) => {
      console.log('관계 승인 수신:', request);
      setRelationshipRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'APPROVED' }
            : req
        )
      );
      
      // 보호자인 경우 알림으로도 추가
      if (user?.userType === 'GUARDIAN') {
        const notification: WebSocketNotification = {
          id: request.id,
          type: 'GUARDIAN_REQUEST_APPROVED',
          title: '연결 승인됨',
          content: `${request.seniorName || '시니어'}님이 연결을 승인했습니다`,
          userId: request.guardianId,
          senderId: request.seniorId,
          isRead: false,
          relatedId: request.id,
          createdAt: request.createdAt
        };
        handleNotificationReceived(notification);
      }
    };

    // 관계 거부 수신 이벤트
    const handleRelationshipRejected = (request: WebSocketRelationshipRequest) => {
      console.log('관계 거부 수신:', request);
      setRelationshipRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'REJECTED' }
            : req
        )
      );
    };

    // 연결 상태 변경 이벤트
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    // 에러 이벤트
    const handleError = (error: any) => {
      console.error('웹소켓 에러:', error);
    };

    // 이벤트 리스너 등록
    webSocketService.on('notification_received', handleNotificationReceived);
    webSocketService.on('relationship_request', handleRelationshipRequest);
    webSocketService.on('relationship_approved', handleRelationshipApproved);
    webSocketService.on('relationship_rejected', handleRelationshipRejected);
    webSocketService.on('error', handleError);

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      webSocketService.off('notification_received', handleNotificationReceived);
      webSocketService.off('relationship_request', handleRelationshipRequest);
      webSocketService.off('relationship_approved', handleRelationshipApproved);
      webSocketService.off('relationship_rejected', handleRelationshipRejected);
      webSocketService.off('error', handleError);
    };
  }, [isConnected, user?.userType, user?.id]);

  const contextValue: WebSocketContextType = {
    isConnected,
    notifications,
    unreadCount,
    relationshipRequests,
    connectWebSocket,
    disconnectWebSocket,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * WebSocket Context 사용을 위한 훅
 */
export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export default WebSocketContext;
