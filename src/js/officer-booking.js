document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in as an officer
    if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('userType') !== 'officer') {
        window.location.href = '../index.html';
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../index.html';
    });

    // Get form elements
    const bookingForm = document.getElementById('bookingForm');
    const calculateBtn = document.getElementById('calculateBtn');
    const proceedToPayBtn = document.getElementById('proceedToPayBtn');

    // Set minimum date for pickup to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('pickupDate').min = tomorrow.toISOString().split('T')[0];

    // Calculate shipping cost
    calculateBtn.addEventListener('click', () => {
        if (!validateForm()) return;

        const weight = parseInt(document.getElementById('weight').value);
        const deliverySpeed = document.getElementById('deliverySpeed').value;
        const packaging = document.getElementById('packaging').value;
        const insurance = document.getElementById('insurance').checked;

        // Base charge calculation (₹20 per 500g)
        const baseCharge = Math.ceil(weight / 500) * 20;

        // Delivery speed multiplier
        let speedMultiplier = 1;
        switch (deliverySpeed) {
            case 'express':
                speedMultiplier = 1.5;
                break;
            case 'sameday':
                speedMultiplier = 2;
                break;
        }

        // Packaging charges
        let packagingCharge = 0;
        switch (packaging) {
            case 'custom':
                packagingCharge = 50;
                break;
            case 'eco':
                packagingCharge = 30;
                break;
            case 'fragile':
                packagingCharge = 100;
                break;
        }

        // Insurance charge
        const insuranceCharge = insurance ? Math.max(50, baseCharge * 0.05) : 0;

        // Update cost summary
        document.getElementById('baseCharge').textContent = `₹${(baseCharge * speedMultiplier).toFixed(2)}`;
        document.getElementById('packagingCharge').textContent = `₹${packagingCharge.toFixed(2)}`;
        document.getElementById('insuranceCharge').textContent = `₹${insuranceCharge.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = 
            `₹${(baseCharge * speedMultiplier + packagingCharge + insuranceCharge).toFixed(2)}`;

        // Enable proceed to payment button
        proceedToPayBtn.disabled = false;
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        const required = [
            'senderName',
            'senderAddress',
            'senderContact',
            'receiverName',
            'receiverAddress',
            'receiverPinCode',
            'receiverContact',
            'weight',
            'contents',
            'deliverySpeed',
            'packaging',
            'pickupDate',
            'pickupTime'
        ];

        required.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(fieldId + 'Error');
            
            if (!field.value) {
                errorElement.textContent = 'This field is required';
                isValid = false;
            } else if (field.pattern && !new RegExp(field.pattern).test(field.value)) {
                switch (fieldId) {
                    case 'receiverPinCode':
                        errorElement.textContent = 'PIN Code must be 6 digits';
                        break;
                    case 'receiverContact':
                    case 'senderContact':
                        errorElement.textContent = 'Contact number must be 10 digits';
                        break;
                }
                isValid = false;
            } else {
                errorElement.textContent = '';
            }
        });

        return isValid;
    }

    // Form submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Generate random booking ID (12 digits)
        const bookingId = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');

        // Store booking details in session storage
        const bookingDetails = {
            bookingId,
            customerId: document.getElementById('senderName').value.replace(/[^a-zA-Z0-9]/g, '').substr(0, 6).toUpperCase(),
            senderName: document.getElementById('senderName').value,
            senderAddress: document.getElementById('senderAddress').value,
            senderContact: document.getElementById('senderContact').value,
            receiverName: document.getElementById('receiverName').value,
            receiverAddress: document.getElementById('receiverAddress').value,
            receiverPinCode: document.getElementById('receiverPinCode').value,
            receiverContact: document.getElementById('receiverContact').value,
            weight: document.getElementById('weight').value,
            contents: document.getElementById('contents').value,
            deliverySpeed: document.getElementById('deliverySpeed').value,
            packaging: document.getElementById('packaging').value,
            pickupDate: document.getElementById('pickupDate').value,
            pickupTime: document.getElementById('pickupTime').value,
            insurance: document.getElementById('insurance').checked,
            amount: document.getElementById('totalAmount').textContent,
            status: 'Payment Pending',
            bookedBy: 'officer'
        };

        sessionStorage.setItem('currentBooking', JSON.stringify(bookingDetails));
        window.location.href = 'payment.html';
    });
});