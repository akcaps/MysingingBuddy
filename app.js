const buddyDefaults = {
  name: "Jamie",
  character: "milo",
  icon: "STAR",
  mood: "Steady guide",
  studentName: "Student",
  studentPhotoDataUrl: ""
};

const storageKeys = {
  users: "my-singing-buddy-users",
  currentUser: "my-singing-buddy-current-user",
  authToken: "my-singing-buddy-auth-token",
  activeSession: "my-singing-buddy-active-session"
};

const defaultSectionCount = 1;

const state = {
  currentUser: loadCurrentUser(),
  buddy: { ...buddyDefaults },
  songs: [],
  activeSongId: null,
  editingSongId: null,
  pendingVerificationEmail: "",
  pendingPasswordResetEmail: "",
  sections: createDefaultSections(defaultSectionCount),
  cueIntervals: []
};

let cloudSaveTimer = null;

const authShell = document.querySelector("#authShell");
const appShell = document.querySelector("#appShell");
const authMessage = document.querySelector("#authMessage");
const showLoginButton = document.querySelector("#showLoginButton");
const showSignupButton = document.querySelector("#showSignupButton");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const loginEmailInput = document.querySelector("#loginEmail");
const loginPasswordInput = document.querySelector("#loginPassword");
const showResetButton = document.querySelector("#showResetButton");
const passwordResetForm = document.querySelector("#passwordResetForm");
const resetEmailInput = document.querySelector("#resetEmail");
const requestResetCodeButton = document.querySelector("#requestResetCodeButton");
const resetCodeInput = document.querySelector("#resetCode");
const resetPasswordInput = document.querySelector("#resetPassword");
const resetConfirmPasswordInput = document.querySelector("#resetConfirmPassword");
const backToLoginButton = document.querySelector("#backToLoginButton");
const signupNameInput = document.querySelector("#signupName");
const signupEmailInput = document.querySelector("#signupEmail");
const signupPasswordInput = document.querySelector("#signupPassword");
const signupConfirmPasswordInput = document.querySelector("#signupConfirmPassword");
const verificationPanel = document.querySelector("#verificationPanel");
const verificationCodeInput = document.querySelector("#verificationCode");
const verifyAccountButton = document.querySelector("#verifyAccountButton");
const resendCodeButton = document.querySelector("#resendCodeButton");
const logoutButton = document.querySelector("#logoutButton");
const welcomeName = document.querySelector("#welcomeName");

const buddyNameInput = document.querySelector("#buddyName");
const buddyEmojiDisplay = document.querySelector("#buddyEmoji");
const buddyNameDisplay = document.querySelector("#buddyNameDisplay");
const buddyMoodDisplay = document.querySelector("#buddyMoodDisplay");
const buddyMessage = document.querySelector("#buddyMessage");
const buddyAvatar = document.querySelector("#buddyAvatar");
const buddyCharacterSlot = document.querySelector("#buddyCharacterSlot");
const characterPicker = document.querySelector("#characterPicker");
const emojiPicker = document.querySelector("#emojiPicker");
const studentNameInput = document.querySelector("#studentName");
const studentPhotoUploadInput = document.querySelector("#studentPhotoUpload");
const studentPhotoPreview = document.querySelector("#studentPhotoPreview");
const studentNameDisplay = document.querySelector("#studentNameDisplay");
const studentPhotoStatus = document.querySelector("#studentPhotoStatus");

const songTitleInput = document.querySelector("#songTitle");
const trackUploadInput = document.querySelector("#trackUpload");
const realTrackUploadInput = document.querySelector("#realTrackUpload");
const trackPlayer = document.querySelector("#trackPlayer");
const trackStatus = document.querySelector("#trackStatus");
const trackMeta = document.querySelector("#trackMeta");
const sectionCountInput = document.querySelector("#sectionCount");
const sectionList = document.querySelector("#sectionList");
const cueLabelInput = document.querySelector("#cueLabel");
const cueLyricsInput = document.querySelector("#cueLyrics");
const cueSectionSelect = document.querySelector("#cueSectionSelect");
const cueStartMinutesInput = document.querySelector("#cueStartMinutes");
const cueStartSecondsInput = document.querySelector("#cueStartSeconds");
const singerStartMinutesInput = document.querySelector("#singerStartMinutes");
const singerStartSecondsInput = document.querySelector("#singerStartSeconds");
const cueDurationMinutesInput = document.querySelector("#cueDurationMinutes");
const cueDurationSecondsInput = document.querySelector("#cueDurationSeconds");
const cuePlayer = document.querySelector("#cuePlayer");
const cueStatus = document.querySelector("#cueStatus");
const saveStatus = document.querySelector("#saveStatus");
const newSongButton = document.querySelector("#newSongButton");
const addCueButton = document.querySelector("#addCueButton");
const saveSongButton = document.querySelector("#saveSongButton");
const cueIntervalList = document.querySelector("#cueIntervalList");
const cueCount = document.querySelector("#cueCount");

const activeSongTitle = document.querySelector("#activeSongTitle");
const activeSongSummary = document.querySelector("#activeSongSummary");
const cueTargetPhoto = document.querySelector("#cueTargetPhoto");
const cueTargetName = document.querySelector("#cueTargetName");
const sliderStatus = document.querySelector("#sliderStatus");
const openLiveButton = document.querySelector("#openLiveButton");
const playTrackButton = document.querySelector("#playTrackButton");
const stopTrackButton = document.querySelector("#stopTrackButton");
const emptyLibrary = document.querySelector("#emptyLibrary");
const songLibrary = document.querySelector("#songLibrary");
const songCardTemplate = document.querySelector("#songCardTemplate");

const iconOptions = [
  { label: "Starter Star", value: "STAR", symbol: "\u2726", bg: "#006e64", glow: "#fff05a" },
  { label: "Beat Badge", value: "NOTE", symbol: "\u266B", bg: "#b80f54", glow: "#00e6d1" },
  { label: "Sunburst", value: "SUN", symbol: "\u2600", bg: "#c76b00", glow: "#fff05a" },
  { label: "Moonwave", value: "MOON", symbol: "\u263E", bg: "#2430a6", glow: "#95fff4" },
  { label: "Heart Amp", value: "HEART", symbol: "\u2665", bg: "#8d164f", glow: "#ff9cc2" },
  { label: "Spark Nova", value: "SPARK", symbol: "\u2737", bg: "#4f22c8", glow: "#00e6d1" },
  { label: "Wave Rider", value: "WAVE", symbol: "\u224B", bg: "#0069a6", glow: "#95fff4" },
  { label: "Crown Legend", value: "CROWN", symbol: "\u265B", bg: "#2a0c32", glow: "#fff05a" }
];

const buddyCharacters = [
  {
    id: "milo",
    name: "Milo",
    label: "Boy helper",
    mood: "Steady guide",
    skin: "#b97854",
    hair: "#3d291f",
    shirt: "#236b64",
    accent: "#efd98b",
    symbol: "\u2726"
  },
  {
    id: "theo",
    name: "Theo",
    label: "Boy helper",
    mood: "Music captain",
    skin: "#8f5f45",
    hair: "#20242b",
    shirt: "#415a77",
    accent: "#d7e8e2",
    symbol: "\u266B"
  },
  {
    id: "kai",
    name: "Kai",
    label: "Boy helper",
    mood: "Hype spark",
    skin: "#d09268",
    hair: "#5a341f",
    shirt: "#d86f5f",
    accent: "#fff4cf",
    symbol: "\u2600"
  },
  {
    id: "luna",
    name: "Luna",
    label: "Girl helper",
    mood: "Brave listener",
    skin: "#ad7559",
    hair: "#2b1d31",
    shirt: "#6d5dfc",
    accent: "#efd98b",
    symbol: "\u263E"
  },
  {
    id: "ava",
    name: "Ava",
    label: "Girl helper",
    mood: "Sunny sidekick",
    skin: "#c98b67",
    hair: "#6b3d24",
    shirt: "#148f8b",
    accent: "#fff4cf",
    symbol: "\u2665"
  },
  {
    id: "zuri",
    name: "Zuri",
    label: "Girl helper",
    mood: "Rhythm rocker",
    skin: "#6f4a39",
    hair: "#171819",
    shirt: "#bd4f6c",
    accent: "#efd98b",
    symbol: "\u2737"
  }
];

