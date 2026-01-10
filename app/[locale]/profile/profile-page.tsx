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
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
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
  const [newPostImage, setNewPostImage] = useState<string>(''); // For now, simple URL input or we can update later for file upload

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
      try {
          setLoading(true);
          const profile = await authService.getProfile();
          if (profile) {
              setUserData(profile);
              // Load posts after profile is loaded
              loadPosts(profile._id || profile.id);
          }
      } catch (error) {
          console.error("Failed to load profile", error);
          showToast('Error', 'Could not load profile. Please login again.', 'error');
      } finally {
          setLoading(false);
      }
  };

  const loadPosts = async (userId: string) => {
      try {
          const userPosts = await feedService.getUserPosts(userId);
          setPosts(userPosts);
      } catch (e) {
          console.error("Failed to load posts", e);
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
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setIsEditing(false);
        showToast("Success", "Profile updated successfully!", "success");
    } catch (e) {
        console.error(e);
        showToast("Error", "Failed to update profile", "error");
    }
  };

  const handleCreatePost = async () => {
      if (!newPostCaption && !newPostImage) {
          showToast("Error", "Please add a caption or image URL", "error");
          return;
      }
      try {
          await feedService.createPost({
              caption: newPostCaption,
              imageUrl: newPostImage
          } as any);
          
          showToast("Success", "Post created!", "success");
          setNewPostCaption('');
          setNewPostImage('');
          setIsCreatingPost(false);
          if (user) loadPosts(user._id || user.id || '');
      } catch (e) {
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
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg self-start group cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                        src={user?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + user?.username} 
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {!isEditing ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{user?.displayName || user?.username}</h1>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#4DC98A] shadow-[0_0_10px_rgba(77,201,138,0.5)] animate-pulse" title="Online"></div>
                        </div>
                        <p className="text-[#CBD2D9] text-sm md:text-base font-normal leading-relaxed max-w-[90%]">
                            {user?.bio || "No bio yet."}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <input 
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                            value={editForm.displayName}
                            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                            placeholder="Display Name"
                        />
                         <textarea 
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            placeholder="Bio"
                            rows={3}
                        />
                         <div className="flex gap-2">
                             <select 
                                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white flex-1"
                                value={editForm.gender}
                                onChange={(e) => setEditForm({...editForm, gender: e.target.value as any})}
                             >
                                 <option value="male">Male</option>
                                 <option value="female">Female</option>
                                 <option value="other">Other</option>
                             </select>
                         </div>
                         <div className="flex gap-2">
                            <input className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white flex-1" placeholder="City" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                            <input className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white flex-1" placeholder="Ward" value={editForm.ward} onChange={e => setEditForm({...editForm, ward: e.target.value})} />
                         </div>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 pt-2">
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-xl tracking-tight">{posts.length}</span>
                        <span className="text-[#7F8C95] text-xs uppercase tracking-wider font-medium">Moments</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-xl tracking-tight">{user?.friends?.length || 0}</span>
                        <span className="text-[#7F8C95] text-xs uppercase tracking-wider font-medium">Connections</span>
                    </div>
                </div>

                {/* Action Button */}
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="group relative w-full mt-2 py-3 px-6 rounded-lg border border-[#F065AB] text-[#F065AB] font-semibold text-sm transition-all duration-300 hover:bg-[#F065AB] hover:text-white flex items-center justify-center gap-2 overflow-hidden"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit_square</span>
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <div className="flex gap-2 mt-2">
                         <button 
                            onClick={handleUpdate}
                            className="flex-1 py-3 px-6 rounded-lg bg-[#4DC98A] text-white font-semibold text-sm transition-all hover:bg-[#3da872]"
                        >
                            Save
                        </button>
                         <button 
                            onClick={() => setIsEditing(false)}
                            className="py-3 px-6 rounded-lg border border-white/10 text-white font-semibold text-sm transition-all hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Spacer */}
            <div className="hidden md:flex flex-1"></div>

            {/* Navigation Menu (Mimicking design) */}
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
                    
                    <button 
                        onClick={() => setIsCreatingPost(!isCreatingPost)}
                        className="p-2 px-4 rounded-full bg-[#248f8f] hover:bg-[#1e7a7a] text-white transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Create
                    </button>
                </div>

                {/* Create Post Form */}
                {isCreatingPost && (
                    <div className="mb-8 p-6 bg-[#1E1E1E] rounded-xl animate-fade-in border border-white/5">
                        <textarea 
                            className="w-full bg-[#141414] text-white p-4 rounded-lg border border-white/10 mb-4 focus:outline-none focus:border-[#248f8f]"
                            placeholder="What's on your mind?"
                            rows={3}
                            value={newPostCaption}
                            onChange={e => setNewPostCaption(e.target.value)}
                        />
                        <input 
                            className="w-full bg-[#141414] text-white p-3 rounded-lg border border-white/10 mb-4 focus:outline-none focus:border-[#248f8f]"
                            placeholder="Image URL (optional)"
                            value={newPostImage}
                            onChange={e => setNewPostImage(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsCreatingPost(false)} className="px-4 py-2 text-white hover:bg-white/5 rounded-lg">Cancel</button>
                            <button onClick={handleCreatePost} className="px-6 py-2 bg-[#248f8f] text-white rounded-lg font-bold hover:bg-[#1e7a7a]">Post</button>
                        </div>
                    </div>
                )}

                {/* Moments Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                    {posts.map((post, index) => (
                        <div key={post._id || index} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-[#1E1E1E] border border-white/5 hover:border-[#248f8f]/30 transition-all shadow-lg hover:shadow-[#248f8f]/10">
                             {post.imageUrl ? (
                                <div className="relative">
                                    <img 
                                        src={post.imageUrl} 
                                        className="w-full h-auto object-cover"
                                        alt="Post"
                                    />
                                </div>
                             ) : (
                                <div className="w-full aspect-square flex items-center justify-center p-6 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]">
                                    <p className="text-white text-center font-medium line-clamp-6">{post.caption}</p>
                                </div>
                             )}
                            
                            {/* Content Block - Always visible on mobile, or just always visible for better UX */}
                            <div className="p-4 bg-[#1E1E1E]">
                                {post.caption && post.imageUrl && (
                                    <p className="text-sm text-gray-300 mb-3 line-clamp-3 leading-relaxed">{post.caption}</p>
                                )}
                                
                                <div className="flex items-center justify-between text-[#7F8C95] text-xs pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 transition-colors hover:text-red-500">
                                            <span className="material-symbols-outlined text-[18px]">favorite</span>
                                            <span className="font-medium">{post.likes?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 transition-colors hover:text-[#248f8f]">
                                            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                                            <span className="font-medium">{post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] opacity-60">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    </div>
  );
}
