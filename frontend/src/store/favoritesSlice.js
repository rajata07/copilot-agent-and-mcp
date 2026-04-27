import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (token) => {
  const res = await fetch('http://localhost:4000/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async ({ token, bookId }) => {
  await fetch('http://localhost:4000/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });
  return bookId;
});

// generated-by-copilot: thunk to remove a book from favorites
export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async ({ token, bookId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:4000/api/favorites/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        return rejectWithValue('Failed to remove favorite');
      }
      return bookId;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [], status: 'idle', removeStatus: 'idle', removeError: null, lastRemoved: null },
  reducers: {
    clearRemoveStatus(state) {
      state.removeStatus = 'idle';
      state.removeError = null;
      state.lastRemoved = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => { state.status = 'loading'; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, state => { state.status = 'failed'; })
      .addCase(addFavorite.fulfilled, (state, action) => {
        // After adding, fetch the updated favorites list to ensure UI is in sync
      })
      // generated-by-copilot: handle remove favorite lifecycle for immediate UI feedback
      .addCase(removeFavorite.pending, state => {
        state.removeStatus = 'loading';
        state.removeError = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.removeStatus = 'succeeded';
        state.items = state.items.filter(b => b.id !== action.payload);
        state.lastRemoved = action.payload;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.removeStatus = 'failed';
        state.removeError = action.payload || 'Failed to remove favorite';
      });
  },
});

export const { clearRemoveStatus } = favoritesSlice.actions;
export default favoritesSlice.reducer;
