import { Profile, ProfileResponse, ProfileApiError } from '../../types/profile';
import { getApiConfig, API_ENDPOINTS } from '../../config/api';

const apiConfig = getApiConfig();

class ProfileApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // 인증이 필요한 경우
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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
