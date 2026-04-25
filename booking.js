// booking.js — UI interactions and cart logic

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CART & SUMMARY LOGIC ---
    const summaryEmpty   = document.getElementById('summaryEmpty');
    const summaryItems   = document.getElementById('summaryItems');
    const summaryFooter  = document.getElementById('summaryFooter');
    const grandTotalEl   = document.getElementById('grandTotal');
    const bookAllBtn     = document.getElementById('bookAllBtn');

    const cart = new Map();

    function renderSummary() {
        summaryItems.innerHTML = '';
        const summaryCalculations = document.getElementById('summaryCalculations');
        let subtotal = 0;
        let hasItems = false;

        cart.forEach((item, key) => {
            if (item.qty <= 0) return;
            hasItems = true;

            const lineTotal = item.price * item.qty;
            subtotal += lineTotal;

            const li = document.createElement('li');
            li.className = 'summary-item';
            li.innerHTML = `
                <div class="summary-item-label">
                    <strong>${item.roomName}</strong>
                    ${item.mealLabel} × ${item.qty}
                </div>
                <div class="summary-item-price">₹${lineTotal.toLocaleString('en-IN')}</div>
            `;
            summaryItems.appendChild(li);
        });

        if (hasItems) {
            let discountAmount = 0;
            let discountDisplay = '';
            const savedCoupon = sessionStorage.getItem('appliedCoupon');
            if (savedCoupon) {
                const discPercent = parseInt(savedCoupon);
                if (!isNaN(discPercent) && discPercent > 0) {
                    discountAmount = subtotal * (discPercent / 100);
                    discountDisplay = `<div class="summary-calc-row" style="color:var(--primary-red);"><span>Discount (${discPercent}%)</span><span>-₹${discountAmount.toLocaleString('en-IN')}</span></div>`;
                }
            }

            const subtotalAfterDiscount = subtotal - discountAmount;
            const tax = subtotalAfterDiscount * 0.18;
            const grandTotal = subtotalAfterDiscount + tax;

            if (summaryCalculations) {
                summaryCalculations.innerHTML = `
                    <div class="summary-calc-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
                    ${discountDisplay}
                    <div class="summary-calc-row"><span>Taxes & Fees (18%)</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
                `;
            }

            summaryEmpty.style.display  = 'none';
            summaryItems.style.display  = 'flex';
            summaryFooter.style.display = 'flex';
            grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
        } else {
            summaryEmpty.style.display  = 'flex';
            summaryItems.style.display  = 'none';
            summaryFooter.style.display = 'none';
            if (summaryCalculations) summaryCalculations.innerHTML = '';
        }
    }

    function attachMealBlock(mealBlock, roomCard) {
        const roomId    = roomCard.dataset.id;
        const roomName  = roomCard.dataset.name;
        const title     = mealBlock.querySelector('h5').textContent.trim();
        const price     = parseInt(mealBlock.querySelector('.meal-price').textContent.replace(/[^0-9]/g, ''));
        const qtyInput  = mealBlock.querySelector('.bed-qty');
        const minusBtn  = mealBlock.querySelector('.minus');
        const plusBtn   = mealBlock.querySelector('.plus');
        const max       = parseInt(qtyInput.getAttribute('max'));
        const cartKey   = `${roomId}__${title}`;

        const updateBlock = () => {
            const qty = parseInt(qtyInput.value);
            mealBlock.classList.toggle('is-active', qty > 0);

            if (qty > 0) {
                cart.set(cartKey, { roomName, mealLabel: title, price, qty });
            } else {
                cart.delete(cartKey);
            }
            renderSummary();
        };

        minusBtn.addEventListener('click', () => {
            const cur = parseInt(qtyInput.value);
            if (cur > 0) { qtyInput.value = cur - 1; updateBlock(); }
        });

        plusBtn.addEventListener('click', () => {
            const cur = parseInt(qtyInput.value);
            if (cur < max) { qtyInput.value = cur + 1; updateBlock(); }
        });
    }

    // --- 2. MODAL LOGIC ---
    const modal = document.getElementById('roomDetailsModal');
    const modalClose = document.getElementById('modalClose');
    const modalMainImg = document.getElementById('modalMainImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalAmenitiesList = document.getElementById('modalAmenitiesList');
    
    // Build icon map from template
    const iconMap = {};
    const iconTemplate = document.getElementById('amenityIconTemplate');
    if (iconTemplate) {
        const spans = iconTemplate.content.querySelectorAll('span[data-name]');
        spans.forEach(sp => {
            iconMap[sp.dataset.name.toLowerCase()] = sp.textContent;
        });
    }

    function openModal(roomCard) {
        // Collect data
        const name = roomCard.dataset.name;
        const desc = roomCard.dataset.desc;
        const amenities = roomCard.dataset.amenities.split(',');
        const imgSrc = roomCard.querySelector('.room-img-wrapper img').src;

        // Populate
        modalTitle.textContent = name;
        modalDesc.textContent = desc;
        modalMainImg.style.backgroundImage = `url(${imgSrc})`;

        modalAmenitiesList.innerHTML = '';
        amenities.forEach(am => {
            const trimmed = am.trim();
            const icon = iconMap[trimmed.toLowerCase()] || '✨';
            const html = `
                <div class="am-item">
                    <span class="icon">${icon}</span>
                    <span>${trimmed}</span>
                </div>
            `;
            modalAmenitiesList.insertAdjacentHTML('beforeend', html);
        });

        modal.classList.remove('hidden');
    }

    modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // --- 3. CALENDAR GENERATOR ---
    function generateMockCalendar(ribbon, basePrice) {
        ribbon.innerHTML = '';
        const today = new Date(); // Start from "Wed 29 Apr" conceptually, we'll just use dynamic current dates
        
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            
            const dow = daysOfWeek[d.getDay()];
            const dayNum = String(d.getDate()).padStart(2, '0');
            const mo = months[d.getMonth()];
            const dLabel = `${dow} ${dayNum} ${mo}`;

            // Randomize if sold out (approx 20% chance)
            const isSoldOut = Math.random() < 0.25;
            const units = isSoldOut ? 0 : Math.floor(Math.random() * 8) + 1;
            
            const div = document.createElement('div');
            div.className = `cal-day ${isSoldOut ? 'sold-out' : ''}`;
            div.innerHTML = `
                <div class="d-label">${dLabel}</div>
                <div class="d-price">${isSoldOut ? '❌' : `₹${basePrice}`}</div>
                <div class="d-units">${units} units</div>
            `;
            ribbon.appendChild(div);
        }
    }


    // --- 4. INITIALIZE ALL ROOM CARDS ---
    document.querySelectorAll('.room-card').forEach(roomCard => {
        // Init Cart inputs
        roomCard.querySelectorAll('.meal-block').forEach(mb => attachMealBlock(mb, roomCard));

        // Init toggle calendar
        const calToggle = roomCard.querySelector('.cal-toggle-btn');
        const calWrap = roomCard.querySelector('.calendar-wrapper');
        const calRibbon = roomCard.querySelector('.calendar-ribbon');
        const basePrice = roomCard.dataset.basePrice;

        if (calToggle && calWrap) {
            generateMockCalendar(calRibbon, basePrice);
            calToggle.addEventListener('click', () => { // Fixed duplicate definition issue by ensuring clear logic
                const isHidden = calWrap.classList.contains('hidden');
                calWrap.classList.toggle('hidden');
                calToggle.classList.toggle('open');
            });
        }

        // Init modal openers
        const imgWrapper = roomCard.querySelector('.room-img-wrapper');
        if (imgWrapper) {
            imgWrapper.addEventListener('click', () => openModal(roomCard));
        }
    });

    // --- 5. OTP MODAL FLOW ---
    const phoneModal = document.getElementById('phoneModal');
    const otpVerifyModal = document.getElementById('otpVerifyModal');
    const phoneModalClose = document.getElementById('phoneModalClose');
    const otpVerifyModalClose = document.getElementById('otpVerifyModalClose');
    
    const btnRequestOtp = document.getElementById('btnRequestOtp');
    const btnVerifyOtp = document.getElementById('btnVerifyOtp');
    const mobileNumberInput = document.getElementById('mobileNumberInput');
    const displayMobile = document.getElementById('displayMobile');
    const otpDigits = document.querySelectorAll('.otp-digit');

    if (bookAllBtn) {
        bookAllBtn.addEventListener('click', () => {
            if (cart.size > 0) {
                if(mobileNumberInput) mobileNumberInput.value = '';
                otpDigits.forEach(d => d.value = '');
                if(phoneModal) phoneModal.classList.remove('hidden');
                if(otpVerifyModal) otpVerifyModal.classList.add('hidden');
            }
        });
    }

    if (phoneModalClose) {
        phoneModalClose.addEventListener('click', () => phoneModal.classList.add('hidden'));
    }
    if (otpVerifyModalClose) {
        otpVerifyModalClose.addEventListener('click', () => otpVerifyModal.classList.add('hidden'));
    }

    if (btnRequestOtp) {
        btnRequestOtp.addEventListener('click', () => {
            if (mobileNumberInput.value.length === 10) {
                displayMobile.textContent = '+91 ' + mobileNumberInput.value;
                phoneModal.classList.add('hidden'); // Close phone modal
                otpVerifyModal.classList.remove('hidden'); // Open verify modal
                otpDigits[0].focus();
            } else {
                alert('Please enter a valid 10-digit mobile number.');
            }
        });
    }

    otpDigits.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                input.value = e.key;
                if (index < otpDigits.length - 1) otpDigits[index + 1].focus();
            } else if (e.key === 'Backspace') {
                input.value = '';
                if (index > 0) otpDigits[index - 1].focus();
            }
        });
    });

    if (btnVerifyOtp) {
        btnVerifyOtp.addEventListener('click', () => {
            const otpStr = Array.from(otpDigits).map(d => d.value).join('');
            if (otpStr.length === 4) {
                const cartData = [];
                cart.forEach((val, key) => cartData.push({ key, ...val }));
                sessionStorage.setItem('bookingCart', JSON.stringify(cartData));
                window.location.href = 'guest-details.html';
            } else {
                alert('Please enter the full 4-digit OTP.');
            }
        });
    }

    renderSummary();
});
