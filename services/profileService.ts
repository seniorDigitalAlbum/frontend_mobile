import { Profile } from '../types/profile';
import profileApiService from './api/profileApiService';

class ProfileService {
  async getProfile(): Promise<Profile> {
    try {
      return this.getDefaultProfile();
      // return await profileApiService.getProfile();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // 에러 발생 시 기본 프로필 반환
      return this.getDefaultProfile();
    }
  }

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    try {
      return await profileApiService.updateProfile(profileData);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async updateProfileImage(imageFile: File): Promise<{ imageUrl: string }> {
    try {
      return await profileApiService.updateProfileImage(imageFile);
    } catch (error) {
      console.error('Failed to update profile image:', error);
      throw error;
    }
  }

  // API 연결 전까지 사용할 기본 프로필
  private getDefaultProfile(): Profile {
    return {
      id: '1',
      name: '사용자',
      phone: '010-1234-5678',
      profileImage: undefined,
    };
  }
}

export const profileService = new ProfileService();
export default profileService; 