const comicOverlay = document.getElementById("comic_overlay");
const minigameOverlay = document.getElementById("minigame_overlay");
const pioneerApp = document.getElementById("pioneer_app");
const panels = document.querySelectorAll(".comic_panel");
const instructionText = document.querySelector(".comic_instruction");

const memoryGrid = document.getElementById("memory_grid");

const volumeBar = document.getElementById("volume_bar");
const customAlert = document.getElementById("custom_alert");
const customAlertText = document.getElementById("custom_alert_text");
const closeAlertBtn = document.getElementById("close_alert_btn");

const loopButton = document.querySelector(".loop_button");
const songTitle = document.querySelector(".song_title");
const songList = document.querySelector(".songs");
const playButton = document.querySelector(".play_button");
const nextButton = document.querySelector(".next_button");
const prevButton = document.querySelector(".previous_button");
const bannerPlay = document.querySelector(".body_button");
const progressBar = document.querySelector(".audio_prog_bar");
const currentTime = document.querySelector(".current_time");
const totalTime = document.querySelector(".total_time");

const newSongTitle = document.getElementById("new_song_title");
const newSongFile = document.getElementById("new_song_file");
const addSongBtn = document.getElementById("add_song_btn");

const audio = new Audio();
let currentSong = 0;
let isLooping = false;
let songs = [];

let currentPanelIndex = 0;
let comicFinished = false;

function preloadImage(index){
    if(index < panels.length){
        const img = panels[index].querySelector("img");
        const preloader = new Image();
        preloader.src = img.src;
    }
}
preloadImage(1);

comicOverlay.addEventListener("click", () => {
    if(comicFinished) return;

    panels[currentPanelIndex].classList.remove("active");
    currentPanelIndex++;

    if(currentPanelIndex < panels.length){
        panels[currentPanelIndex].classList.add("active");
        preloadImage(currentPanelIndex + 1);

        if(currentPanelIndex === panels.length - 1){
            instructionText.textContent = "Click to access the terminal...";
        }
    }
    else{
        comicFinished = true;
        launchMinigame();
    }
});

function launchMinigame(){
    instructionText.style.display = "none";
    minigameOverlay.style.display = "flex";
    comicOverlay.style.opacity = "0";

    setTimeout(() => {
        comicOverlay.style.display = "none";
    }, 800);
}

const symbols = ["🎧", "📻", "🎹", "🎸"];
let cardsArray = [...symbols, ...symbols];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;

cardsArray.sort(() => 0.5 - Math.random());
cardsArray.forEach((symbol) => {
    const card = document.createElement("div");
    card.classList.add("memory_card");
    card.dataset.symbol = symbol;

    card.innerHTML = `<div class="front">?</div>
    <div class="back">${symbol}</div>`;
    card.addEventListener("click", flipCard);
    if(memoryGrid) memoryGrid.appendChild(card);
});

function flipCard(){
    if(lockBoard) return;
    if(this === firstCard) return;

    this.classList.add("flipped");
    if(!firstCard){
        firstCard = this;
        return;
    }
    secondCard = this;
    checkForMatch();
}

function checkForMatch(){
    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

    if(isMatch){
        disableCards();
        matchesFound++;
        if(matchesFound === symbols.length){
            setTimeout(unlockPioneer, 600);
        }
    }
    else{
        unflipCards();
    }
}

function disableCards(){
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    resetBoard();
}

function unflipCards(){
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}

function resetBoard(){
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function unlockPioneer(){
    pioneerApp.style.display = "block";
    setTimeout(() => {
        minigameOverlay.style.opacity = "0";
        pioneerApp.style.filter = "blur(0px)";
        setTimeout(() => {
            minigameOverlay.style.display = "none";
            pioneerApp.style.filter = "none";
        }, 800);
    }, 300);
}

function showCustomAlert(message){
    customAlertText.textContent = message;
    customAlert.classList.remove("hidden");
}

closeAlertBtn.addEventListener("click", () => {
    customAlert.classList.add("hidden");
});

volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value;
});

function loadSong(number){
    if(!songs[number]){
        audio.pause();
        audio.removeAttribute("src");
        songTitle.textContent = "Choose a song";
        progressBar.value = 0;
        currentTime.textContent = "0:00";
        totalTime.textContent = "0:00";
        playButton.textContent = "▶";
        return;
    }
    currentSong = number;
    audio.src = songs[number].file;
    songTitle.textContent = songs[number].title;
    progressBar.value = 0;
    currentTime.textContent = "0:00";
    totalTime.textContent = "0:00";
}

