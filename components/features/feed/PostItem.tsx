'use client';

import { useState } from 'react';
import { feedService } from '@/services/feed.service';
import { useAuth } from '@/hooks/useAuth';

interface PostItemProps {
  post: any;
  onPostUpdated: (updatedPost: any) => void;
  currentUser: any;
}

export default function PostItem({ post, onPostUpdated, currentUser }: PostItemProps) {
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const [isShareLoading, setIsShareLoading] = useState(false);

  const isLiked = post.likes && post.likes.some((id: any) => {
      const likeId = typeof id === 'string' ? id : (id._id ? id._id.toString() : id.toString());
      const userId = currentUser?._id || currentUser?.id;
      return likeId === userId;
  });

  const handleLike = async () => {
    if (isLikeLoading) return;
    
    // OPTIMISTIC UPDATE
    const currentUserId = currentUser?._id || currentUser?.id;
    if (!currentUserId) return; // Cannot like if not logged in

    const previousLikes = post.likes || [];
    const newIsLiked = !isLiked;
    
    // Calculate new likes array
    let newLikes;
    if (newIsLiked) {
        // Add current user ID (mix of string/object is fine for display loop if we handle it)
        newLikes = [...previousLikes, currentUserId];
    } else {
        // Filter out
        newLikes = previousLikes.filter((id: any) => {
            const likeId = typeof id === 'string' ? id : (id._id ? id._id.toString() : id.toString());
            return likeId !== currentUserId;
        });
    }

    // Create optimistic post
    const optimisticPost = { ...post, likes: newLikes };
    onPostUpdated(optimisticPost);
    
    setIsLikeLoading(true);
    try {
      // Real API call
      const updatedPost = await feedService.likePost(post._id);
      // Update with authoritative data
      onPostUpdated(updatedPost);
    } catch (error) {
      console.error(error);
      // Revert on error
      onPostUpdated(post);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = async () => {
    const confirmShare = confirm("Share this post to your profile?");
    if (!confirmShare) return;

    if (isShareLoading) return;
    setIsShareLoading(true);
    try {
        await feedService.sharePost(post._id);
        alert("Post shared successfully!");
        // We probably don't need to update the current post, but maybe trigger a refresh of the feed if the user is viewing their own feed?
        // For now, no callback needed for share besides notification.
    } catch (error) {
        console.error(error);
        alert("Failed to share post");
    } finally {
        setIsShareLoading(false);
    }
  };

  const handleAddComment = async () => {
      if (!commentText.trim()) return;
      setIsCommentLoading(true);
      try {
          const updatedPost = await feedService.addComment(post._id, commentText);
          onPostUpdated(updatedPost);
          setCommentText('');
      } catch (error) {
          console.error(error);
      } finally {
          setIsCommentLoading(false);
      }
  };

  const handleDeleteComment = async (commentId: string) => {
      if (!confirm("Delete this comment?")) return;
      try {
          const updatedPost = await feedService.deleteComment(post._id, commentId);
          onPostUpdated(updatedPost);
      } catch (error) {
          console.error(error);
      }
  };

  const startEditComment = (comment: any) => {
      setEditingCommentId(comment._id);
      setEditCommentText(comment.text);
  };

  const cancelEditComment = () => {
      setEditingCommentId(null);
      setEditCommentText('');
  };

  const handleUpdateComment = async (commentId: string) => {
      if (!editCommentText.trim()) return;
      try {
          const updatedPost = await feedService.editComment(post._id, commentId, editCommentText);
          onPostUpdated(updatedPost);
          setEditingCommentId(null);
          setEditCommentText('');
      } catch (error) {
          console.error(error);
      }
  };

  const postDate = post.createdAt ? new Date(post.createdAt) : new Date();
  const timeAgo = Math.floor((new Date().getTime() - postDate.getTime()) / 1000);
  let timeDisplay = '';
  if (timeAgo < 60) timeDisplay = 'Just now';
  else if (timeAgo < 3600) timeDisplay = `${Math.floor(timeAgo / 60)}m ago`;
  else if (timeAgo < 86400) timeDisplay = `${Math.floor(timeAgo / 3600)}h ago`;
  else timeDisplay = postDate.toLocaleDateString();

  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-white/5 overflow-hidden animate-fade-in mb-6">
        {/* Post Header */}
        <div className="p-4 flex items-center gap-3">
            <img 
                src={post.user?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=unknown'} 
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">
                    {post.user?.displayName || post.user?.username || 'Unknown User'}
                    {post.originalPost && (
                        <span className="font-normal text-[#7F8C95] ml-1">
                            shared a post
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-1 text-[#7F8C95] text-xs">
                    <span>{timeDisplay}</span>
                    <span>•</span>
                    <span className="material-symbols-outlined text-[12px]">public</span>
                </div>
            </div>
            {/* Options menu could go here */}
        </div>

        {/* Content */}
        {post.caption && (
            <div className="px-4 pb-3">
                <p className="text-[#E4E6EB] text-sm whitespace-pre-wrap leading-relaxed">{post.caption}</p>
            </div>
        )}

        {/* Shared Post Content (Recursive-ish but simplified) */}
        {post.originalPost && (
            <div className="mx-4 mb-3 border border-white/10 rounded-lg overflow-hidden bg-black/20">
                 <div className="p-3 flex items-center gap-2 border-b border-white/5">
                    <img 
                        src={post.originalPost.user?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=unknown'} 
                        alt="Original Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                     <div className="flex flex-col">
                        <span className="text-white font-semibold text-xs">
                            {post.originalPost.user?.displayName || post.originalPost.user?.username || 'Unknown'}
                        </span>
                        <span className="text-[#7F8C95] text-[10px]">
                            {new Date(post.originalPost.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                 </div>
                 {post.originalPost.caption && (
                     <div className="px-3 py-2">
                        <p className="text-[#E4E6EB] text-sm whitespace-pre-wrap">{post.originalPost.caption}</p>
                     </div>
                 )}
                 {post.originalPost.imageUrl && (
                    <div className="w-full bg-black">
                        <img 
                            src={post.originalPost.imageUrl} 
                            className="w-full h-auto max-h-[400px] object-contain"
                            alt="Shared Post"
                        />
                    </div>
                )}
            </div>
        )}

        {/* Direct Image Content (if not a shared post or mixed) */}
        {post.imageUrl && !post.originalPost && (
            <div className="w-full bg-black">
                <img 
                    src={post.imageUrl} 
                    className="w-full h-auto max-h-[600px] object-contain"
                    alt="Post"
                />
            </div>
        )}

        {/* Stats */}
        <div className="p-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[#7F8C95] text-xs mb-3 px-1">
                <div className="flex items-center gap-1">
                    {post.likes?.length > 0 && (
                        <>
                            <span className="w-4 h-4 rounded-full bg-[#248f8f] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[10px] text-white">thumb_up</span>
                            </span>
                            <span>{post.likes.length}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    {post.comments?.length > 0 && <span>{post.comments.length} comments</span>}
                    {/* <span>0 shares</span> */}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-1 mb-2">
                <button 
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 transition-colors ${isLiked ? 'text-[#248f8f]' : 'text-[#B0B3B8] hover:text-white'}`}
                >
                    <span className={`material-symbols-outlined text-[20px] ${isLiked ? 'fill-current' : ''}`}>thumb_up</span>
                    <span className="text-sm font-medium">Like</span>
                </button>
                    <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-[#B0B3B8] hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="text-sm font-medium">Comment</span>
                </button>
                    <button 
                    onClick={handleShare}
                    disabled={isShareLoading}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-[#B0B3B8] hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {/* Comment Section */}
            {showComments && (
                <div className="pt-2 border-t border-white/5 animate-fade-in">
                    {/* Add Comment */}
                    <div className="flex gap-2 mb-4">
                        <img 
                            src={currentUser?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + (currentUser?.username || 'me')} 
                            className="w-8 h-8 rounded-full border border-white/10"
                        />
                        <div className="flex-1 relative">
                            <input 
                                className="w-full bg-[#3A3B3C] text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#248f8f]"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button 
                                onClick={handleAddComment} 
                                disabled={isCommentLoading || !commentText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#248f8f] disabled:opacity-50 hover:bg-white/10 p-1 rounded-full"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-3">
                        {post.comments?.map((comment: any) => (
                            <div key={comment._id} className="flex gap-2 group">
                                <img 
                                    src={comment.user?.avatarUrl || 'https://api.dicebear.com/9.x/avataaars/svg?seed=unknown'} 
                                    className="w-8 h-8 rounded-full mt-1 object-cover"
                                />
                                <div className="flex flex-col max-w-[85%]">
                                    <div className="bg-[#3A3B3C] rounded-2xl px-3 py-2 relative">
                                        <span className="text-white text-xs font-bold block hover:underline cursor-pointer">
                                            {comment.user?.displayName || comment.user?.username || 'Unknown'}
                                        </span>
                                        {editingCommentId === comment._id ? (
                                            <div className="mt-1">
                                                <input 
                                                    className="w-full bg-black/20 text-white text-sm rounded px-2 py-1 focus:outline-none"
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleUpdateComment(comment._id);
                                                        if (e.key === 'Escape') cancelEditComment();
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="text-[10px] text-[#B0B3B8] mt-1 space-x-2">
                                                    <span className="cursor-pointer hover:underline" onClick={() => handleUpdateComment(comment._id)}>Save</span>
                                                    <span className="cursor-pointer hover:underline" onClick={cancelEditComment}>Cancel</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[#E4E6EB] text-sm break-words leading-snug">{comment.text}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-[#B0B3B8] px-2 mt-0.5">
                                        <span>{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        {/* Edit/Delete controls for owner */}
                                        {(currentUser._id === comment.user?._id || currentUser.id === comment.user?._id || currentUser._id === post.user?._id) && (
                                            <>
                                                 {currentUser._id === comment.user?._id && (
                                                    <span role="button" onClick={() => startEditComment(comment)} className="font-semibold hover:underline">Edit</span>
                                                 )}
                                                 <span role="button" onClick={() => handleDeleteComment(comment._id)} className="font-semibold hover:underline">Delete</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
