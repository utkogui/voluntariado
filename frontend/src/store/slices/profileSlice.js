import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileService from '../../services/profileService';

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar perfil');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(userId, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const response = await profileService.uploadAvatar(userId, file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao fazer upload do avatar');
    }
  }
);

export const fetchUserSkills = createAsyncThunk(
  'profile/fetchUserSkills',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileService.getUserSkills(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar habilidades');
    }
  }
);

export const updateUserSkills = createAsyncThunk(
  'profile/updateUserSkills',
  async ({ userId, skills }, { rejectWithValue }) => {
    try {
      const response = await profileService.updateUserSkills(userId, skills);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar habilidades');
    }
  }
);

export const fetchUserInterests = createAsyncThunk(
  'profile/fetchUserInterests',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileService.getUserInterests(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar interesses');
    }
  }
);

export const updateUserInterests = createAsyncThunk(
  'profile/updateUserInterests',
  async ({ userId, interests }, { rejectWithValue }) => {
    try {
      const response = await profileService.updateUserInterests(userId, interests);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar interesses');
    }
  }
);

export const fetchUserAvailability = createAsyncThunk(
  'profile/fetchUserAvailability',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileService.getUserAvailability(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar disponibilidade');
    }
  }
);

export const updateUserAvailability = createAsyncThunk(
  'profile/updateUserAvailability',
  async ({ userId, availability }, { rejectWithValue }) => {
    try {
      const response = await profileService.updateUserAvailability(userId, availability);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar disponibilidade');
    }
  }
);

const initialState = {
  profile: null,
  skills: [],
  interests: [],
  availability: null,
  isLoading: false,
  error: null,
  isEditing: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.skills = [];
      state.interests = [];
      state.availability = null;
      state.isEditing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.isEditing = false;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.profilePicture = action.payload.profilePicture;
        }
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch User Skills
      .addCase(fetchUserSkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills = action.payload;
        state.error = null;
      })
      .addCase(fetchUserSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update User Skills
      .addCase(updateUserSkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills = action.payload;
        state.error = null;
      })
      .addCase(updateUserSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch User Interests
      .addCase(fetchUserInterests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserInterests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interests = action.payload;
        state.error = null;
      })
      .addCase(fetchUserInterests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update User Interests
      .addCase(updateUserInterests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserInterests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interests = action.payload;
        state.error = null;
      })
      .addCase(updateUserInterests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch User Availability
      .addCase(fetchUserAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update User Availability
      .addCase(updateUserAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(updateUserAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setEditing,
  clearError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
