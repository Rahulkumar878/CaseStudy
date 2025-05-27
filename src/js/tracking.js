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
            <a href="officer-booking.html">Booking Service</a>
            <a href="#" class="active">Tracking</a>
            <a href="delivery-status.html">Delivery Status</a>
            <a href="pickup-scheduling.html">Pickup Scheduling</a>
            <a href="previous-booking.html">Previous Booking</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="customer-dashboard.html">Home</a>
            <a href="booking-service.html">Booking Service</a>
            <a href="#" class="active">Tracking</a>
            <a href="previous-booking.html">Previous Booking</a>
            <a href="customer-support.html">Contact Support</a>
        `;
    }

    // Add sample booking data if no bookings exist
    if (!sessionStorage.getItem('allBookings')) {
        const sampleBookings = [{
            bookingId: "123456789012",
            trackingStatus: "In Transit",
            pickupDate: "2025-05-26",
            deliverySpeed: "express",
            senderName: "John Doe",
            senderAddress: "123 Main St, City",
            receiverName: "Jane Smith",
            receiverAddress: "456 Park Ave, Town",
            weight: "500",
            contents: "Documents",
            amount: "₹200",
            paymentTime: "2025-05-25T10:30:00"
        }];
        sessionStorage.setItem('allBookings', JSON.stringify(sampleBookings));
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });

    const searchBtn = document.getElementById('searchBtn');
    const trackingInput = document.getElementById('trackingId');
    const trackingResult = document.getElementById('trackingResult');
    const noResult = document.getElementById('noResult');
    const validationMessage = document.getElementById('validationMessage');

    // Input validation
    trackingInput.addEventListener('input', (e) => {
        const input = e.target.value.trim();
        
        // Remove any non-numeric characters
        e.target.value = input.replace(/[^0-9]/g, '');
        
        if (input.length === 0) {
            validationMessage.textContent = '';
            searchBtn.disabled = true;
        } else if (input.length < 12) {
            validationMessage.textContent = `Please enter all 12 digits (${input.length}/12)`;
            validationMessage.className = 'validation-message';
            searchBtn.disabled = true;
        } else if (input.length > 12) {
            validationMessage.textContent = 'Booking ID cannot be more than 12 digits';
            validationMessage.className = 'validation-message';
            searchBtn.disabled = true;
        } else if (!/^\d{12}$/.test(input)) {
            validationMessage.textContent = 'Booking ID must contain only numbers';
            validationMessage.className = 'validation-message';
            searchBtn.disabled = true;
        } else {
            validationMessage.textContent = 'Valid booking ID';
            validationMessage.className = 'validation-message success';
            searchBtn.disabled = false;
        }
    });

    // Track parcel
    searchBtn.addEventListener('click', () => {
        const trackingId = trackingInput.value.trim();
        
        if (!/^\d{12}$/.test(trackingId)) {
            validationMessage.textContent = 'Please enter a valid 12-digit booking ID';
            validationMessage.className = 'validation-message';
            return;
        }

        // Get all bookings from session storage
        const allBookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
        const booking = allBookings.find(b => b.bookingId === trackingId);

        if (booking) {
            // Show tracking result
            trackingResult.classList.remove('hidden');
            if (noResult) noResult.classList.add('hidden');

            // Update tracking information
            document.getElementById('bookingId').textContent = booking.bookingId;
            document.getElementById('currentStatus').textContent = booking.trackingStatus || 'Booked';
            
            // Calculate and display expected delivery
            const pickupDate = new Date(booking.pickupDate);
            let deliveryDays = 4; // default for standard
            if (booking.deliverySpeed === 'express') deliveryDays = 2;
            if (booking.deliverySpeed === 'sameday') deliveryDays = 0;
            
            const expectedDate = new Date(pickupDate);
            expectedDate.setDate(expectedDate.getDate() + deliveryDays);
            document.getElementById('expectedDelivery').textContent = expectedDate.toLocaleDateString();

            // Update timeline based on current status
            const timelineItems = document.querySelectorAll('.timeline-item');
            let currentFound = false;
            
            timelineItems.forEach(item => {
                const status = item.getAttribute('data-status');
                if (currentFound) {
                    item.classList.remove('completed', 'current');
                    item.classList.add('pending');
                } else {
                    item.classList.add('completed');
                    if (status === (booking.trackingStatus || 'booked').toLowerCase()) {
                        item.classList.add('current');
                        currentFound = true;
                    }
                }
            });

            // Display timestamps
            if (booking.paymentTime) {
                document.getElementById('bookedTime').textContent = new Date(booking.paymentTime).toLocaleString();
            }
            if (booking.pickupTime) {
                document.getElementById('pickupTime').textContent = new Date(booking.actualPickupTime).toLocaleString();
            }
            if (booking.transitTime) {
                document.getElementById('transitTime').textContent = new Date(booking.transitTime).toLocaleString();
            }
            if (booking.deliveryTime) {
                document.getElementById('deliveredTime').textContent = new Date(booking.deliveryTime).toLocaleString();
            }

            // Display sender and receiver information
            document.getElementById('senderName').textContent = booking.senderName;
            document.getElementById('senderAddress').textContent = booking.senderAddress;
            document.getElementById('senderContact').textContent = booking.senderContact;

            document.getElementById('receiverName').textContent = booking.receiverName;
            document.getElementById('receiverAddress').textContent = booking.receiverAddress;
            document.getElementById('receiverContact').textContent = booking.receiverContact;

            // Clear validation message
            validationMessage.textContent = '';
        } else {
            // Hide tracking result
            trackingResult.classList.add('hidden');
            if (noResult) noResult.classList.remove('hidden');
            
            // Show error message
            validationMessage.textContent = 'No parcel found with this booking ID';
            validationMessage.className = 'validation-message';
        }
    });

    // Clear validation message when input is cleared
    trackingInput.addEventListener('blur', () => {
        if (trackingInput.value.trim().length === 0) {
            validationMessage.textContent = '';
        }
    });
});
