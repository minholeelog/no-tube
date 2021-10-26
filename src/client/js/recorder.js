import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const actionBtn = document.getElementById('actionBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const files = {
  input: 'recording.webm',
  output: 'output.mp4',
  thumb: 'thumbnail.jpg',
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleStart = () => {
  actionBtn.innerText = '녹화 종료';
  actionBtn.removeEventListener('click', handleStart);
  actionBtn.addEventListener('click', handleStop);

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
  actionBtn.innerText = '동영상 형식 변환 중...';
  actionBtn.removeEventListener('click', handleDownload);
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  // Transcode video file
  ffmpeg.FS('writeFile', files.input, await fetchFile(videoFile));
  await ffmpeg.run('-i', files.input, '-r', '60', files.output);
  const mp4File = ffmpeg.FS('readFile', files.output);
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const mp4Url = URL.createObjectURL(mp4Blob);

  downloadFile(mp4Url, 'MyRecording.mp4');

  // Create thumbnail
  await ffmpeg.run(
    '-i',
    files.input,
    '-ss',
    '00:00:01',
    '-frames:v',
    '1',
    files.thumb
  );
  const thumbFile = ffmpeg.FS('readFile', files.thumb);
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(thumbUrl, 'MyThumbnail.jpg');

  ffmpeg.FS('unlink', files.input);
  ffmpeg.FS('unlink', files.output);
  ffmpeg.FS('unlink', files.thumb);

  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = '녹화 시작';
  actionBtn.addEventListener('click', handleStart);
};

const handleStop = () => {
  actionBtn.innerText = '동영상 내려받기';
  actionBtn.removeEventListener('click', handleStop);
  actionBtn.addEventListener('click', handleDownload);
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

actionBtn.addEventListener('click', handleStart);
