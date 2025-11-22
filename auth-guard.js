// js/auth-guard.js
(function() {
    const LOGIN_PAGE_URL = 'login.html';
    const token = localStorage.getItem('jwtToken');

    // If the token is missing, redirect to the login page immediately.
    if (!token) {
        // Check if we are already on the login page to prevent an infinite loop.
        if (!window.location.href.includes(LOGIN_PAGE_URL)) {
            window.location.replace(LOGIN_PAGE_URL);
        }
    } else {
        // Optional: Perform a silent check with the backend to validate the token's expiry/validity
        // For a full implementation, you would need an AJAX call here (e.g., /api/auth/validate)
        // that returns 200 OK if valid, or 401 Unauthorized if expired/invalid.
        // For this task, a simple check for token presence is sufficient for the client-side guard.
    }
})();