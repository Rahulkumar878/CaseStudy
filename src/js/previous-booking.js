document.addEventListener('DOMContentLoaded', () => {
    // Authentication check
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
            <a href="tracking.html">Tracking</a>
            <a href="delivery-status.html">Delivery Status</a>
            <a href="pickup-scheduling.html">Pickup Scheduling</a>
            <a href="#" class="active">Previous Booking</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="customer-dashboard.html">Home</a>
            <a href="booking-service.html">Booking Service</a>
            <a href="tracking.html">Tracking</a>
            <a href="#" class="active">Previous Booking</a>
            <a href="customer-support.html">Contact Support</a>
        `;
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // DOM Elements
    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const tableBody = document.getElementById('bookingsTableBody');
    const noBookings = document.getElementById('noBookings');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');

    // State management
    const state = {
        itemsPerPage: parseInt(itemsPerPageSelect.value),
        currentPage: 1,
        filteredBookings: [],
        isOfficer: sessionStorage.getItem('userType') === 'officer'
    };

    // Initialize bookings data
    function initializeBookings() {
        const existingBookings = sessionStorage.getItem('allBookings');
        if (!existingBookings) {
            const defaultBookings = generateSampleBookings();
            sessionStorage.setItem('allBookings', JSON.stringify(defaultBookings));
            return defaultBookings;
        }
        return JSON.parse(existingBookings);
    }

    // Generate sample bookings if needed
    function generateSampleBookings() {
        const today = new Date('2025-05-26');
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        return [
            {
                bookingId: "PMS" + Date.now().toString().slice(-9),
                customerId: "CUST001",
                trackingStatus: "In Transit",
                pickupDate: today.toISOString().split('T')[0],
                deliverySpeed: "express",
                senderName: "John Doe",
                receiverName: "Jane Smith",
                receiverAddress: "456 Park Ave, Town",
                weight: "500",
                contents: "Documents",
                amount: "200",
                paymentTime: today.toISOString(),
                transitTime: today.toISOString()
            },
            {
                bookingId: "PMS" + Date.now().toString().slice(-9),
                customerId: "CUST001",
                trackingStatus: "Delivered",
                pickupDate: "2025-05-24",
                deliverySpeed: "standard",
                senderName: "John Doe",
                receiverName: "Alice Johnson",
                receiverAddress: "789 Oak St, City",
                weight: "1000",
                contents: "Electronics",
                amount: "500",
                paymentTime: yesterday.toISOString(),
                pickupTime: "2025-05-24T10:00:00",
                transitTime: "2025-05-24T14:00:00",
                deliveryTime: "2025-05-24T17:30:00"
            },
            {
                bookingId: "PMS" + Date.now().toString().slice(-9),
                customerId: "CUST001",
                trackingStatus: "Booked",
                pickupDate: "2025-05-27",
                deliverySpeed: "sameday",
                senderName: "John Doe",
                receiverName: "Bob Wilson",
                receiverAddress: "321 Pine St, Village",
                weight: "250",
                contents: "Clothing",
                amount: "300",
                paymentTime: today.toISOString()
            },
            {
                bookingId: "PMS" + Date.now().toString().slice(-9),
                customerId: "CUST001",
                trackingStatus: "Pickup",
                pickupDate: "2025-05-26",
                deliverySpeed: "express",
                senderName: "John Doe",
                receiverName: "Eva Brown",
                receiverAddress: "567 Maple Dr, County",
                weight: "750",
                contents: "Books",
                amount: "350",
                paymentTime: yesterday.toISOString(),
                pickupTime: "2025-05-26T11:15:00"
            },
            {
                bookingId: "PMS" + Date.now().toString().slice(-9),
                customerId: "CUST001",
                trackingStatus: "Delivered",
                pickupDate: "2025-05-25",
                deliverySpeed: "sameday",
                senderName: "John Doe",
                receiverName: "Tom Davis",
                receiverAddress: "890 Cedar Ln, District",
                weight: "300",
                contents: "Gift Items",
                amount: "400",
                paymentTime: yesterday.toISOString(),
                pickupTime: "2025-05-25T09:30:00",
                transitTime: "2025-05-25T11:45:00",
                deliveryTime: "2025-05-25T16:20:00"
            }
        ];
    }

    // Format date for display
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Create status badge HTML
    function createStatusBadge(status) {
        const statusClasses = {
            'Booked': 'status-booked',
            'Pickup': 'status-pickup',
            'In Transit': 'status-transit',
            'Delivered': 'status-delivered'
        };
        
        return `<span class="status-badge ${statusClasses[status]}">${status}</span>`;
    }

    // Render table row
    function renderBookingRow(booking) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.bookingId}</td>
            <td>${state.isOfficer ? booking.customerId : '-'}</td>
            <td>${createStatusBadge(booking.trackingStatus)}</td>
            <td>${formatDate(booking.pickupDate).split(',')[0]}</td>
            <td>${booking.deliverySpeed}</td>
            <td>${booking.receiverName}</td>
            <td>${booking.receiverAddress}</td>
            <td>${booking.weight}</td>
            <td>${booking.contents}</td>
            <td>₹${booking.amount}</td>
            <td>
                <button class="action-btn track-btn" data-booking-id="${booking.bookingId}" title="Track Package">
                    <i class="fas fa-truck"></i>
                </button>
                ${booking.trackingStatus === 'Delivered' ? 
                    `<button class="action-btn invoice-btn" data-booking-id="${booking.bookingId}" title="View Invoice">
                        <i class="fas fa-file-invoice"></i>
                    </button>` : ''}
            </td>
        `;
        
        // Add event listeners for tracking and invoice
        const trackBtn = row.querySelector('.track-btn');
        trackBtn.addEventListener('click', () => {
            sessionStorage.setItem('trackingId', booking.bookingId);
            window.location.href = 'tracking.html';
        });

        const invoiceBtn = row.querySelector('.invoice-btn');
        if (invoiceBtn) {
            invoiceBtn.addEventListener('click', () => {
                sessionStorage.setItem('invoiceId', booking.bookingId);
                window.location.href = 'invoice.html';
            });
        }

        return row;
    }

    // Filter bookings based on current filters
    function filterBookings() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

        const allBookings = JSON.parse(sessionStorage.getItem('allBookings'));
        
        state.filteredBookings = allBookings.filter(booking => {
            // Search filter
            const searchMatch = state.isOfficer ? 
                (booking.bookingId.toLowerCase().includes(searchTerm) ||
                booking.customerId.toLowerCase().includes(searchTerm) ||
                booking.receiverName.toLowerCase().includes(searchTerm)) :
                (booking.bookingId.toLowerCase().includes(searchTerm) ||
                booking.receiverName.toLowerCase().includes(searchTerm));

            // Status filter
            const statusMatch = statusValue === 'all' || booking.trackingStatus === statusValue;

            // Date filter
            const bookingDate = new Date(booking.paymentTime);
            let dateMatch = true;

            if (startDate && endDate) {
                dateMatch = bookingDate >= startDate && bookingDate <= endDate;
            } else if (dateValue === 'today') {
                dateMatch = bookingDate.toDateString() === new Date().toDateString();
            } else if (dateValue === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                dateMatch = bookingDate >= weekAgo;
            } else if (dateValue === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                dateMatch = bookingDate >= monthAgo;
            }

            return searchMatch && statusMatch && dateMatch;
        });

        state.currentPage = 1;
        updateTable();
    }

    // Update table with current page of filtered bookings
    function updateTable() {
        const startIdx = (state.currentPage - 1) * state.itemsPerPage;
        const endIdx = startIdx + state.itemsPerPage;
        const pageBookings = state.filteredBookings.slice(startIdx, endIdx);

        // Clear table
        tableBody.innerHTML = '';

        if (pageBookings.length === 0) {
            noBookings.classList.remove('hidden');
            tableBody.parentElement.classList.add('hidden');
        } else {
            noBookings.classList.add('hidden');
            tableBody.parentElement.classList.remove('hidden');
            pageBookings.forEach(booking => {
                tableBody.appendChild(renderBookingRow(booking));
            });
        }

        // Update pagination
        const totalPages = Math.ceil(state.filteredBookings.length / state.itemsPerPage);
        pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
        prevPageBtn.disabled = state.currentPage === 1;
        nextPageBtn.disabled = state.currentPage === totalPages;
    }

    // Event Listeners
    searchInput.addEventListener('input', filterBookings);
    statusFilter.addEventListener('change', filterBookings);
    dateFilter.addEventListener('change', () => {
        dateRangeFilter.style.display = dateFilter.value === 'custom' ? 'flex' : 'none';
        filterBookings();
    });
    startDateInput.addEventListener('change', filterBookings);
    endDateInput.addEventListener('change', filterBookings);
    
    prevPageBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredBookings.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            updateTable();
        }
    });

    itemsPerPageSelect.addEventListener('change', () => {
        state.itemsPerPage = parseInt(itemsPerPageSelect.value);
        state.currentPage = 1;
        updateTable();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });

    // Initialize
    state.filteredBookings = initializeBookings();
    updateTable();

    // Hide date range filter if not officer
    if (!state.isOfficer) {
        dateRangeFilter.style.display = 'none';
    }
});
