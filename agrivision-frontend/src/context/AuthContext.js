import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
            try {
                setCurrentUser(JSON.parse(userInfo));
            } catch (error) {
                console.error('Error parsing user info:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        // Automatically log in without validation
        const mockUser = { 
            username: username || 'User', 
            email: 'user@example.com',
            id: 1 
        };
        const mockToken = 'demo-token-123';

        // Store token and user info
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userInfo', JSON.stringify(mockUser));
        
        setCurrentUser(mockUser);
        toast.success('Logged in successfully');
        return { user: mockUser, token: mockToken };
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            // Optional: Call Django logout endpoint
            if (token) {
                await fetch('http://localhost:8000/api/logout/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                }).catch(err => console.error('Logout API error:', err));
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local storage and state
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            setCurrentUser(null);
            toast.success('Logged out successfully');
        }
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('authToken');
    };

    const value = {
        currentUser,
        login,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
