var speed = 1.8;
var speedNum = document.getElementById('speed-num');
var listAudio = 　[];

var indexAudio = 0;


var currentAudio, interval1;
var playListItems;

var timer = document.getElementsByClassName('timer')[0]

var barProgress = document.getElementById("myBar");


var width = 0;
var progressbar;
const player_elt = document.querySelector('.player-ctn');
const loading = document.querySelector('.loading');

function getNum(name){

}
async function initalizePlay() {

    const book = getUrlVars()['book'];
    listAudio = await loadList(decodeURI(book));
    listAudio.sort((a,b)=>a.id-b.id);
    // after loaded list
    for (var i = 0; i < listAudio.length; i++) {
        createTrackItem(i, listAudio[i].name, listAudio[i].duration);
    }

    playListItems = document.querySelectorAll(".playlist-track-ctn");
    
    for (let i = 0; i < playListItems.length; i++) {
        playListItems[i].addEventListener("click", getClickedElement.bind(this));
    }

    document.querySelector('#source-audio').src = listAudio[indexAudio].file
    document.querySelector('.title').innerHTML = listAudio[indexAudio].name
    
    
    currentAudio = document.getElementById("myAudio");
    
    currentAudio.load()
    currentAudio.playbackRate = speed;
    

    currentAudio.onloadedmetadata = function () {
        document.getElementsByClassName('duration')[0].innerHTML = this.getMinutes(this.currentAudio.duration)
    }.bind(this);

    progressbar = document.querySelector('#myProgress')
    progressbar.addEventListener("click", seek.bind(this));

    loading.style.display = 'none';
    
    player_elt.style.display = '';
      
}
// 
function speedUp() {
    speed += .1;
    currentAudio.playbackRate = speed.toFixed(1);
    speedNum.textContent = speed.toFixed(1);

}


function speedDown() {
    speed -= .1;
    currentAudio.playbackRate = speed.toFixed(1);
    speedNum.textContent = speed.toFixed(1);
}


function createTrackItem(index, name, duration) {
    var trackItem = document.createElement('div');
    trackItem.setAttribute("class", "playlist-track-ctn");
    trackItem.setAttribute("id", "ptc-" + index);
    trackItem.setAttribute("data-index", index);
    document.querySelector(".playlist-ctn").appendChild(trackItem);

    var playBtnItem = document.createElement('div');
    playBtnItem.setAttribute("class", "playlist-btn-play");
    playBtnItem.setAttribute("id", "pbp-" + index);
    document.querySelector("#ptc-" + index).appendChild(playBtnItem);

    var btnImg = document.createElement('i');
    btnImg.setAttribute("class", "fas fa-play");
    btnImg.setAttribute("height", "40");
    btnImg.setAttribute("width", "40");
    btnImg.setAttribute("id", "p-img-" + index);
    document.querySelector("#pbp-" + index).appendChild(btnImg);

    var trackInfoItem = document.createElement('div');
    trackInfoItem.setAttribute("class", "playlist-info-track");
    trackInfoItem.innerHTML = name
    document.querySelector("#ptc-" + index).appendChild(trackInfoItem);

    var trackDurationItem = document.createElement('div');
    trackDurationItem.setAttribute("class", "playlist-duration");
    trackDurationItem.innerHTML = duration
    document.querySelector("#ptc-" + index).appendChild(trackDurationItem);
}

//var listAudio = await fetch('http://localhost:3000/bookplayerlist').then(resp=>resp.json());


// var listAudio = [
//   {
//     name:"Artist 1 - audio 1",
//     file:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
//     duration:"08:47"
//   },
//   {
//     name:"Artist 2 - audio 2",
//     file:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
//     duration:"05:53"
//   },
//   {
//     name:"Artist 3 - audio 3",
//     file:"https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_1MG.mp3",
//     duration:"00:27"
//   }
// ]




