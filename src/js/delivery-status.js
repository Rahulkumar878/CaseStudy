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
    const statusUpdateSection = document.getElementById('statusUpdateSection');
    const noResultMessage = document.getElementById('noResultMessage');
    const updateStatusBtn = document.getElementById('updateStatusBtn');

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
            // Show status update section
            statusUpdateSection.classList.remove('hidden');
            noResultMessage.classList.add('hidden');

            // Display booking information
            document.getElementById('bookingId').textContent = booking.bookingId;
            document.getElementById('senderName').textContent = booking.senderName;
            document.getElementById('receiverName').textContent = booking.receiverName;
            document.getElementById('currentStatus').textContent = booking.trackingStatus || 'Booked';

            // Update status dropdown
            const newStatus = document.getElementById('newStatus');
            newStatus.value = ''; // Reset selection
        } else {
            statusUpdateSection.classList.add('hidden');
            noResultMessage.classList.remove('hidden');
        }
    });

    // Update status
    updateStatusBtn.addEventListener('click', () => {
        const bookingId = document.getElementById('bookingId').textContent;
        const newStatus = document.getElementById('newStatus').value;
        const statusNotes = document.getElementById('statusNotes').value;

        if (!newStatus) {
            alert('Please select a new status');
            return;
        }

        // Update booking status in storage
        const bookings = JSON.parse(sessionStorage.getItem('allBookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);

        if (bookingIndex !== -1) {
            bookings[bookingIndex].trackingStatus = newStatus;
            bookings[bookingIndex].statusNotes = statusNotes;

            // Update timestamp based on status
            const timestamp = new Date().toISOString();
            switch (newStatus) {
                case 'Picked up':
                    bookings[bookingIndex].actualPickupTime = timestamp;
                    break;
                case 'In Transit':
                    bookings[bookingIndex].transitTime = timestamp;
                    break;
                case 'Delivered':
                    bookings[bookingIndex].deliveryTime = timestamp;
                    break;
            }

            sessionStorage.setItem('allBookings', JSON.stringify(bookings));
            alert('Status updated successfully');

            // Reset form
            document.getElementById('newStatus').value = '';
            document.getElementById('statusNotes').value = '';
            statusUpdateSection.classList.add('hidden');
            searchBookingId.value = '';
        }
    });
});
