document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{1,30}$/;

    function showSuccess(message) {
        const container = document.createElement('div');
        container.className = 'success-message';
        container.innerHTML = `
            <h3>Registration Successful!</h3>
            <p>${message}</p>
            <p>You will be redirected to login page in 5 seconds...</p>
        `;
        document.querySelector('.form-container').innerHTML = '';
        document.querySelector('.form-container').appendChild(container);
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 5000);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic validation
        const userId = document.getElementById('newUserId').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const customerName = document.getElementById('customerName').value;
        const email = document.getElementById('email').value;
        
        // Reset all error messages
        document.querySelectorAll('.error').forEach(error => error.textContent = '');
        
        let isValid = true;

        // Validate User ID
        if (userId.length < 5 || userId.length > 20) {
            document.getElementById('newUserIdError').textContent = 'User ID must be between 5 and 20 characters';
            isValid = false;
        }

        // Validate Password
        if (!passwordPattern.test(password)) {
            document.getElementById('newPasswordError').textContent = 
                'Password must contain at least one uppercase letter, one lowercase letter, and one special character';
            isValid = false;
        }

        // Validate Confirm Password
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            isValid = false;
        }

        // Validate Customer Name
        if (customerName.length > 50) {
            document.getElementById('customerNameError').textContent = 'Name cannot exceed 50 characters';
            isValid = false;
        }

        // Validate Mobile Number
        const mobile = document.getElementById('mobile').value;
        if (!/^\d{10}$/.test(mobile)) {
            document.getElementById('mobileError').textContent = 'Please enter a valid 10-digit mobile number';
            isValid = false;
        }

        if (isValid) {
            // In a real application, you would make an API call here
            // For demo purposes, we'll simulate a successful registration
            const randomUsername = 'USER' + Math.random().toString(36).substr(2, 6).toUpperCase();
            showSuccess(`
                <strong>Username:</strong> ${randomUsername}<br>
                <strong>Customer Name:</strong> ${customerName}<br>
                <strong>Email:</strong> ${email}
            `);
        }
    });

    // Real-time password validation
    document.getElementById('newPassword').addEventListener('input', function() {
        const error = document.getElementById('newPasswordError');
        if (!passwordPattern.test(this.value)) {
            error.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, and one special character';
        } else {
            error.textContent = '';
        }
    });

    // Real-time confirm password validation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const error = document.getElementById('confirmPasswordError');
        if (this.value !== document.getElementById('newPassword').value) {
            error.textContent = 'Passwords do not match';
        } else {
            error.textContent = '';
        }
    });
});
