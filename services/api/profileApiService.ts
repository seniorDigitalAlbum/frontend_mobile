import { Profile, ProfileResponse, ProfileApiError } from '../../types/profile';
import { API_ENDPOINTS, apiClient } from '../../config/api';

class ProfileApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      console.log('🔄 ProfileApiService.request 호출:', endpoint);
      const result = await apiClient.request<T>(endpoint, options);
      console.log('✅ ProfileApiService.request 성공:', endpoint);
      return result;
    } catch (error) {
      console.error('❌ Profile API request failed:', error);
      throw error;
    }
  }

  async getProfile(): Promise<Profile> {
    try {
      const response = await this.request<ProfileResponse>(API_ENDPOINTS.profile);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    try {
      const response = await this.request<ProfileResponse>(API_ENDPOINTS.updateProfile, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async updateProfileImage(imageFile: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await this.request<{ success: boolean; imageUrl: string }>(
        API_ENDPOINTS.updateProfileImage,
        {
          method: 'POST',
          body: formData,
          headers: {
            // FormData를 사용할 때는 Content-Type을 설정하지 않음
          },
        }
      );
      return { imageUrl: response.imageUrl };
    } catch (error) {
      console.error('Failed to update profile image:', error);
      throw error;
    }
  }
}

export const profileApiService = new ProfileApiService();
export default profileApiService;
