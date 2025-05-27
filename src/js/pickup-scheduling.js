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

    // Get DOM elements
    const searchBtn = document.getElementById('searchBtn');
    const searchBookingId = document.getElementById('searchBookingId');
    const schedulingForm = document.getElementById('schedulingForm');
    const noResultMessage = document.getElementById('noResultMessage');
    const schedulePickupBtn = document.getElementById('schedulePickupBtn');
    const pickupDate = document.getElementById('pickupDate');

    // Set minimum date for pickup to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    pickupDate.min = tomorrow.toISOString().split('T')[0];

    // Search for booking
    searchBtn.addEventListener('click', () => {
        const bookingId = searchBookingId.value.trim();
        if (!bookingId) {
            alert('Please enter a booking ID');
            return;
        }

        // Get booking from storage
        const bookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
        const booking = bookings.find(b => b.bookingId === bookingId);

        if (booking) {
            // Show scheduling form
            schedulingForm.classList.remove('hidden');
            noResultMessage.classList.add('hidden');

            // Display booking information
            document.getElementById('bookingId').textContent = booking.bookingId;
            document.getElementById('customerName').textContent = booking.senderName;
            document.getElementById('pickupAddress').textContent = booking.senderAddress;
            document.getElementById('contactNumber').textContent = booking.senderContact;

            // Pre-fill date and time if already scheduled
            if (booking.scheduledPickupDate) {
                document.getElementById('pickupDate').value = booking.scheduledPickupDate;
                document.getElementById('pickupTime').value = booking.scheduledPickupTime;
                document.getElementById('assignedOfficer').value = booking.assignedOfficer || '';
                document.getElementById('notes').value = booking.pickupNotes || '';
            }
        } else {
            schedulingForm.classList.add('hidden');
            noResultMessage.classList.remove('hidden');
        }
    });

    // Schedule pickup
    schedulePickupBtn.addEventListener('click', () => {
        // Validate form
        const date = pickupDate.value;
        const time = document.getElementById('pickupTime').value;
        const officer = document.getElementById('assignedOfficer').value.trim();
        const notes = document.getElementById('notes').value.trim();

        if (!date || !time || !officer) {
            alert('Please fill in all required fields');
            return;
        }

        // Update booking in storage
        const bookingId = document.getElementById('bookingId').textContent;
        const bookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);

        if (bookingIndex !== -1) {
            bookings[bookingIndex].scheduledPickupDate = date;
            bookings[bookingIndex].scheduledPickupTime = time;
            bookings[bookingIndex].assignedOfficer = officer;
            bookings[bookingIndex].pickupNotes = notes;
            bookings[bookingIndex].pickupScheduled = true;

            sessionStorage.setItem('allBookings', JSON.stringify(bookings));
            alert('Pickup scheduled successfully');

            // Reset form
            document.getElementById('pickupDate').value = '';
            document.getElementById('pickupTime').value = '';
            document.getElementById('assignedOfficer').value = '';
            document.getElementById('notes').value = '';
            schedulingForm.classList.add('hidden');
            searchBookingId.value = '';
        }
    });
});
