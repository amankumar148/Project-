// Path to your .NET Login API endpoint
const LOGIN_API_URL = 'http://localhost:5000/api/auth/login'; // Adjust port/URL as needed
const MAIN_PAGE_URL = 'index.html'; // Redirect upon successful login

$(document).ready(function() {
    // 1. Check if the user is already logged in (optional check, better handled by token validation)
    // If a token exists, redirect them to the main page to avoid re-logging in.
    const token = localStorage.getItem('jwtToken');
    if (token) {
        // Simple token presence check (better validation is on the server/on main page load)
        // window.location.href = MAIN_PAGE_URL;
        // return;
    }

    $('#loginForm').on('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const username = $('#username').val();
        const password = $('#password').val();

        // 2. Prepare the data payload
        const loginData = {
            Username: username,
            Password: password
        };

        // 3. Perform the AJAX POST request
        $.ajax({
            url: LOGIN_API_URL,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function(response) {
                // 4. Login Successful: Store JWT token and redirect
                if (response && response.token) {
                    // Store the JWT token in Local Storage
                    localStorage.setItem('jwtToken', response.token);
                    
                    // Redirect to the main page
                    window.location.href = MAIN_PAGE_URL;
                } else {
                    // Fallback for unexpected successful response without a token
                    showLoginError('Login failed due to a server error.');
                }
            },
            error: function(xhr) {
                // 5. Login Failed: Show SweetAlert
                let errorMessage = 'Invalid Username or Password.';
                
                // Check if the server provided a specific error message (e.g., status 401 Unauthorized)
                if (xhr.status === 401) {
                    errorMessage = 'Invalid Username or Password.';
                } else if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.status !== 0) {
                    errorMessage = `An unexpected error occurred (Status: ${xhr.status})`;
                }

                showLoginError(errorMessage);
            }
        });
    });
});

function showLoginError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message,
        confirmButtonColor: '#d33'
    });
}