const buddyMessages = {
  "Steady guide": {
    ready: "I will show the right lyrics when each GO cue is pressed.",
    saved: "Song saved. Lyrics and timing are ready for rehearsal."
  },
  "Music captain": {
    ready: "Cue plan ready. Lyrics will appear with each GO moment.",
    saved: "Session saved. The timeline is ready for rehearsal."
  },
  "Hype spark": {
    ready: "I will keep the words easy to see when it is time.",
    saved: "Song saved. The cue words are ready."
  },
  "Brave listener": {
    ready: "One cue at a time. The lyrics will stay clear.",
    saved: "Saved. The lyrics are ready for the live screen."
  },
  "Sunny sidekick": {
    ready: "I will keep the screen bright, simple, and easy to follow.",
    saved: "Song saved. The GO cues are ready."
  },
  "Rhythm rocker": {
    ready: "I am watching the beat with you. The cue lyrics will appear after GO.",
    saved: "Track saved. The rhythm plan is ready."
  }
};

initialize();

function initialize() {
  bindAuthEvents();
  bindAppEvents();
  window.addEventListener("focus", refreshBuddyState);
  renderAuthState();
  if (state.currentUser && getCloudToken()) {
    hydrateCloudAccountData();
  }
}

function bindAuthEvents() {
  showLoginButton.addEventListener("click", () => switchAuthMode("login"));
  showSignupButton.addEventListener("click", () => switchAuthMode("signup"));
  showResetButton.addEventListener("click", () => switchAuthMode("reset"));
  backToLoginButton.addEventListener("click", () => switchAuthMode("login"));
  loginForm.addEventListener("submit", handleLogin);
  signupForm.addEventListener("submit", handleSignup);
  passwordResetForm.addEventListener("submit", handlePasswordReset);
  requestResetCodeButton.addEventListener("click", handlePasswordResetRequest);
  verifyAccountButton.addEventListener("click", handleVerification);
  resendCodeButton.addEventListener("click", resendVerificationCode);
  logoutButton.addEventListener("click", handleLogout);
}

function bindAppEvents() {
  buddyNameInput.addEventListener("input", updateBuddy);
  studentNameInput.addEventListener("input", updateBuddy);
  studentPhotoUploadInput.addEventListener("change", handleStudentPhotoUpload);
  trackUploadInput.addEventListener("change", handleTrackUpload);
  realTrackUploadInput.addEventListener("change", handleRealTrackUpload);
  sectionCountInput.addEventListener("input", handleSectionCountChange);
  trackPlayer.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(trackPlayer.duration)) {
      trackPlayer.dataset.duration = String(trackPlayer.duration);
    }
  });
  newSongButton.addEventListener("click", resetStudio);
  addCueButton.addEventListener("click", addCueInterval);
  saveSongButton.addEventListener("click", saveSong);
  openLiveButton.addEventListener("click", openLiveScreen);
  playTrackButton.addEventListener("click", playBackingTrack);
  stopTrackButton.addEventListener("click", stopSession);
}

function switchAuthMode(mode) {
  const loginActive = mode === "login";
  const signupActive = mode === "signup";
  const resetActive = mode === "reset";
  showLoginButton.classList.toggle("active", loginActive);
  showSignupButton.classList.toggle("active", signupActive);
  loginForm.classList.toggle("hidden", !loginActive);
  signupForm.classList.toggle("hidden", !signupActive);
  passwordResetForm.classList.toggle("hidden", !resetActive);
  verificationPanel.classList.add("hidden");

  if (resetActive) {
    resetEmailInput.value = loginEmailInput.value.trim().toLowerCase();
    authMessage.textContent = "Enter your account email to reset the password.";
    resetEmailInput.focus();
    return;
  }

  authMessage.textContent = loginActive
    ? "Log in with your account email and password."
    : "Create an account to save songs and open shared live sessions.";
}

async function handleSignup(event) {
  event.preventDefault();

  const name = signupNameInput.value.trim();
  const email = signupEmailInput.value.trim().toLowerCase();
  const password = signupPasswordInput.value.trim();
  const confirmPassword = signupConfirmPasswordInput.value.trim();
  const users = loadUsers();

  if (!name || !email || !password || !confirmPassword) {
    authMessage.textContent = "Complete all sign-up fields first.";
    return;
  }

  if (!isValidEmail(email)) {
    authMessage.textContent = "Enter a real email address format, like name@example.com.";
    return;
  }

  if (password !== confirmPassword) {
    authMessage.textContent = "Passwords must match.";
    return;
  }

  const passwordProblem = getPasswordProblem(password);
  if (passwordProblem) {
    authMessage.textContent = passwordProblem;
    return;
  }

  const localUserExists = users.some((user) => user.email === email);

  if (localUserExists && !isCloudAvailable()) {
    authMessage.textContent = "That email already has an account. Try logging in.";
    switchAuthMode("login");
    return;
  }

  let passwordHash = "";
  try {
    passwordHash = await hashPassword(password);
  } catch {
    authMessage.textContent = "This browser cannot securely create an account. Use an updated browser over HTTPS.";
    return;
  }
  if (isCloudAvailable()) {
    try {
      authMessage.textContent = "Creating your cloud account...";
      const result = await cloudRequest("/api/signup", {
        method: "POST",
        body: {
          name,
          email,
          passwordHash,
          buddy: { ...buddyDefaults, name: "Jamie" }
        }
      });

      rememberLocalUser({ name, email, passwordHash, verified: true });
      localStorage.setItem(storageKeys.authToken, result.token);
      localStorage.setItem(storageKeys.currentUser, email);
      state.currentUser = email;
      signupForm.reset();
      bootstrapUserData();
      await hydrateCloudAccountData({ pushLocalIfEmpty: true });
      authMessage.textContent = "Account created. Your songs will now save to this account across devices.";
      renderAuthState();
      return;
    } catch (error) {
      if (error.status === 409) {
        authMessage.textContent = "That cloud account already exists. Log in with that email instead.";
        switchAuthMode("login");
        loginEmailInput.value = email;
        return;
      }
      authMessage.textContent = error.message || "Account creation is temporarily unavailable. Please try again.";
      return;
    }
  }

  if (localUserExists) {
    authMessage.textContent = "That local account already exists. Try logging in.";
    switchAuthMode("login");
    return;
  }

  const verificationCode = createVerificationCode();
  users.push({
    name,
    email,
    passwordHash,
    verified: false,
    verificationCode
  });
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
  state.pendingVerificationEmail = email;
  authMessage.textContent = `Account created. Confirmation code: ${verificationCode}`;
  signupForm.reset();
  signupForm.classList.add("hidden");
  verificationPanel.classList.remove("hidden");
  verificationCodeInput.focus();
}

