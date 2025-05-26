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
        const selectionStart = e.target.selectionStart;
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        
        // Strictly limit to 16 digits
        value = value.substring(0, 16);
        
        // Format with spaces
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        // Calculate new cursor position
        const addedSpaces = Math.floor(selectionStart / 4);
        const newPosition = Math.min(
            formattedValue.length,
            selectionStart + (selectionStart > 0 && selectionStart % 4 === 0 ? 1 : 0)
        );
        
        // Update input value
        e.target.value = formattedValue;
        
        // Adjust cursor position if we're not at the end and we're inserting text
        if (e.inputType === 'insertText' && newPosition < formattedValue.length) {
            e.target.setSelectionRange(newPosition, newPosition);
        }
        
        // Update visual feedback
        const errorElement = document.getElementById('cardNumberError');
        if (value.length === 0) {
            errorElement.textContent = 'Card number is required';
            errorElement.classList.add('visible');
            e.target.classList.add('error-field');
        } else if (value.length < 16) {
            errorElement.textContent = `${16 - value.length} digits remaining`;
            errorElement.classList.add('visible');
            e.target.classList.add('error-field');
        } else {
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
            e.target.classList.remove('error-field');
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
        const selectionStart = e.target.selectionStart;
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 4 digits total
        if (value.length > 4) {
            value = value.slice(0, 4);
        }
        
        // Format MM/YY
        if (value.length >= 2) {
            let month = value.slice(0, 2);
            let year = value.slice(2);
            
            // Validate month (01-12)
            if (parseInt(month) > 12) {
                month = '12';
            } else if (parseInt(month) === 0) {
                month = '01';
            } else if (month.length === 1) {
                month = '0' + month;
            }
            
            // Validate year (can't be less than current year)
            if (year.length > 0) {
                const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
                year = year.slice(0, 2); // Ensure only 2 digits for year
                const yearNum = parseInt(year);
                if (yearNum < currentYear) {
                    year = currentYear.toString().padStart(2, '0');
                }
            }
            
            // Add slash after month
            value = month + (year.length > 0 ? '/' + year : '');
        }
        
        e.target.value = value;
        
        // Move cursor after slash when typing month
        const newPosition = selectionStart + (
            selectionStart === 2 && value.includes('/') && value.length > 2 ? 1 : 0
        );
        e.target.setSelectionRange(newPosition, newPosition);
    });

    // Enable/disable payment button based on form validity
    function updatePaymentButton() {
        const makePaymentBtn = document.getElementById('makePaymentBtn');
        makePaymentBtn.disabled = !validatePaymentForm();
    }

    // Add validation check on input to all form fields
    ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'].forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', updatePaymentButton);
    });

    // Payment form validation and submission
    const makePaymentBtn = document.getElementById('makePaymentBtn');
    makePaymentBtn.addEventListener('click', async () => {
        if (!validatePaymentForm()) {
            return;
        }
        
        makePaymentBtn.disabled = true;
        makePaymentBtn.textContent = 'Processing Payment...';
        
        // Get all form values
        const cardNumber = document.getElementById('cardNumber').value;
        const cardHolder = document.getElementById('cardHolder').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        // Additional validation
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
            makePaymentBtn.disabled = false;
            makePaymentBtn.textContent = 'Make Payment';
            return;
        }

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create payment record
            const payment = {
                cardNumber: cardNumber.replace(/\s/g, '').slice(-4), // Only store last 4 digits
                cardHolder: cardHolder,
                expiryDate: expiryDate,
                amount: bookingDetails.amount,
                currency: '₹', // Indian Rupees
                date: new Date().toISOString(),
                bookingId: bookingDetails.bookingId
            };

            // Update booking details
            bookingDetails.status = 'Payment Completed';
            bookingDetails.paymentTime = payment.date;
            bookingDetails.paymentDetails = payment;
            bookingDetails.trackingStatus = 'Booked';

            // Store the updated booking details
            let allBookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
            const existingIndex = allBookings.findIndex(b => b.bookingId === bookingDetails.bookingId);
            if (existingIndex >= 0) {
                allBookings[existingIndex] = bookingDetails;
            } else {
                allBookings.push(bookingDetails);
            }
            sessionStorage.setItem('allBookings', JSON.stringify(allBookings));
            
            // Store payment details for invoice
            sessionStorage.setItem('lastPayment', JSON.stringify(payment));
            
            // Clear current booking but keep a reference for the invoice
            sessionStorage.setItem('lastBooking', JSON.stringify(bookingDetails));
            sessionStorage.removeItem('currentBooking');
            
            console.log('Payment processed, redirecting to invoice');
            window.location.href = 'invoice.html';
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
            paymentBtn.disabled = false;
            paymentBtn.textContent = 'Make Payment';
        }
    });

    function validatePaymentForm() {
        let isValid = true;
        const fields = {
            cardNumber: {
                pattern: /^(\d{4}\s){3}\d{4}$|^\d{16}$/,
                message: 'Please enter a valid 16-digit card number',
                required: 'Card number is required',
                validate: (value) => {
                    const digitsOnly = value.replace(/\s/g, '');
                    return digitsOnly.length === 16 && /^\d+$/.test(digitsOnly) && 
                           value.match(/(\d{4}\s){3}\d{4}/); // Ensure proper spacing
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
            const input = document.getElementById(fieldId);
            const errorElement = document.getElementById(fieldId + 'Error');
            const value = input.value;

            if (!value.trim()) {
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
