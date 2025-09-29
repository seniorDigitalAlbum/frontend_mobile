import { apiClient } from '../../config/api';

export interface RelationshipRequest {
  guardianId: number;
  seniorId: number;
}

export interface GuardianSeniorRelationship {
  id: number;
  guardianId: number;
  seniorId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  guardianName?: string;
  seniorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipResponse {
  success: boolean;
  message: string;
}

class RelationshipApiService {

  // 보호자-시니어 관계 요청 생성
  async createRelationship(guardianId: number, seniorId: number): Promise<RelationshipResponse> {
    try {
      return await apiClient.post<RelationshipResponse>(
        `/api/relationships/request?guardianId=${guardianId}&seniorId=${seniorId}`
      );
    } catch (error) {
      console.error('관계 요청 생성 실패:', error);
      throw error;
    }
  }

  // 시니어의 대기 중인 관계 조회
  async getPendingRelationships(seniorId: number): Promise<GuardianSeniorRelationship[]> {
    try {
      return await apiClient.get<GuardianSeniorRelationship[]>(
        `/api/relationships/senior/${seniorId}/pending`
      );
    } catch (error) {
      console.error('대기 중인 관계 조회 실패:', error);
      throw error;
    }
  }

  // 관계 승인
  async approveRelationship(relationshipId: number, seniorId: number): Promise<RelationshipResponse> {
    try {
      return await apiClient.put<RelationshipResponse>(
        `/api/relationships/${relationshipId}/approve?seniorId=${seniorId}`
      );
    } catch (error) {
      console.error('관계 승인 실패:', error);
      throw error;
    }
  }

  // 관계 거부
  async rejectRelationship(relationshipId: number): Promise<RelationshipResponse> {
    try {
      return await apiClient.put<RelationshipResponse>(
        `/api/relationships/${relationshipId}/reject`
      );
    } catch (error) {
      console.error('관계 거부 실패:', error);
      throw error;
    }
  }

  // 보호자의 승인된 관계 조회
  async getApprovedRelationships(guardianId: number): Promise<GuardianSeniorRelationship[]> {
    try {
      return await apiClient.get<GuardianSeniorRelationship[]>(
        `/api/relationships/guardian/${guardianId}/approved`
      );
    } catch (error) {
      console.error('승인된 관계 조회 실패:', error);
      throw error;
    }
  }
}

export default new RelationshipApiService();
