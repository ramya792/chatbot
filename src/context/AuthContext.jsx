import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user on load
    const userStr = localStorage.getItem('interviewVerse_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      // Mock logic: check if user exists in local storage list
      const usersStr = localStorage.getItem('interviewVerse_users') || '[]';
      const users = JSON.parse(usersStr);
      const user = users.find(u => 
        u.name.toLowerCase().trim() === username.toLowerCase().trim() && 
        u.password === password
      );

      if (user) {
        // Create session
        const sessionUser = { id: user.id, name: user.name };
        localStorage.setItem('interviewVerse_user', JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);
        resolve(sessionUser);
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  };

  const register = (username, password) => {
    return new Promise((resolve, reject) => {
      const usersStr = localStorage.getItem('interviewVerse_users') || '[]';
      const users = JSON.parse(usersStr);

      if (users.find(u => u.name.toLowerCase().trim() === username.toLowerCase().trim())) {
        reject(new Error('Username already exists'));
        return;
      }

      const newUser = { id: Date.now().toString(), name: username.trim(), password };
      users.push(newUser);
      localStorage.setItem('interviewVerse_users', JSON.stringify(users));

      // Auto login after register
      const sessionUser = { id: newUser.id, name: newUser.name };
      localStorage.setItem('interviewVerse_user', JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      resolve(sessionUser);
    });
  };

  const logout = () => {
    localStorage.removeItem('interviewVerse_user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
