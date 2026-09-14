import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    updateDoc,
    serverTimestamp,
    ensureUserDocument,
    friendlyAuthError
} from "../firebase.js";

/* =====================================================
   KING SCALE DIGITALS
   APPLICATION JAVASCRIPT
===================================================== */


/* =====================================================
   APPLICATION DATA
===================================================== */

const appData = {

    user: {

        name: "Kingscale User",

        username: "",

        email: "",

        avatar: "G",

        provider: "Google",

        connected: true

    },


    plan: {

        name: "KING PLAN",

        status: "Active",

        progress: 75,

        daysRemaining: 24,

        storage: 75,

        features: [

            "Digital Tools",

            "Premium Access",

            "AI Features",

            "Priority Support"

        ]

    },


    invites: {

        invited: 12,

        joined: 8,

        active: 5,

        rewardTarget: 10,

        referral:
            ""

    },


    settings: {

        notifications: true,

        marketing: false,

        securityAlerts: true

    }

};


/* =====================================================
   APPLICATION STATE
===================================================== */

const state = {

    currentRoute: "home",

    menuOpen: false

};


/* =====================================================
   DOM
===================================================== */

const app =
    document.getElementById("app");

const toast =
    document.getElementById("toast");

const profileTrigger =
    document.getElementById("profileTrigger");

const profileMenu =
    document.getElementById("profileMenu");

const modalBackdrop =
    document.getElementById("modalBackdrop");


/* =====================================================
   INIT
===================================================== */

/*
    This is the application initialization function.

    Everything starts here.
*/

function init() {

    loadUserIntoHeader();

    registerGlobalEvents();

    setupInitialRoute();

}


/* =====================================================
   DEMO SESSION HYDRATION
===================================================== */

