document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Date Pickers with Today and Tomorrow
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    if (checkinInput && checkoutInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        checkinInput.value = formatDate(today);
        checkinInput.min = formatDate(today);
        
        checkoutInput.value = formatDate(tomorrow);
        checkoutInput.min = formatDate(tomorrow);

        checkinInput.addEventListener('change', (e) => {
            const newCheckinDate = new Date(e.target.value);
            const newMinCheckout = new Date(newCheckinDate);
            newMinCheckout.setDate(newMinCheckout.getDate() + 1);
            
            checkoutInput.min = formatDate(newMinCheckout);
            if (new Date(checkoutInput.value) <= newCheckinDate) {
                checkoutInput.value = formatDate(newMinCheckout);
            }
        });
    }

    // 2. Form Submission handler logic (Auto calculating discount)
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Calculate Date Math
            const checkin = new Date(checkinInput.value);
            const checkout = new Date(checkoutInput.value);
            const timeDiff = checkout.getTime() - checkin.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // Auto-apply logic
            let discountValue = 0;
            if (daysDiff >= 5 && daysDiff < 10) {
                discountValue = 10;
            } else if (daysDiff >= 10 && daysDiff <= 31) {
                discountValue = 20;
            } else if (daysDiff > 31) {
                discountValue = 30;
            }

            if (discountValue > 0) {
                sessionStorage.setItem('appliedCoupon', discountValue.toString());
            } else {
                sessionStorage.removeItem('appliedCoupon');
            }

            // Redirect to booking portal
            window.location.href = 'booking.html';
        });
    }

    // 3. Extended Stay Notification and Auto-Scroll
    document.querySelectorAll('.extended-stay-card').forEach(card => {
        card.addEventListener('click', () => {
            const discount = card.getAttribute('data-discount');
            const minDays = card.getAttribute('data-min-days');
            
            let notice = `Please select more than ${minDays} days to get ${discount}% discount.`;
            if (minDays === "5") notice = "Please select 5 or more days to get 10% discount.";
            if (minDays === "10") notice = "Please select 10 or more days to get 20% discount.";
            if (minDays === "32") notice = "Please select more than 31 days to get 30% discount.";

            alert(notice);

            const bookingFormEl = document.querySelector('.booking-card');
            if (bookingFormEl) {
                bookingFormEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // 4. Smooth Scrolling for Navigation
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
