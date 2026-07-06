/* ===========================================================
   TATI-FLIX
   Sistema de Sons
=========================================================== */

(() => {
    "use strict";

    let audioContext = null;
    let unlocked = false;
    let muted = localStorage.getItem("tatiflix_sound_muted") === "true";

    const SOUND_BUTTON_ID = "tatiSoundToggle";

    function getAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        return audioContext;
    }

    function unlockAudio() {
        if (unlocked) return;

        const ctx = getAudioContext();

        if (ctx.state === "suspended") {
            ctx.resume();
        }

        unlocked = true;
    }

    function createGain(volume = 0.15) {
        const ctx = getAudioContext();
        const gain = ctx.createGain();

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.connect(ctx.destination);

        return gain;
    }

    function playTone({
        frequency = 440,
        duration = 0.15,
        type = "sine",
        volume = 0.12,
        startDelay = 0,
        slideTo = null
    }) {
        if (muted) return;

        unlockAudio();

        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gain = createGain(volume);

        const start = ctx.currentTime + startDelay;
        const end = start + duration;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);

        if (slideTo) {
            oscillator.frequency.exponentialRampToValueAtTime(slideTo, end);
        }

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        oscillator.connect(gain);
        oscillator.start(start);
        oscillator.stop(end + 0.03);
    }

    function playNoise(duration = 0.18, volume = 0.08) {
        if (muted) return;

        unlockAudio();

        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.35;
        }

        const noise = ctx.createBufferSource();
        const gain = createGain(volume);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        noise.buffer = buffer;
        noise.connect(gain);
        noise.start();
        noise.stop(ctx.currentTime + duration);
    }

    const sounds = {
                intro() {
            // Som original estilo "TATI-FLIX intro", não é o som oficial Netflix

            playTone({
                frequency: 82,
                slideTo: 110,
                duration: 0.28,
                type: "sawtooth",
                volume: 0.13
            });

            playTone({
                frequency: 164,
                duration: 0.22,
                type: "triangle",
                volume: 0.11,
                startDelay: 0.08
            });

            playTone({
                frequency: 220,
                duration: 0.32,
                type: "sine",
                volume: 0.12,
                startDelay: 0.24
            });

            playTone({
                frequency: 440,
                slideTo: 330,
                duration: 0.45,
                type: "triangle",
                volume: 0.09,
                startDelay: 0.42
            });

            playNoise(0.18, 0.035);
        },
        click() {
            playTone({
                frequency: 240,
                slideTo: 420,
                duration: 0.08,
                type: "triangle",
                volume: 0.08
            });
        },

        hover() {
            playTone({
                frequency: 520,
                duration: 0.045,
                type: "sine",
                volume: 0.035
            });
        },

        select() {
            playTone({
                frequency: 360,
                duration: 0.06,
                type: "square",
                volume: 0.04
            });
        },

        error() {
            playTone({
                frequency: 180,
                slideTo: 95,
                duration: 0.22,
                type: "sawtooth",
                volume: 0.08
            });

            playTone({
                frequency: 140,
                slideTo: 80,
                duration: 0.18,
                type: "triangle",
                volume: 0.05,
                startDelay: 0.05
            });
        },

        wordFound() {
            playTone({
                frequency: 420,
                slideTo: 650,
                duration: 0.12,
                type: "triangle",
                volume: 0.1
            });

            playTone({
                frequency: 650,
                slideTo: 880,
                duration: 0.14,
                type: "triangle",
                volume: 0.1,
                startDelay: 0.1
            });

            playTone({
                frequency: 980,
                duration: 0.18,
                type: "sine",
                volume: 0.08,
                startDelay: 0.22
            });
        },

        missionComplete() {
            playNoise(0.2, 0.045);

            playTone({
                frequency: 220,
                slideTo: 440,
                duration: 0.28,
                type: "sawtooth",
                volume: 0.08
            });

            playTone({
                frequency: 440,
                slideTo: 660,
                duration: 0.28,
                type: "triangle",
                volume: 0.1,
                startDelay: 0.22
            });

            playTone({
                frequency: 660,
                slideTo: 990,
                duration: 0.42,
                type: "sine",
                volume: 0.11,
                startDelay: 0.46
            });
        },

        unlock() {
            playNoise(0.14, 0.04);

            playTone({
                frequency: 160,
                slideTo: 520,
                duration: 0.45,
                type: "sawtooth",
                volume: 0.075
            });

            playTone({
                frequency: 520,
                slideTo: 760,
                duration: 0.25,
                type: "triangle",
                volume: 0.09,
                startDelay: 0.3
            });
        },

        accept() {
            playTone({
                frequency: 392,
                duration: 0.12,
                type: "triangle",
                volume: 0.08
            });

            playTone({
                frequency: 523,
                duration: 0.14,
                type: "triangle",
                volume: 0.09,
                startDelay: 0.11
            });

            playTone({
                frequency: 784,
                duration: 0.28,
                type: "sine",
                volume: 0.1,
                startDelay: 0.25
            });
        },

        dramatic() {
            playTone({
                frequency: 250,
                slideTo: 170,
                duration: 0.2,
                type: "sawtooth",
                volume: 0.06
            });
        },

        final() {
            playTone({
                frequency: 330,
                duration: 0.16,
                type: "triangle",
                volume: 0.08
            });

            playTone({
                frequency: 440,
                duration: 0.16,
                type: "triangle",
                volume: 0.08,
                startDelay: 0.13
            });

            playTone({
                frequency: 660,
                duration: 0.28,
                type: "sine",
                volume: 0.1,
                startDelay: 0.28
            });

            playTone({
                frequency: 880,
                duration: 0.34,
                type: "sine",
                volume: 0.075,
                startDelay: 0.48
            });
        }
    };

    function play(soundName) {
        if (!sounds[soundName]) return;
        sounds[soundName]();
    }

    function createSoundToggle() {
        if (document.getElementById(SOUND_BUTTON_ID)) return;

        const button = document.createElement("button");
        button.id = SOUND_BUTTON_ID;
        button.type = "button";
        button.textContent = muted ? "🔇" : "🔊";
        button.title = muted ? "Ativar som" : "Desativar som";

        button.addEventListener("click", event => {
            event.stopPropagation();

            muted = !muted;
            localStorage.setItem("tatiflix_sound_muted", String(muted));

            button.textContent = muted ? "🔇" : "🔊";
            button.title = muted ? "Ativar som" : "Desativar som";

            if (!muted) {
                play("click");
            }
        });

        document.body.appendChild(button);
    }

    function injectStyles() {
        const style = document.createElement("style");

        style.textContent = `
            #${SOUND_BUTTON_ID} {
                position: fixed;
                right: 18px;
                bottom: 18px;
                z-index: 99999;

                width: 46px;
                height: 46px;

                border: 1px solid rgba(229, 9, 20, 0.65);
                border-radius: 50%;

                background: rgba(0, 0, 0, 0.72);
                color: #ffffff;

                font-size: 20px;
                cursor: pointer;

                box-shadow:
                    0 0 18px rgba(229, 9, 20, 0.28),
                    inset 0 0 12px rgba(255, 255, 255, 0.04);

                transition:
                    transform 0.2s ease,
                    background 0.2s ease,
                    box-shadow 0.2s ease;
            }

            #${SOUND_BUTTON_ID}:hover {
                transform: scale(1.08);
                background: rgba(229, 9, 20, 0.82);
                box-shadow: 0 0 26px rgba(229, 9, 20, 0.55);
            }
        `;

        document.head.appendChild(style);
    }

    function setupGlobalSounds() {
        document.addEventListener("pointerdown", () => {
            unlockAudio();
        }, { once: true });

        document.addEventListener("click", event => {
            const target = event.target.closest("button, a, .ws-cell");

            if (!target) return;

            if (target.classList.contains("ws-cell")) {
                play("select");
                return;
            }

            if (target.classList.contains("accept-button")) {
                play("accept");
                return;
            }

            if (target.classList.contains("dramatic-button")) {
                play("dramatic");
                return;
            }

            if (
                target.classList.contains("play-button") ||
                target.classList.contains("watch-button") ||
                target.classList.contains("final-button")
            ) {
                play("unlock");
                return;
            }

            if (target.classList.contains("finish-button")) {
                play("final");
                return;
            }

            play("click");
        });

        document.addEventListener("mouseover", event => {
            const target = event.target.closest("button, a");

            if (!target) return;

            play("hover");
        });
    }

    function init() {
        injectStyles();
        createSoundToggle();
        setupGlobalSounds();
    }

    window.TatiSound = {
        play,
        mute() {
            muted = true;
            localStorage.setItem("tatiflix_sound_muted", "true");
        },
        unmute() {
            muted = false;
            localStorage.setItem("tatiflix_sound_muted", "false");
            play("click");
        },
        toggle() {
            muted = !muted;
            localStorage.setItem("tatiflix_sound_muted", String(muted));
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();