async function hydrateFirebaseUser(user) {

    const profile = await ensureUserDocument(user, { syncProfile: true });

    appData.user.name = profile?.name || user.displayName || "Kingscale User";
    appData.user.username = profile?.username || appData.user.username;
    appData.user.email = user.email || profile?.email || "";
    appData.user.avatar = (appData.user.name || "K").charAt(0).toUpperCase();
    appData.user.provider = profile?.provider || (user.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email");
    appData.user.connected = true;

    if (profile?.settings) {
        appData.settings = { ...appData.settings, ...profile.settings };
    }

    // Build the referral URL from the real deployed origin instead of a hard-coded domain.
    const baseUrl = window.location.origin + window.location.pathname.split("/dashboard/")[0];
    appData.invites.referral = `${baseUrl.replace(/\/$/, "")}/signup/index.html?ref=${encodeURIComponent(profile?.referralCode || "")}`;

    // Plans and rewards are server-managed. Until a subscription document exists,
    // the UI safely falls back to the free/default state.
    const subscriptionSnap = await (await import("../firebase.js")).getDoc(doc(db, "subscriptions", user.uid));
    if (subscriptionSnap.exists()) {
        const subscription = subscriptionSnap.data();
        appData.plan = { ...appData.plan, ...subscription };
    } else {
        appData.plan = {
            name: "FREE PLAN",
            status: "Active",
            progress: 0,
            daysRemaining: 0,
            storage: 0,
            features: ["Basic Access"]
        };
    }
}


/* =====================================================
   LOAD USER INFORMATION
===================================================== */

function loadUserIntoHeader() {

    const user =
        appData.user;


    document.getElementById(
        "miniAvatar"
    ).textContent =
        user.avatar;


    document.getElementById(
        "menuAvatar"
    ).textContent =
        user.avatar;


    document.getElementById(
        "profileTriggerName"
    ).textContent =
        user.name;


    document.getElementById(
        "menuName"
    ).textContent =
        user.name;


    document.getElementById(
        "menuEmail"
    ).textContent =
        user.email;

}


/* =====================================================
   ROUTING
===================================================== */

function setupInitialRoute() {

    let route =
        window.location.hash
        .replace("#", "");


    const validRoutes = [
        "home",
        "plan",
        "invite",
        "profile",
        "settings"
    ];


    if (!validRoutes.includes(route)) {

        route = "home";

    }


    navigate(route, false);

}


/* =====================================================
   NAVIGATE
===================================================== */

function navigate(
    route,
    updateHash = true
) {

    const validRoutes = [
        "home",
        "plan",
        "invite",
        "profile",
        "settings"
    ];


    if (!validRoutes.includes(route)) {

        route = "home";

    }


    state.currentRoute =
        route;


    closeProfileMenu();


    if (updateHash) {

        window.location.hash =
            route;

    }


    renderPage(route);

    updateNavigation(route);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   PAGE RENDERER
===================================================== */

function renderPage(route) {

    switch (route) {

        case "plan":

            renderPlan();

            break;


        case "invite":

            renderInvite();

            break;


        case "profile":

            renderProfile();

            break;


        case "settings":

            renderSettings();

            break;


        default:

            renderHome();

    }

}


/* =====================================================
   HOME
===================================================== */

function renderHome() {

    const user =
        appData.user;

    const plan =
        appData.plan;

    const invites =
        appData.invites;


    app.innerHTML = `

        <section class="page">

            <div class="home-hero">

                <div class="welcome-text">
                    Welcome back,
                </div>

                <div class="home-name">
                    ${escapeHTML(user.name)}
                </div>

                <p class="home-sub">
                    Here's your Kingscale overview.
                </p>

            </div>


            <div class="card">

                <div class="card-title">
                    ⚡ Overview
                </div>


                <div class="home-grid">


                    <div class="metric-card">

                        <div class="metric-icon">
                            👑
                        </div>

                        <div class="metric-label">
                            Current Plan
                        </div>

                        <div class="metric-value">
                            ${plan.name}
                        </div>

                        <button
                            class="metric-action"
                            data-route="plan"
                        >
                            View plan →
                        </button>

                    </div>


                    <div class="metric-card">

                        <div class="metric-icon">
                            📈
                        </div>

                        <div class="metric-label">
                            Plan Progress
                        </div>

                        <div class="metric-value">
                            ${plan.progress}%
                        </div>

                        <button
                            class="metric-action"
                            data-route="plan"
                        >
                            View progress →
                        </button>

                    </div>


                    <div class="metric-card">

                        <div class="metric-icon">
                            🎁
                        </div>

                        <div class="metric-label">
                            Successful Invites
                        </div>

                        <div class="metric-value">
                            ${invites.joined}
                        </div>

                        <button
                            class="metric-action"
                            data-route="invite"
                        >
                            Manage invites →
                        </button>

                    </div>

                </div>

            </div>


            <div class="card blue">

                <div class="card-title">
                    🚀 Quick Access
                </div>


                <div class="action-grid">

                    <button
                        class="action-button"
                        data-route="plan"
                    >
                        <span>💎</span>

                        My Plan

                        <small>
                            Manage your subscription
                        </small>

                    </button>


                    <button
                        class="action-button"
                        data-route="invite"
                    >
                        <span>🎁</span>

                        Invite Friends

                        <small>
                            Referral & rewards
                        </small>

                    </button>


                    <button
                        class="action-button"
                        data-route="profile"
                    >
                        <span>👤</span>

                        Profile

                        <small>
                            Account information
                        </small>

                    </button>


                    <button
                        class="action-button"
                        data-route="settings"
                    >
                        <span>⚙️</span>

                        Settings

                        <small>
                            Preferences & security
                        </small>

                    </button>

                </div>

            </div>


            <div class="card green">

                <div class="card-title">
                    ✓ Account Status
                </div>

                <p style="color:#aaa;line-height:1.7;">
                    Your Google account is connected and
                    your Kingscale account is currently active.
                </p>

            </div>

        </section>

    `;

}


/* =====================================================
   PLAN
===================================================== */

function renderPlan() {

    const plan =
        appData.plan;


    app.innerHTML = `

        <section class="page">

            <div class="page-heading">

                <h1>
                    My Plan
                </h1>

                <p>
                    Manage your Kingscale subscription
                    and plan benefits.
                </p>

            </div>


            <div class="card gold">

                <div class="plan-header">

                    <div>

                        <div class="plan-title">
                            ${plan.name}
                        </div>

                        <div style="color:#999;margin-top:5px;">
                            Premium membership
                        </div>

                    </div>


                    <span class="status-pill">
                        ● ${plan.status}
                    </span>

                </div>


                <div class="large-progress">

                    <div class="progress-top">

                        <span>
                            Plan Progress
                        </span>

                        <span class="progress-number">
                            ${plan.progress}%
                        </span>

                    </div>


                    <div class="progress-track">

                        <div
                            class="progress-value"
                            style="width:${plan.progress}%"
                        ></div>

                    </div>

                </div>


                <div
                    style="
                        display:grid;
                        grid-template-columns:
                        repeat(2,1fr);
                        gap:15px;
                        margin-top:25px;
                    "
                >

                    <div class="metric-card">

                        <div class="metric-label">
                            Renewal
                        </div>

                        <div class="metric-value">
                            ${plan.daysRemaining} days
                        </div>

                    </div>


                    <div class="metric-card">

                        <div class="metric-label">
                            Storage Used
                        </div>

                        <div class="metric-value">
                            ${plan.storage}%
                        </div>

                    </div>

                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Plan Benefits
                </div>


                <div class="plan-feature-grid">

                    ${plan.features.map(
                        feature => `

                            <div class="feature-row">

                                <span>
                                    🛡 ${escapeHTML(feature)}
                                </span>

                                <span class="feature-active">
                                    ✓ Active
                                </span>

                            </div>

                        `
                    ).join("")}

                </div>

            </div>


            <div class="card blue">

                <div class="card-title">
                    Need help?
                </div>

                <p style="color:#999;line-height:1.6;">
                    Contact Kingscale support if you have
                    questions about your membership.
                </p>

                <button
                    class="secondary-button"
                    style="margin-top:18px;"
                    id="supportButton"
                >
                    Contact Support
                </button>

            </div>

        </section>

    `;


    const supportButton =
        document.getElementById(
            "supportButton"
        );


    supportButton.addEventListener(
        "click",
        () => {

            showToast(
                "Support request selected"
            );

        }
    );

}


/* =====================================================
   INVITE
===================================================== */

function renderInvite() {

    const invites =
        appData.invites;


    const progress =
        Math.min(
            100,
            Math.round(
                (invites.joined /
                invites.rewardTarget) *
                100
            )
        );


    app.innerHTML = `

        <section class="page">

            <div class="page-heading">

                <h1>
                    Invite & Earn
                </h1>

                <p>
                    Invite people to Kingscale Digitals
                    and track your referral rewards.
                </p>

            </div>


            <div class="card green">

                <div class="card-title">
                    🎁 Your Referral Link
                </div>

                <p style="color:#aaa;line-height:1.6;">
                    Share your personal referral link
                    with friends.
                </p>


                <div class="referral-box">

                    <div
                        class="referral-link"
                        id="referralLink"
                    >
                        ${escapeHTML(invites.referral)}
                    </div>

                    <button
                        class="copy-icon"
                        id="copyReferral"
                    >
                        📋
                    </button>

                </div>


                <div class="invite-buttons">

                    <button
                        class="primary-button"
                        id="copyReferralLarge"
                    >
                        Copy Link
                    </button>

                    <button
                        class="secondary-button"
                        id="shareReferral"
                    >
                        Share
                    </button>

                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Your Referral Statistics
                </div>


                <div class="invite-stats">

                    <div class="invite-stat">

                        <strong>
                            ${invites.invited}
                        </strong>

                        <span>
                            Invited
                        </span>

                    </div>


                    <div class="invite-stat">

                        <strong>
                            ${invites.joined}
                        </strong>

                        <span>
                            Joined
                        </span>

                    </div>


                    <div class="invite-stat">

                        <strong>
                            ${invites.active}
                        </strong>

                        <span>
                            Active
                        </span>

                    </div>

                </div>

            </div>


            <div class="card gold">

                <div class="card-title">
                    🏆 Next Reward
                </div>


                <p style="color:#aaa;">
                    ${invites.rewardTarget -
                    invites.joined}
                    more successful invite(s)
                    to reach the next reward.
                </p>


                <div
                    class="large-progress"
                    style="margin-top:20px;"
                >

                    <div class="progress-top">

                        <span>
                            Reward Progress
                        </span>

                        <span
                            class="progress-number"
                        >
                            ${progress}%
                        </span>

                    </div>


                    <div class="progress-track">

                        <div
                            class="progress-value"
                            style="
                                width:${progress}%
                            "
                        ></div>

                    </div>

                </div>

            </div>

        </section>

    `;


    document
        .getElementById("copyReferral")
        .addEventListener(
            "click",
            copyReferral
        );


    document
        .getElementById("copyReferralLarge")
        .addEventListener(
            "click",
            copyReferral
        );


    document
        .getElementById("shareReferral")
        .addEventListener(
            "click",
            shareReferral
        );

}


/* =====================================================
   PROFILE
===================================================== */

function renderProfile() {

    const user =
        appData.user;


    app.innerHTML = `

        <section class="page">

            <div class="page-heading">

                <h1>
                    My Profile
                </h1>

                <p>
                    Your Kingscale account information.
                </p>

            </div>


            <div class="card gold profile-main">

                <div class="profile-avatar">
                    ${escapeHTML(user.avatar)}
                </div>


                <div>

                    <div class="profile-name">
                        ${escapeHTML(user.name)}
                    </div>

                    <div class="profile-email">
                        @${escapeHTML(user.username)}
                    </div>

                    <div class="connected-badge">
                        ● Google Account Connected
                    </div>

                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Account Information
                </div>


                <div class="detail-list">

                    <div class="detail-row">

                        <span>
                            Full Name
                        </span>

                        <strong>
                            ${escapeHTML(user.name)}
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Username
                        </span>

                        <strong>
                            @${escapeHTML(user.username)}
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Email
                        </span>

                        <strong>
                            ${escapeHTML(user.email)}
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Sign-in Provider
                        </span>

                        <strong>
                            ${escapeHTML(user.provider)}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="card blue">

                <div class="card-title">
                    Account Actions
                </div>


                <button
                    class="secondary-button"
                    data-route="settings"
                >
                    Account Settings →
                </button>

            </div>

        </section>

    `;

}


/* =====================================================
   SETTINGS
===================================================== */

function renderSettings() {

    const settings =
        appData.settings;


    app.innerHTML = `

        <section class="page">

            <div class="page-heading">

                <h1>
                    Settings
                </h1>

                <p>
                    Manage your account preferences
                    and security.
                </p>

            </div>


            <div class="card">

                <div class="card-title">
                    Notifications
                </div>


                ${settingHTML(
                    "notifications",
                    "Push Notifications",
                    "Receive important Kingscale updates.",
                    settings.notifications
                )}


                ${settingHTML(
                    "marketing",
                    "Product Updates",
                    "Receive news about new Kingscale features.",
                    settings.marketing
                )}

            </div>


            <div class="card green">

                <div class="card-title">
                    Security
                </div>


                ${settingHTML(
                    "securityAlerts",
                    "Security Alerts",
                    "Receive alerts when important account activity occurs.",
                    settings.securityAlerts
                )}

            </div>


            <div class="card">

                <div class="card-title">
                    Google Account
                </div>


                <div class="setting-row">

                    <div class="setting-info">

                        <strong>
                            Google Authentication
                        </strong>

                        <small>
                            Your account is connected through Google.
                        </small>

                    </div>


                    <span
                        style="
                            color:var(--green);
                            font-size:13px;
                        "
                    >
                        ✓ Connected
                    </span>

                </div>

            </div>


            <div class="card">

                <div class="card-title">
                    Account
                </div>


                <button
                    class="danger-button"
                    id="settingsSignOut"
                    style="
                        border:1px solid #ff4444;
                        background:rgba(255,50,50,.08);
                        color:#ff6666;
                    "
                >
                    Sign Out
                </button>

            </div>

        </section>

    `;


    document
        .querySelectorAll("[data-setting]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const setting =
                        button.dataset.setting;

                    appData.settings[setting] =
                        !appData.settings[setting];

                    const user = auth.currentUser;
                    if (user) {
                        updateDoc(doc(db, "users", user.uid), {
                            [`settings.${setting}`]: appData.settings[setting],
                            updatedAt: serverTimestamp()
                        }).catch(error => showToast(friendlyAuthError(error)));
                    }

                    renderSettings();

                    showToast(
                        "Setting updated"
                    );

                }
            );

        });


    document
        .getElementById("settingsSignOut")
        .addEventListener(
            "click",
            openSignOutModal
        );

}


