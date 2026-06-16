import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('vs_token') || null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('vs_token', action.payload.token);
      const loginUser = action.payload.user;
      return {
        ...state,
        user: loginUser ? { ...loginUser, id: loginUser.id || loginUser._id } : null,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('vs_token');
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'SET_USER':
      const loadedUser = action.payload;
      return {
        ...state,
        user: loadedUser ? { ...loadedUser, id: loadedUser.id || loadedUser._id } : null,
        isAuthenticated: true,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      const updatedUser = { ...state.user, ...action.payload };
      return { ...state, user: { ...updatedUser, id: updatedUser.id || updatedUser._id } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('vs_token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const res = await api.get('/auth/me');
        dispatch({ type: 'SET_USER', payload: res.data.user });
      } catch {
        localStorage.removeItem('vs_token');
        dispatch({ type: 'LOGOUT' });
      }
    };
    loadUser();
  }, []);

  const login = (token, user) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
