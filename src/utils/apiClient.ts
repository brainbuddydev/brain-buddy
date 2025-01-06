export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
    if (!baseUrl) {
      throw new Error('Base API URL is not defined in environment variables');
    }
  
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${errorMessage || 'Unknown error'}`
      );
    }
  
    return response.json();
  }
  