/* =====================================================
   SETTINGS HTML
===================================================== */

function settingHTML(
    key,
    title,
    description,
    active
) {

    return `

        <div class="setting-row">

            <div class="setting-info">

                <strong>
                    ${title}
                </strong>

                <small>
                    ${description}
                </small>

            </div>


            <button
                class="toggle ${active ? "active" : ""}"
                data-setting="${key}"
                aria-label="${title}"
            ></button>

        </div>

    `;

}


/* =====================================================
   NAVIGATION STATE
===================================================== */

function updateNavigation(route) {

    document
        .querySelectorAll("[data-route]")
        .forEach(button => {

            if (
                button.classList.contains(
                    "nav-button"
                )
            ) {

                button.classList.toggle(
                    "active",
                    button.dataset.route === route
                );

            }

        });

}


/* =====================================================
   GLOBAL EVENTS
===================================================== */

function registerGlobalEvents() {


    /* Navigation */

    document.addEventListener(
        "click",
        event => {

            const routeElement =
                event.target.closest(
                    "[data-route]"
                );


            if (!routeElement) {

                return;

            }


            const route =
                routeElement.dataset.route;


            if (route) {

                navigate(route);

            }

        }
    );


    /* Profile menu */

    profileTrigger.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleProfileMenu();

        }
    );


    /* Close menu */

    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".profile-switcher"
                )
            ) {

                closeProfileMenu();

            }

        }
    );


    /* Notification */

    document
        .getElementById(
            "notificationButton"
        )
        .addEventListener(
            "click",
            () => {

                showToast(
                    "No new notifications"
                );

            }
        );


    /* Menu sign out */

    document
        .getElementById("menuSignOut")
        .addEventListener(
            "click",
            openSignOutModal
        );


    /* Modal cancel */

    document
        .getElementById("modalCancel")
        .addEventListener(
            "click",
            closeSignOutModal
        );


    /* Modal confirm */

    document
        .getElementById("modalConfirm")
        .addEventListener(
            "click",
            performSignOut
        );


    /* Browser navigation */

    window.addEventListener(
        "hashchange",
        () => {

            const route =
                window.location.hash
                .replace("#", "");

            navigate(
                route || "home",
                false
            );

        }
    );

}


