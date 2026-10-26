const storageKeys = {
  currentUser: "my-singing-buddy-current-user",
  authToken: "my-singing-buddy-auth-token",
  activeSession: "my-singing-buddy-active-session"
};

const liveState = {
  user: "",
  song: null,
  buddy: null,
  savedSongs: [],
  sections: [],
  activeSectionId: "",
  allCues: [],
  cues: [],
  playedCues: new Set(),
  playingCueIds: new Set(),
  pendingCueIds: new Set(),
  processedPlaybackCommandIds: new Set(),
  frameId: null,
  cueStopTimer: null,
  sessionPollTimer: null,
  countdownTimer: null,
  lastPlaybackCommandId: "",
  finishedPlaybackCommandId: "",
  cloudClockOffset: 0,
  audioReady: false,
  pendingPlayback: null,
  participantProfile: {
    name: "",
    photoDataUrl: ""
  },
  duration: 60
};

const buddyDefaults = {
  name: "Jamie",
  character: "milo",
  studentName: "Student",
  studentPhotoDataUrl: "",
  mood: "Steady guide"
};

const liveBuddyLines = {
  "Steady guide": {
    ready: "I will show each cue's lyrics after GO.",
    start: "Track running. Watch the line.",
    pause: "Paused. We can come back when you are ready.",
    countdown: "Cue coming.",
    go: "Press GO.",
    complete: "Song complete."
  },
  "Music captain": {
    ready: "Timeline ready. Lyrics will appear after GO.",
    start: "Track running. Follow the slider.",
    pause: "Paused. Timing is held.",
    countdown: "Cue window approaching.",
    go: "Press GO now.",
    complete: "Session complete."
  },
  "Hype spark": {
    ready: "Lyrics are ready for each GO moment.",
    start: "Here we go. Eyes on the cue line.",
    pause: "Quick pause. We still have this.",
    countdown: "Get ready.",
    go: "GO is ready.",
    complete: "Song complete."
  },
  "Brave listener": {
    ready: "One cue at a time. Lyrics will show after GO.",
    start: "The track has started. I am right here.",
    pause: "Paused. No rush.",
    countdown: "Your turn is getting close.",
    go: "You can press GO when you are ready.",
    complete: "Song finished."
  },
  "Sunny sidekick": {
    ready: "The screen will stay simple and show cue lyrics.",
    start: "The song is moving. Watch for the next cue.",
    pause: "Paused. We can restart the sunny path anytime.",
    countdown: "A bright cue is coming up.",
    go: "Press GO. You are right on time.",
    complete: "Song complete."
  },
  "Rhythm rocker": {
    ready: "I am with the beat.",
    start: "Track is rolling. Watch the rhythm line.",
    pause: "Paused. The beat will wait.",
    countdown: "Cue incoming. Feel the beat.",
    go: "Hit GO. This is your cue.",
    complete: "Song complete. Those GO moments had rhythm."
  }
};

const buddyCharacters = [
  { id: "milo", name: "Milo", mood: "Steady guide", skin: "#b97854", hair: "#3d291f", shirt: "#236b64", accent: "#efd98b", symbol: "\u2726" },
  { id: "theo", name: "Theo", mood: "Music captain", skin: "#8f5f45", hair: "#20242b", shirt: "#415a77", accent: "#d7e8e2", symbol: "\u266B" },
  { id: "kai", name: "Kai", mood: "Hype spark", skin: "#d09268", hair: "#5a341f", shirt: "#d86f5f", accent: "#fff4cf", symbol: "\u2600" },
  { id: "luna", name: "Luna", mood: "Brave listener", skin: "#ad7559", hair: "#2b1d31", shirt: "#6d5dfc", accent: "#efd98b", symbol: "\u263E" },
  { id: "ava", name: "Ava", mood: "Sunny sidekick", skin: "#c98b67", hair: "#6b3d24", shirt: "#148f8b", accent: "#fff4cf", symbol: "\u2665" },
  { id: "zuri", name: "Zuri", mood: "Rhythm rocker", skin: "#6f4a39", hair: "#171819", shirt: "#bd4f6c", accent: "#efd98b", symbol: "\u2737" }
];

const liveSongTitle = document.querySelector("#liveSongTitle");
const liveStudentPhoto = document.querySelector("#liveStudentPhoto");
const liveStudentName = document.querySelector("#liveStudentName");
const songPicker = document.querySelector("#songPicker");
const sectionPicker = document.querySelector("#sectionPicker");
const liveBuddyCoach = document.querySelector("#liveBuddyCoach");
const liveBuddyCharacter = document.querySelector("#liveBuddyCharacter");
const liveBuddyBubble = document.querySelector("#liveBuddyBubble");
const liveStatus = document.querySelector("#liveStatus");
const elapsedTime = document.querySelector("#elapsedTime");
const totalTime = document.querySelector("#totalTime");
const liveTimeline = document.querySelector("#liveTimeline");
const timelineProgress = document.querySelector("#timelineProgress");
const timelineSlider = document.querySelector("#timelineSlider");
const timelineCues = document.querySelector("#timelineCues");
const backingTrack = document.querySelector("#backingTrack");
const voiceCue = document.querySelector("#voiceCue");
const armAudioButton = document.querySelector("#armAudioButton");
const startLiveButton = document.querySelector("#startLiveButton");
const pauseLiveButton = document.querySelector("#pauseLiveButton");
const resetLiveButton = document.querySelector("#resetLiveButton");
const liveProfileName = document.querySelector("#liveProfileName");
const liveProfilePhoto = document.querySelector("#liveProfilePhoto");
const liveLoginPanel = document.querySelector("#liveLoginPanel");
const liveLoginForm = document.querySelector("#liveLoginForm");
const liveLoginEmail = document.querySelector("#liveLoginEmail");
const liveLoginPassword = document.querySelector("#liveLoginPassword");
const liveLoginMessage = document.querySelector("#liveLoginMessage");

initializeLivePage();

