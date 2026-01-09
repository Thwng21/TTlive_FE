const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const usersService = {
  async getUserByUsername(username: string) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  }
};
