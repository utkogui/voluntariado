import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar conversas');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(conversationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar mensagens');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, messageData }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(conversationId, messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao enviar mensagem');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (conversationData, { rejectWithValue }) => {
    try {
      const response = await chatService.createConversation(conversationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar conversa');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.markAsRead(conversationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao marcar como lida');
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
  onlineUsers: [],
  typingUsers: [],
  isConnected: false,
  searchResults: [],
  isSearching: false,
  selectedFiles: [],
  showEmojiPicker: false,
  showFileUpload: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update conversation last message
      const conversation = state.conversations.find(conv => conv.id === action.payload.conversationId);
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = action.payload.createdAt;
      }
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.find(user => user.id === action.payload.id)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(user => user.id !== action.payload);
    },
    setTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    addTypingUser: (state, action) => {
      if (!state.typingUsers.find(user => user.id === action.payload.id)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(user => user.id !== action.payload);
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    // Status de conexão
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    // Busca
    searchUsersStart: (state) => {
      state.isSearching = true;
      state.error = null;
    },
    searchUsersSuccess: (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload;
    },
    searchUsersFailure: (state, action) => {
      state.isSearching = false;
      state.error = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    // Anexos
    addSelectedFile: (state, action) => {
      state.selectedFiles.push(action.payload);
    },
    removeSelectedFile: (state, action) => {
      state.selectedFiles.splice(action.payload, 1);
    },
    clearSelectedFiles: (state) => {
      state.selectedFiles = [];
    },
    // UI
    toggleEmojiPicker: (state) => {
      state.showEmojiPicker = !state.showEmojiPicker;
    },
    setEmojiPicker: (state, action) => {
      state.showEmojiPicker = action.payload;
    },
    toggleFileUpload: (state) => {
      state.showFileUpload = !state.showFileUpload;
    },
    setFileUpload: (state, action) => {
      state.showFileUpload = action.payload;
    },
    // Mensagens
    updateMessageStatus: (state, action) => {
      const { messageId, status, timestamp } = action.payload;
      const message = state.messages.find(m => m.id === messageId);
      if (message) {
        message.status = status;
        if (timestamp) {
          message.updatedAt = timestamp;
        }
      }
    },
    editMessage: (state, action) => {
      const { messageId, content } = action.payload;
      const message = state.messages.find(m => m.id === messageId);
      if (message) {
        message.content = content;
        message.edited = true;
        message.updatedAt = new Date().toISOString();
      }
    },
    markAllAsRead: (state) => {
      state.messages.forEach(message => {
        message.read = true;
      });
      state.unreadCount = 0;
    },
    // Reset
    resetChat: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations || action.payload;
        state.unreadCount = action.payload.unreadCount || 0;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages || action.payload;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
        // Update conversation last message
        const conversation = state.conversations.find(conv => conv.id === action.payload.conversationId);
        if (conversation) {
          conversation.lastMessage = action.payload;
          conversation.updatedAt = action.payload.createdAt;
        }
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations.unshift(action.payload);
        state.error = null;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const conversation = state.conversations.find(conv => conv.id === action.payload.id);
        if (conversation) {
          conversation.unreadCount = 0;
        }
        state.error = null;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  updateMessage,
  deleteMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  updateUnreadCount,
  clearError,
  clearMessages,
  setConnectionStatus,
  searchUsersStart,
  searchUsersSuccess,
  searchUsersFailure,
  clearSearchResults,
  addSelectedFile,
  removeSelectedFile,
  clearSelectedFiles,
  toggleEmojiPicker,
  setEmojiPicker,
  toggleFileUpload,
  setFileUpload,
  updateMessageStatus,
  editMessage,
  markAllAsRead,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
