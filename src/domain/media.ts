export async function getStream() {
  const stream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
    })
    .catch(console.log);
  if (stream) {
    return stream;
  }
}

export async function record(stream: MediaStream, second: number) {
  return new Promise((resolve: (v: Blob) => void) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    mediaRecorder.ondataavailable = ev => {
      if (ev.data.size > 0) {
        resolve(ev.data);
      }
    };
    setTimeout(() => {
      mediaRecorder.stop();
    }, second);
  });
}

export async function recordLoop(cb: (blob: any) => void, second: number) {
  console.log("start record");
  const stream = await getStream();
  console.log({ stream });
  if (stream) {
    setInterval(async () => {
      const buffer = await record(stream, second);
      cb(buffer);
    }, second - 100);
  }
}
