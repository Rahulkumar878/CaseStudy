document.addEventListener('DOMContentLoaded', () => {
    // Authentication check
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../index.html';
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../index.html';
    });

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');

        question.addEventListener('click', () => {
            // Close other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('i').classList.remove('fa-chevron-up');
                    otherItem.querySelector('i').classList.add('fa-chevron-down');
                }
            });

            // Toggle current FAQ
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                answer.style.maxHeight = null;
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });

    // Form validation
    const supportForm = document.getElementById('supportForm');
    const bookingIdInput = document.getElementById('bookingId');

    bookingIdInput.addEventListener('input', () => {
        const bookingIdError = document.getElementById('bookingIdError');
        const value = bookingIdInput.value.trim();
        
        if (value && !/^\d{12}$/.test(value)) {
            bookingIdError.textContent = 'Booking ID must be 12 digits';
        } else {
            bookingIdError.textContent = '';
        }
    });

    // Support form submission
    supportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        let isValid = true;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const bookingId = bookingIdInput.value.trim();

        // Subject validation
        if (!subject) {
            document.getElementById('subjectError').textContent = 'Please select a subject';
            isValid = false;
        }

        // Message validation
        if (!message || message.length < 20) {
            document.getElementById('messageError').textContent = 'Please provide a detailed message (minimum 20 characters)';
            isValid = false;
        }

        // Booking ID validation (if provided)
        if (bookingId && !/^\d{12}$/.test(bookingId)) {
            document.getElementById('bookingIdError').textContent = 'Invalid booking ID format';
            isValid = false;
        }

        if (!isValid) return;

        // Generate ticket ID
        const ticketId = 'TKT' + Date.now().toString().slice(-8);

        // Create support ticket
        const ticket = {
            ticketId,
            userId: sessionStorage.getItem('userId'),
            subject,
            bookingId: bookingId || null,
            message,
            status: 'Open',
            createdAt: new Date().toISOString()
        };

        // Store ticket in session storage
        const tickets = JSON.parse(sessionStorage.getItem('supportTickets') || '[]');
        tickets.push(ticket);
        sessionStorage.setItem('supportTickets', JSON.stringify(tickets));

        // Show success message
        const form = document.querySelector('.support-form');
        const successMessage = document.getElementById('successMessage');
        document.getElementById('ticketId').textContent = ticketId;
        
        form.reset();
        form.style.display = 'none';
        successMessage.classList.remove('hidden');

        // Show form again after 5 seconds
        setTimeout(() => {
            form.style.display = 'block';
            successMessage.classList.add('hidden');
        }, 5000);
    });

    // Live chat functionality
    const startChatBtn = document.getElementById('startChatBtn');
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            alert('Live chat feature coming soon! Please use email or phone support for now.');
        });
    }
});