async function initializeLivePage() {
  bindLiveControls();

  try {
    const session = loadActiveSession();
    const currentUser = localStorage.getItem(storageKeys.currentUser);
    liveState.user = session.user === currentUser ? session.user : currentUser;

    if (!liveState.user || !getCloudToken()) {
      showLiveLogin("Sign in on this screen with the same account to join the live session.");
      return;
    }

    hideLiveLogin();
    liveState.buddy = loadBuddy(liveState.user);
    liveState.participantProfile = loadParticipantProfile();
    liveState.savedSongs = loadSongs(liveState.user).slice(0, 5);
    await hydrateCloudLiveState();

    if (liveState.savedSongs.length === 0) {
      setUnavailable("No saved songs yet. Save a song from the teacher screen on this same account.");
      return;
    }

    renderSongPicker();
    const activeSession = loadActiveSession();
    const selectedSong = liveState.savedSongs.find((song) => song.id === activeSession.songId) || liveState.savedSongs[0];
    await selectLiveSong(selectedSong.id);
    startCloudSessionPolling();
  } catch (error) {
    if (error.status === 401) {
      showLiveLogin("This screen needs to sign in again before it can join the session.");
      return;
    }

    setUnavailable("The live cue screen could not load this song.");
  }
}

function bindLiveControls() {
  liveLoginForm.addEventListener("submit", handleLiveLogin);
  armAudioButton.addEventListener("click", () => armAudioDevice());
  startLiveButton.addEventListener("click", startSession);
  pauseLiveButton.addEventListener("click", pauseAllDevices);
  resetLiveButton.addEventListener("click", resetAllDevices);
  liveProfileName.addEventListener("input", updateParticipantName);
  liveProfilePhoto.addEventListener("change", handleParticipantPhotoUpload);

  backingTrack.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(backingTrack.duration)) {
      liveState.duration = Math.max(liveState.duration, backingTrack.duration);
      totalTime.textContent = formatTime(liveState.duration);
      renderCueBoxes();
    }
  });

  backingTrack.addEventListener("ended", () => {
    cancelAnimationFrame(liveState.frameId);
    clearTimeout(liveState.cueStopTimer);
    liveState.cueStopTimer = null;
    backingTrack.muted = false;
    backingTrack.loop = false;
    backingTrack.volume = 1;
    voiceCue.pause();
    liveState.playingCueIds.clear();
    resetAudioReadyButton();
    liveState.finishedPlaybackCommandId = liveState.lastPlaybackCommandId;
    awardSongCompletion();
  });

  voiceCue.addEventListener("ended", () => {
    clearTimeout(liveState.cueStopTimer);
    liveState.cueStopTimer = null;
    backingTrack.muted = false;
    liveState.playingCueIds.clear();
    updateTimeline();
  });
}

async function handleLiveLogin(event) {
  event.preventDefault();

  const email = liveLoginEmail.value.trim().toLowerCase();
  const password = liveLoginPassword.value.trim();

  if (!isValidEmail(email) || !password) {
    liveLoginMessage.textContent = "Enter the same confirmed email and password used on the teacher screen.";
    return;
  }

  try {
    liveLoginMessage.textContent = "Joining this account...";
    const passwordHash = await hashPassword(password);
    const result = await cloudRequest("/api/login", {
      method: "POST",
      body: { email, passwordHash }
    });

    localStorage.setItem(storageKeys.authToken, result.token);
    localStorage.setItem(storageKeys.currentUser, email);
    localStorage.removeItem(storageKeys.activeSession);
    liveLoginMessage.textContent = "Joined. Loading the shared song session...";
    window.location.reload();
  } catch {
    liveLoginMessage.textContent = "That login did not work. Use the exact account from the teacher device.";
  }
}

function showLiveLogin(message) {
  liveLoginPanel.classList.remove("hidden");
  liveLoginMessage.textContent = message;
  liveStatus.textContent = message;
  liveSongTitle.textContent = "Join Live Cue Screen";
  armAudioButton.disabled = true;
  startLiveButton.disabled = true;
  pauseLiveButton.disabled = true;
  resetLiveButton.disabled = true;
  liveLoginEmail.focus();
}

function hideLiveLogin() {
  liveLoginPanel.classList.add("hidden");
  liveLoginMessage.textContent = "";
}

function renderSongPicker() {
  songPicker.innerHTML = "";

  liveState.savedSongs.forEach((song, index) => {
    const button = document.createElement("button");
    const title = document.createElement("strong");
    const detail = document.createElement("span");

    button.type = "button";
    button.className = "song-choice";
    button.dataset.songId = song.id;
    title.textContent = song.title || `Song ${index + 1}`;
    detail.textContent = `${normalizeCueIntervals(song).length} cues | ${normalizeSections(song).length} sections`;
    button.append(title, detail);
    button.addEventListener("click", () => selectLiveSong(song.id));
    songPicker.appendChild(button);
  });
}

async function startCloudSessionPolling() {
  if (!getCloudToken() || liveState.sessionPollTimer) {
    return;
  }

  await pollCloudSession();
  liveState.sessionPollTimer = setInterval(pollCloudSession, 500);
}

async function pollCloudSession() {
  try {
    const session = await cloudRequest("/api/session");
    syncCloudClock(session);
    const nextSong = liveState.savedSongs.find((song) => song.id === session.songId);

    if (nextSong && nextSong.id !== liveState.song?.id && backingTrack.paused) {
      await selectLiveSong(nextSong.id);
      liveStatus.textContent = "Joined the current cloud music session.";
    }

    await handleCloudPlaybackSession(session);
  } catch {
    // Keep the current local session if cloud polling is temporarily unavailable.
  }
}

