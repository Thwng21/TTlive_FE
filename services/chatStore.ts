// Simple subscriber pattern for global state
type Listener = () => void;
type Message = {
    senderId: string;
    originalText: string; // Store original text
    text: string;         // Store displayed text (translated or not)
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    timestamp: Date;
    isMe: boolean;
};

class ChatStore {
    status: 'idle' | 'searching' | 'connected' | 'disconnected' = 'searching';
    messages: Message[] = [];
    roomId: string | null = null;
    listeners: Listener[] = [];
    currentLocale: string = 'en'; // Track current locale
    
    // Persist input across reloads/navs if needed (optional)
    inputText: string = '';

    subscribe(listener: Listener) {
        this.listeners.push(listener);
        return () => {
             this.listeners = this.listeners.filter(l => l !== listener);
        }
    }

    notify() {
        this.listeners.forEach(l => l());
    }

    setStatus(status: 'idle' | 'searching' | 'connected' | 'disconnected') {
        this.status = status;
        this.notify();
    }

    setRoomId(id: string | null) {
        this.roomId = id;
        this.notify();
    }

    reset() {
        this.status = 'idle';
        this.messages = [];
        this.roomId = null;
        this.notify();
    }

    addMessage(msg: Message) {
        // Apply current locale translation if needed immediately
        if (!msg.isMe) {
            msg.text = this.mockTranslate(msg.originalText, this.currentLocale);
        }
        
        this.messages = [...this.messages, msg];
        this.notify();
    }

    setMessages(msgs: Message[]) {
        this.messages = msgs;
        this.notify();
    }
    
    // Removed duplicate reset
    
    // New: Handle Language Change
    setLocale(locale: string) {
        if (this.currentLocale === locale) return;
        this.currentLocale = locale;
        this.retranslateAll();
    }

    private retranslateAll() {
        this.messages = this.messages.map(msg => {
            if (msg.isMe) return msg; // Don't translate my own messages (optional)
            
            return {
                ...msg,
                text: this.mockTranslate(msg.originalText, this.currentLocale)
            };
        });
        this.notify();
    }

    private mockTranslate(text: string, targetLocale: string): string {
        // Mock Translation Logic - Expand as needed
        if (targetLocale === 'vi') {
             if (/hello|hi/i.test(text)) return `${text} (Dịch: Xin chào)`;
             if (/how are you/i.test(text)) return `${text} (Dịch: Bạn khỏe không?)`;
             if (/nice to meet you/i.test(text)) return `${text} (Dịch: Rất vui được gặp bạn)`;
        } 
        else if (targetLocale === 'en') {
             if (/xin chao|xin chào|lô/i.test(text)) return `${text} (Trans: Hello)`;
             if (/khoe khong|khỏe không/i.test(text)) return `${text} (Trans: How are you?)`;
        }
        else if (targetLocale === 'zh') {
             if (/hello|hi/i.test(text)) return `${text} (翻译: 你好)`;
             if (/xin chao/i.test(text)) return `${text} (翻译: 你好)`;
        }
        
        return text;
    }
}

export const chatStore = new ChatStore();
