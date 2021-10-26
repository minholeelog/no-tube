const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const playBtnIcon = playBtn.querySelector('i');
const muteBtn = document.getElementById('mute');
const muteBtnIcon = muteBtn.querySelector('i');
const volumeRange = document.getElementById('volume');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const fullScreenIcon = fullScreenBtn.querySelector('i');
const videoContainer = document.getElementById('videoContainer');
const videoControls = document.getElementById('videoControls');

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
    showControls();
  }
  playBtnIcon.classList = video.paused ? 'fas fa-play' : 'fas fa-pause';
};

const handleVideoClick = () => {
  handlePlayClick();
};

const handlePause = () => {
  playBtn.innerText = 'Pause';
};

const handlePlay = () => {
  playBtn.innerText = 'Play';
};

const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? 'fas fa-volume-mute'
    : 'fas fa-volume-up';
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (e) => {
  const {
    target: { value },
  } = e;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = 'Mute';
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (e) => {
  const {
    target: { value },
  } = e;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullScreen = document.fullscreenElement;
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = 'fas fa-expand';
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = 'fas fa-compress';
  }
};

const hideControls = () => videoControls.classList.remove('showing');
const showControls = () => videoControls.classList.add('showing');

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  showControls();
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleKeyPress = (e) => {
  const { code } = e;
  if (code === 'Space') {
    handlePlayClick();
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: 'post',
  });
};

const handleLoadedData = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

playBtn.addEventListener('click', handlePlayClick);
mute.addEventListener('click', handleMuteClick);
volumeRange.addEventListener('input', handleVolumeChange);
video.addEventListener('loadeddata', handleLoadedData);
video.addEventListener('ended', handleEnded);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('click', handleVideoClick);
videoContainer.addEventListener('mousemove', handleMouseMove);
videoContainer.addEventListener('mouseleave', handleMouseLeave);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullScreen);
window.addEventListener('keydown', handleKeyPress);