async function handleLogin(event) {
  event.preventDefault();

  const email = loginEmailInput.value.trim().toLowerCase();
  const password = loginPasswordInput.value.trim();
  const users = loadUsers();
  const user = users.find((item) => item.email === email);

  if (!isValidEmail(email) || !password) {
    authMessage.textContent = "Enter a valid email and password.";
    return;
  }

  let passwordHash = "";
  try {
    passwordHash = await hashPassword(password);
  } catch {
    authMessage.textContent = "This browser cannot securely sign in. Use an updated browser over HTTPS.";
    return;
  }

  if (isCloudAvailable()) {
    try {
      authMessage.textContent = "Checking your cloud account...";
      const result = await cloudRequest("/api/login", {
        method: "POST",
        body: { email, passwordHash }
      });

      rememberLocalUser({ name: result.name || email.split("@")[0], email, passwordHash, verified: true });
      localStorage.setItem(storageKeys.authToken, result.token);
      localStorage.setItem(storageKeys.currentUser, email);
      state.currentUser = email;
      authMessage.textContent = "Welcome back. Loading your cloud song library.";
      loginForm.reset();
      bootstrapUserData();
      await hydrateCloudAccountData({ pushLocalIfEmpty: true });
      renderAuthState();
      return;
    } catch (error) {
      if (!user) {
        authMessage.textContent = "We could not find that cloud login. Try again or create an account.";
        return;
      }
      authMessage.textContent = "Online login did not respond, so this browser is checking its local account.";
    }
  }

  if (!user) {
    authMessage.textContent = "We could not find that login. Try again or create an account.";
    return;
  }

  if (!user.verified) {
    if (!user.verificationCode) {
      user.verificationCode = createVerificationCode();
      localStorage.setItem(storageKeys.users, JSON.stringify(users));
    }
    state.pendingVerificationEmail = email;
    loginForm.classList.add("hidden");
    verificationPanel.classList.remove("hidden");
    authMessage.textContent = `Confirm this email before logging in. Confirmation code: ${user.verificationCode}`;
    return;
  }

  const passwordMatches = await verifyPassword(user, password);
  if (!passwordMatches) {
    authMessage.textContent = "That password does not match this confirmed email.";
    return;
  }

  if (!user.passwordHash) {
    user.passwordHash = passwordHash;
    delete user.password;
    localStorage.setItem(storageKeys.users, JSON.stringify(users));
  }

  localStorage.setItem(storageKeys.currentUser, email);
  state.currentUser = email;
  authMessage.textContent = "Welcome back. Opening your studio.";
  loginForm.reset();
  bootstrapUserData();
  renderAuthState();
}

async function handlePasswordResetRequest() {
  const email = resetEmailInput.value.trim().toLowerCase();

  if (!isValidEmail(email)) {
    authMessage.textContent = "Enter the email address for the account you want to recover.";
    return;
  }

  requestResetCodeButton.disabled = true;
  state.pendingPasswordResetEmail = email;

  if (isCloudAvailable()) {
    try {
      authMessage.textContent = "Preparing a password reset code...";
      const result = await cloudRequest("/api/password-reset/request", {
        method: "POST",
        body: { email }
      });

      if (result.resetCode) {
        resetCodeInput.value = result.resetCode;
        authMessage.textContent = `Reset code: ${result.resetCode}. Enter a new password below.`;
        resetPasswordInput.focus();
        return;
      } else {
        authMessage.textContent = "If that account exists, a reset request is ready. Contact the program owner for help completing the reset.";
        return;
      }
    } catch (error) {
      authMessage.textContent = "Online reset is unavailable right now, so this browser will check for a saved local account.";
    } finally {
      requestResetCodeButton.disabled = false;
    }
  }

  const users = loadUsers();
  const user = users.find((item) => item.email === email);

  if (!user) {
    authMessage.textContent = "We could not find a saved account for that email on this browser.";
    requestResetCodeButton.disabled = false;
    return;
  }

  user.passwordResetCode = createVerificationCode();
  user.passwordResetExpiresAt = Date.now() + (15 * 60 * 1000);
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
  resetCodeInput.value = user.passwordResetCode;
  authMessage.textContent = `Reset code: ${user.passwordResetCode}. Enter a new password below.`;
  resetPasswordInput.focus();
  requestResetCodeButton.disabled = false;
}

async function handlePasswordReset(event) {
  event.preventDefault();

  const email = resetEmailInput.value.trim().toLowerCase();
  const resetCode = resetCodeInput.value.trim();
  const password = resetPasswordInput.value.trim();
  const confirmPassword = resetConfirmPasswordInput.value.trim();

  if (!isValidEmail(email) || !resetCode) {
    authMessage.textContent = "Enter your account email and reset code.";
    return;
  }

  if (password !== confirmPassword) {
    authMessage.textContent = "New passwords must match.";
    return;
  }

  const passwordProblem = getPasswordProblem(password);
  if (passwordProblem) {
    authMessage.textContent = passwordProblem;
    return;
  }

  let passwordHash = "";
  try {
    passwordHash = await hashPassword(password);
  } catch {
    authMessage.textContent = "This browser cannot securely change the password. Use an updated browser over HTTPS.";
    return;
  }

  if (isCloudAvailable()) {
    try {
      authMessage.textContent = "Changing your password...";
      await cloudRequest("/api/password-reset/confirm", {
        method: "POST",
        body: { email, resetCode, passwordHash }
      });

      rememberLocalUser({ email, passwordHash, verified: true });
      finishPasswordReset(email);
      return;
    } catch (error) {
      authMessage.textContent = error.message || "That reset code did not work. Request a new code and try again.";
      return;
    }
  }

  const users = loadUsers();
  const user = users.find((item) => item.email === email);

  if (!user || user.passwordResetCode !== resetCode) {
    authMessage.textContent = "That reset code does not match.";
    return;
  }

  if (Number(user.passwordResetExpiresAt) < Date.now()) {
    authMessage.textContent = "That reset code expired. Request a new one.";
    return;
  }

  user.passwordHash = passwordHash;
  user.verified = true;
  delete user.password;
  delete user.passwordResetCode;
  delete user.passwordResetExpiresAt;
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
  finishPasswordReset(email);
}

function finishPasswordReset(email) {
  state.pendingPasswordResetEmail = "";
  localStorage.removeItem(storageKeys.authToken);
  localStorage.removeItem(storageKeys.currentUser);
  passwordResetForm.reset();
  switchAuthMode("login");
  loginEmailInput.value = email;
  authMessage.textContent = "Password changed. Log in with your new password.";
  loginPasswordInput.focus();
}

function handleVerification() {
  const email = state.pendingVerificationEmail;
  const code = verificationCodeInput.value.trim();
  const users = loadUsers();
  const user = users.find((item) => item.email === email);

  if (!user) {
    authMessage.textContent = "Start sign-up again so we know which email to confirm.";
    return;
  }

  if (user.verificationCode !== code) {
    authMessage.textContent = "That confirmation code does not match.";
    return;
  }

  user.verified = true;
  user.verificationCode = "";
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
  state.pendingVerificationEmail = "";
  verificationCodeInput.value = "";
  verificationPanel.classList.add("hidden");
  loginForm.classList.remove("hidden");
  showLoginButton.classList.add("active");
  showSignupButton.classList.remove("active");
  loginEmailInput.value = email;
  authMessage.textContent = "Email confirmed. Log in with your password.";
}

function resendVerificationCode() {
  const email = state.pendingVerificationEmail;
  const users = loadUsers();
  const user = users.find((item) => item.email === email);

  if (!user) {
    authMessage.textContent = "Start sign-up again so we know which email to confirm.";
    return;
  }

  user.verificationCode = createVerificationCode();
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
  authMessage.textContent = `New confirmation code: ${user.verificationCode}`;
}

function handleLogout() {
  stopSession();
  if (cloudSaveTimer) {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
  }
  localStorage.removeItem(storageKeys.currentUser);
  localStorage.removeItem(storageKeys.authToken);
  localStorage.removeItem(storageKeys.activeSession);
  state.currentUser = null;
  state.buddy = { ...buddyDefaults };
  state.songs = [];
  state.activeSongId = null;
  state.editingSongId = null;
  state.pendingVerificationEmail = "";
  state.pendingPasswordResetEmail = "";
  state.sections = createDefaultSections(defaultSectionCount);
  state.cueIntervals = [];
  loginForm.reset();
  signupForm.reset();
  passwordResetForm.reset();
  verificationCodeInput.value = "";
  setSaveStatus("");
  renderAuthState();
}