async function selectLiveSong(songId) {
  const song = liveState.savedSongs.find((item) => item.id === songId);
  if (!song) {
    return;
  }

  pauseSession();
  liveState.song = song;
  liveState.playedCues.clear();
  liveState.playingCueIds.clear();
  liveState.pendingCueIds.clear();
  liveState.pendingPlayback = null;
  resetAudioReadyButton();
  await ensureSongMedia(liveState.song);
  liveState.sections = normalizeSections(liveState.song);
  liveState.allCues = normalizeCueIntervals(liveState.song);
  liveState.activeSectionId = getInitialSectionId(liveState.song);
  liveState.cues = getSectionCues(liveState.activeSectionId);
  liveState.duration = calculateTimelineDuration(liveState.song, liveState.allCues);
  backingTrack.src = liveState.song.trackDataUrl;
  voiceCue.src = liveState.song.cueDataUrl;
  localStorage.setItem(storageKeys.activeSession, JSON.stringify({
    user: liveState.user,
    songId: liveState.song.id,
    sectionId: liveState.activeSectionId
  }));
  localStorage.setItem(sectionStorageKey(liveState.song.id), liveState.activeSectionId);
  renderLiveSong();
  updateSongPickerSelection();
}

function updateSongPickerSelection() {
  songPicker.querySelectorAll(".song-choice").forEach((button) => {
    button.classList.toggle("active", button.dataset.songId === liveState.song?.id);
  });
}

function renderLiveSong() {
  liveState.buddy.mood = getCharacterOption(liveState.buddy.character).mood;
  liveSongTitle.textContent = liveState.song.title;
  renderParticipantProfile();
  renderLiveBuddyCharacter();
  totalTime.textContent = formatTime(liveState.duration);
  renderSectionPicker();
  renderCueBoxes();
  updateTimeline();
  liveStatus.textContent = `${getActiveSectionName()} is ready. One device can press Start All Devices when the group is ready.`;
  setLiveBuddySpeech(getBuddyLine("ready"));
}

function renderSectionPicker() {
  sectionPicker.innerHTML = "";

  liveState.sections.forEach((section) => {
    const button = document.createElement("button");
    const cueCount = liveState.allCues.filter((cue) => cue.sectionId === section.id).length;

    button.type = "button";
    button.className = "section-choice";
    button.dataset.sectionId = section.id;
    button.classList.toggle("active", section.id === liveState.activeSectionId);
    button.textContent = `${section.name} (${cueCount})`;
    button.setAttribute("aria-label", `Choose ${section.name}, ${cueCount} cue${cueCount === 1 ? "" : "s"}`);
    button.addEventListener("click", () => selectLiveSection(section.id));
    sectionPicker.appendChild(button);
  });
}

function selectLiveSection(sectionId) {
  if (!liveState.song || sectionId === liveState.activeSectionId) {
    return;
  }

  pauseSession();
  liveState.activeSectionId = sectionId;
  liveState.cues = getSectionCues(sectionId);
  liveState.playedCues.clear();
  localStorage.setItem(sectionStorageKey(liveState.song.id), sectionId);
  localStorage.setItem(storageKeys.activeSession, JSON.stringify({
    user: liveState.user,
    songId: liveState.song.id,
    sectionId
  }));
  renderSectionPicker();
  renderCueBoxes();
  updateTimeline();
  liveStatus.textContent = `${getActiveSectionName()} selected. One device can press Start All Devices when ready.`;
  setLiveBuddySpeech(`${getActiveSectionName()} is ready. I will show only this section's GO moments.`);
}

function renderCueBoxes() {
  timelineCues.innerHTML = "";

  if (liveState.cues.length === 0) {
    const empty = document.createElement("div");
    empty.className = "no-cue-note";
    empty.textContent = `No GO cues are assigned to ${getActiveSectionName()} yet.`;
    timelineCues.appendChild(empty);
    return;
  }

  const layouts = buildCueLayouts(liveState.cues);

  liveState.cues.forEach((cue) => {
    const cueButton = document.createElement("button");
    const layout = layouts.get(cue.id) || { left: 0, width: 8, top: 50, height: 104 };

    cueButton.type = "button";
    cueButton.className = "cue-box";
    cueButton.dataset.cueId = cue.id;
    cueButton.style.left = `${layout.left}%`;
    cueButton.style.width = `${layout.width}%`;
    cueButton.style.setProperty("--cue-top", `${layout.top}%`);
    cueButton.style.setProperty("--cue-height", `${layout.height}px`);
    cueButton.disabled = true;
    cueButton.setAttribute("aria-label", `${cue.label} GO cue`);

    const photo = document.createElement("img");
    photo.src = getParticipantPhoto();
    photo.alt = "";

    const overlay = document.createElement("span");
    overlay.className = "cue-overlay";
    setCueOverlay(overlay, formatTime(cue.startTime), cue.label);

    cueButton.append(photo, overlay);
    cueButton.addEventListener("pointerdown", (event) => {
      if (cueButton.disabled) {
        return;
      }
      event.preventDefault();
      playCue(cue);
    });
    cueButton.addEventListener("click", () => playCue(cue));
    timelineCues.appendChild(cueButton);
  });
}

function buildCueLayouts(cues) {
  const trackWidth = Math.max(liveTimeline.clientWidth - 64, 1);
  const trackHeight = Math.max(liveTimeline.clientHeight, 260);
  const minCardWidth = (72 / trackWidth) * 100;
  const maxCardWidth = Math.max(minCardWidth, 12);
  const gap = Math.min((14 / trackWidth) * 100, 3);
  const laneEnds = [];
  const positioned = cues
    .map((cue) => {
      const rawWidth = percentage(cue.duration, liveState.duration);
      const width = Math.min(Math.max(rawWidth, minCardWidth), maxCardWidth);
      const left = Math.min(Math.max(percentage(cue.startTime, liveState.duration), 0), Math.max(100 - width, 0));
      return { cue, left, width, lane: 0 };
    })
    .sort((a, b) => a.left - b.left);

  positioned.forEach((item) => {
    const lane = laneEnds.findIndex((end) => item.left >= end + gap);
    const nextLane = lane === -1 ? laneEnds.length : lane;
    item.lane = nextLane;
    laneEnds[nextLane] = item.left + item.width;
  });

  const laneCount = Math.max(laneEnds.length, 1);
  const slotHeight = Math.max((trackHeight - 36) / laneCount, 54);
  const cardHeight = Math.min(Math.max(slotHeight - 8, 58), 108);

  return new Map(positioned.map((item) => {
    const top = laneCount === 1 ? 50 : ((item.lane + 0.5) / laneCount) * 100;
    return [item.cue.id, {
      left: item.left,
      width: item.width,
      top,
      height: cardHeight
    }];
  }));
}

