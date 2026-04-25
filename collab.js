document.addEventListener('DOMContentLoaded', () => {
    const natSelect = document.getElementById('collabNationality');
    
    // Exact identical country mapping from guest-details.js to keep absolute consistency
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    if (natSelect) {
        countries.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = c;
            natSelect.appendChild(option);
        });
    }

    // Extract category from URL and auto-fill the field
    const urlParams = new URLSearchParams(window.location.search);
    const categoryQuery = urlParams.get('category');
    const categoryField = document.getElementById('collabCategory');
    if (categoryField && categoryQuery) {
        // Decode and format if needed
        categoryField.value = decodeURIComponent(categoryQuery);
    }

    const collabForm = document.getElementById('collabForm');
    if (collabForm) {
        collabForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate Phone
            const phone = document.getElementById('collabPhone').value;
            if (phone.length < 10) {
                alert("Please enter a valid 10-digit mobile number.");
                return;
            }

            // Mock Success Submission
            const btn = collabForm.querySelector('button[type="submit"]');
            const ogText = btn.innerText;
            btn.innerText = "Submitting...";
            btn.style.opacity = '0.8';

            setTimeout(() => {
                alert("Application submitted successfully! Our team will reach out to you shortly.");
                collabForm.reset();
                btn.innerText = ogText;
                btn.style.opacity = '1';
                window.location.href = "index.html"; // Route back to landing page
            }, 800);
        });
    }
});
