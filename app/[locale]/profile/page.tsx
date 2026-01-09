'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/auth.service';
import { feedService } from '@/services/feed.service';

interface UserProfile {
    _id?: string;
    id?: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    friends: string[];
    gender?: 'male' | 'female' | 'other';
    address?: {
        city: string;
        ward: string;
    };
}

export default function UserProfilePage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'saved'>('all');
  
  // Edit Mode State - Using Modal now
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
      displayName: '',
      bio: '',
      gender: 'other',
      city: '',
      ward: ''
  });

  // Create Post State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState<string>(''); 

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
      try {
          setLoading(true);
          const profile = await authService.getProfile();
          if (profile) {
              setUserData(profile);
              // Ensure we have a valid ID for fetching posts
              const userId = profile._id || profile.id;
              if (userId) {
                  loadPosts(userId);
              } else {
                  console.error("Profile loaded but no ID found", profile);
              }
          }
      } catch (error) {
          console.error("Failed to load profile", error);
          // Don't show toast on 401/403 to avoid spamming if not logged in
      } finally {
          setLoading(false);
      }
  };

  const loadPosts = async (userId: string) => {
      try {
          const userPosts = await feedService.getUserPosts(userId);
          if (Array.isArray(userPosts)) {
            setPosts(userPosts);
          } else {
              setPosts([]);
          }
      } catch (e) {
          console.error("Failed to load posts", e);
          // Silent fail for now, UI will just show empty
      }
  };

  const setUserData = (data: any) => {
      setUser(data);
      setEditForm({
          displayName: data.displayName || '',
          bio: data.bio || '',
          gender: data.gender || 'other',
          city: data.address?.city || '',
          ward: data.address?.ward || ''
      });
  };

  const handleUpdate = async () => {
    try {
        setIsUpdating(true);
        const payload = {
            displayName: editForm.displayName,
            bio: editForm.bio,
            gender: editForm.gender,
            address: {
                city: editForm.city,
                ward: editForm.ward
            }
        };

        const updated = await authService.updateProfile(payload);
        setUser(updated); // Update local state
        // Keep access token, but update user info in localStorage if needed (usually handled by auth context)
        // localStorage.setItem('user', JSON.stringify(updated)); 
        setIsEditModalOpen(false);
        showToast("Success", "Profile updated successfully!", "success");
    } catch (e) {
        console.error(e);
        showToast("Error", "Failed to update profile", "error");
    } finally {
        setIsUpdating(false);
    }
  };

  const handleCreatePost = async () => {
      if (!newPostCaption.trim() && !newPostImage.trim()) {
          showToast("Error", "Please add a caption or image", "error");
          return;
      }
      try {
          // Optimistic UI Update: Create placeholder or wait for response
          const newPostData = {
              caption: newPostCaption,
              imageUrl: newPostImage
          };
          
          const createdPost = await feedService.createPost(newPostData);
          
          showToast("Success", "Post created!", "success");
          setNewPostCaption('');
          setNewPostImage('');
          setIsCreatingPost(false);
          
          // Debugging
          console.log("Post created:", createdPost);
          console.log("Current User:", user);

          // Immediately update list with the new post returned from backend
          if (createdPost) {
              // Ensure user object is populated if backend returned ID only
              if (createdPost.user && typeof createdPost.user === 'string' && user) {
                  createdPost.user = {
                      _id: user._id || user.id,
                      username: user.username,
                      displayName: user.displayName,
                      avatarUrl: user.avatarUrl
                  };
              }
               setPosts(prevPosts => [createdPost, ...prevPosts]);
          } else {
             // Fallback to fetch
             if (user && (user._id || user.id)) {
                loadPosts(user._id || user.id || '');
             }
          }
      } catch (e) {
          console.error(e);
          showToast("Error", "Failed to create post", "error");
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white bg-[#131f1f]">Loading...</div>;

  return (
    <div className="bg-[#f6f8f8] dark:bg-[#131f1f] font-sans text-white h-screen overflow-hidden flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-[340px] lg:w-[380px] xl:w-[420px] h-auto md:h-full bg-[#1E1E1E] flex flex-col p-6 lg:p-10 overflow-y-auto border-b md:border-b-0 md:border-r border-white/5 shadow-2xl z-20 shrink-0 relative">
            
            {/* Profile Identity Block */}
            <div className="flex flex-col gap-6 mb-8">
                {/* Avatar */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg self-start group cursor-pointer border-4 border-[#1E1E1E]">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                        src={user?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + (user?.username || 'user')} 
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{user?.displayName || user?.username}</h1>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4DC98A] shadow-[0_0_10px_rgba(77,201,138,0.5)] animate-pulse" title="Online"></div>
                    </div>
                    <p className="text-[#CBD2D9] text-sm md:text-base font-normal leading-relaxed max-w-[90%]">
                        {user?.bio || "No bio yet."}
                    </p>
                    {user?.address?.city && (
                        <div className="flex items-center gap-2 text-[#7F8C95] text-xs mt-1">
                             <span className="material-symbols-outlined text-[14px]">location_on</span>
                             <span>{user.address.ward ? `${user.address.ward}, ` : ''}{user.address.city}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-2">
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-xl tracking-tight">{posts?.length || 0}</span>
                        <span className="text-[#7F8C95] text-xs uppercase tracking-wider font-medium">Moments</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-xl tracking-tight">{user?.friends?.length || 0}</span>
                        <span className="text-[#7F8C95] text-xs uppercase tracking-wider font-medium">Connections</span>
                    </div>
                </div>

                {/* Edit Profile Button */}
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="group relative w-full mt-2 py-3 px-6 rounded-lg border border-[#F065AB] text-[#F065AB] font-semibold text-sm transition-all duration-300 hover:bg-[#F065AB] hover:text-white flex items-center justify-center gap-2 overflow-hidden"
                >
                    <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    <span>Edit Profile</span>
                </button>
            </div>

            {/* Spacer */}
            <div className="hidden md:flex flex-1"></div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5 mt-8 md:mt-0">
                <Link href="/" className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-[#CBD2D9] hover:bg-white/5 hover:text-white transition-all group">
                    <span className="material-symbols-outlined text-[#7F8C95] group-hover:text-white transition-colors">home</span>
                    <span className="font-medium text-sm md:text-base">Home</span>
                </Link>
                 <Link href="/stranger" className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-[#CBD2D9] hover:bg-white/5 hover:text-white transition-all group">
                    <span className="material-symbols-outlined text-[#7F8C95] group-hover:text-white transition-colors">chat_bubble</span>
                    <span className="font-medium text-sm md:text-base">Chat</span>
                </Link>
                <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg bg-[#248f8f]/10 text-[#248f8f] transition-all cursor-default">
                    <span className="material-symbols-outlined icon-filled">person</span>
                    <span className="font-medium text-sm md:text-base">Profile</span>
                </div>
            </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#141414] h-full overflow-y-auto relative scroll-smooth custom-scrollbar">
            <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-14">
                
                {/* Sticky Header */}
                <div className="sticky top-0 z-30 bg-[#141414]/95 backdrop-blur-md pt-2 pb-6 mb-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex gap-8">
                         <button 
                            onClick={() => setActiveTab('all')}
                            className={`relative font-bold text-sm tracking-wide pb-3 transition-colors ${activeTab === 'all' ? 'text-white' : 'text-[#7F8C95] hover:text-[#CBD2D9]'}`}
                        >
                            All Moments
                            {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#248f8f] rounded-t-full"></span>}
                        </button>
                    </div>
                    
                    {!isCreatingPost && (
                        <button 
                            onClick={() => setIsCreatingPost(true)}
                            className="p-2 px-4 rounded-full bg-[#248f8f] hover:bg-[#1e7a7a] text-white transition-colors flex items-center gap-2 text-sm font-bold"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Create
                        </button>
                    )}
                </div>

                {/* Create Post Form */}
                {isCreatingPost && (
                    <div className="mb-8 p-6 bg-[#1E1E1E] rounded-xl animate-fade-in border border-white/5 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Moment</h3>
                        <textarea 
                            className="w-full bg-[#141414] text-white p-4 rounded-lg border border-white/10 mb-4 focus:outline-none focus:border-[#248f8f] resize-none"
                            placeholder="What's happening?"
                            rows={3}
                            value={newPostCaption}
                            onChange={e => setNewPostCaption(e.target.value)}
                        />
                        <div className="relative mb-4">
                            <input 
                                className="w-full bg-[#141414] text-white p-3 pl-10 rounded-lg border border-white/10 focus:outline-none focus:border-[#248f8f]"
                                placeholder="Image URL (optional)"
                                value={newPostImage}
                                onChange={e => setNewPostImage(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute left-3 top-3 text-[#7F8C95]">image</span>
                        </div>
                        {newPostImage && (
                            <div className="mb-4 rounded-lg overflow-hidden relative group max-h-60">
                                <img src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => setNewPostImage('')}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-white text-sm">close</span>
                                </button>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsCreatingPost(false)} className="px-4 py-2 text-white hover:bg-white/5 rounded-lg text-sm font-medium">Cancel</button>
                            <button onClick={handleCreatePost} className="px-6 py-2 bg-[#248f8f] text-white rounded-lg font-bold hover:bg-[#1e7a7a] text-sm">Post</button>
                        </div>
                    </div>
                )}

                {/* Moments Feed (Facebook Style) */}
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#7F8C95]">
                        <span className="material-symbols-outlined text-6xl mb-4">image_not_supported</span>
                        <p>No moments shared yet.</p>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-6 pb-20">
                        {posts.map((post, index) => {
                            const postDate = post.createdAt ? new Date(post.createdAt) : new Date();
                            const timeAgo = Math.floor((new Date().getTime() - postDate.getTime()) / 1000);
                            let timeDisplay = '';
                            if (timeAgo < 60) timeDisplay = 'Just now';
                            else if (timeAgo < 3600) timeDisplay = `${Math.floor(timeAgo / 60)}m ago`;
                            else if (timeAgo < 86400) timeDisplay = `${Math.floor(timeAgo / 3600)}h ago`;
                            else timeDisplay = postDate.toLocaleDateString();

                            return (
                            <div key={post._id || index} className="bg-[#1E1E1E] rounded-xl border border-white/5 overflow-hidden animate-fade-in">
                                {/* Post Header */}
                                <div className="p-4 flex items-center gap-3">
                                    <img 
                                        src={post.user?.avatarUrl || user?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=unknown'} 
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-white font-semibold text-sm">
                                            {post.user?.displayName || post.user?.username || user?.displayName || user?.username || 'Unknown User'}
                                        </span>
                                        <div className="flex items-center gap-1 text-[#7F8C95] text-xs">
                                            <span>{timeDisplay}</span>
                                            <span>•</span>
                                            <span className="material-symbols-outlined text-[12px]">public</span>
                                        </div>
                                    </div>
                                    <button className="ml-auto text-[#7F8C95] hover:text-white">
                                        <span className="material-symbols-outlined">more_horiz</span>
                                    </button>
                                </div>

                                {/* content text */}
                                {post.caption && (
                                    <div className="px-4 pb-3">
                                         <p className="text-[#E4E6EB] text-sm whitespace-pre-wrap leading-relaxed">{post.caption}</p>
                                    </div>
                                )}

                                {/* content image */}
                                {post.imageUrl && (
                                    <div className="w-full bg-black">
                                        <img 
                                            src={post.imageUrl} 
                                            className="w-full h-auto max-h-[600px] object-contain"
                                            alt="Post"
                                        />
                                    </div>
                                )}

                                {/* Post Footer (Stats & Actions) */}
                                <div className="p-3 border-t border-white/5">
                                    <div className="flex items-center justify-between text-[#7F8C95] text-xs mb-3 px-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-4 h-4 rounded-full bg-[#248f8f] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[10px] text-white">thumb_up</span>
                                            </span>
                                            <span>{post.likes?.length || 0}</span>
                                        </div>
                                        <div>
                                            {/* <span>0 comments</span> */}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-1">
                                        <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-[#B0B3B8] hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                                            <span className="text-sm font-medium">Like</span>
                                        </button>
                                         <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-[#B0B3B8] hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                                            <span className="text-sm font-medium">Comment</span>
                                        </button>
                                         <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-[#B0B3B8] hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">share</span>
                                            <span className="text-sm font-medium">Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1E1E1E] rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[#7F8C95] hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-[#7F8C95] uppercase font-bold tracking-wider">Display Name</label>
                                <input 
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#248f8f] transition-colors"
                                    value={editForm.displayName}
                                    onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-[#7F8C95] uppercase font-bold tracking-wider">Bio</label>
                                <textarea 
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#248f8f] transition-colors resize-none"
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-[#7F8C95] uppercase font-bold tracking-wider">Gender</label>
                                    <select 
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#248f8f] transition-colors appearance-none"
                                        value={editForm.gender}
                                        onChange={(e) => setEditForm({...editForm, gender: e.target.value as any})}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-[#7F8C95] uppercase font-bold tracking-wider">City</label>
                                    <input 
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#248f8f] transition-colors"
                                        value={editForm.city}
                                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                                    />
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs text-[#7F8C95] uppercase font-bold tracking-wider">Ward</label>
                                <input 
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#248f8f] transition-colors"
                                    value={editForm.ward}
                                    onChange={(e) => setEditForm({...editForm, ward: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 bg-[#141414]/50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-2.5 rounded-lg border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="px-6 py-2.5 rounded-lg bg-[#248f8f] text-white font-semibold text-sm hover:bg-[#1e7a7a] transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
}
