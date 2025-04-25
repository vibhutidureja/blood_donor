// Sample blood inventory data
let bloodInventory = JSON.parse(localStorage.getItem('bloodInventory')) || {
    'A+': { units: 15, status: 'good' },
    'A-': { units: 8, status: 'medium' },
    'B+': { units: 12, status: 'good' },
    'B-': { units: 5, status: 'low' },
    'AB+': { units: 3, status: 'low' },
    'AB-': { units: 2, status: 'critical' },
    'O+': { units: 20, status: 'good' },
    'O-': { units: 6, status: 'medium' }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Populate blood inventory
    populateBloodInventory();
    
    // Handle form submissions
    setupFormHandlers();
    
    // Set up navigation
    setupNavigation();

    // Initialize form validation
    setupFormValidation();
});

// Form validation setup
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => validateInput(input));
            input.addEventListener('blur', () => validateInput(input));
        });
    });
}

// Input validation
function validateInput(input) {
    const value = input.value.trim();
    const errorElement = input.nextElementSibling;
    
    if (input.hasAttribute('required') && !value) {
        showError(input, 'This field is required');
        return false;
    }

    if (input.type === 'tel' && value && !/^\d{10}$/.test(value)) {
        showError(input, 'Please enter a valid 10-digit phone number');
        return false;
    }

    if (input.type === 'number') {
        const min = input.getAttribute('min');
        const max = input.getAttribute('max');
        if (min && parseInt(value) < parseInt(min)) {
            showError(input, `Minimum value is ${min}`);
            return false;
        }
        if (max && parseInt(value) > parseInt(max)) {
            showError(input, `Maximum value is ${max}`);
            return false;
        }
    }

    removeError(input);
    return true;
}

function showError(input, message) {
    const errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        input.parentNode.insertBefore(error, input.nextSibling);
    } else {
        errorElement.textContent = message;
    }
    input.classList.add('error');
}

function removeError(input) {
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
    input.classList.remove('error');
}

// Populate blood inventory cards
function populateBloodInventory() {
    const inventoryGrid = document.querySelector('.inventory-grid');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = Object.entries(bloodInventory)
        .map(([group, data]) => `
            <div class="blood-card ${data.status}">
                <h3>${group}</h3>
                <p>Units Available: ${data.units}</p>
                <p class="status">Status: ${data.status}</p>
            </div>
        `).join('');
}

// Handle form submissions
function setupFormHandlers() {
    const donateForm = document.getElementById('donateForm');
    const requestForm = document.getElementById('requestForm');

    if (donateForm) {
        donateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(donateForm)) {
                handleDonationForm(donateForm);
            }
        });
    }

    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(requestForm)) {
                handleRequestForm(requestForm);
            }
        });
    }
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    return isValid;
}

// Handle donation form submission
function handleDonationForm(form) {
    showLoading(form);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate API call delay
    setTimeout(() => {
        // Update blood inventory
        const bloodGroup = data.bloodGroup;
        if (bloodInventory[bloodGroup]) {
            bloodInventory[bloodGroup].units += 1;
            updateBloodStatus(bloodGroup);
            localStorage.setItem('bloodInventory', JSON.stringify(bloodInventory));
            populateBloodInventory();
        }
        
        hideLoading(form);
        showNotification('Thank you for your donation request! We will contact you shortly.', 'success');
        form.reset();
    }, 1500);
}

// Handle blood request form submission
function handleRequestForm(form) {
    showLoading(form);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate API call delay
    setTimeout(() => {
        const bloodGroup = data.requestBloodGroup;
        const units = parseInt(data.units);
        
        if (bloodInventory[bloodGroup] && bloodInventory[bloodGroup].units >= units) {
            bloodInventory[bloodGroup].units -= units;
            updateBloodStatus(bloodGroup);
            localStorage.setItem('bloodInventory', JSON.stringify(bloodInventory));
            populateBloodInventory();
            showNotification('Your blood request has been approved and will be processed immediately.', 'success');
        } else {
            showNotification('Sorry, we currently don\'t have enough blood units available.', 'error');
        }
        
        hideLoading(form);
        form.reset();
    }, 1500);
}

function updateBloodStatus(bloodGroup) {
    const units = bloodInventory[bloodGroup].units;
    if (units >= 10) {
        bloodInventory[bloodGroup].status = 'good';
    } else if (units >= 5) {
        bloodInventory[bloodGroup].status = 'medium';
    } else if (units >= 2) {
        bloodInventory[bloodGroup].status = 'low';
    } else {
        bloodInventory[bloodGroup].status = 'critical';
    }
}

// Loading state
function showLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
}

function hideLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'Submit';
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Set up navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add additional styling
const style = document.createElement('style');
style.textContent = `
    .blood-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
    }

    .blood-card h3 {
        color: #c62828;
        margin-bottom: 1rem;
    }

    .blood-card .status {
        font-weight: bold;
        margin-top: 0.5rem;
    }

    .blood-card.good .status {
        color: #4caf50;
    }

    .blood-card.medium .status {
        color: #ff9800;
    }

    .blood-card.low .status {
        color: #f44336;
    }

    .blood-card.critical .status {
        color: #c62828;
        font-weight: bold;
    }

    .error-message {
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }

    .error {
        border-color: #f44336 !important;
    }

    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateY(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }

    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }

    .notification.success {
        border-left: 4px solid #4caf50;
    }

    .notification.error {
        border-left: 4px solid #f44336;
    }

    .notification i {
        font-size: 1.25rem;
    }

    .notification.success i {
        color: #4caf50;
    }

    .notification.error i {
        color: #f44336;
    }
`;

document.head.appendChild(style); 