async function loadList(book) {
    const url = `http://localhost:3000/bookplayerlist?book=${book}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    return data;
}

function loadNewTrack(index) {
    var player = document.querySelector('#source-audio')
    player.src = listAudio[index].file
    document.querySelector('.title').innerHTML = listAudio[index].name
    this.currentAudio = document.getElementById("myAudio");
    this.currentAudio.load()
    this.toggleAudio()
    this.currentAudio.playbackRate = speed;
    this.updateStylePlaylist(this.indexAudio, index)
    this.indexAudio = index;
}

function getClickedElement(event) {
    for (let i = 0; i < playListItems.length; i++) {
        if (playListItems[i] == event.target) {
            var clickedIndex = event.target.getAttribute("data-index")
            if (clickedIndex == this.indexAudio) { // alert('Same audio');
                this.toggleAudio()
                this.currentAudio.playbackRate = speed;
            } else {
                loadNewTrack(clickedIndex);
            }
        }
    }
}




function toggleAudio() {

    if (this.currentAudio.paused) {
        document.querySelector('#icon-play').style.display = 'none';
        document.querySelector('#icon-pause').style.display = 'block';
        document.querySelector('#ptc-' + this.indexAudio).classList.add("active-track");
        this.playToPause(this.indexAudio)
        this.currentAudio.play();
        this.currentAudio.playbackRate = speed;
    } else {
        document.querySelector('#icon-play').style.display = 'block';
        document.querySelector('#icon-pause').style.display = 'none';
        this.pauseToPlay(this.indexAudio)
        this.currentAudio.pause();
        this.currentAudio.playbackRate = speed;
    }
}

function pauseAudio() {
    this.currentAudio.pause();
    clearInterval(interval1);
}


function onTimeUpdate() {
    var t = this.currentAudio.currentTime
    timer.innerHTML = this.getMinutes(t);
    this.setBarProgress();
    if (this.currentAudio.ended) {
        document.querySelector('#icon-play').style.display = 'block';
        document.querySelector('#icon-pause').style.display = 'none';
        this.pauseToPlay(this.indexAudio)
        if (this.indexAudio < listAudio.length - 1) {
            var index = parseInt(this.indexAudio) + 1
            this.loadNewTrack(index)
        }
    }
}


function setBarProgress() {
    var progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
    document.getElementById("myBar").style.width = progress + "%";
}


function getMinutes(t) {
    var min = parseInt(parseInt(t) / 60);
    var sec = parseInt(t % 60);
    if (sec < 10) {
        sec = "0" + sec
    }
    if (min < 10) {
        min = "0" + min
    }
    return min + ":" + sec
}



function seek(event) {
    var percent = event.offsetX / progressbar.offsetWidth;
    this.currentAudio.currentTime = percent * this.currentAudio.duration;
    barProgress.style.width = percent * 100 + "%";
}

function forward() {
    this.currentAudio.currentTime = this.currentAudio.currentTime + 5
    this.setBarProgress();
}

function rewind() {
    this.currentAudio.currentTime = this.currentAudio.currentTime - 5
    this.setBarProgress();
}


function next() {
    if (this.indexAudio < listAudio.length - 1) {
        var oldIndex = this.indexAudio
        this.indexAudio++;
        updateStylePlaylist(oldIndex, this.indexAudio)
        this.loadNewTrack(this.indexAudio);
    }
}

function previous() {
    if (this.indexAudio > 0) {
        var oldIndex = this.indexAudio
        this.indexAudio--;
        updateStylePlaylist(oldIndex, this.indexAudio)
        this.loadNewTrack(this.indexAudio);
    }
}

function updateStylePlaylist(oldIndex, newIndex) {
    document.querySelector('#ptc-' + oldIndex).classList.remove("active-track");
    this.pauseToPlay(oldIndex);
    document.querySelector('#ptc-' + newIndex).classList.add("active-track");
    this.playToPause(newIndex)
}

function playToPause(index) {
    var ele = document.querySelector('#p-img-' + index)
    ele.classList.remove("fa-play");
    ele.classList.add("fa-pause");
}

function pauseToPlay(index) {
    var ele = document.querySelector('#p-img-' + index)
    ele.classList.remove("fa-pause");
    ele.classList.add("fa-play");
}


function toggleMute() {
    var btnMute = document.querySelector('#toggleMute');
    var volUp = document.querySelector('#icon-vol-up');
    var volMute = document.querySelector('#icon-vol-mute');
    if (this.currentAudio.muted == false) {
        this.currentAudio.muted = true
        volUp.style.display = "none"
        volMute.style.display = "block"
    } else {
        this.currentAudio.muted = false
        volMute.style.display = "none"
        volUp.style.display = "block"
    }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

initalizePlay();