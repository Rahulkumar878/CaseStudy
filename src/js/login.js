document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const userTypeSelect = document.getElementById('userType');

    // Error display elements
    const userIdError = document.getElementById('userIdError');
    const passwordError = document.getElementById('passwordError');
    const userTypeError = document.getElementById('userTypeError');

    // Validation patterns
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{1,30}$/;

    // Input validation functions
    function validateUserId() {
        const value = userIdInput.value.trim();
        if (value.length === 0) {
            userIdError.textContent = 'User ID is required';
            userIdInput.classList.add('invalid');
            return false;
        } else if (value.length < 5 || value.length > 20) {
            userIdError.textContent = 'User ID must be between 5 and 20 characters';
            userIdInput.classList.add('invalid');
            return false;
        }
        userIdError.textContent = '';
        userIdInput.classList.remove('invalid');
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (value.length === 0) {
            passwordError.textContent = 'Password is required';
            passwordInput.classList.add('invalid');
            return false;
        } else if (!passwordPattern.test(value)) {
            passwordError.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, and one special character';
            passwordInput.classList.add('invalid');
            return false;
        }
        passwordError.textContent = '';
        passwordInput.classList.remove('invalid');
        return true;
    }

    function validateUserType() {
        if (!userTypeSelect.value) {
            userTypeError.textContent = 'Please select a user type';
            userTypeSelect.classList.add('invalid');
            return false;
        }
        userTypeError.textContent = '';
        userTypeSelect.classList.remove('invalid');
        return true;
    }

    // Real-time validation
    userIdInput.addEventListener('input', validateUserId);
    passwordInput.addEventListener('input', validatePassword);
    userTypeSelect.addEventListener('change', validateUserType);

    // Form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields
        const isUserIdValid = validateUserId();
        const isPasswordValid = validatePassword();
        const isUserTypeValid = validateUserType();

        if (isUserIdValid && isPasswordValid && isUserTypeValid) {
            // In a real application, you would make an API call here
            // For demo purposes, we'll simulate a successful login
            const userType = userTypeSelect.value;
            const userId = userIdInput.value;

            // Store user information in sessionStorage
            sessionStorage.setItem('userType', userType);
            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('isLoggedIn', 'true');

            // Redirect to appropriate dashboard
            // window.location.href = `../components/${userType}-dashboard.html`;
            if (userType === 'customer') {
                window.location.href = '../components/customer-dashboard.html';
            }
            else if (userType === 'officer') {
                window.location.href = '../components/officer-dashboard.html';
            }
        }
    });
});
