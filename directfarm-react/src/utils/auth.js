import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const LOGIN_TIME_KEY = 'loginTime';
const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const authUtils = {
    // Set authentication data
    setAuth: (token, user) => {
        // Set token in session cookie (no expires option means it's a session cookie)
        Cookies.set(TOKEN_KEY, token);

        // Set user data and login time in localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());

        // Dispatch event for UI updates
        window.dispatchEvent(new Event('userChanged'));
        window.dispatchEvent(new Event('storage'));
    },

    // Get authentication data
    getAuth: () => {
        const token = Cookies.get(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const loginTime = localStorage.getItem(LOGIN_TIME_KEY);

        // If no token (browser closed) or no user data, return null
        if (!token || !storedUser || !loginTime) {
            return null;
        }

        // Check if session has expired (3 hours)
        const now = Date.now();
        if (now - parseInt(loginTime) > SESSION_DURATION) {
            authUtils.clearAuth(); // Clear expired session
            return null;
        }

        try {
            return {
                token,
                user: JSON.parse(storedUser)
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
            authUtils.clearAuth();
            return null;
        }
    },

    // Get just the token (for API requests)
    getToken: () => {
        const auth = authUtils.getAuth();
        return auth ? auth.token : null;
    },

    // Get just the user (for UI)
    getUser: () => {
        const auth = authUtils.getAuth();
        return auth ? auth.user : null;
    },

    // Clear authentication data (logout)
    clearAuth: () => {
        Cookies.remove(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LOGIN_TIME_KEY);

        // Dispatch event for UI updates
        window.dispatchEvent(new Event('userChanged'));
        window.dispatchEvent(new Event('storage'));
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!authUtils.getAuth();
    },

    // Update user data without changing token/session
    updateUser: (user) => {
        if (authUtils.isAuthenticated()) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            window.dispatchEvent(new Event('userChanged'));
            window.dispatchEvent(new Event('storage'));
        }
    }
};

export default authUtils;
