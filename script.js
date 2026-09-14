import {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithRedirect,
  getRedirectResult,
  ensureUserDocument,
  friendlyAuthError,
  isFirebaseConfigured
} from "../firebase.js";

"use strict";

const form = document.getElementById("signupForm");
const modal = document.getElementById("termsModal");
const openTerms = document.getElementById("openTerms");
const closeTerms = document.getElementById("closeTerms");
const togglePasswordBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const notification = document.getElementById("topNotification");
const submitBtn = document.getElementById("submitBtn");

function showNotification(message, isError = true) {
  notification.textContent = message;
  notification.style.display = "block";
  notification.style.color = isError ? "#ff4d4d" : "#ffffff";
  notification.classList.toggle("shake", isError);
  if (isError) void notification.offsetWidth;
  clearTimeout(showNotification.timer);
  showNotification.timer = setTimeout(() => {
    notification.style.display = "none";
    notification.classList.remove("shake");
  }, isError ? 4500 : 3000);
}

function openTermsModal(event) {
  event?.preventDefault();
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  closeTerms.focus();
}
function closeTermsModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
openTerms?.addEventListener("click", openTermsModal);
closeTerms?.addEventListener("click", closeTermsModal);
modal?.addEventListener("click", e => { if (e.target === modal) closeTermsModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeTermsModal(); });

togglePasswordBtn?.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePasswordBtn.textContent = showing ? "👁️" : "🙈";
});

const allowedPhonePrefixes = ["23480", "23481", "23490", "23491", "23470", "23471"];
function isValidPhone(phone) {
  return /^\d{13}$/.test(phone) && allowedPhonePrefixes.some(prefix => phone.startsWith(prefix));
}
document.getElementById("phone")?.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 13);
});


getRedirectResult(auth).then(async result => {
  if (!result?.user) return;
  await ensureUserDocument(result.user, { syncProfile: true });
  window.location.replace("../login/index.html");
}).catch(error => showNotification(friendlyAuthError(error)));

if (!isFirebaseConfigured()) {
  showNotification("Firebase is not configured yet. Add your Firebase web config before creating accounts.");
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const realName = document.getElementById("realName").value.trim().replace(/\s+/g, " ");
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const ageValue = document.getElementById("age").value.trim();
  const age = Number(ageValue);
  const password = passwordInput.value;
  const termsChecked = document.getElementById("terms").checked;

  if (!realName) return showNotification("Please enter your Real Name.");
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) return showNotification("Email must be a valid @gmail.com address.");
  if (!isValidPhone(phone)) return showNotification("Invalid number. 13 digits only with an approved Nigerian prefix.");
  if (!ageValue || !Number.isInteger(age) || age < 12 || age > 45) return showNotification("Age must be between 12 and 45.");
  if (!(password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password))) {
    return showNotification("Password must be at least 8 characters and contain an uppercase letter, a digit, and a symbol.");
  }
  if (!termsChecked) return showNotification("Please accept the Terms and Conditions.");

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: realName });
    const username = realName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || `user${credential.user.uid.slice(0, 6)}`;
    await ensureUserDocument(credential.user, { name: realName, username, phone, age });
    showNotification("Account created successfully.", false);
    setTimeout(() => window.location.replace("../dashboard/index.html#home"), 500);
  } catch (error) {
    showNotification(friendlyAuthError(error));
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// Optional Google account creation. Firebase creates the account on first successful sign-in.
const googleButton = document.createElement("button");
googleButton.type = "button";
googleButton.className = "google-signup-btn";
googleButton.textContent = "Continue with Google";
googleButton.style.cssText = "width:100%;margin-top:12px;padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;";
form.insertAdjacentElement("afterend", googleButton);
googleButton.addEventListener("click", async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    showNotification(friendlyAuthError(error));
  }
});
