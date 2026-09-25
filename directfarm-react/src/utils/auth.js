const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const LOGIN_TIME_KEY = 'loginTime';
const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const authUtils = {
    // Set authentication data
    setAuth: (token, user) => {
        // Use sessionStorage instead of Cookies/localStorage to isolate session to this tab
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        sessionStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());

        // Dispatch event for UI updates within the SAME tab
        window.dispatchEvent(new Event('userChanged'));
    },

    // Get authentication data
    getAuth: () => {
        const token = sessionStorage.getItem(TOKEN_KEY);
        const storedUser = sessionStorage.getItem(USER_KEY);
        const loginTime = sessionStorage.getItem(LOGIN_TIME_KEY);

        // If no token or no user data, return null
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
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(LOGIN_TIME_KEY);

        // Dispatch event for UI updates within the SAME tab
        window.dispatchEvent(new Event('userChanged'));
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!authUtils.getAuth();
    },

    // Update user data without changing token/session
    updateUser: (user) => {
        if (authUtils.isAuthenticated()) {
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
            window.dispatchEvent(new Event('userChanged'));
        }
    }
};

export default authUtils;
