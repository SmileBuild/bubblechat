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
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, ...updates } : session
    );
    this.saveSessions(updatedSessions);
    return updatedSessions;
  },

  deleteSession(sessions, sessionId) {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    this.saveSessions(updatedSessions);
    return updatedSessions;
  }
};
