// Request location permission and get coordinates
function requestLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        // Options for high accuracy
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };
                resolve(coords);
            },
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = 'An unknown error occurred';
                        break;
                }
                reject(new Error(errorMessage));
            },
            options,
        );
    });
}

// Send location to Laravel backend
async function updateUserLocation() {
    try {
        const coords = await requestLocation();

        const response = await fetch('/api/update-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute('content'),
            },
            body: JSON.stringify({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update location');
        }

        const result = await response.json();
        console.log('Location updated successfully:', result);
        return result;
    } catch (error) {
        console.error('Location error:', error);
        // Handle error (show fallback, use IP location, etc.)
        handleLocationError(error);
    }
}

// Handle location errors gracefully
function handleLocationError(error) {
    // Show user-friendly message
    const errorDiv = document.getElementById('location-error');
    if (errorDiv) {
        errorDiv.textContent = `Location error: ${error.message}`;
        errorDiv.style.display = 'block';
    }

    // Optionally fall back to IP-based location
    fallbackToIPLocation();
}

// Fallback to IP-based location
async function fallbackToIPLocation() {
    try {
        const response = await fetch('/api/ip-location', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute('content'),
            },
        });

        if (response.ok) {
            console.log('Fell back to IP-based location');
        }
    } catch (error) {
        console.error('IP location fallback failed:', error);
    }
}

// Show privacy consent modal before requesting location
function showLocationConsentModal() {
    const modal = document.getElementById('location-consent-modal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
    }
}

// Handle consent approval
function handleLocationConsent() {
    // Hide consent modal
    const modal = document.getElementById('location-consent-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }

    // Now request location
    updateUserLocation();
}

// Handle consent denial
function handleLocationDenial() {
    const modal = document.getElementById('location-consent-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }

    // Show message about limited functionality
    const messageDiv = document.getElementById('location-denied-message');
    if (messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.innerHTML = `
            <div class="alert alert-info">
                <strong>Location access declined.</strong> 
                You can still use our services, but distance calculations and nearby provider suggestions will be limited.
                You can change this decision anytime in your account settings.
            </div>
        `;
    }

    // Optional: Still try IP-based location for basic functionality
    fallbackToIPLocation();
}

// Check if user has already given consent
function checkLocationConsent() {
    // Check if user previously consented (stored in database)
    fetch('/api/location-consent-status', {
        headers: {
            'X-CSRF-TOKEN': document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute('content'),
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.consent_given) {
                // User already consented, request location directly
                updateUserLocation();
            } else {
                // Show consent modal
                showLocationConsentModal();
            }
        })
        .catch((error) => {
            console.error('Error checking consent status:', error);
            // Default to showing consent modal
            showLocationConsentModal();
        });
}

// Usage example
document.addEventListener('DOMContentLoaded', function () {
    const locationBtn = document.getElementById('enable-location');
    if (locationBtn) {
        locationBtn.addEventListener('click', checkLocationConsent);
    }

    // Set up consent modal buttons
    const consentBtn = document.getElementById('consent-approve');
    const denyBtn = document.getElementById('consent-deny');

    if (consentBtn) {
        consentBtn.addEventListener('click', handleLocationConsent);
    }

    if (denyBtn) {
        denyBtn.addEventListener('click', handleLocationDenial);
    }
});
