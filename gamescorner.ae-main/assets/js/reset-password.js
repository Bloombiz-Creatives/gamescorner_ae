// reset-password.js
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetPasswordForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.getElementById('submitButton');

    // Get email and OTP from URL parameters
    // const urlParams = new URLSearchParams(window.location.search);
    const email = localStorage.getItem('email');
    const resetPasswordOTP = localStorage.getItem('resetPasswordOTP');

    if (!email || !resetPasswordOTP) {
        errorMessage.textContent = 'Invalid reset password link';
        return;
    }

    // Password validation
    function validatePasswords() {
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;

        if (passwordValue.length < 6) {
            errorMessage.textContent = 'Password must be at least 8 characters long';
            submitButton.disabled = true;
            return false;
        }

        if (passwordValue !== confirmPasswordValue) {
            errorMessage.textContent = 'Passwords do not match';
            submitButton.disabled = true;
            return false;
        }

        errorMessage.textContent = '';
        submitButton.disabled = false;
        return true;
    }

    password.addEventListener('input', validatePasswords);
    confirmPassword.addEventListener('input', validatePasswords);

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Resetting...';

            const response = await fetch('https://api.gamescorner.ae/api/web_reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    resetPasswordOTP,
                    password: password.value,
                    confirmPassword: confirmPassword.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Show success message
            errorMessage.style.color = 'green';
            errorMessage.textContent = data.message;

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            errorMessage.style.color = 'red';
            errorMessage.textContent = error.message;
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });
});