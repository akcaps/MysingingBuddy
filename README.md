# My Singing Buddy

My Singing Buddy powers Voice for All, an accessible choir rehearsal tool for neurodivergent and nonverbal students. It helps students participate through visual timing, section-based GO cues, lyric prompts, and real singer audio clips without requiring them to sing out loud.

## Current Features

- Account-based saved song libraries on the published site.
- Public account creation with no invitation code.
- Password recovery flow that does not display reset codes publicly by default.
- Karaoke and real singer track uploads with separate timing controls.
- Minute-and-second cue inputs for longer songs.
- Choir sections from 1 to 10, with cues assigned to specific sections.
- A separate live screen where each device chooses its section.
- Optional per-device session profile for a display name/photo that is not saved to the account.
- Shared Start All Devices countdown for joined screens on the same account.
- Shared GO cue recovery so late cue presses jump the room back to the cue and keep all devices in sync.
- Singer clips play from the real singer track while the karaoke track keeps playing underneath.
- Other sections can hear a shared GO cue even if the cue box belongs to a different section.
- No advertising, analytics scripts, YouTube embeds, TikTok/ByteDance integrations, Tencent integrations, or outside font requests.

## How To Use

1. Log in or create an account on the teacher page.
2. Upload the karaoke track and real singer track.
3. Create choir sections and add GO cues with lyrics.
4. Review the cues and audio preview.
5. Save the song to the account library.
6. Open the live screen on each student device.
7. On each live screen, choose the song, choose the section, optionally add a display name/photo, and press Ready This Device.
8. One joined device presses Start All Devices.

## Development

This project uses standard HTML, CSS, and JavaScript, with a generated Cloudflare Worker for account and rehearsal APIs.

- Run `node build-worker.cjs` to build `dist/server/index.js`.
- The deployed Worker needs a D1 binding named `DB` and an R2 binding named `BUCKET` for audio uploads.
- Account creation is public: no invitation code, school affiliation, or approved email domain is required.
- Serve the static files locally to preview the interface. Cloud account and shared rehearsal features require the Worker and its storage bindings.
- Each device must press Ready This Device before audio playback, as required by browser audio rules.
