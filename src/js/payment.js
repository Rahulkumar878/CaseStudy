document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../../src/index.html';
    }

    // Get booking details from session storage
    const bookingDetails = JSON.parse(sessionStorage.getItem('currentBooking'));
    if (!bookingDetails) {
        window.location.href = sessionStorage.getItem('userType') === 'officer' 
            ? 'officer-booking.html' 
            : 'booking-service.html';
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // Display booking details
    document.getElementById('bookingId').textContent = bookingDetails.bookingId;
    document.getElementById('amountToPay').textContent = bookingDetails.amount;

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });

    // Back button functionality
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = sessionStorage.getItem('userType') === 'officer' 
            ? 'officer-booking.html' 
            : 'booking-service.html';
    });

    // Format card number as user types
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput.addEventListener('input', (e) => {
        // Remove any non-digits and existing spaces
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 16 digits
        if (value.length > 16) {
            value = value.slice(0, 16);
        }
        
        // Format with spaces after every 4 digits
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        // Update the input value
        e.target.value = formattedValue;
        
        // Update visual feedback
        const errorElement = document.getElementById('cardNumberError');
        if (value.length > 0 && value.length < 16) {
            errorElement.textContent = `${16 - value.length} digits remaining`;
        } else {
            errorElement.textContent = '';
        }
    });
    
    // Prevent form submission when pasting invalid content
    cardNumberInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const numbersOnly = pastedText.replace(/\D/g, '').slice(0, 16);
        // Trigger the input event to format the pasted number
        cardNumberInput.value = numbersOnly;
        cardNumberInput.dispatchEvent(new Event('input'));
    });

    // Format expiry date as user types
    const expiryDateInput = document.getElementById('expiryDate');
    expiryDateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substr(0, 4);
        
        if (value.length >= 2) {
            const month = parseInt(value.substr(0, 2));
            if (month > 12) value = '12' + value.substr(2);
            value = value.substr(0, 2) + '/' + value.substr(2);
        }
        
        e.target.value = value;
    });

    // Payment form validation and submission
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validatePaymentForm()) return;

        // Simulate payment processing
        const paymentBtn = document.getElementById('makePaymentBtn');
        paymentBtn.disabled = true;
        paymentBtn.textContent = 'Processing...';

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update booking status
            bookingDetails.status = 'Payment Completed';
            bookingDetails.paymentTime = new Date().toISOString();

            // Store the updated booking details
            let allBookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
            allBookings.push(bookingDetails);
            sessionStorage.setItem('allBookings', JSON.stringify(allBookings));
            
            // Clear current booking
            sessionStorage.removeItem('currentBooking');

            // Redirect to invoice
            window.location.href = `invoice.html?bookingId=${bookingDetails.bookingId}`;
        } catch (error) {
            alert('Payment failed. Please try again.');
            paymentBtn.disabled = false;
            paymentBtn.textContent = 'Make Payment';
        }
    });

    function validatePaymentForm() {
        let isValid = true;
        const fields = {
            cardNumber: {
                pattern: /^[0-9]{16}$/,
                message: 'Please enter a valid 16-digit card number',
                required: 'Card number is required',
                validate: (value) => {
                    return value.replace(/\s/g, '').length === 16;
                }
            },
            cardHolder: {
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'Name should only contain letters and spaces',
                required: 'Card holder name is required',
                validate: (value) => value.trim().length >= 2
            },
            expiryDate: {
                pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                message: 'Please use format MM/YY (e.g., 05/25)',
                required: 'Expiry date is required',
                validate: (value) => {
                    if (!value.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) return false;
                    const [month, year] = value.split('/');
                    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
                    const today = new Date();
                    return expiry > today;
                }
            },
            cvv: {
                pattern: /^[0-9]{3}$/,
                message: 'CVV must be 3 digits',
                required: 'CVV is required',
                validate: (value) => value.length === 3 && /^\d+$/.test(value)
            }
        };

        Object.entries(fields).forEach(([fieldId, validation]) => {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(fieldId + 'Error');
            const value = field.value.replace(/\s/g, '');

            const input = document.getElementById(fieldId);
            if (!value) {
                errorElement.textContent = validation.required;
                errorElement.classList.add('visible');
                input.classList.add('error-field');
                isValid = false;
            } else if (!validation.validate(value)) {
                errorElement.textContent = validation.message;
                errorElement.classList.add('visible');
                input.classList.add('error-field');
                isValid = false;
            } else {
                errorElement.textContent = '';
                errorElement.classList.remove('visible');
                input.classList.remove('error-field');
            }
        });

        // Additional validation for expiry date
        if (isValid) {
            const [month, year] = document.getElementById('expiryDate').value.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const today = new Date();
            
            if (expiry < today) {
                document.getElementById('expiryDateError').textContent = 'Card has expired';
                isValid = false;
            }
        }

        return isValid;
    }
});
