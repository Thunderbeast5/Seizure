import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

const SESSION_KEY = 'user_session';
const TOKEN_KEY = 'auth_token';
const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes

export interface SessionData {
  user: User;
  token: string;
  lastRefresh: number;
}

class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  // Save session data to local storage
  async saveSession(user: User, token: string): Promise<void> {
    try {
      const sessionData: SessionData = {
        user,
        token,
        lastRefresh: Date.now()
      };
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Start token refresh timer
      this.startTokenRefreshTimer();
      
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Get saved session data
  async getSession(): Promise<SessionData | null> {
    try {
      const sessionString = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionString) {
        const sessionData: SessionData = JSON.parse(sessionString);
        
        // Check if session is still valid (less than 1 hour old)
        const isValid = Date.now() - sessionData.lastRefresh < 60 * 60 * 1000;
        
        if (isValid) {
          return sessionData;
        } else {
          // Session expired, clear it
          await this.clearSession();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Clear session data
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      
      // Clear refresh timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      console.log('Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Update token
  async updateToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Update session data with new token
      const sessionString = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionString) {
        const sessionData: SessionData = JSON.parse(sessionString);
        sessionData.token = token;
        sessionData.lastRefresh = Date.now();
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      }
      
      console.log('Token updated successfully');
    } catch (error) {
      console.error('Error updating token:', error);
    }
  }

  // Start automatic token refresh
  private startTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(async () => {
      try {
        // This would typically call the auth context's refreshToken method
        console.log('Token refresh timer triggered');
      } catch (error) {
        console.error('Error in token refresh timer:', error);
      }
    }, REFRESH_INTERVAL);
  }

  // Check if session exists and is valid
  async hasValidSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }
}

export const sessionManager = new SessionManager();
