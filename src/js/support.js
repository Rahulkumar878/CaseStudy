document.addEventListener('DOMContentLoaded', () => {
    // Authentication check
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = '../index.html';
    }

    // Display username
    document.getElementById('username').textContent = sessionStorage.getItem('userId');

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

    // Support form submission
    const supportForm = document.getElementById('supportForm');
    supportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            subject: document.getElementById('subject').value,
            bookingId: document.getElementById('bookingId').value,
            message: document.getElementById('message').value,
            userId: sessionStorage.getItem('userId'),
            timestamp: new Date().toISOString()
        };

        // Store support ticket in session storage
        const supportTickets = JSON.parse(sessionStorage.getItem('supportTickets') || '[]');
        const ticketId = 'TICKET-' + Date.now();
        supportTickets.push({
            id: ticketId,
            ...formData,
            status: 'Open'
        });
        sessionStorage.setItem('supportTickets', JSON.stringify(supportTickets));

        // Show success message
        alert(`Your support ticket ${ticketId} has been submitted. We'll get back to you soon.`);
        supportForm.reset();
    });

    // Live chat functionality
    const startChatBtn = document.getElementById('startChatBtn');
    startChatBtn.addEventListener('click', () => {
        // In a real application, this would initialize a chat widget
        alert('Chat feature coming soon! Please use email or phone support for now.');
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../../src/index.html';
    });
});
