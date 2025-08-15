// API服务配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.tiktokrepostremover.com';

export interface WaitlistResponse {
  success: boolean;
  message: string;
  subscription_id?: number;
}

export interface WaitlistRequest {
  email: string;
}

/**
 * 加入WaitList
 */
export const subscribeToWaitlist = async (email: string): Promise<WaitlistResponse> => {
  const response = await fetch(`${API_BASE_URL}/waitlist/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * 取消WaitList订阅
 */
export const unsubscribeFromWaitlist = async (email: string): Promise<WaitlistResponse> => {
  const response = await fetch(`${API_BASE_URL}/waitlist/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
