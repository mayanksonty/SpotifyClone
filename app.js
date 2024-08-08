let currentSongs = new Audio();
let songs;
let currFolder;

function decimalToMinutesSeconds(decimal) {
    // Convert the decimal to an integer number of seconds
    const totalSeconds = Math.floor(decimal);

    // Calculate minutes and seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Format minutes and seconds as two-digit strings
    const minutesFormatted = String(minutes).padStart(2, '0');
    const secondsFormatted = String(seconds).padStart(2, '0');

    // Return the formatted time string
    return `${minutesFormatted}:${secondsFormatted}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/Exercise/SpotifyClone/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1])
        }
    }

    //creating songs list in your lib.
    let songsUL = document.querySelector(".song-lists").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li>
                            <img class="invert" src="static/music-solid.svg" alt="">
                            <div class="songs-info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Mayank Verma</div>
                            </div>
                            <div class="playnow">
                                <h4>Play Now</h4>
                                <span><img class="invert" src="static/circle-play-solid.svg" alt=""></span>
                            </div>
                        </li>`;
    }



    // Attach the event listner to each songs.
    Array.from(document.querySelector(".song-lists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".songs-info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".songs-info").firstElementChild.innerHTML)
        })
    })

}

function playMusic(track, pause = false) {
    currentSongs.src = `/songs/${currFolder}/` + track
    if (!pause) {
        currentSongs.play();
        play.src = "static/pause-solid.svg"
    }
    document.querySelector(".playbar-songs-info").innerHTML = decodeURI(track)
    document.querySelector(".playbar-songs-time").innerHTML = "00:00/00:00"
}

// Display All cards dynamically
async function displayAllCards() {
    let a = await fetch(`http://127.0.0.1:5500/Exercise/SpotifyClone/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    console.log(response)
    let anchors = div.getElementsByTagName("a")
    console.log(anchors)
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    // We are not using forEach and async as it will run in background and the event listner will not word for the cards.
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").splice(-1)[0]

            // get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/Exercise/SpotifyClone/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="cards m-1">
            <div class="play">
                <img src="static/play-solid.svg" alt="">
            </div>
            <img src="${response.imgSrc}" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Add event listner to card for displying playists
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            await getSongs(item.currentTarget.dataset.folder) // currentTarget will be used if we want the target which have event listner attached on the other hand target will give me the element which is clicked.
            playMusic()
            console.log(item.currentTarget.dataset.folder, "Mayank")
            console.log(item.currentTarget)
        })
    })
}

async function main() {

    await getSongs("Sad")
    console.log(songs)
    playMusic(songs[0], true)

    displayAllCards()


    // Attach the event listner to play, next and back buttons
    play.addEventListener("click", () => {
        if (currentSongs.paused) {
            currentSongs.play();
            play.src = "static/pause-solid.svg"
        }
        else {
            currentSongs.pause();
            play.src = "static/circle-play-solid.svg"
        }
    })

    // Listen for time update event
    currentSongs.addEventListener("timeupdate", () => {
        document.querySelector(".playbar-songs-time").innerHTML = `${decimalToMinutesSeconds(currentSongs.currentTime)}/${decimalToMinutesSeconds(currentSongs.duration)}`
        document.querySelector(".seekbar-circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%"
    })

    // Adding even listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect())
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".seekbar-circle").style.left = percent + "%"
        currentSongs.currentTime = ((currentSongs.duration) * percent) / 100
    })

    // Hamburger Menu Functionality
    let hamburgerNav = document.querySelector(".nav")
    hamburgerNav.addEventListener("click", e => {
        let leftSection = document.querySelector(".left")
        leftSection.classList.toggle("left-hamburger-menu")
        let rightSection = document.querySelector(".right")
        rightSection.classList.toggle("right-hamburger-menu-class")
    })

    let crossBtn = document.querySelector(".cross-btn")
    crossBtn.addEventListener("click", e => {
        let leftSection = document.querySelector(".left")
        leftSection.classList.toggle("left-hamburger-menu")
        let rightSection = document.querySelector(".right")
        rightSection.classList.toggle("right-hamburger-menu-class")
    })

    // Adding event listner on previous and next btn
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSongs.src.split(`/songs/${currFolder}/`)[1])
        console.log(currentSongs.src.split("/songs/")[1])
        console.log(index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSongs.src.split(`/songs/${currFolder}/`)[1])
        console.log(index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add event listner to volume button
    volRange.addEventListener("change", (e) => {
        currentSongs.volume = parseInt(e.target.value) / 100
    })

    // Add event listner to volumle to mute it
    volume.addEventListener("click",e=>{
       if(e.target.src.includes("volume-high-solid.svg")){
        e.target.src = e.target.src.replace("static/volume-high-solid.svg","static/volume-xmark-solid.svg")
        currentSongs.volume = 0
        volRange.value = 0
       }
       else{
        e.target.src = e.target.src.replace("static/volume-xmark-solid.svg","static/volume-high-solid.svg")
        currentSongs.volume = 1
        volRange.value = 100
       }
    })
}

main()