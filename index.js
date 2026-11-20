const originalSongs = [
    {title: "Parda", file: "audio/song6.mp3"},
    {title: "YOUSEEBIGGIRL", file: "audio/song1.mp3"},
    {title: "Reflections", file: "audio/song2.mp3"},
    {title: "Imagine", file: "audio/song3.mp3"},
    {title: "Eyes without a face", file: "audio/song4.mp3"},
    {title: "Swimming Pool", file: "audio/song5.mp3"},
];

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

const upNextList = document.querySelector(".queue");
const clearUpNextBtn = document.getElementById("clear_queue_btn");
const restoreBtn = document.getElementById("restore_btn");

const audio = new Audio();
let currentSong = 0;
let isLooping = false;
let songs = [];
let upNext = [];

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

function renderUpNext(){
    upNextList.innerHTML = "";

    if(upNext.length === 0){
        const empty = document.createElement("li");
        empty.textContent = "Empty queue bruh"
        empty.className = "empty";
        upNextList.appendChild(empty);
        return;
    }
    for(let i = 0; i < upNext.length; i++){
        const li = document.createElement("li");
        const titleSpan = document.createElement("span");
        titleSpan.className = "queue_title";
        titleSpan.textContent = (i+1)+ ". " + upNext[i].title;

        const removeButton = document.createElement("button");
        removeButton.textContent = "❌";
        removeButton.className = "delete_btn";
        removeButton.addEventListener("click", () => {
            upNext.splice(i, 1);
            renderUpNext();
        });

        li.appendChild(titleSpan);
        li.appendChild(removeButton);
        upNextList.appendChild(li);
    }
}

function playedQueue(){
    while(upNext.length > 0){
        const song = upNext.shift();
        const index = songs.indexOf(song);
        if(index !== -1){
            renderUpNext();
            loadSong(index);
            playSong();
            return true;
        }
    }
    renderUpNext();
    return false;
}
clearUpNextBtn.addEventListener("click", () => {
    upNext = [];
    renderUpNext();
}); 
function restoreSongs(){
    let added = 0;
    for(let i = 0; i < originalSongs.length; i++){
        let alreadyThere = false;
        for(let j = 0; j < songs.length; j++){
            if(songs[j].file === originalSongs[i].file){
                alreadyThere = true;
            }
        }
        if(!alreadyThere){
            songs.push({title: originalSongs[i].title, file: originalSongs[i].file});
            added++;
        }
    }
    if(added === 0){
        showCustomAlert("Songs are already there");
        return;
    }
    localforage.setItem("mySavedSongs", songs).then(() => {
        renderSongs();
        if(!audio.src){
            loadSong(0);
        }
        showCustomAlert("Got " + added + " songs back");
    });
}
restoreBtn.addEventListener("click", restoreSongs);

function nextSong(){
    if(songs.length === 0) return;
    if(playedQueue()) return;
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
    else if(currentSong === songs.length - 1 && upNext.length === 0){
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

        const buttons = document.createElement("div");
        buttons.className = "song_actions";
        const upNextButton = document.createElement("button")
        upNextButton.textContent = "➕";
        upNextButton.className = "queue_btn";
        upNextButton.title = "Add to queue";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.className = "delete_btn";

        li.addEventListener("click", () => {
            loadSong(i);
            playSong();
        });
        upNextButton.addEventListener("click", (e) => {
            e.stopPropagation();
            upNext.push(songs[i]);
            renderUpNext();
        });
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const wasCurrent = (currentSong === i);
            const removed =  songs.splice(i, 1)[0];

            for(let j = upNext.length - 1; j >= 0; j--){
                if(upNext[j] === removed){
                    upNext.splice(j, 1);
                }
            }
            
            localforage.setItem("mySavedSongs", songs).then(() => {
                if(wasCurrent){
                    pauseSong();
                    loadSong(0);
                }
                else if(currentSong > i){
                    currentSong--;
                }
                renderUpNext();
                renderSongs();
            });
        });
        buttons.appendChild(upNextButton);
        buttons.appendChild(deleteButton);
        li.appendChild(titleSpan);
        li.appendChild(buttons);
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
        songs = [];
        for(let i = 0; i < originalSongs.length; i++){
            songs.push({title: originalSongs[i].title, file: originalSongs[i].file})
        }
        localforage.setItem("mySavedSongs", songs);
    }
    else{
        songs = (typeof savedSongs === "string") ? JSON.parse(savedSongs) : savedSongs;
    }
    renderSongs();
    renderUpNext();
    loadSong(0);
});