import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

export interface WebSocketNotification {
  id: number;
  type: string;
  title: string;
  content: string;
  userId: number;
  senderId?: number;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

export interface WebSocketRelationshipRequest {
  id: number;
  guardianId: number;
  seniorId: number;
  guardianName?: string;
  seniorName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.eventListeners = new Map();
  }

  /**
   * 웹소켓 연결
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl();
        console.log('🔌 웹소켓 연결 시도:', wsUrl);

        this.socket = io(wsUrl, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
        });

        // 연결 성공
        this.socket.on('connect', () => {
          console.log('✅ 웹소켓 연결 성공');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        // 연결 실패
        this.socket.on('connect_error', (error) => {
          console.error('❌ 웹소켓 연결 실패:', error);
          this.isConnected = false;
          reject(error);
        });

        // 연결 해제
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 웹소켓 연결 해제:', reason);
          this.isConnected = false;
          
          // 자동 재연결 시도
          if (reason === 'io server disconnect') {
            this.handleReconnect();
          }
        });

        // 인증 에러
        this.socket.on('auth_error', (error) => {
          console.error('🔐 웹소켓 인증 실패:', error);
          this.disconnect();
          reject(error);
        });

        // 기본 이벤트 리스너 등록
        this.setupDefaultEventListeners();

      } catch (error) {
        console.error('❌ 웹소켓 초기화 실패:', error);
        reject(error);
      }
    });
  }

  /**
   * 웹소켓 URL 생성
   */
  private getWebSocketUrl(): string {
    if (Platform.OS === 'web') {
      // 웹에서는 HTTP/HTTPS 기반으로 WebSocket URL 생성
      const baseUrl = API_BASE_URL.replace(/^http/, 'ws');
      return baseUrl;
    } else {
      // 네이티브에서는 개발 서버 IP 사용
      const baseUrl = API_BASE_URL.replace(/^http/, 'ws');
      return baseUrl;
    }
  }

  /**
   * 기본 이벤트 리스너 설정
   */
  private setupDefaultEventListeners(): void {
    if (!this.socket) return;

    // 알림 관련 이벤트
    this.socket.on('notification_received', (notification: WebSocketNotification) => {
      console.log('🔔 알림 수신:', notification);
      this.emit('notification_received', notification);
    });

    // 관계 요청 관련 이벤트
    this.socket.on('relationship_request', (request: WebSocketRelationshipRequest) => {
      console.log('👥 관계 요청 수신:', request);
      this.emit('relationship_request', request);
    });

    this.socket.on('relationship_approved', (request: WebSocketRelationshipRequest) => {
      console.log('✅ 관계 승인 수신:', request);
      this.emit('relationship_approved', request);
    });

    this.socket.on('relationship_rejected', (request: WebSocketRelationshipRequest) => {
      console.log('❌ 관계 거부 수신:', request);
      this.emit('relationship_rejected', request);
    });

    // 대화 관련 이벤트
    this.socket.on('conversation_updated', (data: any) => {
      console.log('💬 대화 업데이트:', data);
      this.emit('conversation_updated', data);
    });

    // 에러 처리
    this.socket.on('error', (error: any) => {
      console.error('🚨 웹소켓 에러:', error);
      this.emit('error', error);
    });
  }

  /**
   * 자동 재연결 처리
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔄 최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  /**
   * 웹소켓 연결 해제
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 웹소켓 연결 해제');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * 연결 상태 확인
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 이벤트 발생
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`이벤트 리스너 실행 중 오류 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 서버로 이벤트 전송
   */
  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('웹소켓이 연결되지 않음:', event, data);
    }
  }

  /**
   * 특정 사용자에게 이벤트 전송
   */
  emitToUser(userId: number, event: string, data?: any): void {
    this.emit(event, {
      userId,
      ...data
    });
  }
}

// 싱글톤 인스턴스 생성 및 export
export const webSocketService = new WebSocketService();
export default webSocketService;
