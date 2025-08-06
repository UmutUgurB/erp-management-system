'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Mic, 
  MicOff, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface AIInsight {
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'general';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  data?: any;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: 'Merhaba! Ben ERP sisteminizin AI asistanıyım. Size nasıl yardımcı olabilirim?',
          timestamp: new Date(),
          suggestions: [
            'Satış raporu oluştur',
            'Stok durumunu kontrol et',
            'Müşteri analizi yap',
            'Finansal özet göster'
          ]
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await generateAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        data: response.data
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate insights if relevant
      if (response.insights) {
        setInsights(prev => [...prev, ...response.insights]);
      }

    } catch (error) {
      addNotification('error', 'Hata!', 'AI asistanına ulaşılamıyor.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (input: string): Promise<any> => {
    // Mock AI responses based on input keywords
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('satış') || lowerInput.includes('rapor')) {
      return {
        content: 'Satış raporunuzu hazırlıyorum. Son 30 günde toplam 45,000₺ satış gerçekleşti. En çok satan ürünler: Laptop (%25), Mouse (%18), Keyboard (%15).',
        suggestions: ['Detaylı analiz göster', 'Trend grafiği oluştur', 'Hedef karşılaştırması yap'],
        insights: [{
          type: 'sales',
          title: 'Satış Artışı',
          description: 'Geçen aya göre %12 artış var',
          confidence: 0.85
        }]
      };
    }
    
    if (lowerInput.includes('stok') || lowerInput.includes('envanter')) {
      return {
        content: 'Stok durumu: 5 ürün kritik seviyede, 12 ürün düşük stokta. Toplam envanter değeri: 125,000₺. Önerilen siparişler hazır.',
        suggestions: ['Kritik stokları göster', 'Sipariş önerilerini incele', 'Tedarikçi bilgilerini getir'],
        insights: [{
          type: 'inventory',
          title: 'Stok Uyarısı',
          description: '3 ürün için acil sipariş gerekli',
          confidence: 0.92
        }]
      };
    }
    
    if (lowerInput.includes('müşteri') || lowerInput.includes('analiz')) {
      return {
        content: 'Müşteri analizi: 156 aktif müşteri, ortalama sipariş değeri 850₺. En değerli müşteri segmenti: Kurumsal (%40). Müşteri memnuniyeti: %87.',
        suggestions: ['Müşteri segmentasyonu', 'Loyalty programı önerisi', 'Churn analizi'],
        insights: [{
          type: 'customer',
          title: 'Müşteri Fırsatı',
          description: '15 müşteri için cross-selling fırsatı',
          confidence: 0.78
        }]
      };
    }
    
    if (lowerInput.includes('finans') || lowerInput.includes('para')) {
      return {
        content: 'Finansal özet: Bu ay gelir 67,000₺, gider 42,000₺, net kar 25,000₺. Nakit akışı pozitif. En büyük gider kalemi: Tedarik (%35).',
        suggestions: ['Detaylı finansal rapor', 'Kar marjı analizi', 'Bütçe planlaması'],
        insights: [{
          type: 'financial',
          title: 'Kar Artışı',
          description: 'Geçen aya göre %8 kar artışı',
          confidence: 0.89
        }]
      };
    }

    // Default response
    return {
      content: 'Anlıyorum. Size daha iyi yardımcı olabilmem için daha spesifik bir soru sorabilir misiniz? Satış, stok, müşteri veya finansal konularda bilgi verebilirim.',
      suggestions: ['Satış raporu oluştur', 'Stok durumunu kontrol et', 'Müşteri analizi yap', 'Finansal özet göster']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setInputValue('Stok durumunu kontrol et');
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleInsightAction = (insight: AIInsight) => {
    addNotification('info', 'AI Önerisi', `${insight.title}: ${insight.description}`);
    // Handle specific actions based on insight type
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <Bot className="w-6 h-6" />
        {insights.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {insights.length}
          </span>
        )}
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-end p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl w-full max-w-md h-96 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Asistan</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ERP Sistemi</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.suggestions && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Panel */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Öngörüleri</h3>
            </div>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInsightAction(insight)}
                    className="ml-2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
} 