async function startSession() {
  if (!liveState.song) {
    return;
  }

  if (!liveState.audioReady) {
    const ready = await armAudioDevice({ quiet: true });
    if (!ready) {
      startLiveButton.disabled = false;
      return;
    }
  }

  if (getCloudToken()) {
    try {
      startLiveButton.disabled = true;
      liveStatus.textContent = "Starting every joined device in 3 seconds...";
      const session = await cloudRequest("/api/session", {
        method: "PUT",
        body: {
          songId: liveState.song.id,
          sectionId: liveState.activeSectionId,
          playback: { action: "schedule-start" }
        }
      });
      syncCloudClock(session);
      await handleCloudPlaybackSession(session);
      return;
    } catch {
      startLiveButton.disabled = false;
      liveStatus.textContent = "Cloud start did not connect. Starting this device only.";
    }
  }

  scheduleLocalCountdown(Date.now() + 3000, `local-${Date.now()}`);
}

function beginPlaybackAtOffset(offsetSeconds = 0) {
  liveState.playedCues.clear();
  liveState.playingCueIds.clear();
  clearTimeout(liveState.countdownTimer);
  clearTimeout(liveState.cueStopTimer);
  liveState.countdownTimer = null;
  liveState.cueStopTimer = null;
  const startTime = Math.min(Math.max(offsetSeconds, 0), Math.max(liveState.duration - 0.2, 0));
  backingTrack.loop = false;
  backingTrack.muted = true;
  backingTrack.volume = 1;
  voiceCue.pause();
  safelySeekVoiceCue(0);
  safelySeekBackingTrack(startTime);
  backingTrack.muted = false;

  const markPlaybackStarted = () => {
    liveStatus.textContent = `${getActiveSectionName()} timeline running.`;
    setLiveBuddySpeech(getBuddyLine("start"), "is-speaking");
  };

  if (backingTrack.paused) {
    const playPromise = backingTrack.play();
    if (playPromise?.catch) {
      playPromise
        .then(markPlaybackStarted)
        .catch(() => {
          liveState.audioReady = false;
          markAudioNeedsReady("Press Ready This Device, then Start All Devices again if the song did not begin.");
          startLiveButton.disabled = false;
        });
    } else {
      markPlaybackStarted();
    }
  } else {
    markPlaybackStarted();
  }

  startLiveButton.disabled = false;
  animateTimeline();
}

async function handleCloudPlaybackSession(session) {
  const playback = session?.playback;

  if (!playback || !playback.commandId) {
    return;
  }

  if (playback.songId && playback.songId !== liveState.song?.id) {
    const nextSong = liveState.savedSongs.find((song) => song.id === playback.songId);
    if (!nextSong) {
      return;
    }
    await selectLiveSong(nextSong.id);
  }

  if (playback.state === "scheduled" && playback.startAt) {
    if (playback.commandId === liveState.lastPlaybackCommandId && !backingTrack.paused) {
      return;
    }

    scheduleLocalCountdown(getLocalTimeForCloudStart(playback.startAt), playback.commandId, playback.startAt);
    return;
  }

  if (liveState.processedPlaybackCommandIds.has(playback.commandId)) {
    return;
  }

  if (playback.state === "cue-hit") {
    const result = executeSyncedCue(playback);
    if (result !== "pending") {
      rememberProcessedPlaybackCommand(playback.commandId);
    }
    return;
  }

  if (playback.state === "paused") {
    applyLocalPause("Paused by the shared session.");
    rememberProcessedPlaybackCommand(playback.commandId);
    return;
  }

  if (playback.state === "reset") {
    applyLocalReset("Reset by the shared session.");
    rememberProcessedPlaybackCommand(playback.commandId);
  }
}

function rememberProcessedPlaybackCommand(commandId) {
  if (!commandId) {
    return;
  }

  liveState.processedPlaybackCommandIds.add(commandId);

  if (liveState.processedPlaybackCommandIds.size > 40) {
    const [oldestCommandId] = liveState.processedPlaybackCommandIds;
    liveState.processedPlaybackCommandIds.delete(oldestCommandId);
  }
}

function scheduleLocalCountdown(localStartAt, commandId, cloudStartAt = 0, force = false) {
  if (!liveState.song) {
    return;
  }

  if (!force && commandId === liveState.finishedPlaybackCommandId) {
    return;
  }

  if (!force && commandId === liveState.lastPlaybackCommandId && liveState.pendingPlayback?.commandId === commandId) {
    return;
  }

  if (!force && commandId === liveState.lastPlaybackCommandId && (liveState.countdownTimer || !backingTrack.paused)) {
    return;
  }

  liveState.lastPlaybackCommandId = commandId;
  liveState.finishedPlaybackCommandId = "";
  clearTimeout(liveState.countdownTimer);
  cancelAnimationFrame(liveState.frameId);
  if (liveState.audioReady) {
    backingTrack.loop = true;
    backingTrack.muted = true;
    backingTrack.volume = 0;
    safelySeekBackingTrack(0);
    if (backingTrack.paused) {
      liveState.audioReady = false;
      startLiveButton.disabled = false;
      markAudioNeedsReady("Tap Ready This Device again on this screen so it can listen for the shared start.");
      return;
    }
  } else {
    backingTrack.pause();
    safelySeekBackingTrack(0);
  }
  voiceCue.pause();
  safelySeekVoiceCue(0);
  liveState.playedCues.clear();
  liveState.playingCueIds.clear();
  updateTimeline();
  startLiveButton.disabled = true;

  const tick = () => {
    const remainingMs = localStartAt - Date.now();

    if (remainingMs <= 0) {
      if (!liveState.audioReady) {
        liveState.pendingPlayback = {
          state: "scheduled",
          commandId,
          startAt: cloudStartAt || getCloudNow(),
          songId: liveState.song.id
        };
        liveState.countdownTimer = null;
        startLiveButton.disabled = false;
        markAudioNeedsReady("Press Ready This Device once on this screen to hear and join the running session.");
        setLiveBuddySpeech("Press Ready This Device once so this screen can play sound.", "is-speaking");
        return;
      }

      const offsetSeconds = cloudStartAt ? Math.max((getCloudNow() - cloudStartAt) / 1000, 0) : 0;
      beginPlaybackAtOffset(offsetSeconds);
      return;
    }

    const count = Math.max(Math.ceil(remainingMs / 1000), 1);
    liveStatus.textContent = `All devices start in ${count}...`;
    setLiveBuddySpeech(`${count}. Everyone on this account starts together.`, "is-counting");
    liveState.countdownTimer = setTimeout(tick, Math.min(remainingMs, 250));
  };

  tick();
}

