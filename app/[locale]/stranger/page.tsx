'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useSocket } from '@/hooks/useSocket';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { UserMenu } from '@/components/common/UserMenu';
import { useToast } from '@/context/ToastContext';
import { chatStore } from '@/services/chatStore';
import { StrangerProfileModal } from '@/components/feature/profile/StrangerProfileModal';

    type Message = {
        senderId: string;
        text: string;

        type: 'text' | 'image' | 'video' | 'audio' | 'file';
        timestamp: Date;
        isMe: boolean;
        originalText?: string; // Add optional to match Store if needed types overlap, but we use Store types now mostly
    };

export default function StrangerChatPage() {
    const t = useTranslations('StrangerChat');
    const { showToast } = useToast();
    const params = useParams();
    const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
    const socket = useSocket();
    
    // Initialize state from Singleton Store
    const [status, setStatus] = useState(chatStore.status);
    const [messages, setMessages] = useState(chatStore.messages);
    const [roomId, setRoomId] = useState(chatStore.roomId);
    
    // Update Store locale when Page locale changes
    useEffect(() => {
        if (locale) {
            chatStore.setLocale(locale);
        }
    }, [locale]);

    useEffect(() => {
        const checkProfile = () => {
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const user = JSON.parse(stored);
                    if (!user.gender || !user.address?.city) {
                         showToast(
                             "Profile Incomplete", 
                             "Please update your profile (Gender & Location) to find better matches!", 
                             "info"
                         );
                    }
                }
            } catch (e) {
                console.error("Profile check error", e);
            }
        };
        checkProfile();
    }, []);
    
    const [inputText, setInputText] = useState('');
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const [isVideoRevealed, setIsVideoRevealed] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    // Mobile View State: 'split' | 'video' | 'chat'
    const [mobileViewMode, setMobileViewMode] = useState<'split' | 'video' | 'chat'>('split');
    
    // Stranger Profile Logic
    const [showStrangerProfile, setShowStrangerProfile] = useState(false);
    
    // Friend Request State
    const [friendRequestStatus, setFriendRequestStatus] = useState<'none' | 'sent' | 'received' | 'accepted' | 'declined'>('none');
    
    // Partner Profile State
    const [partnerProfile, setPartnerProfile] = useState<{
        id: string;
        username: string;
        displayName: string;
        avatarUrl?: string;
        bio?: string;
    } | null>(null);

    const [receivedRequestData, setReceivedRequestData] = useState<any>(null); // { senderId, senderInfo }
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [partnerDbId, setPartnerDbId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteCandidates = useRef<any[]>([]); // Buffer for ICE candidates
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isSwapped, setIsSwapped] = useState(false); // For swapping main/pip view
    const [isInitiator, setIsInitiator] = useState(false);
    const [pendingOffer, setPendingOffer] = useState<any>(null);
    const [isStarted, setIsStarted] = useState(false);
    
    // Ref to track start status continuously without stale closures
    const isStartedRef = useRef(isStarted);
    useEffect(() => {
        isStartedRef.current = isStarted;
    }, [isStarted]);

    // Handle skipped camera explicitly
    const [isCameraSkipped, setIsCameraSkipped] = useState(false);

    // Voice Message State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Load user info
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setCurrentUser(JSON.parse(userStr));
            }
        } catch (e) {
            console.error("Failed to load user info", e);
        }
    }, []);

    // Sync with Singleton Store
    useEffect(() => {
        const unsubscribe = chatStore.subscribe(() => {
            setStatus(chatStore.status);
            setMessages(chatStore.messages);
            setRoomId(chatStore.roomId);
        });
        return unsubscribe;
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-start Camera - REMOVED for On-Demand logic
    /*
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true } });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                showToast("Camera Error", "Could not access camera. Please allow permissions.", "error");
            }
        };

        startCamera();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    */
    
    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [localStream]);

    const requestCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true } });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setIsVideoRevealed(true); // Auto-reveal video when permission granted
            setShowPermissionModal(false);
            showToast("Camera đã bật", "Đã bật video thành công", "success");
        } catch (err) {
            console.error("Error accessing camera:", err);
            showToast("Lỗi Camera", "Không thể truy cập camera. Vui lòng cấp quyền.", "error");
        }
    };

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, status]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, status]);

    useEffect(() => {
        if (status === 'connected') {
            setIsVideoRevealed(false); // Reset video state on new connection
            // Reset skipped state on new connection match to prompt again if needed 
            // OR keep it if user wants to stay hidden? 
            // Let's keep it false to force choice or default behavior
             setIsCameraSkipped(false);
        }
    }, [status]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        // If we are already connected/searching in the store, don't re-emit joinQueue unless necessary
        // BUT, if the socket reconnected, we might need to recover state.
        // For now, assume socket stays connected.

        // Only listen if not already listening is hard with socket.io one-to-many,
        // but useEffect cleanup removes listeners. 
        // We need to update the STORE, not local state directly.

        const onConnect = () => {
             console.log('Connected to socket server');
             if (chatStore.status === 'idle' || chatStore.status === 'searching') {
                  joinQueueWithUser();
             }
        };

        const onMatchFound = (data: { roomId: string, initiator: boolean, areFriends?: boolean, partnerId?: string, partnerInfo?: any }) => {
            console.log('Match found:', data);
            chatStore.setStatus('connected');
            chatStore.setRoomId(data.roomId);
            chatStore.setMessages([]);
            setIsInitiator(data.initiator);
            
            // Set Partner Profile
            if (data.partnerInfo) {
                setPartnerProfile(data.partnerInfo);
            } else {
                setPartnerProfile(null); // Reset if anonymous or error
            }

            // Show Permission Modal when match is found
            setShowPermissionModal(true);
            
            showToast("Thành công", "Bạn đã được kết nối với người lạ!", "success");
            
            // Handle Friend Status
            if (data.areFriends) {
                setFriendRequestStatus('accepted');
            } else {
                setFriendRequestStatus('none');
            }
            
            setReceivedRequestData(null);
            setPartnerDbId(data.partnerId || null);
        };

        const onMessage = (payload: any) => {
            console.log('Received message:', payload);
            
            // Handled by chatStore internal logic now for formatting
            chatStore.addMessage({
                senderId: payload.senderId,
                originalText: payload.text, // Store original
                text: payload.text,         // Initial display (will be formatted by store)
                type: payload.type,
                timestamp: new Date(payload.timestamp),
                isMe: false 
            });
            // Stop typing indicator when message received
            setIsPartnerTyping(false);
        };

        const onTyping = (data: { senderId: string }) => {
            // Using ID check just in case, though broadcast usually excludes sender
            console.log('Partner typing...');
            setIsPartnerTyping(true);
        };

        const onStopTyping = (data: { senderId: string }) => {
            setIsPartnerTyping(false);
        };
        
        const onPartnerDisconnected = () => {
             console.log("Partner disconnected event received");
             showToast("Người lại đã rời đi", "Đang tìm kiếm đối tác mới...", "info");
             setIsPartnerTyping(false);
             
             // Reset state and join queue
             chatStore.reset(); 
             chatStore.setStatus('searching');
             setPartnerProfile(null);
             
             // Reset Friend Request
             setFriendRequestStatus('none');
             setReceivedRequestData(null);
             
             // Emit joinQueue after a short delay or immediately?
             // Immediately is fine, backend handles the queue.
             if (socket && socket.connected) {
                console.log("Emitting joinQueue immediately to find new match");
                socket.emit('joinQueue', {});
             }
        };

        const onFriendRequestReceived = (data: any) => {
            console.log("Friend request received:", data);
            setReceivedRequestData(data);
            if (data.senderInfo && data.senderInfo.id) {
                setPartnerDbId(data.senderInfo.id);
            }
            setFriendRequestStatus('received');
            showToast("Lời mời kết bạn", "Người lạ muốn kết bạn với bạn!", "info");
        };

        const onFriendRequestAccepted = (data: any) => {
            console.log("Friend request accepted:", data);
            
            if (data.responderInfo && currentUser && data.responderInfo.id !== currentUser.id) {
                 setPartnerDbId(data.responderInfo.id);
            }

            setFriendRequestStatus('accepted');
            showToast("Đã chấp nhận", "Các bạn đã trở thành bạn bè!", "success");
        };

        const onFriendRequestDeclined = () => {
            setFriendRequestStatus('declined');
            showToast("Đã từ chối", "Lời mời kết bạn đã bị từ chối.", "warning");
        };

        const onUnfriendSuccess = () => {
            setFriendRequestStatus('none');
            showToast("Đã hủy kết bạn", "Bạn đã hủy kết bạn thành công.", "info");
        };

        const onFriendRemoved = () => {
             // friendRequestStatus is stale in this closure, so we just reset unconditionally.
             // It's safe because if we receive this event, we really should be 'none'.
             setFriendRequestStatus('none');
             showToast("Đã hủy kết bạn", "Đối phương đã hủy kết bạn với bạn.", "info");
        };

        // Important: Check if we need to remove old listeners to avoid duplicates
        // if the socket instance is the SAME, adding listeners again duplicates them.
        socket.off('connect');
        socket.off('matchFound');
        socket.off('message');
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('partnerDisconnected');
        socket.off('friendRequestReceived');
        socket.off('friendRequestAccepted');
        socket.off('friendRequestDeclined');
        socket.off('unfriendSuccess');
        socket.off('friendRemoved');

        socket.on('connect', onConnect);
        socket.on('matchFound', onMatchFound);
        socket.on('message', onMessage);
        socket.on('typing', onTyping);
        socket.on('stopTyping', onStopTyping);
        socket.on('partnerDisconnected', onPartnerDisconnected);
        socket.on('friendRequestReceived', onFriendRequestReceived);
        socket.on('friendRequestAccepted', onFriendRequestAccepted);
        socket.on('friendRequestDeclined', onFriendRequestDeclined);
        socket.on('unfriendSuccess', onUnfriendSuccess);
        socket.on('friendRemoved', onFriendRemoved);
        
        // Initial check for join - improved logic
        if (socket.connected) {
             // Only auto-search if we are TRULY searching and have no room, 
             // AND we are not just reloading into an existing session
             if (chatStore.status === 'searching' && !chatStore.roomId) {
                  // Wait a brief moment to ensure we aren't just reconnecting? 
                  // or just let it rip. The backend should handle duplicate joins if implemented well.
                  // socket.emit('joinQueue', {}); 
                  
                  // NOTE: The initial onConnect handles this. If already connected, we emit.
                  // But if we remount and are connected, onConnect WON'T fire.
                  joinQueueWithUser(); 
             }
        }
        
        return () => {
            // Remove listeners on unmount
            socket.off('connect', onConnect);
            socket.off('matchFound', onMatchFound);
            socket.off('message', onMessage);
            socket.off('typing', onTyping);
            socket.off('stopTyping', onStopTyping);
            socket.off('partnerDisconnected', onPartnerDisconnected);
            socket.off('friendRequestReceived', onFriendRequestReceived);
            socket.off('friendRequestAccepted', onFriendRequestAccepted);
            socket.off('friendRequestDeclined', onFriendRequestDeclined);
            socket.off('unfriendSuccess', onUnfriendSuccess);
            socket.off('friendRemoved', onFriendRemoved);
        };
    }, [socket]); // Removed locale dependency to prevent listener churn

     // --- WebRTC Logic ---
    const resetPeerConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setRemoteStream(null);
    };

    const createPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && roomId && socket) {
                socket.emit('signal', {
                    roomId,
                    signal: { type: 'candidate', candidate: event.candidate }
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote track', event.streams[0]);
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        peerConnectionRef.current = pc;
        return pc;
    }, [roomId, socket, localStream]);

    // Helper to process offer
    const processOffer = useCallback(async (offerSignal: any) => {
        const pc = peerConnectionRef.current || createPeerConnection();
        // if (pc.signalingState !== 'stable') return; // Relax this check for renegotiation potential
        
        await pc.setRemoteDescription(new RTCSessionDescription(offerSignal));
        
        // Flush buffered candidates
        while (remoteCandidates.current.length > 0) {
            const candidate = remoteCandidates.current.shift();
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Error adding buffered candidate:", e);
            }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.emit('signal', { roomId, signal: answer });
    }, [createPeerConnection, roomId, socket]);

    // Handle incoming signals
    useEffect(() => {
        if (!socket) return;

        const handleSignal = async (data: { senderId: string, signal: any }) => {
            console.log("Received signal data:", data);
            
            if (!data || !data.signal) {
                console.warn("Received invalid signal data:", data);
                return;
            }

            const { signal } = data;
            
            try {
                if (!signal.type) {
                     console.warn("Signal missing type:", signal);
                     return;
                }

                if (signal.type === 'offer') {
                    if (localStream || isCameraSkipped) { // Allow if stream ready OR user skipped
                        await processOffer(signal);
                    } else {
                        console.log("Received offer but waiting for local stream or user decision...");
                        setPendingOffer(signal);
                    }
                } else if (signal.type === 'answer') {
                    const pc = peerConnectionRef.current;
                    if (pc && pc.signalingState === 'have-local-offer') {
                       await pc.setRemoteDescription(new RTCSessionDescription(signal));
                       // Flush buffered candidates
                       while (remoteCandidates.current.length > 0) {
                           const candidate = remoteCandidates.current.shift();
                           try {
                               await pc.addIceCandidate(new RTCIceCandidate(candidate));
                           } catch (e) { console.error(e) }
                       }
                    }
                } else if (signal.type === 'candidate' && signal.candidate) {
                    const pc = peerConnectionRef.current;
                    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                        } catch (e) { console.error("Error adding candidate", e); }
                    } else {
                        // Buffer candidate if PC doesn't exist or remote description not yet set
                        console.log("Buffering candidate (no PC or no RemoteDesc)...");
                        remoteCandidates.current.push(signal.candidate);
                    }
                }
            } catch (err) {
                console.error('Error handling signal:', err);
            }
        };

        socket.on('signal', handleSignal);
        return () => {
            socket.off('signal', handleSignal);
        };
    }, [socket, roomId, createPeerConnection, localStream, processOffer, isCameraSkipped]);

    // Process pending offer once stream is ready or skipped
    useEffect(() => {
        if (pendingOffer && (localStream || isCameraSkipped)) {
            console.log("Processing pending offer now that stream is ready/skipped");
            processOffer(pendingOffer);
            setPendingOffer(null);
        }
    }, [pendingOffer, localStream, isCameraSkipped, processOffer]);

    // Initiator logic: Start Offer once Permission Granted (Stream Ready) OR Skipped
    useEffect(() => {
        if (status === 'connected' && isInitiator && (localStream || isCameraSkipped) && !remoteStream && !peerConnectionRef.current) {
            const startCall = async () => {
                // Wait small delay to ensure partner is ready?
                setTimeout(async () => {
                    const pc = createPeerConnection();
                    // Create Offer
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket?.emit('signal', { roomId, signal: offer });
                }, 1000);
            };
            startCall();
        }
    }, [status, isInitiator, localStream, isCameraSkipped, remoteStream, createPeerConnection, roomId, socket]);

    // Reset on disconnect
    useEffect(() => {
        if (status !== 'connected') {
            resetPeerConnection();
        }
    }, [status]);
    // --- End WebRTC Logic ---

    // --- Voice Message Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Comprehensive mime-type check for better cross-browser support (iOS Safari, Android, Desktop)
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/mpeg',
                'audio/ogg;codecs=opus',
                'audio/aac'
            ];

            let selectedMimeType = '';
            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    selectedMimeType = type;
                    break;
                }
            }
            
            const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
            
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Determine the actual mime type used
                let mimeType = mediaRecorder.mimeType || selectedMimeType || 'audio/mp4'; // Fallback to mp4 for Safari if empty
                
                // iOS Safari fix: sometimes mimeType is empty string but data is mp4
                if (!mimeType) mimeType = 'audio/mp4';

                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                await uploadAndSendAudio(audioBlob, mimeType);
                stream.getTracks().forEach(track => track.stop()); // Stop mic
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            showToast("Error", "Microphone access denied or not supported.", "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAndSendAudio = async (blob: Blob, mimeType: string) => {
        const formData = new FormData();
        
        // Smart extension detection
        let ext = 'webm';
        if (mimeType.includes('mp4') || mimeType.includes('aac') || mimeType.includes('m4a')) {
            ext = 'mp4';
        } else if (mimeType.includes('ogg')) {
            ext = 'ogg';
        } else if (mimeType.includes('wav')) {
            ext = 'wav';
        }
        
        // Add timestamp to ensure unique filenames if needed
        const filename = `voice_${Date.now()}.${ext}`;
        formData.append('file', blob, filename); 

        try {
            const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            
            showToast("Đang gửi...", "Đang tải lên đoạn ghi âm", "info");

            const res = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!res.ok) throw new Error("Upload failed");
            
            const data = await res.json();
            
            if (data && data.filename) {
                 const fileUrl = `${apiUrl}/uploads/${data.filename}`;
                 
                 const messageData = {
                    roomId,
                    message: fileUrl,
                    type: 'audio',
                    userId: currentUser?.id || currentUser?._id
                 };
                 
                 socket?.emit('sendMessage', messageData);
                 
                 // Optimistic update
                 chatStore.addMessage({
                    senderId: socket?.id || 'me',
                    text: fileUrl,
                    originalText: fileUrl,
                    type: 'audio',
                    timestamp: new Date(),
                    isMe: true
                 });
                 showToast("Đã gửi", "Đoạn ghi âm đã được gửi", "success");
            }
        } catch (error) {
            console.error("Upload voice error:", error);
            showToast("Lỗi", "Không thể gửi đoạn ghi âm", "error");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (status === 'connected' && roomId && socket) {
            socket.emit('typing', { roomId });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopTyping', { roomId });
            }, 1000);
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !socket || !roomId) return;

        // Clear typing status immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('stopTyping', { roomId });

        const messageData = {
            roomId,
            message: inputText,
            type: 'text',
            userId: 'me' 
        };

        chatStore.addMessage({
            senderId: 'me',
            originalText: inputText,
            text: inputText,
            type: 'text',
            timestamp: new Date(),
            isMe: true
        });

        socket.emit('sendMessage', messageData);
        setInputText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    
    const handleSendFriendRequest = () => {
        if (!socket || !roomId || !currentUser) {
            showToast("Lỗi", "Bạn cần đăng nhập để thêm bạn bè.", "error");
            return;
        }
        
        socket.emit('sendFriendRequest', {
            roomId,
            senderInfo: {
                id: currentUser.id || currentUser._id,
                displayName: currentUser.displayName,
                avatarUrl: currentUser.avatarUrl
            }
        });
        setFriendRequestStatus('sent');
        showToast("Đã gửi", "Đã gửi lời mời kết bạn!", "success");
    };

    const handleRespondFriendRequest = (accept: boolean) => {
        if (!socket || !roomId || !receivedRequestData) return;
        
        socket.emit('respondFriendRequest', {
            roomId,
            accept,
            senderId: receivedRequestData.senderId, // Socket ID of sender
            targetUserId: receivedRequestData.senderInfo?.id, // DB ID of sender
            responderInfo: {
                id: currentUser.id || currentUser._id,
                displayName: currentUser.displayName
            }
        });
        
        if (accept) {
            // Optimistic update, actual update comes from socket event
            // setFriendRequestStatus('accepted'); 
        } else {
            setFriendRequestStatus('declined');
            setReceivedRequestData(null);
        }
    };

    const handleUnfriend = () => {
        if (!socket || !roomId || !currentUser || !partnerDbId) return;

        if (window.confirm("Bạn có chắc chắn muốn hủy kết bạn không?")) {
            socket.emit('unfriend', {
                roomId,
                userId: currentUser.id || currentUser._id,
                targetUserId: partnerDbId
            });
        }
    };
    
    const getUserIdFromStorage = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                return u.id || u._id;
            }
        } catch(e) {}
        return null;
    };

    const joinQueueWithUser = () => {
        // Use ref for accurate "started" state check inside listeners
        if (!isStartedRef.current) return;
        const userId = getUserIdFromStorage();
        console.log("Joining queue with userId:", userId);
        socket?.emit('joinQueue', { userId });
    };

    const handleStart = () => {
        setIsStarted(true);
        // Manually update ref immediately for the below call to work
        isStartedRef.current = true;
        chatStore.setStatus('searching');
        joinQueueWithUser();
    };

    const findNewStranger = () => {
        setFriendRequestStatus('none');
        setReceivedRequestData(null);
        chatStore.reset();
        chatStore.setStatus('searching');
        joinQueueWithUser();
    }

    const handleStop = () => {
        setIsStarted(false);
        chatStore.reset();
        socket?.emit('leaveQueue');
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
    };

  return (
    <div className="font-display h-[100dvh] flex flex-col bg-background-dark text-white overflow-hidden">
        {/* Top Navigation (Minimal) */}
        <header className="h-16 border-b border-[#333] flex items-center justify-between px-6 lg:px-10 bg-[#151515] shrink-0 z-50 relative">
            <div className="flex items-center gap-3">
                <div className="size-8 text-primary">
                    <span className="material-symbols-outlined text-3xl">token</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">AnonChat</h1>
            </div>
            <div className="flex items-center gap-4">
                {isStarted && (
                     <button
                        onClick={handleStop}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all font-medium text-sm"
                     >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Dừng tìm kiếm
                     </button>
                )}
                <div className="hidden sm:block">
                     <LanguageSwitcher />
                </div>
                <UserMenu />
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
            {!isStarted && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-auth-dark/95 backdrop-blur-md">
                     <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative mx-4">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="material-symbols-outlined text-4xl text-white">person</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {t.rich('welcomeTitle', {
                                    defaultMessage: 'Xin chào, {name}!',
                                    name: currentUser?.displayName || currentUser?.username || 'Bạn'
                                })}
                            </h1>
                            <p className="text-slate-400">
                                {t('welcomeSubtitle', { defaultMessage: 'Sẵn sàng gặp gỡ người bạn mới?' })}
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="text-sm text-slate-500 mb-1">{t('displayName', { defaultMessage: 'Tên hiển thị' })}</div>
                                <div className="text-lg text-white font-medium">{currentUser?.displayName || currentUser?.username || t('notSet', { defaultMessage: 'Chưa cập nhật' })}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex gap-4">
                                <div className="flex-1">
                                    <div className="text-sm text-slate-500 mb-1">{t('gender', { defaultMessage: 'Giới tính' })}</div>
                                    <div className="text-lg text-white font-medium capitalize">{currentUser?.gender ? (currentUser.gender === 'male' ? 'Nam' : (currentUser.gender === 'female' ? 'Nữ' : 'Khác')) : t('notSet', { defaultMessage: 'Chưa cập nhật' })}</div>
                                </div>
                                <div className="flex-1 border-l border-white/10 pl-4">
                                    <div className="text-sm text-slate-500 mb-1">{t('address', { defaultMessage: 'Địa chỉ' })}</div>
                                    <div className="text-lg text-white font-medium">
                                        {currentUser?.address?.city ? currentUser.address.city : t('notSet', { defaultMessage: 'Chưa cập nhật' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] duration-200 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">rocket_launch</span>
                            Start Finding Stranger
                        </button>
                    </div>
                </div>
            )}
            <div className="w-full h-full flex flex-col lg:flex-row">
                
                {/* Left Column: Video/Interaction Area (Expanded) */}
                <section className={`
                    relative bg-black flex flex-col items-center justify-center overflow-hidden border-b lg:border-b-0 border-[#333] transition-all duration-300
                    ${mobileViewMode === 'split' ? 'h-[35dvh] lg:h-auto flex-none lg:flex-1' : ''}
                    ${mobileViewMode === 'video' ? 'h-full lg:h-auto flex-1' : ''}
                    ${mobileViewMode === 'chat' ? 'h-0 lg:h-auto hidden lg:flex' : ''}
                `}>
                    {/* Mobile View Controls (Video) */}
                    <div className="absolute top-4 left-4 z-50 lg:hidden flex gap-2">
                         {mobileViewMode !== 'split' && (
                             <button onClick={() => setMobileViewMode('split')} className="bg-black/50 p-2 rounded-full text-white backdrop-blur-md border border-white/10 shadow-lg">
                                  <span className="material-symbols-outlined text-lg">vertical_split</span>
                             </button>
                         )}
                         {mobileViewMode !== 'video' && status === 'connected' && (
                             <button onClick={() => setMobileViewMode('video')} className="bg-black/50 p-2 rounded-full text-white backdrop-blur-md border border-white/10 shadow-lg">
                                  <span className="material-symbols-outlined text-lg">fullscreen</span>
                             </button>
                         )}
                    </div>

                    {/* Status: Searching */}
                    {status === 'searching' && (
                        <div className="flex flex-col items-center justify-center z-10">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-xl font-medium animate-pulse text-primary tracking-wide">{t('waiting')}</p>
                            
                            {/* Show Local Video while waiting too */}
                            <div className="mt-8 w-40 h-40 bg-black rounded-full overflow-hidden border-4 border-[#333] shadow-inner relative">
                                 <video 
                                    ref={localVideoRef}
                                    autoPlay 
                                    muted 
                                    playsInline
                                    className="w-full h-full object-cover transform -scale-x-100 opacity-60"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Checking camera...</p>
                        </div>
                    )}

                    {/* Status: Connected - Real Video Feed */}
                    {status === 'connected' && (
                        <>
                            {/* --- Video Layers --- */}
                            
                            {/* REMOTE VIDEO (Partner) */}
                            {/* Logic: If NOT swapped, it is Main (Background). If swapped, it is PIP (Small). */}
                            <div 
                                onClick={() => isSwapped && setIsSwapped(false)}
                                className={`
                                    transition-all duration-300 ease-in-out
                                    ${isSwapped 
                                        ? "absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-72 rounded-xl border border-white/20 shadow-2xl z-30 cursor-pointer" 
                                        : "absolute inset-0 w-full h-full z-0"
                                    }
                                    bg-black overflow-hidden
                                `}
                            >
                                {remoteStream ? (
                                    <video 
                                        ref={remoteVideoRef}
                                        autoPlay 
                                        playsInline
                                        className="w-full h-full object-cover"
                                        /* Remote video should NOT be mirrored */
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50">
                                         {/* Placeholder/Loading */}
                                        <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mb-4"></div>
                                        <p className="text-white/50 text-sm animate-pulse">Waiting for video...</p>
                                    </div>
                                )}
                                {/* Label for Remote when in PIP */}
                                {isSwapped && <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-0.5 rounded text-white">Stranger</div>}
                            </div>

                            {/* LOCAL VIDEO (You) */}
                            {/* Logic: If NOT swapped, it is PIP. If swapped, it is Main. */}
                            <div 
                                onClick={() => !isSwapped && setIsSwapped(true)}
                                className={`
                                    transition-all duration-300 ease-in-out
                                    ${!isSwapped 
                                        ? "absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-72 rounded-xl border border-white/20 shadow-2xl z-30 cursor-pointer" 
                                        : "absolute inset-0 w-full h-full z-0"
                                    }
                                    bg-black overflow-hidden
                                `}
                            >
                                {localStream ? (
                                    <video 
                                        ref={localVideoRef}
                                        autoPlay 
                                        muted 
                                        playsInline
                                        className="w-full h-full object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                                        <span className="material-symbols-outlined text-3xl mb-2">videocam_off</span>
                                        <span className="text-xs">Off</span>
                                    </div>
                                )}
                                {/* Label for Local when in PIP */}
                                {!isSwapped && <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-0.5 rounded text-white">You</div>}
                            </div>


                            {/* Permission Modal */}
                            {showPermissionModal && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                                     <div className="bg-[#1e1e1e] rounded-2xl max-w-md w-full p-6 md:p-8 text-center shadow-2xl border border-white/10 animate-fade-in-up">
                                         <div className="relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6">
                                              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                                              <div className="relative w-full h-full flex items-center justify-center bg-[#252525] rounded-full border border-green-500/30">
                                                  <span className="material-symbols-outlined text-green-400 text-2xl md:text-3xl">videocam</span>
                                                  <span className="absolute -bottom-1 -right-1 material-symbols-outlined text-white text-sm bg-green-600 rounded-full p-0.5">lock</span>
                                              </div>
                                         </div>
                                         
                                         <h3 className="text-2xl font-bold text-white mb-3">Xác nhận kết nối</h3>
                                         <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                            Bạn có chắc là muốn xem full HD người trò chuyện hay không?
                                         </p>

                                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold mb-8">
                                              <span className="material-symbols-outlined text-sm">security</span>
                                              BẢO MẬT QUYỀN RIÊNG TƯ
                                         </div>

                                         <div className="space-y-3">
                                              <button 
                                                  onClick={requestCamera}
                                                  className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                              >
                                                  Cho phép truy cập
                                              </button>
                                              <button 
                                                  onClick={() => {
                                                      setShowPermissionModal(false);
                                                      setIsCameraSkipped(true);
                                                  }}
                                                  className="w-full py-3.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-medium rounded-xl transition-colors"
                                              >
                                                  Tiếp tục không Video
                                              </button>
                                         </div>
                                         <p className="text-[10px] text-gray-500 mt-4">
                                              Nhấn &quot;Cho phép&quot; (Allow) trên thông báo trình duyệt tiếp theo.
                                         </p>
                                     </div>
                                </div>
                            )}

                            {/* Actions (Profile, Friend) */}
                            <div className="absolute top-6 right-6 z-20 flex gap-3 items-center">
                                {/* Profile Button & Name Label */}
                                <div className="flex items-center gap-3">
                                    {status === 'connected' && (
                                        <span className="text-white font-bold text-shadow-md hidden md:block animate-fade-in">
                                            {partnerProfile?.displayName || 'Stranger'}
                                        </span>
                                    )}
                                    <button 
                                        onClick={() => setShowStrangerProfile(true)}
                                        className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white border border-white/10 transition-colors flex items-center justify-center h-12 w-12" 
                                        title="View Profile"
                                    >
                                        <span className="material-symbols-outlined">person</span>
                                    </button>
                                </div>
                                
                                {/* Dynamic Friend Request Button */}
                                {friendRequestStatus === 'none' && (
                                    <button 
                                        onClick={handleSendFriendRequest}
                                        className="p-3 bg-primary hover:bg-primary-hover rounded-full text-black font-bold transition-colors shadow-lg h-12 w-12 flex items-center justify-center" 
                                        title="Add Friend"
                                    >
                                        <span className="material-symbols-outlined">person_add</span>
                                    </button>
                                )}
                                
                                {friendRequestStatus === 'sent' && (
                                    <div className="px-4 py-2 bg-gray-600/80 backdrop-blur-md rounded-full text-white/80 font-medium text-sm border border-white/10 flex items-center gap-2 h-12">
                                        <span className="material-symbols-outlined text-lg animate-pulse">hourglass_empty</span>
                                        <span>Đã gửi...</span>
                                    </div>
                                )}
                                
                                {friendRequestStatus === 'received' && (
                                    <div className="flex bg-black/60 backdrop-blur-md rounded-full border border-white/10 overflow-hidden h-12 shadow-xl animate-fade-in-up">
                                         <button 
                                            onClick={() => handleRespondFriendRequest(true)}
                                            className="px-4 hover:bg-green-500 hover:text-white text-green-400 transition-colors border-r border-white/10 flex items-center gap-1"
                                            title="Chấp nhận"
                                         >
                                            <span className="material-symbols-outlined">check</span>
                                            <span className="text-xs font-bold hidden md:inline">Chấp nhận</span>
                                         </button>
                                         <button 
                                            onClick={() => handleRespondFriendRequest(false)}
                                            className="px-4 hover:bg-red-500 hover:text-white text-red-400 transition-colors flex items-center gap-1"
                                            title="Từ chối"
                                         >
                                            <span className="material-symbols-outlined">close</span>
                                         </button>
                                    </div>
                                )}
                                
                                {friendRequestStatus === 'accepted' && (
                                    <div className="flex bg-green-500 rounded-full shadow-lg h-12 items-center overflow-hidden">
                                        <div className="px-4 py-2 text-black font-bold flex items-center gap-2 cursor-default">
                                            <span className="material-symbols-outlined">how_to_reg</span>
                                            <span>Bạn bè</span>
                                        </div>
                                        <button 
                                            onClick={handleUnfriend}
                                            className="h-full px-3 bg-green-600 hover:bg-red-500 hover:text-white text-black/50 transition-colors border-l border-black/10 flex items-center justify-center"
                                            title="Hủy kết bạn"
                                        >
                                            <span className="material-symbols-outlined text-lg">person_remove</span>
                                        </button>
                                    </div>
                                )}
                                
                                {friendRequestStatus === 'declined' && (
                                    <div className="px-4 py-2 bg-red-500/80 backdrop-blur-md rounded-full text-white font-medium text-sm flex items-center gap-2 h-12">
                                        <span className="material-symbols-outlined">person_off</span>
                                        <span>Đã từ chối</span>
                                    </div>
                                )}
                            </div>

                            {/* Next Stranger Button (Bottom Center) */}
                            <div className="absolute bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-max">
                                <button
                                    onClick={findNewStranger}
                                    className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-[#1e1e1e]/90 hover:bg-white text-white hover:text-black hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-md rounded-full transition-all duration-300 shadow-2xl group text-sm lg:text-base"
                                >
                                    <span className="font-bold tracking-wide">Next Person</span>
                                    <div className="bg-white/10 group-hover:bg-black/10 rounded-full p-1 -mr-2 transition-colors">
                                        <span className="material-symbols-outlined text-lg block">arrow_forward</span>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'disconnected' && (
                        <div className="z-10 text-center">
                            <p className="text-gray-400 mb-6 text-lg">{t('disconnected')}</p>
                            <button 
                                onClick={findNewStranger}
                                className="px-8 py-3 bg-primary text-black font-bold rounded-full hover:bg-primary-hover transition-transform active:scale-95 shadow-lg lg:text-lg"
                            >
                                Find New Stranger
                            </button>
                        </div>
                    )}
                </section>

                {/* Right Column: Chat Window (Narrower - 30% or 350px min) */}
                <aside className={`
                    w-full lg:w-[400px] border-l border-[#333] flex flex-col bg-[#111] shrink-0 z-20 shadow-2xl transition-all duration-300 overflow-hidden
                    ${mobileViewMode === 'split' ? 'flex-1 lg:flex-none lg:h-full' : ''}
                    ${mobileViewMode === 'video' ? 'h-0 hidden lg:flex lg:flex-none lg:h-full' : ''}
                    ${mobileViewMode === 'chat' ? 'h-full flex-1 lg:flex-none lg:h-auto' : ''}
                `}>
                     {/* Chat Header */}
                     <div className="h-10 lg:h-14 border-b border-[#333] flex items-center px-4 bg-[#151515] shrink-0 justify-between">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            <span className="font-medium text-sm text-gray-300">Live Chat</span>
                        </div>
                        
                        {/* Mobile View Controls (Chat) */}
                        <div className="lg:hidden flex gap-2">
                             {mobileViewMode === 'split' ? (
                                 <button onClick={() => setMobileViewMode('chat')} className="text-gray-400 hover:text-white p-1">
                                      <span className="material-symbols-outlined text-lg">fullscreen</span>
                                 </button>
                             ) : (
                                 <button onClick={() => setMobileViewMode('split')} className="text-gray-400 hover:text-white p-1">
                                      <span className="material-symbols-outlined text-lg">vertical_split</span>
                                 </button>
                             )}
                        </div>
                     </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                         {messages.length === 0 && status === 'connected' && (
                             <div className="text-center mt-10 opacity-30">
                                 <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                                 <p className="text-sm">Say hello!</p>
                             </div>
                         )}

                        {messages.map((msg, idx) => (
                             <div key={idx} className={`flex flex-col max-w-[90%] ${msg.isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl text-sm ${
                                    msg.isMe 
                                    ? 'bg-primary text-black rounded-tr-none' 
                                    : 'bg-[#2a2a2a] text-gray-200 rounded-tl-none'
                                }`}>
                                    {msg.type === 'audio' ? (
                                        <audio controls src={msg.text} className="w-[200px] h-8" />
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1 mx-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                        ))}

                        {/* Typing Indicator */}
                        {isPartnerTyping && (
                            <div className="flex flex-col max-w-[90%] self-start items-start animate-fade-in-up">
                                <div className="px-4 py-3 rounded-2xl text-sm bg-[#2a2a2a] text-gray-200 rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1 mx-1">Typing...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} /> 
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#151515] border-t border-[#333] sticky bottom-0 z-30">
                        <div className="relative flex items-center gap-2">
                            <input 
                                className="flex-1 bg-[#222] border border-[#333] rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary placeholder-gray-600" 
                                placeholder={isRecording ? "Recording..." : (status === 'connected' ? "Type a message..." : "Waiting...")}
                                type="text" 
                                value={inputText}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                disabled={status !== 'connected' || isRecording}
                            />
                            
                            {/* Voice Button */}
                            <button 
                                onClick={() => isRecording ? stopRecording() : startRecording()}
                                disabled={status !== 'connected'}
                                className={`p-2.5 rounded-full transition-colors flex items-center justify-center
                                    ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'}
                                `}
                                title={isRecording ? "Click to send" : "Click to record"}
                            >
                                <span className="material-symbols-outlined text-[20px] block">
                                    {isRecording ? 'send' : 'mic'}
                                </span>
                            </button>

                            <button 
                                onClick={handleSendMessage}
                                disabled={status !== 'connected' || !inputText.trim()}
                                className="p-2.5 bg-primary text-black rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px] block">send</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
{/* Stranger Profile Modal */}
            <StrangerProfileModal 
                isOpen={showStrangerProfile}
                onClose={() => setShowStrangerProfile(false)}
                user={{
                    id: partnerProfile?.id || partnerDbId || 'unknown',
                    username: partnerProfile?.username || 'stranger', 
                    displayName: partnerProfile?.displayName,
                    avatarUrl: partnerProfile?.avatarUrl,
                    bio: partnerProfile?.bio
                }}
            />
        </div>
  );
}
