import axios, { AxiosError } from 'axios';

export interface ContentData {
  url: string;
  highlightedText: string;
  thumbnails: string[]; // Array of base64 encoded image strings
}

export interface ApiResponse {
  success: boolean;
  message: string;
  id?: string;
}

const API_ENDPOINT = 'https://api.example.com/save-content'; // Replace with actual API endpoint

export class ApiService {
  private static instance: ApiService;
  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async sendContentToApi(data: ContentData): Promise<ApiResponse> {
    try {
      const response = await axios.post<ApiResponse>(API_ENDPOINT, data, {
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers here
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending content to API:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        return {
          success: false,
          message: axiosError.response?.data?.message || axiosError.message,
        };
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Helper function to convert an image file to base64
  async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
