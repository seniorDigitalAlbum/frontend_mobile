export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
  message?: string;
}

export interface ProfileApiError {
  message: string;
  status?: number;
} 