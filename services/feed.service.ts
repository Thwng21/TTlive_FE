const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const feedService = {
  async getAllPosts() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/feed`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async getUserPosts(userId: string) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/feed/user/${userId}?t=${new Date().getTime()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch posts error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch user posts: ${response.statusText}`);
    }
    return response.json();
  },

  async createPost(data: any) {
     const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
  },

  async likePost(postId: string) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/feed/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to like post');
    return response.json();
  }
};
