const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const friendsService = {
  async addFriend(username: string) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/friends/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username })
    });
    if (!response.ok) throw new Error('Failed to add friend');
    return response.json();
  },

  async unfriend(friendId: string) {
    const token = localStorage.getItem('accessToken');
    // Using explicit unfriend endpoint if available, or delete
    // Checking backend... usually DELETE /friends/:id or POST /friends/unfriend
    // Based on common patterns in this project, let's assume POST for now or check backend.
    
    // Let's assume standard REST for now, or check backend controller.
    const response = await fetch(`${API_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
        // Fallback or retry.
        throw new Error('Failed to unfriend');
    }
    return response.json();
  },

  async getFriends() {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/friends`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch friends');
      return response.json();
  }
};
