document.addEventListener("DOMContentLoaded", function () {
  const apiUrlSendOtp = "https://api.gamescorner.ae/api/web_forgot";
  const apiUrlVerifyOtp = "https://api.gamescorner.ae/api/web_verify";

  // Function to send OTP
  async function sendOtp(email) {
    const response = await fetch(apiUrlSendOtp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  }

  // Function to verify OTP
  async function verifyOtp(email, resetPasswordOTP) {
    const response = await fetch(apiUrlVerifyOtp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resetPasswordOTP }),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  }

  // Handle Forgot Password Page
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailElement = document.getElementById("email");
      const submitButton = document.getElementById("submitButton");
      const statusMessage = document.getElementById("statusMessage");

      if (!emailElement || !submitButton || !statusMessage) {
        console.error("Required elements are missing on the Forgot Password page.");
        return;
      }

      const email = emailElement.value.trim();
      if (!email) {
        statusMessage.innerText = "Please enter a valid email address.";
        return;
      }

      submitButton.disabled = true;
      submitButton.innerText = "Sending OTP...";

      try {
        const data = await sendOtp(email);
        statusMessage.innerText = data.message;

        if (data.success) {
          // Store email in localStorage to pass it to the next page
          localStorage.setItem("email", email);
          window.location.href = "verify-otp.html";
        }
      } catch (error) {
        statusMessage.innerText = error.message || "Failed to send OTP.";
      } finally {
        submitButton.disabled = false;
        submitButton.innerText = "Send OTP";
      }
    });
  }

  // Handle OTP Verification Page
  const verifyOtpButton = document.getElementById("verifyOtpButton");
  if (verifyOtpButton) {
    const emailElement = document.getElementById("email");
    const otpElement = document.getElementById("otp");
    const otpStatusMessage = document.getElementById("otpStatusMessage");

    // Pre-fill the email field with the value from localStorage
    const storedEmail = localStorage.getItem("email");
    if (emailElement && storedEmail) {
      emailElement.value = storedEmail;
    }

    verifyOtpButton.addEventListener("click", async () => {
      if (!emailElement || !otpElement || !otpStatusMessage) {
        console.error("Required elements are missing on the OTP Verification page.");
        return;
      }

      const email = emailElement.value.trim();
      const resetPasswordOTP = otpElement.value.trim();

      if (!email || !resetPasswordOTP) {
        otpStatusMessage.innerText = "Both email and OTP are required.";
        return;
      }

      verifyOtpButton.disabled = true;
      verifyOtpButton.innerText = "Verifying...";

      try {
        const data = await verifyOtp(email, resetPasswordOTP);
        otpStatusMessage.innerText = data.message;

        if (data.success) {
          alert("OTP verified successfully!");
          // Clear localStorage after verification
          // localStorage.removeItem("email");
          localStorage.setItem("resetPasswordOTP", resetPasswordOTP)
          window.location.href = "reset-password.html";
        }
      } catch (error) {
        otpStatusMessage.innerText = error.message || "Failed to verify OTP.";
      } finally {
        verifyOtpButton.disabled = false;
        verifyOtpButton.innerText = "Verify OTP";
      }
    });
  }
});