function renderAuthState() {
  const loggedIn = Boolean(state.currentUser);
  authShell.classList.toggle("hidden", loggedIn);
  appShell.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) {
    switchAuthMode("login");
    return;
  }

  bootstrapUserData();
  renderCharacterPicker();
  renderEmojiPicker();
  syncBuddyInputs();
  renderBuddy();
  renderSongLibrary();
  hydrateActiveSong();

  welcomeName.textContent = `Hello, ${getCurrentDisplayName()}`;
}

function getCurrentDisplayName() {
  const user = loadUsers().find((item) => item.email === state.currentUser);

  if (user?.name) {
    return user.name;
  }

  if (state.currentUser) {
    const emailName = state.currentUser.split("@")[0] || "friend";
    return emailName
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return "friend";
}

function bootstrapUserData() {
  state.buddy = loadBuddy();
  state.songs = loadSongs();
  state.activeSongId = state.songs[0] ? state.songs[0].id : null;
  state.editingSongId = state.activeSongId;
  state.sections = createDefaultSections(defaultSectionCount);
  state.cueIntervals = [];
}

function renderEmojiPicker() {
  emojiPicker.innerHTML = "";

  iconOptions.forEach((icon) => {
    const button = document.createElement("button");
    const symbol = document.createElement("span");
    const label = document.createElement("small");
    button.type = "button";
    button.className = "emoji-option";
    button.dataset.icon = icon.value;
    applyIconStyle(button, icon);
    button.title = `Choose ${icon.value.toLowerCase()} as buddy icon`;
    button.setAttribute("aria-label", `Choose ${icon.value.toLowerCase()} as buddy icon`);
    button.setAttribute("aria-pressed", String(icon.value === state.buddy.icon));
    button.classList.toggle("active", icon.value === state.buddy.icon);
    symbol.textContent = icon.symbol;
    label.textContent = icon.label;
    button.append(symbol, label);
    button.addEventListener("click", () => {
      state.buddy.icon = icon.value;
      persistBuddy();
      queueCloudStateSave();
      renderBuddy();
      renderEmojiPicker();
    });
    emojiPicker.appendChild(button);
  });
}

function renderCharacterPicker() {
  characterPicker.innerHTML = "";

  buddyCharacters.forEach((character) => {
    const button = document.createElement("button");
    const art = createCharacterElement(character, "small");
    const name = document.createElement("strong");
    const detail = document.createElement("span");

    button.type = "button";
    button.className = "character-option";
    button.dataset.character = character.id;
    button.classList.toggle("active", character.id === state.buddy.character);
    button.setAttribute("aria-label", `Choose ${character.name}, ${character.mood}`);
    button.setAttribute("aria-pressed", String(character.id === state.buddy.character));
    name.textContent = character.name;
    detail.textContent = character.mood;
    button.append(art, name, detail);
    button.addEventListener("click", () => {
      state.buddy.character = character.id;
      state.buddy.name = character.name;
      state.buddy.mood = character.mood;
      persistBuddy();
      queueCloudStateSave();
      syncBuddyInputs();
      renderBuddy();
      renderCharacterPicker();
    });
    characterPicker.appendChild(button);
  });
}

function syncBuddyInputs() {
  buddyNameInput.value = state.buddy.name;
  studentNameInput.value = state.buddy.studentName;
}

function updateBuddy() {
  state.buddy.name = buddyNameInput.value.trim() || buddyDefaults.name;
  state.buddy.mood = getCharacterOption(state.buddy.character).mood;
  state.buddy.studentName = studentNameInput.value.trim() || buddyDefaults.studentName;
  persistBuddy();
  queueCloudStateSave();
  renderBuddy();
}

async function handleStudentPhotoUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    state.buddy.studentPhotoDataUrl = await resizeImageFile(file, 420);
    renderBuddy();
    setSaveStatus("Cue picture updated.");
  } catch (error) {
    setSaveStatus("Could not load that picture. Try a smaller image file.");
  }
}

function renderBuddy() {
  const icon = getIconOption(state.buddy.icon);
  const character = getCharacterOption(state.buddy.character);
  state.buddy.mood = character.mood;
  buddyCharacterSlot.replaceChildren(createCharacterElement(character, "large"));
  applyIconStyle(buddyAvatar, icon);
  buddyEmojiDisplay.textContent = icon.symbol;
  buddyNameDisplay.textContent = state.buddy.name;
  buddyMoodDisplay.textContent = state.buddy.mood;
  buddyMessage.textContent = getBuddyMessage("ready");
  buddyAvatar.setAttribute("aria-label", `${state.buddy.name} icon`);
  studentNameDisplay.textContent = state.buddy.studentName;
  cueTargetName.textContent = state.buddy.studentName;

  if (state.buddy.studentPhotoDataUrl) {
    studentPhotoPreview.src = state.buddy.studentPhotoDataUrl;
    cueTargetPhoto.src = state.buddy.studentPhotoDataUrl;
    studentPhotoStatus.textContent = "Your cue preview";
  } else {
    const fallback = placeholderImage(state.buddy.studentName);
    studentPhotoPreview.src = fallback;
    cueTargetPhoto.src = fallback;
    studentPhotoStatus.textContent = "Add a picture to personalize your cue.";
  }
}

function refreshBuddyState() {
  if (!state.currentUser) {
    return;
  }

  state.buddy = loadBuddy();
  renderBuddy();
  renderEmojiPicker();
}

function getIconOption(value) {
  return iconOptions.find((icon) => icon.value === value) || iconOptions[0];
}

function getCharacterOption(value) {
  return buddyCharacters.find((character) => character.id === value) || buddyCharacters[0];
}

function applyIconStyle(element, icon) {
  element.style.setProperty("--badge-bg", icon.bg);
  element.style.setProperty("--badge-glow", icon.glow);
}

function createCharacterElement(character, size) {
  const art = document.createElement("div");
  art.className = `character-art ${size || ""}`.trim();
  art.dataset.character = character.id;
  art.style.setProperty("--skin", character.skin);
  art.style.setProperty("--hair", character.hair);
  art.style.setProperty("--shirt", character.shirt);
  art.style.setProperty("--char-accent", character.accent);
  art.innerHTML = `
    <span class="character-symbol">${character.symbol}</span>
    <span class="character-body"></span>
    <span class="character-face">
      <span class="character-hair"></span>
      <span class="character-eye left"></span>
      <span class="character-eye right"></span>
      <span class="character-smile"></span>
    </span>
  `;
  return art;
}

function getBuddyMessage(type) {
  const messages = buddyMessages[state.buddy.mood] || buddyMessages["Steady guide"];
  return messages[type] || messages.ready;
}

function handleTrackUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    trackPlayer.src = reader.result;
    trackPlayer.dataset.filename = file.name;
    trackStatus.textContent = file.name;
    trackMeta.textContent = "Karaoke track loaded for the live screen.";
  };
  reader.readAsDataURL(file);
}

function handleRealTrackUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    cuePlayer.src = reader.result;
    cuePlayer.dataset.filename = file.name;
    cuePlayer.dataset.source = "real-singer-track";
    cueStatus.textContent = file.name;
    setSaveStatus("Singer track loaded. Cue boxes can use separate singer start times.");
  };
  reader.readAsDataURL(file);
}

function handleSectionCountChange() {
  const requestedCount = clampSectionCount(sectionCountInput.value);
  const currentSections = state.sections.length ? state.sections : createDefaultSections(defaultSectionCount);
  const nextSections = createDefaultSections(requestedCount).map((section, index) => ({
    ...section,
    name: currentSections[index]?.name || section.name
  }));
  const validIds = new Set(nextSections.map((section) => section.id));
  const fallbackId = nextSections[0].id;

  state.sections = nextSections;
  state.cueIntervals = state.cueIntervals.map((cue) => ({
    ...cue,
    sectionId: validIds.has(cue.sectionId) ? cue.sectionId : fallbackId
  }));
  renderSections();
  renderCueIntervals();
}