function syncCloudClock(session) {
  if (Number.isFinite(Number(session?.serverTime))) {
    liveState.cloudClockOffset = Number(session.serverTime) - Date.now();
  }
}

function getCloudNow() {
  return Date.now() + liveState.cloudClockOffset;
}

function getLocalTimeForCloudStart(startAt) {
  return Number(startAt) - liveState.cloudClockOffset;
}

async function armAudioDevice(options = {}) {
  if (!liveState.song) {
    return false;
  }

  armAudioButton.disabled = true;
  armAudioButton.classList.remove("needs-ready");

  if (!options.quiet) {
    liveStatus.textContent = "Getting this device ready for sound...";
    setLiveBuddySpeech("I am getting this screen ready for karaoke and singer clips.", "is-speaking");
  }

  try {
    await ensureSongMedia(liveState.song);

    if (!liveState.song.trackDataUrl || !liveState.song.cueDataUrl) {
      throw new Error("Missing song audio.");
    }

    backingTrack.src = liveState.song.trackDataUrl;
    voiceCue.src = liveState.song.cueDataUrl;
    await primeBackingTrack();
    voiceCue.load();

    liveState.audioReady = true;
    armAudioButton.disabled = true;
    armAudioButton.textContent = "Device Listening";
    armAudioButton.classList.add("is-ready");
    liveStatus.textContent = options.quiet
      ? "This device is ready. Starting the group countdown..."
      : "This device is listening silently. One account device can press Start All Devices.";

    if (liveState.pendingPlayback) {
      const pending = liveState.pendingPlayback;
      liveState.pendingPlayback = null;
      if (pending.state === "scheduled") {
        scheduleLocalCountdown(getLocalTimeForCloudStart(pending.startAt), pending.commandId, pending.startAt, true);
      } else {
        await handleCloudPlaybackSession({ playback: pending, serverTime: getCloudNow() });
      }
    }

    return true;
  } catch (error) {
    liveState.audioReady = false;
    armAudioButton.disabled = false;
    const message = error.message === "Missing song audio."
      ? "This account has the song, but this screen cannot find its audio yet. Re-save the song once from the teacher page so the karaoke and singer tracks upload."
      : "Tap Ready This Device once so this screen is allowed to play sound.";
    markAudioNeedsReady(message);
    return false;
  }
}

async function primeBackingTrack() {
  if (!backingTrack.src) {
    return;
  }

  backingTrack.loop = true;
  backingTrack.muted = true;
  backingTrack.volume = 0;
  safelySeekBackingTrack(0);
  await backingTrack.play();
}

function resetAudioReadyButton() {
  liveState.audioReady = false;
  backingTrack.loop = false;
  backingTrack.volume = 1;
  armAudioButton.disabled = false;
  armAudioButton.textContent = "Ready This Device";
  armAudioButton.classList.remove("is-ready", "needs-ready");
}

function markAudioNeedsReady(message) {
  armAudioButton.disabled = false;
  armAudioButton.textContent = "Ready This Device";
  armAudioButton.classList.remove("is-ready");
  armAudioButton.classList.add("needs-ready");
  liveStatus.textContent = message;
}

async function pauseAllDevices() {
  if (!liveState.song || !getCloudToken()) {
    applyLocalPause("Paused.");
    return;
  }

  try {
    const session = await cloudRequest("/api/session", {
      method: "PUT",
      body: {
        songId: liveState.song.id,
        sectionId: liveState.activeSectionId,
        playback: { action: "pause" }
      }
    });
    syncCloudClock(session);
    await handleCloudPlaybackSession(session);
  } catch {
    applyLocalPause("Paused on this device.");
  }
}

async function resetAllDevices() {
  if (!liveState.song || !getCloudToken()) {
    applyLocalReset("Reset and ready.");
    return;
  }

  try {
    const session = await cloudRequest("/api/session", {
      method: "PUT",
      body: {
        songId: liveState.song.id,
        sectionId: liveState.activeSectionId,
        playback: { action: "reset" }
      }
    });
    syncCloudClock(session);
    await handleCloudPlaybackSession(session);
  } catch {
    applyLocalReset("Reset on this device.");
  }
}

function pauseSession() {
  applyLocalPause("Paused.");
}

function applyLocalPause(message) {
  backingTrack.pause();
  clearTimeout(liveState.countdownTimer);
  clearTimeout(liveState.cueStopTimer);
  liveState.countdownTimer = null;
  liveState.cueStopTimer = null;
  backingTrack.muted = false;
  backingTrack.loop = false;
  backingTrack.volume = 1;
  voiceCue.pause();
  liveState.playingCueIds.clear();
  if (liveState.song) {
    resetAudioReadyButton();
  }
  cancelAnimationFrame(liveState.frameId);
  startLiveButton.disabled = false;
  liveStatus.textContent = message;
  setLiveBuddySpeech(getBuddyLine("pause"));
}

