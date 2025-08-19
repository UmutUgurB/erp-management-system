'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreHorizontal,
  User,
  Bot,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Wifi,
  WifiOff
} from 'lucide-react';
import chatService, { ChatMessage, ChatStatus } from '@/lib/chatService';

interface ChatAgent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  department: string;
  rating: number;
}

interface ChatSupportProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

const ChatSupport: React.FC<ChatSupportProps> = ({ isOpen, onClose, onMinimize }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<ChatAgent | null>(null);
  const [chatStatus, setChatStatus] = useState<'connecting' | 'connected' | 'waiting' | 'ended'>('connecting');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [chatRating, setChatRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock agent data
  const mockAgent: ChatAgent = {
    id: '1',
    name: 'Ayşe Demir',
    avatar: '/api/avatars/ayse.jpg',
    status: 'online',
    department: 'Müşteri Hizmetleri',
    rating: 4.8
  };

  // Mock initial messages
  const initialMessages: ChatMessage[] = [
    {
      id: '1',
      text: 'Merhaba! ERP sistemimiz hakkında nasıl yardımcı olabilirim?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 60000),
      status: 'read'
    },
    {
      id: '2',
      text: 'Merhaba, ürün stok durumunu nasıl kontrol edebilirim?',
      sender: 'user',
      timestamp: new Date(Date.now() - 30000),
      status: 'read'
    },
    {
      id: '3',
      text: 'Ürün stok durumunu kontrol etmek için Dashboard > Inventory bölümüne gidebilir veya arama çubuğundan ürün adını yazabilirsiniz.',
      sender: 'agent',
      timestamp: new Date(Date.now() - 15000),
      status: 'read'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    } else {
      cleanupChat();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Connect to chat service
      await chatService.connect('user_' + Date.now(), 'user', {
        name: 'Dashboard User',
        email: 'user@example.com'
      });

      setConnectionStatus('connected');
      setChatStatus('connected');
      setCurrentAgent(mockAgent);
      setMessages(initialMessages);
      
      // Set up event listeners
      chatService.on('new_message', handleNewMessage);
      chatService.on('typing_start', handleTypingStart);
      chatService.on('typing_stop', handleTypingStop);
      chatService.on('chat_ended', handleChatEnded);
      chatService.on('error', handleError);
      chatService.on('disconnected', handleDisconnected);
      chatService.on('reconnect_failed', handleReconnectFailed);
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setConnectionStatus('disconnected');
      setChatStatus('ended');
    }
  };

  const cleanupChat = () => {
    // Remove event listeners
    chatService.off('new_message', handleNewMessage);
    chatService.off('typing_start', handleTypingStart);
    chatService.off('typing_stop', handleTypingStop);
    chatService.off('chat_ended', handleChatEnded);
    chatService.off('error', handleError);
    chatService.off('disconnected', handleDisconnected);
    chatService.off('reconnect_failed', handleReconnectFailed);
    
    // Disconnect if chat is ended
    if (chatStatus === 'ended') {
      chatService.disconnect();
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleTypingStart = (data: any) => {
    if (data.userType === 'agent') {
      setAgentTyping(true);
    }
  };

  const handleTypingStop = (data: any) => {
    if (data.userType === 'agent') {
      setAgentTyping(false);
    }
  };

  const handleChatEnded = (chatId: string) => {
    setChatStatus('ended');
    setShowRating(true);
  };

  const handleError = (error: string) => {
    console.error('Chat error:', error);
    
    // Show user-friendly error message
    if (error.includes('HTML instead of WebSocket data')) {
      setConnectionStatus('disconnected');
      setChatStatus('ended');
      // You could show a toast notification here
    }
  };

  const handleDisconnected = () => {
    setConnectionStatus('disconnected');
    setChatStatus('ended');
  };

  const handleReconnectFailed = () => {
    setConnectionStatus('disconnected');
    setChatStatus('ended');
    // You could show a toast notification here
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(false);

    try {
      // Send message through chat service
      chatService.sendChatMessage(inputText);
      
      // Update message status to sent
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
          )
        );
      }, 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Handle typing indicators
    if (!isTyping) {
      setIsTyping(true);
      chatService.startTyping();
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      chatService.stopTyping();
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const attachment = {
        type: file.type.startsWith('image/') ? 'image' : 'file' as const,
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024).toFixed(1)} KB`
      };

      const message: ChatMessage = {
        id: Date.now().toString(),
        text: `Dosya eklendi: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
        attachments: [attachment]
      };

      setMessages(prev => [...prev, message]);
      
      // Send file through chat service
      chatService.sendChatMessage(`Dosya eklendi: ${file.name}`, [attachment]);
    }
  };

  const handleRating = (rating: number) => {
    setChatRating(rating);
    setShowRating(false);
    
    // End chat with rating
    chatService.endChat(rating, 'User provided rating');
  };

  const endChat = () => {
    chatService.endChat();
    setChatStatus('ended');
    setShowRating(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-600" />;
      default: return null;
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(currentAgent?.status || 'offline')} rounded-full border-2 border-white`} />
          </div>
          <div>
            <h3 className="font-medium">Canlı Destek</h3>
            <p className="text-xs opacity-90">
              {currentAgent ? currentAgent.name : 'Bağlanıyor...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-1 px-2 py-1 bg-white/20 rounded">
            {getConnectionStatusIcon()}
            <span className="text-xs">
              {connectionStatus === 'connected' && 'Bağlı'}
              {connectionStatus === 'connecting' && 'Bağlanıyor'}
              {connectionStatus === 'disconnected' && 'Bağlantı Yok'}
            </span>
          </div>
          
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Küçült"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Status */}
      {chatStatus === 'connecting' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm">Destek temsilcisi aranıyor...</span>
          </div>
        </div>
      )}

      {chatStatus === 'waiting' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm">Sırada bekleniyor...</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-end space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {message.sender === 'agent' && (
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                
                <div className={`px-3 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.sender === 'agent'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.map((attachment, index) => (
                    <div key={index} className="mt-2 p-2 bg-white/20 rounded">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs">{attachment.name}</span>
                        {attachment.size && (
                          <span className="text-xs opacity-75">({attachment.size})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {message.sender === 'user' && (
                  <div className="flex items-center space-x-1">
                    {getMessageStatusIcon(message.status)}
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-gray-500 mt-1 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {agentTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-end space-x-2">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Dosya Ekle"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || connectionStatus !== 'connected'}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Gönder"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Attachment Menu */}
        <AnimatePresence>
          {showAttachmentMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Paperclip className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Dosya Ekle</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Sesli Arama">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Görüntülü Arama">
              <Video className="w-4 h-4" />
            </button>
          </div>
          
          {chatStatus === 'connected' && (
            <button
              onClick={endChat}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Sohbeti Bitir
            </button>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
            >
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Sohbeti Değerlendirin
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Size nasıl yardımcı olduk? Deneyiminizi değerlendirin.
                </p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`p-1 transition-colors ${
                        chatRating && chatRating >= star
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-6 h-6" fill={chatRating && chatRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">İyi</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm">Kötü</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatSupport;