function renderSections() {
  const sections = state.sections.length ? state.sections : createDefaultSections(defaultSectionCount);
  state.sections = sections;
  sectionCountInput.value = String(sections.length);
  sectionList.innerHTML = "";

  sections.forEach((section, index) => {
    const row = document.createElement("label");
    const label = document.createElement("span");
    const input = document.createElement("input");

    row.className = "section-row";
    label.textContent = `Section ${index + 1}`;
    input.type = "text";
    input.maxLength = 24;
    input.value = section.name;
    input.setAttribute("aria-label", `Name for section ${index + 1}`);
    input.addEventListener("input", () => {
      section.name = input.value.trim() || `Section ${index + 1}`;
      syncSectionOptions();
      renderCueIntervals();
    });

    row.append(label, input);
    sectionList.appendChild(row);
  });

  syncSectionOptions();
}

function syncSectionOptions() {
  const selectedSectionId = cueSectionSelect.value || state.sections[0]?.id || "section-1";

  cueSectionSelect.innerHTML = "";
  state.sections.forEach((section, index) => {
    const option = document.createElement("option");
    option.value = section.id;
    option.textContent = section.name || `Section ${index + 1}`;
    cueSectionSelect.appendChild(option);
  });

  cueSectionSelect.value = state.sections.some((section) => section.id === selectedSectionId)
    ? selectedSectionId
    : state.sections[0]?.id || "";
}

function addCueInterval() {
  const startTime = readTimePair(cueStartMinutesInput, cueStartSecondsInput, "karaoke cue time");
  const singerStartTime = readTimePair(singerStartMinutesInput, singerStartSecondsInput, "singer track start time");
  const duration = readTimePair(cueDurationMinutesInput, cueDurationSecondsInput, "clip length");
  const label = cueLabelInput.value.trim() || `Cue ${state.cueIntervals.length + 1}`;
  const lyrics = cueLyricsInput.value.trim();
  const sectionId = cueSectionSelect.value || state.sections[0]?.id || "section-1";
  const sectionName = getSectionName(sectionId);

  if (startTime === null || singerStartTime === null || duration === null) {
    return;
  }

  if (duration <= 0) {
    setSaveStatus("Enter a clip length greater than 0 seconds.");
    return;
  }

  state.cueIntervals.push({
    id: createId(),
    label,
    lyrics,
    sectionId,
    startTime,
    singerStartTime,
    duration
  });

  state.cueIntervals.sort((a, b) => a.startTime - b.startTime);
  cueLyricsInput.value = "";
  setTimePair(cueStartMinutesInput, cueStartSecondsInput, startTime + duration + 8);
  setTimePair(singerStartMinutesInput, singerStartSecondsInput, singerStartTime + duration + 8);
  renderCueIntervals();
  setSaveStatus(`Added "${label}" for ${sectionName} at karaoke ${formatTime(startTime)} using singer ${formatTime(singerStartTime)}.`);
}

function renderCueIntervals() {
  cueIntervalList.innerHTML = "";
  cueCount.textContent = `${state.cueIntervals.length} ${state.cueIntervals.length === 1 ? "cue" : "cues"}`;

  if (state.cueIntervals.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cue-note";
    empty.textContent = "No timed cue boxes added yet.";
    cueIntervalList.appendChild(empty);
    return;
  }

  state.cueIntervals.forEach((interval) => {
    const row = document.createElement("div");
    row.className = "cue-interval-row";

    const details = document.createElement("div");
    const name = document.createElement("strong");
    const timing = document.createElement("span");
    const lyrics = document.createElement("span");
    const sectionName = getSectionName(interval.sectionId);
    name.textContent = interval.label;
    timing.textContent = `${sectionName} | Karaoke ${formatTime(interval.startTime)} | Singer ${formatTime(interval.singerStartTime)} | ${formatTime(interval.duration)} clip`;
    lyrics.className = "cue-lyrics-preview";
    lyrics.textContent = interval.lyrics ? `Lyrics: ${interval.lyrics}` : "No lyrics entered for this cue.";
    details.append(name, timing, lyrics);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "icon-button";
    removeButton.textContent = "X";
    removeButton.title = "Remove cue interval";
    removeButton.setAttribute("aria-label", `Remove ${interval.label}`);
    removeButton.addEventListener("click", () => {
      state.cueIntervals = state.cueIntervals.filter((item) => item.id !== interval.id);
      renderCueIntervals();
    });

    row.append(details, removeButton);
    cueIntervalList.appendChild(row);
  });
}

async function saveSong() {
  const song = buildSongFromInputs(state.editingSongId);
  setSaveStatus("");

  if (!song.title) {
    activeSongTitle.textContent = "Song title needed";
    activeSongSummary.textContent = "Add a song title before saving this rehearsal.";
    setSaveStatus("Add a song title first.");
    return;
  }

  if (!song.trackDataUrl || !song.cueDataUrl) {
    activeSongTitle.textContent = "Song setup incomplete";
    activeSongSummary.textContent = "Upload a karaoke track and matching real singer track before saving.";
    setSaveStatus("Upload a karaoke track and matching real singer track before saving.");
    return;
  }

  if (song.cueIntervals.length === 0) {
    activeSongTitle.textContent = "Cue timing needed";
    activeSongSummary.textContent = "Add at least one timed cue box before saving.";
    setSaveStatus("Add at least one cue interval before saving.");
    return;
  }

  try {
    setSaveStatus("Saving song...");
    await persistSongMedia(song);

    const existingIndex = state.songs.findIndex((item) => item.id === song.id);
    if (existingIndex >= 0) {
      state.songs[existingIndex] = song;
    } else {
      state.songs.unshift(song);
    }

    state.activeSongId = song.id;
    state.editingSongId = song.id;
    persistSongs();
    await persistCloudState();
    await persistActiveSession(song.id);
    renderSongLibrary();
    hydrateActiveSong();
    setSaveStatus(`Saved "${song.title}" to this account's buddy library.`);
    buddyMessage.textContent = getBuddyMessage("saved");
  } catch (error) {
    setSaveStatus("Saving failed. Try a shorter audio clip or smaller track file.");
  }
}

function buildSongFromInputs(existingId) {
  const songId = existingId || createId();

  return {
    id: songId,
    title: songTitleInput.value.trim(),
    cueLabel: cueLabelInput.value.trim() || "Singer clip",
    cueSource: "real-singer-track",
    cueDuration: state.cueIntervals[0]?.duration || readTimePair(cueDurationMinutesInput, cueDurationSecondsInput, "clip length") || 4,
    sections: state.sections.map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      name: section.name || `Section ${index + 1}`
    })),
    cueIntervals: state.cueIntervals.map((interval) => ({ ...interval })),
    trackName: trackPlayer.dataset.filename || "Karaoke track",
    realTrackName: cuePlayer.dataset.filename || "Real singer track",
    trackDuration: Number(trackPlayer.dataset.duration) || 0,
    trackDataUrl: trackPlayer.src || "",
    trackMediaId: `${songId}-track`,
    cueDataUrl: cuePlayer.src || "",
    cueMediaId: `${songId}-cue`,
    updatedAt: new Date().toLocaleString()
  };
}

