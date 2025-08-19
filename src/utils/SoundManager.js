// This utility manages all sound effects for the game.
let backgroundMusic; // Keep a reference to the audio object to control it

// A helper function to play audio safely
const playSound = (src) => {
    const sound = new Audio(src);
    sound.play().catch(error => {
        console.error(`Error playing sound ${src}:`, error);
    });
};

export const playDiceRoll = () => playSound('/sounds/dice-roll.mp3');
export const playTokenStep = () => playSound('/sounds/token-move.mp3'); // Changed from move to step
export const playTokenCapture = () => playSound('/sounds/token-capture.mp3');
export const playTokenFinish = () => playSound('/sounds/token-finish.mp3');
export const playTokenEnter = () => playSound('/sounds/token-enter.mp3');

// --- Background Music Controls ---

let backgroundMusic1, backgroundMusic2;
let isPlayingFirst = true;

export const playBackgroundMusic = () => {
    if (!backgroundMusic1) {
        backgroundMusic1 = new Audio('/sounds/background-music.mp3');
        backgroundMusic2 = new Audio('/sounds/background-music.mp3');

        backgroundMusic1.volume = 0.3;
        backgroundMusic2.volume = 0.3;
    }

    const playLoop = (current, next) => {
        current.play().catch(err => console.error(err));

        current.onended = () => {
            next.currentTime = 0;
            next.play();
            isPlayingFirst = !isPlayingFirst;
            playLoop(next, current); // Swap for next loop
        };
    };

    if (isPlayingFirst) {
        playLoop(backgroundMusic1, backgroundMusic2);
    } else {
        playLoop(backgroundMusic2, backgroundMusic1);
    }
};
export const stopBackgroundMusic = () => {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reset to the start
    }
};