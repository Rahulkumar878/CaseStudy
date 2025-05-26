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
    document.getElementById('bookingDate').textContent = new Date(bookingDetails.bookingTime || bookingDetails.paymentTime).toLocaleDateString();
    document.getElementById('amount').textContent = paymentDetails.amount; // Amount already includes currency symbol
    document.getElementById('paymentDate').textContent = new Date(paymentDetails.date).toLocaleString();
    document.getElementById('cardNumber').textContent = `xxxx-xxxx-xxxx-${paymentDetails.cardNumber}`;
    document.getElementById('cardHolder').textContent = paymentDetails.cardHolder;
    
    // Calculate estimated delivery date based on delivery speed
    const paymentDate = new Date(paymentDetails.date);
    let estimatedDelivery;
    switch(bookingDetails.deliverySpeed) {
        case 'sameday':
            estimatedDelivery = new Date(paymentDate);
            estimatedDelivery.setHours(23, 59, 59);
            break;
        case 'express':
            estimatedDelivery = new Date(paymentDate);
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
            break;
        default: // standard
            estimatedDelivery = new Date(paymentDate);
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
    }
    document.getElementById('expectedDelivery').textContent = estimatedDelivery.toLocaleDateString();
    
    // Format service details
    const serviceCost = document.getElementById('serviceCost');
    if (serviceCost) {
        serviceCost.textContent = `${paymentDetails.currency}${paymentDetails.amount}`;
    }
    
    const paymentTime = document.getElementById('paymentTime');
    if (paymentTime) {
        paymentTime.textContent = new Date(paymentDetails.date).toLocaleString();
    }

    // Add print functionality
    const printButton = document.getElementById('printInvoice');
    if (printButton) {
        printButton.addEventListener('click', () => {
            // Hide the print button temporarily
            printButton.style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'none';
            
            // Print the page
            window.print();
            
            // Show the buttons again
            setTimeout(() => {
                printButton.style.display = 'block';
                document.getElementById('logoutBtn').style.display = 'block';
            }, 500);
        });
    }
    
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

    // Handle navigation to dashboard
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            // Clear payment specific data
            sessionStorage.removeItem('lastPayment');
            sessionStorage.removeItem('lastBooking');

            // Navigate to appropriate dashboard
            window.location.href = sessionStorage.getItem('userType') === 'officer' 
                ? 'officer-dashboard.html' 
                : 'customer-dashboard.html';
        });
    }

    // Handle print button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            // Print window will automatically hide UI elements via CSS
            window.print();
        });
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });
});
