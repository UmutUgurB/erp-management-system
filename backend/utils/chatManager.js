const { logger } = require('./logger');

class ChatManager {
  constructor() {
    this.activeChats = new Map(); // chatId -> chatData
    this.agents = new Map(); // agentId -> agentData
    this.chatQueue = []; // waiting chats
    this.agentStatuses = new Map(); // agentId -> status
  }

  /**
   * Initialize chat manager with default agents
   */
  initialize() {
    // Add default agents
    this.addAgent({
      id: '1',
      name: 'Ayşe Demir',
      department: 'Müşteri Hizmetleri',
      status: 'online',
      rating: 4.8,
      maxChats: 3,
      currentChats: 0
    });

    this.addAgent({
      id: '2',
      name: 'Mehmet Kaya',
      department: 'Teknik Destek',
      status: 'online',
      rating: 4.6,
      maxChats: 2,
      currentChats: 0
    });

    this.addAgent({
      id: '3',
      name: 'Fatma Özkan',
      department: 'Satış Desteği',
      status: 'away',
      rating: 4.7,
      maxChats: 2,
      currentChats: 0
    });

    logger.info('Chat manager initialized with default agents');
  }

  /**
   * Add a new agent
   */
  addAgent(agentData) {
    this.agents.set(agentData.id, {
      ...agentData,
      currentChats: 0,
      lastActivity: new Date(),
      totalChats: 0,
      averageRating: agentData.rating || 0
    });
    this.agentStatuses.set(agentData.id, agentData.status);
    logger.info(`Agent added: ${agentData.name} (${agentData.department})`);
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId, status) {
    if (this.agents.has(agentId)) {
      this.agents.get(agentId).status = status;
      this.agentStatuses.set(agentId, status);
      logger.info(`Agent ${agentId} status updated to: ${status}`);
    }
  }

  /**
   * Get available agents
   */
  getAvailableAgents() {
    return Array.from(this.agents.values()).filter(agent => 
      agent.status === 'online' && agent.currentChats < agent.maxChats
    );
  }

  /**
   * Create a new chat session
   */
  createChat(userId, userInfo = {}) {
    const chatId = `chat_${Date.now()}_${userId}`;
    
    const chat = {
      id: chatId,
      userId,
      userInfo,
      status: 'waiting',
      createdAt: new Date(),
      agentId: null,
      messages: [],
      rating: null,
      feedback: null,
      lastActivity: new Date()
    };

    this.activeChats.set(chatId, chat);
    this.addToQueue(chatId);
    
    logger.info(`New chat created: ${chatId} for user: ${userId}`);
    return chat;
  }

  /**
   * Add chat to queue
   */
  addToQueue(chatId) {
    if (!this.chatQueue.includes(chatId)) {
      this.chatQueue.push(chatId);
      logger.info(`Chat ${chatId} added to queue. Queue length: ${this.chatQueue.length}`);
    }
  }

  /**
   * Assign chat to agent
   */
  assignChatToAgent(chatId, agentId) {
    const chat = this.activeChats.get(chatId);
    const agent = this.agents.get(agentId);

    if (!chat || !agent) {
      logger.error(`Failed to assign chat ${chatId} to agent ${agentId}: Not found`);
      return false;
    }

    if (agent.currentChats >= agent.maxChats) {
      logger.warn(`Agent ${agentId} is at max capacity`);
      return false;
    }

    // Remove from queue
    const queueIndex = this.chatQueue.indexOf(chatId);
    if (queueIndex > -1) {
      this.chatQueue.splice(queueIndex, 1);
    }

    // Assign chat
    chat.agentId = agentId;
    chat.status = 'active';
    chat.assignedAt = new Date();

    // Update agent stats
    agent.currentChats++;
    agent.totalChats++;
    agent.lastActivity = new Date();

    logger.info(`Chat ${chatId} assigned to agent ${agent.name}`);
    return true;
  }

  /**
   * Get next available agent for chat
   */
  getNextAvailableAgent() {
    const availableAgents = this.getAvailableAgents();
    
    if (availableAgents.length === 0) {
      return null;
    }

    // Sort by current chat load and rating
    availableAgents.sort((a, b) => {
      if (a.currentChats !== b.currentChats) {
        return a.currentChats - b.currentChats;
      }
      return b.rating - a.rating;
    });

    return availableAgents[0];
  }

  /**
   * Process chat queue
   */
  processQueue() {
    if (this.chatQueue.length === 0) {
      return;
    }

    const availableAgent = this.getNextAvailableAgent();
    if (!availableAgent) {
      logger.info('No available agents to process queue');
      return;
    }

    // Assign chats to available agent
    while (this.chatQueue.length > 0 && availableAgent.currentChats < availableAgent.maxChats) {
      const chatId = this.chatQueue.shift();
      if (chatId) {
        this.assignChatToAgent(chatId, availableAgent.id);
      }
    }
  }

  /**
   * Add message to chat
   */
  addMessage(chatId, message) {
    const chat = this.activeChats.get(chatId);
    if (!chat) {
      logger.error(`Chat not found: ${chatId}`);
      return false;
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
      status: 'sent',
      attachments: message.attachments || []
    };

    chat.messages.push(newMessage);
    chat.lastActivity = new Date();

    logger.info(`Message added to chat ${chatId}: ${message.sender} - ${message.text.substring(0, 50)}...`);
    return newMessage;
  }