function resetSession() {
  applyLocalReset("Reset and ready.");
}

function applyLocalReset(message) {
  backingTrack.pause();
  backingTrack.currentTime = 0;
  clearTimeout(liveState.countdownTimer);
  clearTimeout(liveState.cueStopTimer);
  liveState.countdownTimer = null;
  liveState.cueStopTimer = null;
  backingTrack.muted = false;
  backingTrack.loop = false;
  backingTrack.volume = 1;
  voiceCue.pause();
  safelySeekVoiceCue(0);
  safelySeekBackingTrack(0);
  liveState.playedCues.clear();
  liveState.playingCueIds.clear();
  liveState.pendingCueIds.clear();
  liveState.pendingPlayback = null;
  if (liveState.song) {
    resetAudioReadyButton();
  }
  cancelAnimationFrame(liveState.frameId);
  startLiveButton.disabled = false;
  updateTimeline();
  liveStatus.textContent = message;
  setLiveBuddySpeech(getBuddyLine("ready"));
}

function animateTimeline() {
  updateTimeline();
  liveState.frameId = requestAnimationFrame(animateTimeline);
}

function updateTimeline() {
  const currentTime = backingTrack.currentTime || 0;
  const progress = percentage(currentTime, liveState.duration);
  const trackWidth = Math.max(liveTimeline.clientWidth - 64, 1);

  elapsedTime.textContent = formatTime(currentTime);
  timelineProgress.style.width = `${trackWidth * (progress / 100)}px`;
  timelineSlider.style.left = `${32 + (trackWidth * (progress / 100))}px`;

  liveState.cues.forEach((cue) => updateCueBox(cue, currentTime));
}

function updateCueBox(cue, currentTime) {
  const cueButton = timelineCues.querySelector(`[data-cue-id="${cue.id}"]`);
  if (!cueButton) {
    return;
  }

  const overlay = cueButton.querySelector(".cue-overlay");
  const countdownStart = Math.max(cue.startTime - 5, 0);
  const cueEnd = cue.startTime + cue.duration;
  const alreadyPlayed = liveState.playedCues.has(cue.id);
  const isPlaying = liveState.playingCueIds.has(cue.id);
  const isPending = liveState.pendingCueIds.has(cue.id);

  cueButton.classList.remove("is-counting", "is-ready", "is-played", "is-missed", "is-playing");

  if (isPlaying || isPending) {
    cueButton.disabled = true;
    cueButton.classList.add("is-playing");
    setCueOverlay(overlay, isPending ? "Syncing" : "Playing", cue.label);
    return;
  }

  if (alreadyPlayed) {
    cueButton.disabled = true;
    cueButton.classList.add("is-played");
    setCueOverlay(overlay, "Done", cue.label);
    return;
  }

  if (currentTime >= countdownStart && currentTime < cue.startTime) {
    const count = Math.max(Math.ceil(cue.startTime - currentTime), 1);
    cueButton.disabled = true;
    cueButton.classList.add("is-counting");
    setCueOverlay(overlay, String(count), cue.label);
    liveStatus.textContent = `${getParticipantName()}, get ready.`;
    setLiveBuddySpeech(`${count}. ${getBuddyLine("countdown")}`, "is-counting");
    return;
  }

  if (currentTime >= cue.startTime && currentTime <= cueEnd) {
    cueButton.disabled = false;
    cueButton.classList.add("is-ready");
    setCueOverlay(overlay, "GO", cue.label);
    liveStatus.textContent = `${getParticipantName()}, press GO for ${getActiveSectionName()}.`;
    setLiveBuddySpeech(getBuddyLine("go"), "is-cheering");
    return;
  }

  if (currentTime > cueEnd) {
    cueButton.disabled = false;
    cueButton.classList.add("is-missed");
    setCueOverlay(overlay, "GO", cue.label);
    return;
  }

  cueButton.disabled = true;
  setCueOverlay(overlay, formatTime(cue.startTime), cue.label);
}

function setCueOverlay(overlay, primary, secondary) {
  overlay.textContent = "";
  const primaryText = document.createElement("span");
  const secondaryText = document.createTextNode(secondary);
  primaryText.textContent = primary;
  overlay.append(primaryText, secondaryText);
}

function safelySeekVoiceCue(time) {
  try {
    voiceCue.currentTime = Math.max(Number(time) || 0, 0);
    return true;
  } catch {
    return false;
  }
}

function safelySeekBackingTrack(time) {
  try {
    backingTrack.currentTime = Math.max(Number(time) || 0, 0);
    return true;
  } catch {
    return false;
  }
}

async function playCue(cue) {
  if (
    liveState.playedCues.has(cue.id) ||
    liveState.playingCueIds.has(cue.id) ||
    liveState.pendingCueIds.has(cue.id)
  ) {
    return;
  }

  liveState.pendingCueIds.add(cue.id);
  updateCueBox(cue, backingTrack.currentTime || cue.startTime);

  if (getCloudToken()) {
    try {
      const session = await cloudRequest("/api/session", {
        method: "PUT",
        body: {
          songId: liveState.song.id,
          sectionId: liveState.activeSectionId,
          playback: {
            action: "cue-hit",
            cueId: cue.id,
            cueSectionId: cue.sectionId,
            label: cue.label,
            lyrics: cue.lyrics,
            startTime: cue.startTime,
            singerStartTime: cue.singerStartTime,
            duration: cue.duration
          }
        }
      });
      syncCloudClock(session);
      liveState.pendingCueIds.delete(cue.id);
      await handleCloudPlaybackSession(session);
      return;
    } catch {
      liveState.pendingCueIds.delete(cue.id);
      liveStatus.textContent = "The shared cue did not send. Playing it on this screen.";
    }
  }

  liveState.pendingCueIds.delete(cue.id);
  executeSyncedCue({
    state: "cue-hit",
    commandId: `local-cue-${Date.now()}`,
    commandAt: getCloudNow(),
    songId: liveState.song.id,
    cueId: cue.id,
    cueSectionId: cue.sectionId,
    label: cue.label,
    lyrics: cue.lyrics,
    startTime: cue.startTime,
    singerStartTime: cue.singerStartTime,
    duration: cue.duration
  });
}

