import { apiClient } from '../config/api';
import { GuardianSeniorRelationship } from './api/relationshipApiService';

export interface SeniorInfo {
  id: number;
  name: string;
  profileImage?: string;
  kakaoId?: string;
  kakaoNickname?: string;
  kakaoProfileImage?: string;
  phoneNumber?: string;
  connectionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ConnectResponse {
  success: boolean;
  message: string;
}

class GuardianService {
  /**
   * 시니어와 연결 (관계 요청 생성)
   */
  async connectSenior(guardianId: number, seniorId: number): Promise<ConnectResponse> {
    try {
      // apiClient 사용하여 관계 요청 생성
      await apiClient.post(`/api/relationships/request?guardianId=${guardianId}&seniorId=${seniorId}`);
      
      return {
        success: true,
        message: '연결 요청이 완료되었습니다.'
      };
    } catch (error) {
      console.error('시니어 연결 실패:', error);
      
      // 백엔드 에러 메시지를 그대로 전달
      if (error instanceof Error) {
        throw error; // 에러를 다시 throw하여 호출하는 곳에서 처리할 수 있도록 함
      }
      
      return {
        success: false,
        message: '연결에 실패했습니다.'
      };
    }
  }

  /**
   * 연결된 시니어 목록 조회 (승인된 관계만)
   */
  async getConnectedSeniors(guardianId: number): Promise<SeniorInfo[]> {
    try {
      // 승인 여부와 상관없이 모든 관계 조회 (PENDING, APPROVED 모두 포함)
      const relationships = await apiClient.get<GuardianSeniorRelationship[]>(`/api/relationships/guardian/${guardianId}`);
      
      // 관계 정보를 SeniorInfo 형태로 변환
      const seniors: SeniorInfo[] = relationships.map((rel) => ({
        id: rel.senior.id,
        name: rel.senior.nickname || '시니어',
        phoneNumber: '',
        profileImage: rel.senior.profileImageUrl || '',
        kakaoId: '',
        connectionStatus: rel.status as const // 실제 상태 반영 (PENDING, APPROVED, REJECTED)
      }));
      
      return seniors;
    } catch (error) {
      console.error('연결된 시니어 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 대기 중인 시니어 목록 조회 (PENDING 상태)
   */
  async getPendingSeniors(guardianId: number): Promise<SeniorInfo[]> {
    try {
      // 모든 관계를 조회한 후 PENDING 상태만 필터링
      const relationships = await apiClient.get<GuardianSeniorRelationship[]>(`/api/relationships/guardian/${guardianId}`);
      
      // PENDING 상태의 관계만 필터링
      const pendingRelationships = relationships.filter(rel => rel.status === 'PENDING');
      
      // 관계 정보를 SeniorInfo 형태로 변환
      const seniors: SeniorInfo[] = pendingRelationships.map((rel) => ({
        id: rel.seniorId,
        name: rel.seniorName || '시니어',
        phoneNumber: '',
        profileImage: '',
        kakaoId: '',
        connectionStatus: 'PENDING' as const
      }));
      
      return seniors;
    } catch (error) {
      console.error('대기 중인 시니어 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 모든 시니어 목록 조회 (모든 상태)
   */
  async getAllSeniors(guardianId: number): Promise<SeniorInfo[]> {
    try {
      // 모든 관계를 한 번에 조회
      const relationships = await apiClient.get<GuardianSeniorRelationship[]>(`/api/relationships/guardian/${guardianId}`);
      
      // 관계 정보를 SeniorInfo 형태로 변환
      const seniors: SeniorInfo[] = relationships.map((rel) => ({
        id: rel.seniorId,
        name: rel.seniorName || '시니어',
        phoneNumber: '',
        profileImage: '',
        kakaoId: '',
        connectionStatus: rel.status as 'PENDING' | 'APPROVED' | 'REJECTED'
      }));
      
      return seniors;
    } catch (error) {
      console.error('시니어 목록 조회 실패:', error);
      return [];
    }
  }
}

export default new GuardianService();
