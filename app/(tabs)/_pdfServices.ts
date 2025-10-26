/**
 * PDF Services
 * Handles all PDF-related API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config, buildApiUrl } from '@/constants/config';

// Type definitions
export interface PdfItem {
  id: string;
  createdAt: string;
  title: string;
  pdfUrl: string;
  imageUrl: string;
  userId: string;
  conversationId: string;
  messageId: string;
}

export interface PdfMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PdfResponse {
  success: boolean;
  message: string;
  data: {
    items: PdfItem[];
    meta: PdfMeta;
  };
}

/**
 * Fetch all PDFs with pagination
 */
export const getPdfs = async (page: number = 1, pageSize: number = 9): Promise<PdfResponse> => {
  try {
    // Get auth token
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }

    // Build URL with query parameters
    const url = buildApiUrl(`${Config.endpoints.chat.pdfs}?page=${page}&pageSize=${pageSize}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch PDFs: ${response.status}`);
    }

    const data: PdfResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch PDFs');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching PDFs');
  }
};

/**
 * Get a single PDF by ID
 */
export const getPdfById = async (id: string): Promise<PdfItem> => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }

    const url = buildApiUrl(`${Config.endpoints.chat.pdfs}/${id}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch PDF: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching PDF');
  }
};