  /**
   * End chat session
   */
  endChat(chatId, rating = null, feedback = null) {
    const chat = this.activeChats.get(chatId);
    if (!chat) {
      logger.error(`Chat not found: ${chatId}`);
      return false;
    }

    // Update chat
    chat.status = 'ended';
    chat.endedAt = new Date();
    chat.rating = rating;
    chat.feedback = feedback;

    // Update agent stats
    if (chat.agentId) {
      const agent = this.agents.get(chat.agentId);
      if (agent) {
        agent.currentChats = Math.max(0, agent.currentChats - 1);
        
        // Update average rating
        if (rating) {
          const totalRating = agent.averageRating * (agent.totalChats - 1) + rating;
          agent.averageRating = totalRating / agent.totalChats;
        }
      }
    }

    // Remove from active chats after some time
    setTimeout(() => {
      this.activeChats.delete(chatId);
      logger.info(`Chat ${chatId} removed from active chats`);
    }, 24 * 60 * 60 * 1000); // 24 hours

    logger.info(`Chat ${chatId} ended with rating: ${rating}`);
    return true;
  }

  /**
   * Get chat by ID
   */
  getChat(chatId) {
    return this.activeChats.get(chatId);
  }

  /**
   * Get user's active chat
   */
  getUserChat(userId) {
    for (const [chatId, chat] of this.activeChats) {
      if (chat.userId === userId && (chat.status === 'active' || chat.status === 'waiting')) {
        return chat;
      }
    }
    return null;
  }

  /**
   * Get agent's active chats
   */
  getAgentChats(agentId) {
    const chats = [];
    for (const [chatId, chat] of this.activeChats) {
      if (chat.agentId === agentId && chat.status === 'active') {
        chats.push(chat);
      }
    }
    return chats;
  }

  /**
   * Get chat statistics
   */
  getStats() {
    const stats = {
      totalActiveChats: 0,
      totalWaitingChats: 0,
      totalAgents: this.agents.size,
      onlineAgents: 0,
      averageResponseTime: 0,
      totalChatsToday: 0,
      averageRating: 0
    };

    let totalRating = 0;
    let ratedChats = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const chat of this.activeChats.values()) {
      if (chat.status === 'active') {
        stats.totalActiveChats++;
      } else if (chat.status === 'waiting') {
        stats.totalWaitingChats++;
      }

      if (chat.createdAt >= today) {
        stats.totalChatsToday++;
      }

      if (chat.rating) {
        totalRating += chat.rating;
        ratedChats++;
      }
    }

    for (const agent of this.agents.values()) {
      if (agent.status === 'online') {
        stats.onlineAgents++;
      }
    }

    if (ratedChats > 0) {
      stats.averageRating = totalRating / ratedChats;
    }

    return stats;
  }

  /**
   * Clean up old chats
   */
  cleanup() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days

    for (const [chatId, chat] of this.activeChats) {
      if (chat.status === 'ended' && chat.endedAt < cutoff) {
        this.activeChats.delete(chatId);
        logger.info(`Old chat cleaned up: ${chatId}`);
      }
    }
  }

  /**
   * Get chat history for user
   */
  getUserChatHistory(userId, limit = 10) {
    const history = [];
    for (const [chatId, chat] of this.activeChats) {
      if (chat.userId === userId && chat.status === 'ended') {
        history.push({
          id: chat.id,
          status: chat.status,
          createdAt: chat.createdAt,
          endedAt: chat.endedAt,
          agentName: chat.agentId ? this.agents.get(chat.agentId)?.name : null,
          rating: chat.rating,
          messageCount: chat.messages.length
        });
      }
    }

    return history
      .sort((a, b) => b.endedAt - a.endedAt)
      .slice(0, limit);
  }

  /**
   * Transfer chat to different agent
   */
  transferChat(chatId, newAgentId) {
    const chat = this.activeChats.get(chatId);
    const newAgent = this.agents.get(newAgentId);

    if (!chat || !newAgent) {
      logger.error(`Failed to transfer chat ${chatId}: Chat or agent not found`);
      return false;
    }

    if (newAgent.currentChats >= newAgent.maxChats) {
      logger.warn(`New agent ${newAgentId} is at max capacity`);
      return false;
    }

    // Remove from current agent
    if (chat.agentId) {
      const currentAgent = this.agents.get(chat.agentId);
      if (currentAgent) {
        currentAgent.currentChats = Math.max(0, currentAgent.currentChats - 1);
      }
    }

    // Assign to new agent
    chat.agentId = newAgentId;
    chat.transferredAt = new Date();
    newAgent.currentChats++;

    // Add transfer message
    this.addMessage(chatId, {
      text: `Sohbet ${newAgent.name} adlı temsilciye transfer edildi.`,
      sender: 'system',
      attachments: []
    });

    logger.info(`Chat ${chatId} transferred to agent ${newAgent.name}`);
    return true;
  }
}

module.exports = ChatManager;
