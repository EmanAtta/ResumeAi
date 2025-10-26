import { ApiEndpoints } from "@/utils/ApiEndpoints";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Chat {
  id: string;
  title?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'model';
  createdAt: string;
  conversationId: string;
  pdfUrl?: string | null;
}

export interface AIResponse {
  isGenerated: boolean;
  message: string;
  htmlCode: string | null;
  pdfUrl: string | null;
  code?: string | null;
}

export interface ChatResponse {
  success: boolean;
  data?: Chat[];
  conversations?: Chat[];
  error?: string;
  message?: string;
}

export interface MessagesResponse {
  success: boolean;
  data?: Chat;
  conversation?: Chat;
  error?: string;
  message?: string;
}

export interface CreateChatPayload {
  message: string;
  conversationId?: string;
}

export interface SendMessagePayload {
  message: string;
  conversationId: string;
}

// Helper function to parse model's JSON response or AI response
const parseModelContent = (content: string | AIResponse): string => {
  // If it's already an object (AIResponse), extract the message
  if (typeof content === 'object' && content !== null) {
    return content.message || '';
  }

  // If it's a string, try to parse it
  try {
    // Check if content is wrapped in ```json code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return parsed.message || parsed.content || content;
    }

    // Try to parse directly as JSON
    const parsed = JSON.parse(content);
    return parsed.message || parsed.content || content;
  } catch {
    // If not JSON, return as is
    return content;
  }
};

// Helper function to process messages and parse model responses
const processMessages = (messages: Message[]): Message[] => {
  return messages.map(msg => ({
    ...msg,
    content: msg.role === 'model' ? parseModelContent(msg.content) : msg.content
  }));
};

// Get auth token from storage
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Get all chats
export const getAllChats = async (): Promise<ChatResponse> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(ApiEndpoints.chat.getAll, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response. Please check if the backend is running.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch chats');
    }

    // Handle both data and conversations response formats
    return {
      success: data.success !== false,
      data: data.data || data.conversations || [],
      message: data.message,
    };
  } catch (error: any) {
    if (error.message.includes('JSON')) {
      throw new Error('Server error: Please ensure the backend is running at ' + ApiEndpoints.chat.getAll);
    }
    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to server.');
    }
    throw error;
  }
};

// Get chat messages by ID
export const getChatById = async (id: string): Promise<MessagesResponse> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(ApiEndpoints.chat.getById(id), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response. Please check if the backend is running.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch messages');
    }

    // Handle both data and conversation response formats
    const conversationData = data.data || data.conversation;

    // Process messages if they exist (could be an array directly or inside conversation object)
    let processedData = conversationData;
    if (Array.isArray(conversationData)) {
      // If data is array of messages, process them
      processedData = {
        messages: processMessages(conversationData)
      };
    } else if (conversationData?.messages) {
      // If data has messages property, process them
      processedData = {
        ...conversationData,
        messages: processMessages(conversationData.messages)
      };
    }

    return {
      success: data.success !== false,
      data: processedData,
      message: data.message,
    };
  } catch (error: any) {
    if (error.message.includes('JSON')) {
      throw new Error('Server error: Please ensure the backend is running.');
    }
    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to server.');
    }
    throw error;
  }
};

// Create new chat (first message)
export const createChat = async (payload: CreateChatPayload): Promise<{ success: boolean; data?: any; conversation?: any; error?: string; message?: string }> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(ApiEndpoints.chat.sendMessage, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response.');
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'Failed to create chat');
    }

    // Handle the response - API returns { success, message, data: AIResponse }
    // We need to get the conversation ID and handle the AI response
    const aiResponse = responseData.data;

    // After creating a chat, we need to fetch all chats to get the new conversation ID
    // Since the API doesn't return the conversation ID directly in this response
    // We'll return the response and let the hook handle fetching the conversation list

    return {
      success: responseData.success !== false,
      data: aiResponse,
      message: responseData.message,
    };
  } catch (error: any) {
    throw error;
  }
};

// Send message to existing chat
export const sendMessage = async (chatId: string, payload: SendMessagePayload): Promise<MessagesResponse> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }

    // Use the main chat endpoint with conversationId in body
    const response = await fetch(ApiEndpoints.chat.sendMessage, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: payload.message,
        conversationId: chatId,
      }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Expected JSON response.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send message');
    }

    // Process messages in response
    const conversationData = data.data || data.conversation;
    let processedData = conversationData;
    if (conversationData?.messages) {
      processedData = {
        ...conversationData,
        messages: processMessages(conversationData.messages)
      };
    }

    return {
      success: data.success !== false,
      data: processedData,
      message: data.message,
    };
  } catch (error: any) {
    throw error;
  }
};