function executeSyncedCue(playback) {
  const cue = getCueFromPlayback(playback);
  if (!cue) {
    return "ignored";
  }

  if (!liveState.audioReady) {
    liveState.pendingPlayback = playback;
    markAudioNeedsReady("Press Ready This Device so this screen can hear the shared cue.");
    return "pending";
  }

  clearTimeout(liveState.cueStopTimer);
  liveState.cueStopTimer = null;
  voiceCue.pause();
  liveState.playingCueIds.clear();
  liveState.playingCueIds.add(cue.id);
  liveState.playedCues.add(cue.id);

  const commandAt = Number(playback.commandAt || playback.requestedAt || getCloudNow());
  const elapsed = Math.max((getCloudNow() - commandAt) / 1000, 0);
  const clipStart = Math.max(Number(cue.singerStartTime) || 0, 0);
  const clipDuration = Math.max(Number(cue.duration) || 0, 0.5);
  const singerOffset = Math.min(elapsed, clipDuration);
  const karaokeTime = Math.min(
    Math.max((Number(cue.startTime) || 0) + elapsed, 0),
    Math.max(liveState.duration - 0.2, 0)
  );

  backingTrack.loop = false;
  backingTrack.volume = 1;
  safelySeekBackingTrack(karaokeTime);
  backingTrack.muted = false;

  if (!safelySeekVoiceCue(clipStart + singerOffset)) {
    backingTrack.muted = false;
    liveState.playingCueIds.delete(cue.id);
    liveState.playedCues.delete(cue.id);
    updateCueBox(cue, backingTrack.currentTime || cue.startTime);
    liveStatus.textContent = "The singer track is still loading. Press GO again in a moment.";
    return "ignored";
  }

  const finishCuePlayback = () => {
    voiceCue.pause();
    backingTrack.muted = false;
    liveState.playingCueIds.delete(cue.id);
    liveState.cueStopTimer = null;
    updateCueBox(cue, backingTrack.currentTime || cue.startTime);
  };

  const handleCuePlayFailure = () => {
    clearTimeout(liveState.cueStopTimer);
    liveState.cueStopTimer = null;
    backingTrack.muted = false;
    liveState.playingCueIds.delete(cue.id);
    liveState.playedCues.delete(cue.id);
    updateCueBox(cue, backingTrack.currentTime || cue.startTime);
    liveStatus.textContent = "Press GO again if the singer clip did not start.";
  };

  const ensureBackingTrackRuns = () => {
    if (!backingTrack.paused) {
      return;
    }

    const backingPromise = backingTrack.play();
    if (backingPromise?.catch) {
      backingPromise.catch(() => {
        liveState.audioReady = false;
        markAudioNeedsReady("Press Ready This Device, then join the shared session again.");
      });
    }
  };

  ensureBackingTrackRuns();

  const remainingCueMs = Math.max((clipDuration - singerOffset) * 1000, 80);
  if (singerOffset >= clipDuration) {
    finishCuePlayback();
  } else {
    const playPromise = voiceCue.play();
    if (playPromise?.catch) {
      playPromise
        .then(() => {
          liveState.cueStopTimer = setTimeout(finishCuePlayback, remainingCueMs);
        })
        .catch(handleCuePlayFailure);
    } else {
      liveState.cueStopTimer = setTimeout(finishCuePlayback, remainingCueMs);
    }
  }

  const lyrics = cue.lyrics || cue.label || "Follow this cue.";
  liveStatus.textContent = lyrics;
  setLiveBuddySpeech(lyrics, "is-speaking");
  cancelAnimationFrame(liveState.frameId);
  animateTimeline();
  return "played";
}

function getCueFromPlayback(playback) {
  const existingCue = liveState.allCues.find((item) => item.id === playback.cueId);
  if (existingCue) {
    return existingCue;
  }

  return {
    id: playback.cueId || `shared-cue-${playback.commandId}`,
    label: playback.label || "Shared cue",
    lyrics: playback.lyrics || "",
    sectionId: playback.cueSectionId || playback.sectionId || liveState.activeSectionId,
    startTime: Number(playback.startTime) || 0,
    singerStartTime: Number.isFinite(Number(playback.singerStartTime))
      ? Number(playback.singerStartTime)
      : Number(playback.startTime) || 0,
    duration: Number(playback.duration) || 4
  };
}

function awardSongCompletion() {
  const totalCueCount = liveState.cues.length;
  const tappedCueCount = liveState.playedCues.size;

  if (totalCueCount === 0) {
    liveStatus.textContent = `Song complete. ${getActiveSectionName()} did not have GO cues assigned.`;
    setLiveBuddySpeech("Song complete. No GO cues were assigned to this section.", "is-speaking");
    return;
  }

  liveStatus.textContent = `Song complete. ${tappedCueCount}/${totalCueCount} GO cues played.`;
  setLiveBuddySpeech(getBuddyLine("complete"), "is-cheering");
}

function getBuddyLine(type) {
  const lines = liveBuddyLines[liveState.buddy?.mood] || liveBuddyLines["Steady guide"];
  return lines[type] || lines.ready;
}

function setLiveBuddySpeech(message, mode) {
  liveBuddyBubble.textContent = message;
  liveBuddyCoach.classList.remove("is-speaking", "is-counting", "is-cheering");

  if (mode) {
    liveBuddyCoach.classList.add(mode);
  }
}

function renderLiveBuddyCharacter() {
  const character = getCharacterOption(liveState.buddy.character);
  liveBuddyCharacter.replaceChildren(createCharacterElement(character));
}

function getCharacterOption(value) {
  return buddyCharacters.find((character) => character.id === value) || buddyCharacters[0];
}

