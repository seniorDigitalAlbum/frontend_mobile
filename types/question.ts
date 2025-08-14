export interface Question {
  id: number;
  text: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionResponse {
  success: boolean;
  data: Question[];
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
} 