const STORAGE_KEY = 'bubblechat-sessions';

export const sessionStorage = {
  loadSessions() {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY);
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  },

  saveSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  },

  updateSession(sessions, sessionId, updates) {
    try {
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex === -1) return null;

      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        ...updates
      };

      this.saveSessions(updatedSessions);
      return updatedSessions;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  },

  deleteSession(sessions, sessionId) {
    try {
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      this.saveSessions(updatedSessions);
      return updatedSessions;
    } catch (error) {
      console.error('Error deleting session:', error);
      return sessions;
    }
  }
};