function playSong(){
    if(!audio.src) return;
    audio.play().then(() => {
        playButton.textContent = "⏸";
    }).catch((err) => {
        console.error("Playback failed:", err);
        playButton.textContent = "▶";
    });
}

function pauseSong(){
    audio.pause();
    playButton.textContent = "▶";
}

function togglePlay(){
    if(audio.paused){
        playSong();
    }
    else{
        pauseSong();
    }
}

function nextSong(){
    if(songs.length === 0) return;
    let next = currentSong + 1;
    if(next >= songs.length){
        next = 0;
    }
    loadSong(next);
    playSong();
}

function previousSong(){
    if(songs.length === 0) return;
    let previous = currentSong - 1;
    if(previous < 0){
        previous = songs.length - 1;
    }
    loadSong(previous);
    playSong();
}

function formatTime(seconds){
    if(isNaN(seconds)){
        return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if(secs < 10){
        secs = "0" + secs;
    }
    return minutes + ":" + secs;
}

playButton.addEventListener("click", togglePlay);
nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", previousSong);
loopButton.addEventListener("click", () => {
    isLooping = !isLooping;
    loopButton.classList.toggle("active", isLooping);
});

bannerPlay.addEventListener("click", () => {
    loadSong(0);
    playSong();
});

progressBar.addEventListener("input", () => {
    if(audio.duration){
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    }
});
audio.addEventListener("timeupdate", () => {
    if(audio.duration){
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        currentTime.textContent = formatTime(audio.currentTime);
    }
});
audio.addEventListener("loadedmetadata", () => {
    totalTime.textContent = formatTime(audio.duration);
});
audio.addEventListener("ended", () => {
    if(isLooping){
        audio.currentTime = 0;
        playSong();
    }
    else if(currentSong === songs.length - 1){
        pauseSong();
    }
    else{
        nextSong();
    }
});

function renderSongs(){
    songList.innerHTML = "";
    for(let i = 0; i < songs.length; i++){
        const li = document.createElement("li");

        const titleSpan = document.createElement("span");
        titleSpan.textContent = (i + 1) + ". " + songs[i].title;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.className = "delete_btn";

        li.addEventListener("click", () => {
            loadSong(i);
            playSong();
        });

        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const wasCurrent = (currentSong === i);
            songs.splice(i, 1);

            localforage.setItem("mySavedSongs", songs).then(() => {
                if(wasCurrent){
                    pauseSong();
                    loadSong(0);
                }
                else if(currentSong > i){
                    currentSong--;
                }
                renderSongs();
            });
        });

        li.appendChild(titleSpan);
        li.appendChild(deleteButton);
        songList.appendChild(li);
    }
}

addSongBtn.addEventListener("click", () => {
    const title = newSongTitle.value.trim();
    const file = newSongFile.files[0];

    if(title && file){
        const reader = new FileReader();
        reader.onload = (e) => {
            const baseAudio = e.target.result;
            songs.push({title: title, file: baseAudio});

            localforage.setItem("mySavedSongs", songs).then(() => {
                renderSongs();
                newSongTitle.value = "";
                newSongFile.value = "";
            }).catch((err) => {
                showCustomAlert("Error saving file");
                console.error(err);
                songs.pop();
            });
        };
        reader.readAsDataURL(file);
    }
    else{
        showCustomAlert("Please enter title and select file");
    }
});

localforage.getItem("mySavedSongs").then((savedSongs) => {
    if(!savedSongs || savedSongs.length === 0){
        songs = [
            {title: "YOUSEEBIGGIRL", file: "audio/song1.mp3"},
            {title: "Reflections", file: "audio/song2.mp3"},
            {title: "Imagine", file: "audio/song3.mp3"},
            {title: "Eyes without a face", file: "audio/song4.mp3"},
            {title: "Swimming Pool", file: "audio/song5.mp3"},
        ];
        localforage.setItem("mySavedSongs", songs);
    }
    else{
        songs = (typeof savedSongs === "string") ? JSON.parse(savedSongs) : savedSongs;
    }
    renderSongs();
    loadSong(0);
});