import { Profile, ProfileResponse, ProfileApiError } from '../../types/profile';
import { API_ENDPOINTS } from '../../config/api';
import apiClient from './apiClient';

class ProfileApiService {

  async getProfile(): Promise<Profile> {
    try {
      const response = await apiClient.get<ProfileResponse>(API_ENDPOINTS.profile);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    try {
      const response = await apiClient.put<ProfileResponse>(API_ENDPOINTS.updateProfile, profileData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async updateProfileImage(imageFile: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await apiClient.post<{ success: boolean; imageUrl: string }>(
        API_ENDPOINTS.updateProfileImage,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return { imageUrl: response.data.imageUrl };
    } catch (error) {
      console.error('Failed to update profile image:', error);
      throw error;
    }
  }
}

export const profileApiService = new ProfileApiService();
export default profileApiService;
