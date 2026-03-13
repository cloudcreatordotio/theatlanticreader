import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SessionState {
  authToken: string | null;
  refreshToken: string | null;
  userId: string | null;
}

const initialState: SessionState = {
  // Pre-populated for development — simulates logged-in user
  authToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTcwOTI1MTIwMH0.mock-signature',
  refreshToken: 'rt_8f7e6d5c4b3a2190',
  userId: 'user-123',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setTokens(
      state,
      action: PayloadAction<{authToken: string; refreshToken: string}>,
    ) {
      state.authToken = action.payload.authToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearSession(state) {
      state.authToken = null;
      state.refreshToken = null;
      state.userId = null;
    },
  },
});

export const {setTokens, clearSession} = sessionSlice.actions;
export default sessionSlice.reducer;