/* =====================================================
   PROFILE MENU
===================================================== */

function toggleProfileMenu() {

    state.menuOpen =
        !state.menuOpen;


    profileMenu.classList.toggle(
        "show",
        state.menuOpen
    );


    profileTrigger.classList.toggle(
        "open",
        state.menuOpen
    );


    profileTrigger.setAttribute(
        "aria-expanded",
        String(state.menuOpen)
    );

}


function closeProfileMenu() {

    state.menuOpen = false;

    profileMenu.classList.remove(
        "show"
    );

    profileTrigger.classList.remove(
        "open"
    );

    profileTrigger.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* =====================================================
   COPY REFERRAL
===================================================== */

async function copyReferral() {

    const link =
        appData.invites.referral;


    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                link
            );

        } else {

            fallbackCopy(link);

        }


        showToast(
            "Referral link copied ✓"
        );

    } catch (error) {

        fallbackCopy(link);

    }

}


/* =====================================================
   FALLBACK COPY
===================================================== */

function fallbackCopy(text) {

    const input =
        document.createElement(
            "textarea"
        );


    input.value = text;

    input.style.position =
        "fixed";

    input.style.left =
        "-9999px";


    document.body.appendChild(
        input
    );


    input.select();


    try {

        document.execCommand(
            "copy"
        );

    } catch (error) {

        console.error(
            "Copy failed",
            error
        );

    }


    document.body.removeChild(
        input
    );

}


/* =====================================================
   SHARE
===================================================== */

async function shareReferral() {

    const link =
        appData.invites.referral;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "Kingscale Digitals",

                text:
                    "Join me on Kingscale Digitals.",

                url:
                    link

            });

        } catch (error) {

            /*
                User cancelled sharing.
                No error message needed.
            */

        }

    } else {

        await copyReferral();

        showToast(
            "Link copied — ready to share"
        );

    }

}


/* =====================================================
   SIGN OUT MODAL
===================================================== */

function openSignOutModal() {

    closeProfileMenu();

    modalBackdrop.classList.add(
        "show"
    );

}


function closeSignOutModal() {

    modalBackdrop.classList.remove(
        "show"
    );

}


async function performSignOut() {

    closeSignOutModal();

    try {
        await signOut(auth);
        showToast("Signed out successfully");
        setTimeout(() => {
            window.location.replace("../login/index.html");
        }, 350);
    } catch (error) {
        showToast(friendlyAuthError(error));
    }

}



/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2400
        );

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.replace("../login/index.html");
            return;
        }

        try {
            await hydrateFirebaseUser(user);
            init();
        } catch (error) {
            console.error("Kingscale Firebase initialization failed:", error);
            showToast("Unable to load your account data.");
        }
    });
});