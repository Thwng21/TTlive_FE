'use client';
import React, { useState, useEffect } from 'react';
import { feedService } from '@/services/feed.service';
import { usersService } from '@/services/users.service';
import { friendsService } from '@/services/friends.service';
import { useToast } from '@/context/ToastContext';
import PostItem from '@/components/features/feed/PostItem';

interface StrangerProfileModalProps {
    user: {
        id: string; // The backend ID
        username: string;
        displayName?: string;
        avatarUrl?: string;
        bio?: string; // If available
        stats?: { // If available
            postsCount?: number;
            friendsCount?: number;
        }
    };
    isOpen: boolean;
    onClose: () => void;
}

export const StrangerProfileModal: React.FC<StrangerProfileModalProps> = ({ user, isOpen, onClose }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'articles'>('all');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [isFriend, setIsFriend] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user?.id) {
            setFullProfile(null); 
             // Get current user from storage
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const currentUser = JSON.parse(userStr);
                    setCurrentUserId(currentUser._id || currentUser.id);
                }
            } catch (e) { console.error(e); }

            fetchData();
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (fullProfile && currentUserId) {
            const friendsList = fullProfile.friends || [];
            // Check if current user ID is in the friend list of the profile being viewed
            const isFriendMatch = friendsList.includes(currentUserId);
            setIsFriend(isFriendMatch);
        }
    }, [fullProfile, currentUserId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [postsData, profileData] = await Promise.all([
                feedService.getUserPosts(user.id),
                user.username ? usersService.getUserByUsername(user.username).catch(e => null) : Promise.resolve(null)
            ]);
            
            if (Array.isArray(postsData)) setPosts(postsData);
            if (profileData) setFullProfile(profileData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFriendAction = async () => {
        try {
            if (isFriend) {
                // Unfriend
                if (confirm('Are you sure you want to unfriend this user?')) {
                     await friendsService.unfriend(user.id);
                     setIsFriend(false);
                     showToast('Success', 'Unfriended successfully', 'success');
                     // Refresh profile data to update counts if needed
                     fetchData();
                }
            } else {
                // Add Friend (Direct add based on backend logic)
                 // Or actually backend takes username for add? Let's check backend
                 // Backend: addFriend(@Body() body: { username: string })
                 await friendsService.addFriend(user.username); // Assuming addFriend takes username currently or adjusting service
                 setIsFriend(true);
                 showToast('Success', 'Friend added successfully', 'success');
                  fetchData();
            }
        } catch (e) {
            console.error(e);
            showToast('Error', 'Action failed', 'error');
        }
    };

    if (!isOpen) return null;

    // Filter posts based on tab
    const filteredPosts = posts.filter(post => {
        if (activeTab === 'all') return true;
        if (activeTab === 'photos') return post.imageUrl && !post.videoUrl;
        if (activeTab === 'videos') return post.videoUrl;
        // Assuming articles are text-only or specific type
        if (activeTab === 'articles') return !post.imageUrl && !post.videoUrl; 
        return true;
    });

    const displayName = user.displayName || user.username || "Anonymous";
    const username = user.username || "user";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in font-sans">
             <div className="bg-[#131f1f] w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col md:flex-row relative animate-scale-up">
                
                {/* Close Button Mobile */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 md:hidden w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Left Sidebar (Profile Identity) */}
                <aside className="w-full md:w-[320px] lg:w-[360px] max-h-[35vh] md:max-h-full bg-[#1E1E1E] flex flex-col p-6 lg:p-10 overflow-y-auto border-b md:border-b-0 md:border-r border-white/5 relative z-20 shrink-0 custom-scrollbar">
                    <div className="flex flex-col gap-6 mb-8">
                        {/* Avatar */}
                        <div className="flex flex-row md:flex-col gap-4 md:gap-6 items-center md:items-start">
                             <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg shrink-0 group">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                <img 
                                    src={user.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + user.username} 
                                    alt={displayName}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex flex-col gap-1 md:gap-2">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-white line-clamp-1">{displayName}</h1>
                                    {/* Status Indicator (Fake Online) */}
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#4DC98A] shadow-[0_0_10px_rgba(77,201,138,0.5)] animate-pulse shrink-0" title="Online"></div>
                                </div>
                                <p className="text-[#CBD2D9] text-sm md:text-base font-normal">
                                    @{username}
                                </p>
                            </div>
                        </div>

                        <p className="text-[#CBD2D9] text-sm md:text-base font-normal leading-relaxed max-w-[90%] md:mt-0 hidden md:block">
                            {fullProfile?.bio || user.bio || "This user hasn't written a bio yet."}
                        </p>
                        
                        {/* Mobile Bio (Collapsible or truncated) */}
                        <p className="text-[#CBD2D9] text-xs font-normal leading-relaxed line-clamp-2 md:hidden">
                            {fullProfile?.bio || user.bio || "This user hasn't written a bio yet."}
                        </p>

                        {/* Minimalist Stats */}
                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg md:text-xl tracking-tight">{posts.length}</span>
                                <span className="text-[#7F8C95] text-[10px] md:text-xs uppercase tracking-wider font-medium">Moments</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg md:text-xl tracking-tight">{fullProfile?.friends?.length || '--'}</span>
                                <span className="text-[#7F8C95] text-[10px] md:text-xs uppercase tracking-wider font-medium">Connections</span>
                            </div>
                        </div>

                         {/* Action Button (Send Message or Add Friend) */}
                         <div className="flex gap-3 mt-2 md:mt-4">
                            <button className="flex-1 py-2 md:py-3 px-4 rounded-lg bg-[#248f8f] text-white font-semibold text-sm transition-all hover:bg-[#1e7a7a] flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                                <span className="text-xs md:text-sm">Message</span>
                            </button>
                            
                            <button 
                                onClick={handleFriendAction}
                                className={`py-2 md:py-3 px-4 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center ${
                                    isFriend 
                                    ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                                    : 'border-[#F065AB] text-[#F065AB] hover:bg-[#F065AB] hover:text-white'
                                }`}
                                title={isFriend ? "Unfriend" : "Add Friend"}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {isFriend ? 'person_remove' : 'person_add'}
                                </span>
                            </button>
                         </div>
                    </div>
                    
                    <button onClick={onClose} className="mt-auto hidden md:flex items-center gap-2 text-[#7F8C95] hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Back to Chat</span>
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-[#141414] h-full overflow-y-auto relative scroll-smooth custom-scrollbar">
                     <div className="p-6 md:p-10 lg:p-14">
                        {/* Sticky Filter Header */}
                        <div className="sticky top-0 z-30 bg-[#141414]/95 backdrop-blur-md pt-2 pb-6 mb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex gap-8 overflow-x-auto hide-scrollbar">
                                <button 
                                    onClick={() => setActiveTab('all')}
                                    className={`relative font-bold text-sm tracking-wide pb-3 whitespace-nowrap transition-colors ${activeTab === 'all' ? 'text-white' : 'text-[#7F8C95] hover:text-white'}`}
                                >
                                    All Moments
                                    {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#248f8f] rounded-t-full"></span>}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('photos')}
                                    className={`relative font-bold text-sm tracking-wide pb-3 whitespace-nowrap transition-colors ${activeTab === 'photos' ? 'text-white' : 'text-[#7F8C95] hover:text-white'}`}
                                >
                                    Photos
                                     {activeTab === 'photos' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#248f8f] rounded-t-full"></span>}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('videos')}
                                    className={`relative font-bold text-sm tracking-wide pb-3 whitespace-nowrap transition-colors ${activeTab === 'videos' ? 'text-white' : 'text-[#7F8C95] hover:text-white'}`}
                                >
                                    Videos
                                     {activeTab === 'videos' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#248f8f] rounded-t-full"></span>}
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="w-full flex justify-center py-20 opacity-50">
                                <div className="w-8 h-8 border-2 border-[#248f8f] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredPosts.length === 0 && (
                             <div className="h-[40vh] flex flex-col items-center justify-center text-[#7F8C95] gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-50">perm_media</span>
                                <p>No moments shared yet.</p>
                            </div>
                        )}

                        {/* Vertical Feed (Facebook Style) */}
                        <div className="max-w-xl mx-auto space-y-6 pb-20">
                            {filteredPosts.map((post, index) => (
                                <PostItem 
                                    key={post._id || index}
                                    post={post}
                                    currentUser={{ _id: currentUserId }}
                                    onPostUpdated={(updatedPost) => {
                                        setPosts((prev) => prev.map((p) => (p._id && updatedPost._id && p._id === updatedPost._id ? updatedPost : p)));
                                    }}
                                />
                            ))}
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};

