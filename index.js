const songs = [
    {title: "YOUSEEBIGGIRL", file: "audio/song1.mp3"},
    {title: "Reflections", file: "audio/song2.mp3"},
    {title: "Imagine", file: "audio/song3.mp3"},
    {title: "Eyes without a face", file: "audio/song4.mp3"},
    {title: "Swimming Pool", file: "audio/song5.mp3"}
];

const songTitle = document.querySelector(".song_title");
const songList = document.querySelector(".songs");
const playButton = document.querySelector(".play_button");
const nextButton = document.querySelector(".next_button");
const prevButton = document.querySelector(".previous_button");
const bannerPlay = document.querySelector(".body_button");
const progressBar = document.querySelector(".audio_prog_bar");
const currentTime = document.querySelector(".current_time");
const totalTime = document.querySelector(".total_time");

const audio = new Audio();
let currentSong = 0

function loadSong(number){
    currentSong = number;
    audio.src = songs[number].file;
    songTitle.textContent = songs[number].title;
    progressBar.value = 0;
    currentTime.textContent = "0:00"
    totalTime.textContent = "0:00"
}
function playSong(){
    audio.play();
    playButton.textContent = "⏸";
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
    let next = currentSong + 1;
    if(next == songs.length){
        next = 0;
    }
    loadSong(next);
    playSong();
}
function previousSong(){
    let previous = currentSong - 1;
    if(previous < 0){
        previous = songs.length -1;
    }
    loadSong(previous);
    playSong();
}
function formatTime(seconds){
    if(isNaN(seconds)){
        return "0:00";
    }
    const minutes = Math.floor(seconds/60);
    let secs = Math.floor(seconds % 60);
    if(secs < 10){
        secs = "0" + secs;
    }
    return minutes + ":" + secs;
}

playButton.addEventListener("click", togglePlay);
nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", previousSong);
bannerPlay.addEventListener("click", function(){
    loadSong(0);
    playSong();
});

progressBar.addEventListener("input", function(){
    if(audio.duration){
        audio.currentTime = (progressBar.value/100)*audio.duration;
    }
});
audio.addEventListener("timeupdate", function(){
    if(audio.duration){
        progressBar.value = (audio.currentTime/ audio.duration)*100;
        currentTime.textContent = formatTime(audio.currentTime);
    }
});
audio.addEventListener("loadedmetadata", function(){
    totalTime.textContent = formatTime(audio.duration);
});
audio.addEventListener("ended", function(){
    if(currentSong === songs.length -1){
        pauseSong();
    }
    else{
        nextSong();
    }
})

for(let i = 0; i < songs.length; i++){
    const li = document.createElement("li");
    li.textContent = (i+1) + ". " + songs[i].title;
    li.addEventListener("click", function(){
        loadSong(i);
        playSong();
    });
    songList.appendChild(li);
}
loadSong(0);