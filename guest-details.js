// guest-details.js
document.addEventListener('DOMContentLoaded', () => {

    let cartJson = sessionStorage.getItem('bookingCart');
    if (!cartJson) {
        alert("No booking found! Redirecting to booking page.");
        window.location.href = "booking.html";
        return;
    }

    let cartParams = JSON.parse(cartJson);

    const summaryItems = document.getElementById('summaryItems');
    const grandTotalEl = document.getElementById('grandTotal');
    const summaryCalculations = document.getElementById('summaryCalculations');
    const formsContainer = document.getElementById('formsContainer');
    const formTemplate = document.getElementById('guestFormTemplate');
    const btnFinalizeBooking = document.getElementById('btnFinalizeBooking');
    const btnApplyCoupon = document.getElementById('btnApplyCoupon');
    const couponInput = document.getElementById('couponInput');

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    // Calculate max date for 18+ validation
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

    function renderAll() {
        if (!cartParams || cartParams.length === 0) {
            window.location.href = "booking.html";
            return;
        }

        // Reset Containers
        summaryItems.innerHTML = '';
        formsContainer.innerHTML = '';

        let subtotal = 0;
        let totalGuestsGlobalCount = 1;

        cartParams.forEach((item, index) => {
            const lineTotal = item.price * item.qty;
            subtotal += lineTotal;
            
            // Build Summary UI
            const li = document.createElement('li');
            li.className = 'summary-item';
            li.innerHTML = `
                <div class="summary-item-label">
                    <strong>${item.roomName}</strong>
                    ${item.mealLabel} × ${item.qty}
                </div>
                <div class="summary-item-price-wrap">
                    <div class="summary-item-price">₹${lineTotal.toLocaleString('en-IN')}</div>
                    <button class="btn-delete-item" data-index="${index}" title="Remove Item">🗑️</button>
                </div>
            `;
            summaryItems.appendChild(li);

            // Generate Forms for this item
            const nameLower = item.roomName.toLowerCase();
            const isPrivate = nameLower.includes('deluxe') || nameLower.includes('private') || nameLower.includes('suite');

            if (isPrivate) {
                // For Private/Deluxe: Output 2 forms per quantity booked
                for (let r = 0; r < item.qty; r++) {
                    const roomContext = item.qty > 1 ? ` (Room ${r+1})` : '';
                    spawnForm(`Guest ${totalGuestsGlobalCount++}`, `Primary Guest for ${item.roomName}${roomContext}`, false);
                    spawnForm(`Guest ${totalGuestsGlobalCount++}`, `Secondary Guest for ${item.roomName}${roomContext}`, true);
                }
            } else {
                // For Dorms: Output 1 mandatory form per bed quantity booked
                for (let b = 0; b < item.qty; b++) {
                    spawnForm(`Guest ${totalGuestsGlobalCount++}`, `Bed ${b+1} in ${item.roomName}`, false);
                }
            }
        });

        // Add delete listeners
        document.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cartParams.splice(idx, 1);
                sessionStorage.setItem('bookingCart', JSON.stringify(cartParams));
                renderAll();
            });
        });

        // Summary Calculations (Discount + Tax)
        let discountAmount = 0;
        let discountDisplay = '';
        const savedCoupon = sessionStorage.getItem('appliedCoupon');
        if (savedCoupon) {
            const discPercent = parseInt(savedCoupon);
            if (!isNaN(discPercent) && discPercent > 0) {
                discountAmount = subtotal * (discPercent / 100);
                discountDisplay = `<div class="summary-calc-row" style="color:var(--primary-red);"><span>Discount (${discPercent}%)</span><span>-₹${discountAmount.toLocaleString('en-IN')}</span></div>`;
                if(couponInput) couponInput.value = `EXTENDED-${discPercent}`;
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
        grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    }

    // Helper to spawn a form
    function spawnForm(titleText, subtitleText, isOptional) {
        const clone = formTemplate.content.cloneNode(true);
        const titleEl = clone.querySelector('.guest-title');
        const badgeEl = clone.querySelector('.badge-optional');
        const subTitleEl = clone.querySelector('.guest-subtitle');
        const inputs = clone.querySelectorAll('input, select');
        
        // Populate Countries Select
        const natSelect = clone.querySelector('.gf-nationality');
        if (natSelect) {
            countries.forEach(c => {
                const option = document.createElement('option');
                option.value = c;
                option.textContent = c;
                natSelect.appendChild(option);
            });
        }

        // Apply 18+ Date Logic
        const dobInput = clone.querySelector('.gf-dob');
        if (dobInput) {
            dobInput.max = maxDate;
            dobInput.addEventListener('change', (e) => {
                if (e.target.value > maxDate) {
                    alert('Primary guests must be 18 years or older to book.');
                    e.target.value = '';
                }
            });
        }

        // Text setup
        titleEl.firstChild.textContent = titleText + " ";
        subTitleEl.textContent = subtitleText;

        if (isOptional) {
            badgeEl.classList.remove('hidden');
            inputs.forEach(inp => inp.removeAttribute('required'));
            const reqSpans = clone.querySelectorAll('.req');
            reqSpans.forEach(sp => sp.style.display = 'none');
        } else {
            badgeEl.classList.add('hidden');
        }

        formsContainer.appendChild(clone);
    }

    // Initialize View
    renderAll();

    // Finalize
    btnFinalizeBooking.addEventListener('click', () => {
        const requiredInputs = document.querySelectorAll('input[required], select[required]');
        let isValid = true;
        requiredInputs.forEach(inp => {
            if (!inp.value.trim()) {
                inp.style.borderColor = 'red';
                isValid = false;
            } else {
                inp.style.borderColor = '#ddd';
            }
        });

        if (isValid) {
            alert('Guest details saved successfully!\nProceeding to payment gateway...');
        } else {
            alert('Please fill out all mandatory fields before proceeding.');
        }
    });

    if (btnApplyCoupon) {
        btnApplyCoupon.addEventListener('click', () => {
            const val = couponInput.value.trim().toUpperCase();
            if (val.length > 3) {
                alert(`Coupon applied: ${val}. Applying 10% discount!`);
                // Placeholder mock logic for UX, actually calculations would adjust subtotal here.
                couponInput.value = '';
            } else {
                alert('Please enter a valid coupon code.');
            }
        });
    }

});