function renderSongLibrary() {
  songLibrary.innerHTML = "";
  emptyLibrary.hidden = state.songs.length > 0;

  state.songs.forEach((song) => {
    const fragment = songCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".song-card");
    const title = fragment.querySelector(".song-card-title");
    const meta = fragment.querySelector(".song-card-meta");
    const loadButton = fragment.querySelector(".load-song-button");
    const syncAudioButton = fragment.querySelector(".sync-audio-button");
    const deleteButton = fragment.querySelector(".delete-song-button");

    title.textContent = song.title;
    meta.textContent = `${formatCueCount(song)} | ${formatSectionCount(song)} | Karaoke: ${song.trackName} | Singer: ${song.realTrackName || "Real singer track"} | ${song.updatedAt}`;

    loadButton.addEventListener("click", async () => {
      state.activeSongId = song.id;
      state.editingSongId = song.id;
      await populateStudio(song);
      await persistActiveSession(song.id);
      hydrateActiveSong();
    });

    syncAudioButton.addEventListener("click", async () => {
      syncAudioButton.disabled = true;
      setSaveStatus(`Checking audio for "${song.title}"...`);
      try {
        const result = await syncSongAudioToCloud(song, { force: true });
        setSaveStatus(result.message);
      } catch (error) {
        setSaveStatus(error.message || "Audio sync failed. Try opening this on the computer that has the original files.");
      } finally {
        syncAudioButton.disabled = false;
      }
    });

    deleteButton.addEventListener("click", async () => {
      state.songs = state.songs.filter((item) => item.id !== song.id);
      if (state.activeSongId === song.id) {
        state.activeSongId = state.songs[0] ? state.songs[0].id : null;
        state.editingSongId = state.activeSongId;
      }
      persistSongs();
      await persistCloudState();
      renderSongLibrary();
      hydrateActiveSong();
    });

    if (state.activeSongId === song.id) {
      card.style.boxShadow = "inset 0 0 0 3px rgba(0, 255, 209, 0.42)";
    }

    songLibrary.appendChild(fragment);
  });
}

async function populateStudio(song) {
  await ensureSongMedia(song);
  state.editingSongId = song.id;
  state.sections = normalizeSections(song);
  state.cueIntervals = normalizeCueIntervals(song);
  songTitleInput.value = song.title;
  cueLabelInput.value = song.cueLabel || "";
  cueLyricsInput.value = state.cueIntervals[0]?.lyrics || "";
  setTimePair(cueDurationMinutesInput, cueDurationSecondsInput, song.cueDuration || state.cueIntervals[0]?.duration || 4);
  setTimePair(cueStartMinutesInput, cueStartSecondsInput, state.cueIntervals[0]?.startTime ?? 10);
  setTimePair(singerStartMinutesInput, singerStartSecondsInput, state.cueIntervals[0]?.singerStartTime ?? 10);
  renderSections();
  trackPlayer.src = song.trackDataUrl;
  trackPlayer.dataset.filename = song.trackName || "Karaoke track";
  trackPlayer.dataset.duration = String(song.trackDuration || "");
  cuePlayer.src = song.cueDataUrl;
  cuePlayer.dataset.source = "real-singer-track";
  cuePlayer.dataset.filename = song.realTrackName || "Real singer track";
  trackStatus.textContent = song.trackName || "Saved karaoke track";
  trackMeta.textContent = "Saved karaoke track loaded.";
  cueStatus.textContent = song.realTrackName || "Saved real singer track loaded.";
  renderCueIntervals();
}

function hydrateActiveSong() {
  const activeSong = state.songs.find((song) => song.id === state.activeSongId) || state.songs[0];

  if (!activeSong) {
    state.activeSongId = null;
    state.editingSongId = null;
    state.sections = createDefaultSections(defaultSectionCount);
    state.cueIntervals = [];
    renderSections();
    renderCueIntervals();
    activeSongTitle.textContent = "No song selected";
    activeSongSummary.textContent = "Save a song to prepare a sing-along moment.";
    sliderStatus.textContent = "Open the big-screen page after saving a song.";
    openLiveButton.disabled = true;
    playTrackButton.disabled = true;
    stopTrackButton.disabled = true;
    return;
  }

  state.activeSongId = activeSong.id;
  state.editingSongId = activeSong.id;
  state.sections = normalizeSections(activeSong);
  state.cueIntervals = normalizeCueIntervals(activeSong);
  renderSections();
  renderCueIntervals();
  activeSongTitle.textContent = activeSong.title;
  activeSongSummary.textContent = `${formatCueCount(activeSong)} across ${formatSectionCount(activeSong).toLowerCase()} ready for the live screen.`;
  sliderStatus.textContent = "Ready to open on the teen big-screen page.";
  openLiveButton.disabled = false;
  playTrackButton.disabled = false;
  stopTrackButton.disabled = false;
  persistActiveSession(activeSong.id).catch(() => {
    sliderStatus.textContent = "Ready locally. Cloud session sync will retry when you open the teen screen.";
  });
}

function resetStudio() {
  state.editingSongId = null;
  setSaveStatus("");
  songTitleInput.value = "";
  cueLabelInput.value = "";
  cueLyricsInput.value = "";
  setTimePair(cueStartMinutesInput, cueStartSecondsInput, 10);
  setTimePair(singerStartMinutesInput, singerStartSecondsInput, 10);
  setTimePair(cueDurationMinutesInput, cueDurationSecondsInput, 4);
  state.sections = createDefaultSections(defaultSectionCount);
  state.cueIntervals = [];
  renderSections();
  renderCueIntervals();
  trackUploadInput.value = "";
  realTrackUploadInput.value = "";
  trackPlayer.removeAttribute("src");
  trackPlayer.dataset.filename = "";
  trackPlayer.dataset.duration = "";
  cuePlayer.removeAttribute("src");
  cuePlayer.dataset.filename = "";
  cuePlayer.dataset.source = "";
  trackStatus.textContent = "No karaoke track uploaded yet";
  trackMeta.textContent = "Choose the instrumental or karaoke file that plays continuously on the teen screen.";
  cueStatus.textContent = "No real singer track uploaded yet";
}

async function openLiveScreen() {
  const activeSong = state.songs.find((song) => song.id === state.activeSongId);
  if (!activeSong) {
    return;
  }

  await persistActiveSession(activeSong.id);
  window.open("live.html", "_blank");
  sliderStatus.textContent = "Teen big-screen page opened. Other signed-in devices can join this session.";
}

async function playBackingTrack() {
  const activeSong = state.songs.find((song) => song.id === state.activeSongId);
  if (!activeSong) {
    return;
  }

  await ensureSongMedia(activeSong);
  trackPlayer.src = activeSong.trackDataUrl;
  trackPlayer.currentTime = 0;
  trackPlayer.play();
}

function stopSession() {
  cuePlayer.pause();
  cuePlayer.currentTime = 0;
  trackPlayer.pause();
  trackPlayer.currentTime = 0;
  if (state.activeSongId) {
    openLiveButton.disabled = false;
    sliderStatus.textContent = "Preview stopped. Big-screen session is still ready.";
  }
}

async function persistSongMedia(song) {
  await saveMediaAsset(song.trackMediaId, song.trackDataUrl);
  await saveMediaAsset(song.cueMediaId, song.cueDataUrl);

  if (getCloudToken()) {
    await Promise.all([
      saveCloudMediaAsset(song.trackMediaId, song.trackDataUrl),
      saveCloudMediaAsset(song.cueMediaId, song.cueDataUrl)
    ]);
  }
}

async function syncSongAudioToCloud(song, options = {}) {
  if (!getCloudToken()) {
    throw new Error("Sign into the cloud account before syncing audio.");
  }

  const trackExists = await cloudMediaExists(song.trackMediaId);
  const cueExists = await cloudMediaExists(song.cueMediaId);

  if (!options.force && trackExists && cueExists) {
    return {
      uploaded: 0,
      message: `"${song.title}" audio is already available to this account.`
    };
  }

  const trackDataUrl = song.trackDataUrl || await loadMediaAsset(song.trackMediaId).catch(() => "");
  const cueDataUrl = song.cueDataUrl || await loadMediaAsset(song.cueMediaId).catch(() => "");
  const missing = [];
  let uploaded = 0;

  if (!trackDataUrl) {
    missing.push("karaoke track");
  }

  if (!cueDataUrl) {
    missing.push("real singer track");
  }

  if (missing.length > 0) {
    if (trackExists && cueExists) {
      return {
        uploaded: 0,
        message: `"${song.title}" audio is already in the account cloud. Refresh the other computer's live page.`
      };
    }

    throw new Error(`This computer does not have the ${missing.join(" and ")} for "${song.title}". Open the original upload computer or re-upload those files, then press Sync audio.`);
  }

  if (options.force || !trackExists) {
    await saveCloudMediaAsset(song.trackMediaId, trackDataUrl);
    uploaded += 1;
  }

  if (options.force || !cueExists) {
    await saveCloudMediaAsset(song.cueMediaId, cueDataUrl);
    uploaded += 1;
  }

  song.trackDataUrl = trackDataUrl;
  song.cueDataUrl = cueDataUrl;
  await saveMediaAsset(song.trackMediaId, trackDataUrl);
  await saveMediaAsset(song.cueMediaId, cueDataUrl);

  return {
    uploaded,
    message: uploaded > 0
      ? `"${song.title}" audio synced to this account. Refresh the other computer and press Ready This Device.`
      : `"${song.title}" audio is already synced.`
  };
}

