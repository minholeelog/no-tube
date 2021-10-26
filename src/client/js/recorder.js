import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handleStart = () => {
  startBtn.innerText = 'stop';
  startBtn.removeEventListener('click', handleStart);
  startBtn.addEventListener('click', handleStop);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const handleDownload = async () => {
  startBtn.innerText = 'Start Recording';
  startBtn.removeEventListener('click', handleDownload);
  startBtn.addEventListener('click', handleStart);

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  ffmpeg.FS('writeFile', 'recording.webm', await fetchFile(videoFile));
  await ffmpeg.run('-i', 'recording.webm', '-r', '60', 'output.mp4');
  const mp4File = ffmpeg.FS('readFile', 'output.mp4');
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const mp4Url = URL.createObjectURL(mp4Blob);

  const a = document.createElement('a');
  a.href = mp4Url;
  a.download = 'MyRecording.mp4';
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = 'Download Recording';
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 400, height: 250 },
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
