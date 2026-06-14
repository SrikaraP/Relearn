import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Load from local storage
  const loadFromStorage = () => {
    let storedUsers = JSON.parse(localStorage.getItem('relearn_users') || '[]');
    const storedCurrentUser = JSON.parse(localStorage.getItem('relearn_current_user') || 'null');
    
    // Seed default users if they don't exist so that testing across isolated tabs/incognito works
    const defaultTeacher = {
      id: 't1', role: 'teacher', username: 'mr_smith', email: 'smith@school.edu', password: 'password',
      linkedIds: [], incomingRequests: [], outgoingRequests: [], supportMessages: [], onboardingComplete: true, profile: {}
    };
    const defaultParent = {
      id: 'p1', role: 'parent', username: 'jane_parent', email: 'jane@family.com', password: 'password',
      linkedIds: [], incomingRequests: [], outgoingRequests: [], supportMessages: [], onboardingComplete: true, profile: {}
    };

    if (!storedUsers.some(u => u.username === 'mr_smith')) storedUsers.push(defaultTeacher);
    if (!storedUsers.some(u => u.username === 'jane_parent')) storedUsers.push(defaultParent);
    
    localStorage.setItem('relearn_users', JSON.stringify(storedUsers));

    setUsers(storedUsers);
    if (storedCurrentUser) {
      // Refresh current user data from the DB to ensure fresh links and profile
      const freshUser = storedUsers.find(u => u.id === storedCurrentUser.id);
      if (freshUser) setUser(freshUser);
    } else {
      setUser(null);
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    loadFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === 'relearn_users' || e.key === 'relearn_current_user') {
        loadFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to local storage whenever users or current user changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('relearn_users', JSON.stringify(users));
    }
    if (user) {
      localStorage.setItem('relearn_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('relearn_current_user');
    }
  }, [users, user]);

  const register = (role, username, email, password) => {
    const emailExists = users.some(u => u.email === email);
    const usernameExists = users.some(u => u.username === username);

    if (emailExists) return { success: false, message: 'Email is already registered.' };
    if (usernameExists) return { success: false, message: 'Username is already taken.' };

    const newUser = {
      id: Date.now().toString(),
      role,
      username,
      email,
      password,
      linkedIds: [], // Array of linked user IDs
      incomingRequests: [], // { fromId, fromUsername, fromRole }
      outgoingRequests: [], // { toId, toUsername }
      supportMessages: [], // { fromUsername, message, date }
      onboardingComplete: false,
      profile: {} // Stores grade, interests, etc.
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const login = (email, password) => {
    const existingUser = users.find(u => u.email === email && u.password === password);
    if (existingUser) {
      setUser(existingUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const logout = () => {
    localStorage.removeItem('relearn_current_user');
    setUser(null);
  };

  const updateProfile = (profileData) => {
    if (!user) return;
    const updatedUser = { 
      ...user, 
      profile: { ...user.profile, ...profileData },
      onboardingComplete: true
    };
    
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    setUser(updatedUser);
  };

  const sendLinkRequest = (targetUsername) => {
    const targetUser = users.find(u => u.username === targetUsername);
    if (!targetUser) return { success: false, message: 'User not found.' };
    if (targetUser.id === user.id) return { success: false, message: 'Cannot link to yourself.' };
    if (user.linkedIds.includes(targetUser.id)) return { success: false, message: 'User already linked.' };
    
    if (targetUser.incomingRequests.some(req => req.fromId === user.id)) {
      return { success: false, message: 'Request already sent.' };
    }

    const request = { 
      fromId: user.id, 
      fromUsername: user.username, 
      fromRole: user.role,
      profile: user.profile,
      email: user.email,
      date: new Date().toISOString()
    };
    
    setUsers(users.map(u => {
      if (u.id === targetUser.id) {
        return { ...u, incomingRequests: [...u.incomingRequests, request] };
      }
      if (u.id === user.id) {
        return { ...u, outgoingRequests: [...(u.outgoingRequests || []), { toId: targetUser.id, toUsername: targetUser.username }] };
      }
      return u;
    }));
    
    // Immediately update local user state
    setUser(prev => ({
      ...prev,
      outgoingRequests: [...(prev.outgoingRequests || []), { toId: targetUser.id, toUsername: targetUser.username }]
    }));
    
    return { success: true, message: `Request sent to ${targetUsername}` };
  };

  const respondToRequest = (fromId, accept) => {
    if (!user) return;

    let updatedUsers = [...users];
    
    // Remove request from current user
    const currentUserIndex = updatedUsers.findIndex(u => u.id === user.id);
    const updatedCurrentUser = { ...updatedUsers[currentUserIndex] };
    updatedCurrentUser.incomingRequests = updatedCurrentUser.incomingRequests.filter(req => req.fromId !== fromId);

    if (accept) {
      updatedCurrentUser.linkedIds = [...updatedCurrentUser.linkedIds, fromId];
      // Add to the other user's linkedIds and remove their outgoing request
      const otherUserIndex = updatedUsers.findIndex(u => u.id === fromId);
      if (otherUserIndex !== -1) {
         updatedUsers[otherUserIndex] = {
           ...updatedUsers[otherUserIndex],
           linkedIds: [...updatedUsers[otherUserIndex].linkedIds, user.id],
           outgoingRequests: (updatedUsers[otherUserIndex].outgoingRequests || []).filter(req => req.toId !== user.id)
         };
      }
    } else {
      // Just remove the outgoing request from the other user
      const otherUserIndex = updatedUsers.findIndex(u => u.id === fromId);
      if (otherUserIndex !== -1) {
         updatedUsers[otherUserIndex] = {
           ...updatedUsers[otherUserIndex],
           outgoingRequests: (updatedUsers[otherUserIndex].outgoingRequests || []).filter(req => req.toId !== user.id)
         };
      }
    }

    updatedUsers[currentUserIndex] = updatedCurrentUser;
    setUsers(updatedUsers);
    setUser(updatedCurrentUser);
  };

  const getLinkedUsers = () => {
    if (!user) return [];
    return users.filter(u => user.linkedIds.includes(u.id));
  };

  const getAllTeachers = () => {
    return users.filter(u => u.role === 'teacher').map(t => ({
      id: t.id,
      username: t.username,
      email: t.email,
      profile: t.profile
    }));
  };

  const getAllParents = () => {
    return users.filter(u => u.role === 'parent').map(p => ({
      id: p.id,
      username: p.username,
      email: p.email,
      profile: p.profile
    }));
  };

  const sendSupportMessage = (childId, message) => {
    setUsers(users.map(u => {
      if (u.id === childId) {
        return {
          ...u,
          supportMessages: [...(u.supportMessages || []), {
            fromUsername: user.username,
            message,
            date: new Date().toISOString()
          }]
        };
      }
      return u;
    }));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      register, 
      login, 
      logout, 
      updateProfile,
      sendLinkRequest,
      respondToRequest, 
      getLinkedUsers, 
      getAllTeachers,
      getAllParents,
      sendSupportMessage,
      users 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