async function repairCloudAudioFromLocal(songs, options = {}) {
  if (!getCloudToken() || !Array.isArray(songs) || songs.length === 0) {
    return;
  }

  let uploaded = 0;
  let missing = 0;

  for (const song of songs) {
    try {
      const result = await syncSongAudioToCloud(song, { force: false });
      uploaded += result.uploaded || 0;
    } catch {
      missing += 1;
    }
  }

  if (!options.silent && uploaded > 0) {
    setSaveStatus(`Synced ${uploaded} audio file${uploaded === 1 ? "" : "s"} to this account for other computers.`);
    return;
  }

  if (!options.silent && missing > 0) {
    setSaveStatus("Some saved songs are missing local audio on this computer. Use Sync audio on the original upload computer.");
  }
}

async function ensureSongMedia(song) {
  if (!song.trackDataUrl && song.trackMediaId) {
    song.trackDataUrl = await loadMediaAsset(song.trackMediaId);
    if (!song.trackDataUrl) {
      song.trackDataUrl = await loadCloudMediaAsset(song.trackMediaId);
      if (song.trackDataUrl) {
        await saveMediaAsset(song.trackMediaId, song.trackDataUrl);
      }
    }
  }

  if (!song.cueDataUrl && song.cueMediaId) {
    song.cueDataUrl = await loadMediaAsset(song.cueMediaId);
    if (!song.cueDataUrl) {
      song.cueDataUrl = await loadCloudMediaAsset(song.cueMediaId);
      if (song.cueDataUrl) {
        await saveMediaAsset(song.cueMediaId, song.cueDataUrl);
      }
    }
  }
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function isCloudAvailable() {
  return window.location.protocol === "https:" || window.location.protocol === "http:";
}

function getCloudToken() {
  return localStorage.getItem(storageKeys.authToken) || "";
}

async function cloudRequest(path, options = {}) {
  if (!isCloudAvailable()) {
    const error = new Error("Cloud storage is only available from the hosted site.");
    error.status = 0;
    throw error;
  }

  const headers = {
    "Accept": "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {})
  };
  const token = getCloudToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || "Cloud request failed.");
    error.status = response.status;
    throw error;
  }

  return payload;
}

function rememberLocalUser(userDetails) {
  const users = loadUsers();
  const existingIndex = users.findIndex((user) => user.email === userDetails.email);
  const nextUser = {
    ...(existingIndex >= 0 ? users[existingIndex] : {}),
    ...userDetails,
    verified: true
  };

  if (existingIndex >= 0) {
    users[existingIndex] = nextUser;
  } else {
    users.push(nextUser);
  }

  localStorage.setItem(storageKeys.users, JSON.stringify(users));
}

async function hydrateCloudAccountData(options = {}) {
  if (!getCloudToken()) {
    return;
  }

  const localSongs = state.songs.slice();

  try {
    const cloudState = await cloudRequest("/api/state");
    const cloudSongs = Array.isArray(cloudState.songs)
      ? cloudState.songs.map((song) => ({
        ...song,
        sections: normalizeSections(song),
        cueIntervals: normalizeCueIntervals(song),
        trackDataUrl: "",
        cueDataUrl: ""
      }))
      : [];

    if (options.pushLocalIfEmpty && cloudSongs.length === 0 && localSongs.length > 0) {
      await persistCloudState();
      await repairCloudAudioFromLocal(localSongs, { silent: true });
      setSaveStatus("Existing local songs and audio copied into this cloud account.");
      return;
    }

    state.buddy = normalizeBuddyProfile(cloudState.buddy);
    state.songs = cloudSongs;
    state.activeSongId = cloudState.activeSession?.songId || state.songs[0]?.id || null;
    state.editingSongId = state.activeSongId;

    persistBuddy();
    persistSongs();

    if (cloudState.activeSession?.songId) {
      localStorage.setItem(storageKeys.activeSession, JSON.stringify({
        user: state.currentUser,
        songId: cloudState.activeSession.songId
      }));
    }

    renderCharacterPicker();
    renderEmojiPicker();
    syncBuddyInputs();
    renderBuddy();
    renderSongLibrary();
    hydrateActiveSong();
    setSaveStatus("Cloud library loaded for this account.");
    repairCloudAudioFromLocal(state.songs, { silent: false }).catch(() => {
      setSaveStatus("Cloud library loaded. Use Sync audio on any song that will not play on another computer.");
    });
  } catch (error) {
    setSaveStatus("Cloud library could not load. This browser will keep using its local copy for now.");
  }
}

function normalizeBuddyProfile(profile) {
  const buddy = profile ? { ...buddyDefaults, ...profile } : { ...buddyDefaults };
  buddy.character = getCharacterOption(buddy.character).id;
  buddy.mood = getCharacterOption(buddy.character).mood;
  buddy.studentName = buddyDefaults.studentName;
  buddy.studentPhotoDataUrl = "";
  return buddy;
}

function queueCloudStateSave() {
  if (!getCloudToken()) {
    return;
  }

  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    persistCloudState().catch(() => {
      setSaveStatus("Cloud save paused. Changes are still saved on this browser.");
    });
  }, 700);
}

async function persistCloudState() {
  if (!getCloudToken()) {
    return;
  }

  await cloudRequest("/api/state", {
    method: "PUT",
    body: {
      buddy: getSafeBuddyProfile(state.buddy),
      songs: state.songs.map(stripSongForCloud),
      activeSession: loadActiveSession()
    }
  });
}

function getSafeBuddyProfile(profile) {
  const character = getCharacterOption(profile?.character);
  const icon = getIconOption(profile?.icon);
  return {
    name: typeof profile?.name === "string" && profile.name.trim() ? profile.name.trim().slice(0, 40) : buddyDefaults.name,
    character: character.id,
    icon: icon.value,
    mood: character.mood
  };
}

function stripSongForCloud(song) {
  return {
    ...song,
    sections: normalizeSections(song),
    cueIntervals: normalizeCueIntervals(song),
    trackDataUrl: "",
    cueDataUrl: ""
  };
}

async function saveCloudMediaAsset(id, dataUrl) {
  if (!id || !dataUrl || !getCloudToken()) {
    return;
  }

  const response = await fetch(`/api/media/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      "Content-Type": "text/plain; charset=utf-8",
      Authorization: `Bearer ${getCloudToken()}`
    },
    body: dataUrl
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Cloud media upload failed.");
  }
}

async function cloudMediaExists(id) {
  if (!id || !getCloudToken()) {
    return false;
  }

  try {
    const response = await fetch(`/api/media/${encodeURIComponent(id)}`, {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${getCloudToken()}`
      }
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function loadCloudMediaAsset(id) {
  if (!id || !getCloudToken()) {
    return "";
  }

  try {
    const response = await fetch(`/api/media/${encodeURIComponent(id)}`, {
      headers: {
        "Accept": "text/plain",
        Authorization: `Bearer ${getCloudToken()}`
      }
    });

    if (!response.ok) {
      return "";
    }

    const dataUrl = await response.text();
    return dataUrl.startsWith("data:") ? dataUrl : "";
  } catch {
    return "";
  }
}

async function saveCloudActiveSession(activeSession) {
  if (!getCloudToken()) {
    return;
  }

  await cloudRequest("/api/session", {
    method: "PUT",
    body: activeSession
  });
}

function resizeImageFile(file, maxSize) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      image.src = reader.result;
    });

    reader.addEventListener("error", () => reject(reader.error));

    image.addEventListener("load", () => {
      const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    });

    image.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function openMediaDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("my-singing-buddy-media", 1);

    request.addEventListener("upgradeneeded", () => {
      request.result.createObjectStore("media");
    });

    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function saveMediaAsset(id, dataUrl) {
  const db = await openMediaDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("media", "readwrite");
    transaction.objectStore("media").put(dataUrl, id);
    transaction.addEventListener("complete", resolve);
    transaction.addEventListener("error", () => reject(transaction.error));
  });
}