function createCharacterElement(character) {
  const art = document.createElement("div");
  art.className = "character-art live";
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

function loadParticipantProfile() {
  return { name: "", photoDataUrl: "" };
}

function persistParticipantProfile() {
  // Keep student-facing profile details session-only.
}

function updateParticipantName() {
  liveState.participantProfile.name = liveProfileName.value.trim();
  persistParticipantProfile();
  renderParticipantProfile();
  renderCueBoxes();
}

async function handleParticipantPhotoUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    liveState.participantProfile.photoDataUrl = await resizeImageFile(file, 420);
    persistParticipantProfile();
    renderParticipantProfile();
    renderCueBoxes();
    liveStatus.textContent = "This screen's picture is ready for this session only.";
  } catch {
    liveStatus.textContent = "That picture could not load. Try a smaller image.";
  }
}

function renderParticipantProfile() {
  const name = getParticipantName();
  liveProfileName.value = liveState.participantProfile.name || "";
  liveStudentName.textContent = name;
  liveStudentPhoto.src = getParticipantPhoto();
}

function getParticipantName() {
  return liveState.participantProfile.name || "Student";
}

function getParticipantPhoto() {
  const name = getParticipantName();
  return liveState.participantProfile.photoDataUrl || placeholderImage(name);
}

function loadActiveSession() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.activeSession)) || {};
  } catch {
    return {};
  }
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

async function hydrateCloudLiveState() {
  if (!getCloudToken()) {
    return;
  }

  const cloudState = await cloudRequest("/api/state");
  liveState.buddy = normalizeBuddyProfile(cloudState.buddy);
  liveState.savedSongs = Array.isArray(cloudState.songs)
    ? cloudState.songs.map((song) => ({
      ...song,
      sections: normalizeSections(song),
      cueIntervals: normalizeCueIntervals(song),
      trackDataUrl: "",
      cueDataUrl: ""
    })).slice(0, 5)
    : [];

  localStorage.setItem(userScopedKey(liveState.user, "buddy-profile"), JSON.stringify(liveState.buddy));
  localStorage.setItem(userScopedKey(liveState.user, "saved-songs"), JSON.stringify(liveState.savedSongs));

  if (cloudState.activeSession?.songId) {
    localStorage.setItem(storageKeys.activeSession, JSON.stringify({
      user: liveState.user,
      songId: cloudState.activeSession.songId
    }));
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

function loadBuddy(user) {
  try {
    const saved = JSON.parse(localStorage.getItem(userScopedKey(user, "buddy-profile")));
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

function loadSongs(user) {
  try {
    const saved = JSON.parse(localStorage.getItem(userScopedKey(user, "saved-songs")));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function userScopedKey(user, suffix) {
  return `${user || "guest"}-${suffix}`;
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

async function loadMediaAsset(id) {
  const db = await openMediaDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("media", "readonly");
    const request = transaction.objectStore("media").get(id);
    request.addEventListener("success", () => resolve(request.result || ""));
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

function createDefaultSections(count = 1) {
  const sectionTotal = Math.min(Math.max(Number.parseInt(count, 10) || 1, 1), 10);

  return Array.from({ length: sectionTotal }, (_, index) => ({
    id: `section-${index + 1}`,
    name: `Section ${index + 1}`
  }));
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

  return createDefaultSections(1);
}

function getInitialSectionId(song) {
  const session = loadActiveSession();
  const savedSectionId = localStorage.getItem(sectionStorageKey(song.id));
  const candidate = session.songId === song.id && session.sectionId ? session.sectionId : savedSectionId;
  const firstSectionId = liveState.sections[0]?.id || "section-1";

  return liveState.sections.some((section) => section.id === candidate) ? candidate : firstSectionId;
}

function sectionStorageKey(songId) {
  return `${liveState.user || "guest"}-${songId}-active-section`;
}

function getSectionCues(sectionId) {
  return liveState.allCues.filter((cue) => cue.sectionId === sectionId);
}

function getActiveSectionName() {
  const section = liveState.sections.find((item) => item.id === liveState.activeSectionId);
  return section?.name || "Section 1";
}

function normalizeCueIntervals(song) {
  const sections = normalizeSections(song);
  const fallbackSectionId = sections[0]?.id || "section-1";
  const validSectionIds = new Set(sections.map((section) => section.id));

  if (Array.isArray(song.cueIntervals) && song.cueIntervals.length > 0) {
    return song.cueIntervals
      .map((cue, index) => ({
        id: cue.id || `cue-${index}`,
        label: cue.label || `Cue ${index + 1}`,
        lyrics: cue.lyrics || cue.text || song.cueLyrics || "",
        sectionId: validSectionIds.has(cue.sectionId) ? cue.sectionId : fallbackSectionId,
        startTime: Number(cue.startTime) || 0,
        singerStartTime: Number.isFinite(Number(cue.singerStartTime))
          ? Number(cue.singerStartTime)
          : Number(cue.startTime) || 0,
        duration: Number(cue.duration) || 4
      }))
      .sort((a, b) => a.startTime - b.startTime);
  }

  return [{
    id: "cue-1",
    label: song.cueLabel || "Cue 1",
    lyrics: song.cueLyrics || "",
    sectionId: fallbackSectionId,
    startTime: 10,
    singerStartTime: 10,
    duration: Number(song.cueDuration) || 4
  }];
}

function calculateTimelineDuration(song, cues) {
  const finalCueEnd = cues.reduce((max, cue) => Math.max(max, cue.startTime + cue.duration + 8), 0);
  const storedLength = Number(song.trackDuration) || 0;
  return Math.max(finalCueEnd, storedLength, 45);
}

function percentage(value, total) {
  return Math.min(Math.max((value / Math.max(total, 1)) * 100, 0), 100);
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

function setUnavailable(message) {
  liveStatus.textContent = message;
  armAudioButton.disabled = true;
  startLiveButton.disabled = true;
  pauseLiveButton.disabled = true;
  resetLiveButton.disabled = true;
}
