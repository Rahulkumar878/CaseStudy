document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../index.html';
    }

    // Update navigation based on user type
    const userType = sessionStorage.getItem('userType');
    const navLinks = document.querySelector('.nav-links');
    
    if (userType === 'officer') {
        navLinks.innerHTML = `
            <a href="officer-dashboard.html">Home</a>
            <a href="#" class="active">Booking Service</a>
            <a href="tracking.html">Tracking</a>
            <a href="delivery-status.html">Delivery Status</a>
            <a href="pickup-scheduling.html">Pickup Scheduling</a>
            <a href="previous-booking.html">Previous Booking</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="customer-dashboard.html">Home</a>
            <a href="#" class="active">Booking Service</a>
            <a href="tracking.html">Tracking</a>
            <a href="previous-booking.html">Previous Booking</a>
            <a href="customer-support.html">Contact Support</a>
        `;
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });

    // Get form elements
    const bookingForm = document.getElementById('bookingForm');
    const calculateBtn = document.getElementById('calculateBtn');
    const proceedToPayBtn = document.getElementById('proceedToPayBtn');

    // Pre-populate sender information for customer
    const currentUser = sessionStorage.getItem('userId');
    if (sessionStorage.getItem('userType') === 'customer') {
        document.getElementById('senderName').value = currentUser;
        document.getElementById('senderAddress').value = sessionStorage.getItem('userAddress') || '';
        document.getElementById('senderContact').value = sessionStorage.getItem('userContact') || '';
    }

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

        // Generate booking ID with PMS prefix and timestamp
        const timestamp = Date.now();
        const bookingId = 'PMS' + timestamp.toString().slice(-9);

        // Calculate total amount
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
        const totalAmount = (baseCharge * speedMultiplier + packagingCharge + insuranceCharge).toFixed(2);

        // Store booking details in session storage
        const bookingDetails = {
            bookingId,
            customerId: sessionStorage.getItem('userId'),
            bookingDate: new Date().toISOString(),
            trackingStatus: 'Booked',
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
            amount: totalAmount,
            status: 'Payment Pending',
            baseCharge: baseCharge * speedMultiplier,
            packagingCharge,
            insuranceCharge
        };

        // Save to current booking for payment
        sessionStorage.setItem('currentBooking', JSON.stringify(bookingDetails));

        // Save to all bookings
        const allBookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
        allBookings.push(bookingDetails);
        sessionStorage.setItem('allBookings', JSON.stringify(allBookings));

        // Redirect to payment
        window.location.href = 'payment.html';
    });
});