async function loadMediaAsset(id) {
  const db = await openMediaDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("media", "readonly");
    const request = transaction.objectStore("media").get(id);
    request.addEventListener("success", () => resolve(request.result || ""));
    request.addEventListener("error", () => reject(request.error));
  });
}

function createDefaultSections(count) {
  const sectionTotal = clampSectionCount(count);

  return Array.from({ length: sectionTotal }, (_, index) => ({
    id: `section-${index + 1}`,
    name: `Section ${index + 1}`
  }));
}

function clampSectionCount(value) {
  const count = Number.parseInt(value, 10);
  return Math.min(Math.max(Number.isFinite(count) ? count : defaultSectionCount, 1), 10);
}

function normalizeSections(song = {}) {
  if (Array.isArray(song.sections) && song.sections.length > 0) {
    return song.sections.slice(0, 10).map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      name: section.name || `Section ${index + 1}`
    }));
  }

  if (Array.isArray(song.cueIntervals)) {
    const sectionIds = Array.from(new Set(
      song.cueIntervals
        .map((cue) => cue.sectionId)
        .filter(Boolean)
    )).slice(0, 10);

    if (sectionIds.length > 0) {
      return sectionIds.map((sectionId, index) => ({
        id: sectionId,
        name: `Section ${index + 1}`
      }));
    }
  }

  return createDefaultSections(defaultSectionCount);
}

function getSectionName(sectionId) {
  const section = state.sections.find((item) => item.id === sectionId);
  return section?.name || "Section 1";
}

function readTimePair(minutesInput, secondsInput, label) {
  const minutes = Number(minutesInput.value || 0);
  const seconds = Number(secondsInput.value || 0);

  if (!Number.isFinite(minutes) || minutes < 0 || !Number.isInteger(minutes)) {
    setSaveStatus(`Enter whole minutes of 0 or higher for ${label}.`);
    return null;
  }

  if (!Number.isFinite(seconds) || seconds < 0 || seconds >= 60) {
    setSaveStatus(`Enter seconds from 0 to 59.9 for ${label}.`);
    return null;
  }

  return (minutes * 60) + seconds;
}

function setTimePair(minutesInput, secondsInput, totalSeconds) {
  const safeSeconds = Math.max(Number(totalSeconds) || 0, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = Math.round((safeSeconds % 60) * 10) / 10;

  minutesInput.value = String(minutes);
  secondsInput.value = formatSecondsInput(seconds);
}

function formatSecondsInput(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function normalizeCueIntervals(song) {
  const sections = normalizeSections(song);
  const fallbackSectionId = sections[0]?.id || "section-1";
  const validSectionIds = new Set(sections.map((section) => section.id));

  if (Array.isArray(song.cueIntervals) && song.cueIntervals.length > 0) {
    return song.cueIntervals
      .map((interval, index) => ({
        id: interval.id || createId(),
        label: interval.label || song.cueLabel || `Cue ${index + 1}`,
        lyrics: interval.lyrics || interval.text || song.cueLyrics || "",
        sectionId: validSectionIds.has(interval.sectionId) ? interval.sectionId : fallbackSectionId,
        startTime: Number(interval.startTime) || 0,
        singerStartTime: Number.isFinite(Number(interval.singerStartTime))
          ? Number(interval.singerStartTime)
          : Number(interval.startTime) || 0,
        duration: Number(interval.duration) || Number(song.cueDuration) || 4
      }))
      .sort((a, b) => a.startTime - b.startTime);
  }

  if (song.cueLabel) {
    return [{
      id: createId(),
      label: song.cueLabel,
      lyrics: song.cueLyrics || "",
      sectionId: fallbackSectionId,
      startTime: 10,
      singerStartTime: 10,
      duration: Number(song.cueDuration) || 4
    }];
  }

  return [];
}

function formatCueCount(song) {
  const count = normalizeCueIntervals(song).length;
  return `${count} timed ${count === 1 ? "cue" : "cues"}`;
}

function formatSectionCount(song) {
  const count = normalizeSections(song).length;
  return `${count} choir ${count === 1 ? "section" : "sections"}`;
}

async function persistActiveSession(songId) {
  const activeSession = {
    user: state.currentUser,
    songId
  };

  localStorage.setItem(storageKeys.activeSession, JSON.stringify(activeSession));

  if (getCloudToken()) {
    await saveCloudActiveSession(activeSession);
  }
}

function loadActiveSession() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.activeSession)) || {};
  } catch {
    return {};
  }
}

function formatTime(value) {
  const totalSeconds = Math.round(Math.max(Number(value) || 0, 0));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getPasswordProblem(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password needs uppercase, lowercase, and a number.";
  }

  return "";
}

async function hashPassword(password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Secure password hashing is not available.");
  }

  const bytes = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(user, password) {
  if (user.passwordHash) {
    return user.passwordHash === await hashPassword(password);
  }

  return user.password === password;
}

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function loadUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.users));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadCurrentUser() {
  return localStorage.getItem(storageKeys.currentUser);
}

function userScopedKey(suffix) {
  return `${state.currentUser || "guest"}-${suffix}`;
}

function loadBuddy() {
  try {
    const saved = JSON.parse(localStorage.getItem(userScopedKey("buddy-profile")));
    const buddy = saved ? { ...buddyDefaults, ...saved } : { ...buddyDefaults };
    buddy.character = getCharacterOption(buddy.character).id;
    buddy.mood = getCharacterOption(buddy.character).mood;
    buddy.studentName = buddyDefaults.studentName;
    buddy.studentPhotoDataUrl = "";
    return buddy;
  } catch {
    return { ...buddyDefaults };
  }
}

function loadSongs() {
  try {
    const saved = JSON.parse(localStorage.getItem(userScopedKey("saved-songs")));
    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.map((song) => ({
      ...song,
      sections: normalizeSections(song),
      cueIntervals: normalizeCueIntervals(song),
      trackMediaId: song.trackMediaId || `${song.id}-track`,
      cueMediaId: song.cueMediaId || `${song.id}-cue`,
      trackDataUrl: song.trackDataUrl || "",
      cueDataUrl: song.cueDataUrl || "",
      realTrackName: song.realTrackName || song.cueTrackName || song.cueLabel || "Real singer track",
      cueSource: song.cueSource || "real-singer-track"
    }));
  } catch {
    return [];
  }
}

function persistBuddy() {
  localStorage.setItem(userScopedKey("buddy-profile"), JSON.stringify(getSafeBuddyProfile(state.buddy)));
}

function persistSongs() {
  const songsForStorage = state.songs.map((song) => ({
    ...song,
    trackDataUrl: "",
    cueDataUrl: ""
  }));

  localStorage.setItem(userScopedKey("saved-songs"), JSON.stringify(songsForStorage));
}

function placeholderImage(name) {
  const label = (name || "Student").replace(/[<&>"']/g, "").slice(0, 12);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="12" fill="#fff4cf"/>
      <circle cx="80" cy="60" r="28" fill="#d86f5f"/>
      <rect x="34" y="98" width="92" height="36" rx="18" fill="#236b64" opacity="0.2"/>
      <text x="80" y="146" text-anchor="middle" font-family="Segoe UI, Verdana, sans-serif" font-size="16" font-weight="700" fill="#174b46">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createId() {
  return `song-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
