document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../../src/index.html';
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // Get booking and payment details from session storage
    const bookingDetails = JSON.parse(sessionStorage.getItem('lastBooking'));
    const paymentDetails = JSON.parse(sessionStorage.getItem('lastPayment'));

    if (!bookingDetails || !paymentDetails) {
        console.error('Missing booking or payment details');
        window.location.href = sessionStorage.getItem('userType') === 'officer' 
            ? 'officer-dashboard.html' 
            : 'customer-dashboard.html';
    }

    // Populate invoice details
    document.getElementById('bookingId').textContent = bookingDetails.bookingId;
    document.getElementById('bookingDate').textContent = new Date(paymentDetails.date).toLocaleDateString();
    document.getElementById('amount').textContent = `₹${paymentDetails.amount}`;
    document.getElementById('paymentDate').textContent = new Date(paymentDetails.date).toLocaleString();
    document.getElementById('cardNumber').textContent = `xxxx-xxxx-xxxx-${paymentDetails.cardNumber}`;
    document.getElementById('cardHolder').textContent = paymentDetails.cardHolder;
    
    document.getElementById('receiverName').textContent = bookingDetails.receiverName;
    document.getElementById('receiverAddress').textContent = bookingDetails.receiverAddress;
    document.getElementById('receiverPin').textContent = bookingDetails.receiverPinCode;
    document.getElementById('receiverMobile').textContent = bookingDetails.receiverContact;
    document.getElementById('parcelWeight').textContent = `${bookingDetails.weight}g`;
    document.getElementById('parcelContents').textContent = bookingDetails.contents;

    // Format delivery type
    const deliveryTypes = {
        standard: 'Standard Delivery (3-5 days)',
        express: 'Express Delivery (1-2 days)',
        sameday: 'Same Day Delivery'
    };
    document.getElementById('deliveryType').textContent = deliveryTypes[bookingDetails.deliverySpeed];

    // Format packaging type
    const packagingTypes = {
        standard: 'Standard Packaging',
        custom: 'Custom Packaging',
        eco: 'Eco-friendly Packaging',
        fragile: 'Fragile Item Handling'
    };
    document.getElementById('packagingType').textContent = packagingTypes[bookingDetails.packaging];

    // Format pickup time
    const pickupTimeSlots = {
        '9-12': '9:00 AM - 12:00 PM',
        '12-15': '12:00 PM - 3:00 PM',
        '15-18': '3:00 PM - 6:00 PM'
    };
    document.getElementById('pickupTime').textContent = 
        `${bookingDetails.pickupDate} (${pickupTimeSlots[bookingDetails.pickupTime]})`;

    // Calculate and display expected delivery date
    const pickupDate = new Date(bookingDetails.pickupDate);
    let deliveryDays = 4; // default for standard
    if (bookingDetails.deliverySpeed === 'express') deliveryDays = 2;
    if (bookingDetails.deliverySpeed === 'sameday') deliveryDays = 0;
    
    const expectedDate = new Date(pickupDate);
    expectedDate.setDate(expectedDate.getDate() + deliveryDays);
    document.getElementById('expectedDelivery').textContent = expectedDate.toLocaleDateString();

    // Display payment details
    document.getElementById('serviceCost').textContent = bookingDetails.amount;
    document.getElementById('paymentTime').textContent = 
        new Date(bookingDetails.paymentTime).toLocaleString();

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });

    // Home button functionality
    document.getElementById('homeBtn').addEventListener('click', () => {
        window.location.href = sessionStorage.getItem('userType') === 'officer' 
            ? 'officer-dashboard.html' 
            : 'customer-dashboard.html';
    });
});
