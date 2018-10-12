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

export async function recordInterval(cb: (ms: MediaSource) => void) {
  const stream = await getStream();
  if (!stream) {
    return;
  }
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm; codecs="opus,vp8"'
  });
  const ms = new MediaSource();
  cb(ms);

  await waitEvent(ms, "sourceopen");
  console.log("opend");

  const sb = ms.addSourceBuffer(mediaRecorder.mimeType);
  const chunks: ArrayBuffer[] = [];

  mediaRecorder.ondataavailable = async ({ data: blob }) => {
    const buf = await readAsArrayBuffer(blob);
    chunks.push(buf);
  };

  mediaRecorder.start(100);

  (async function recur(): Promise<any> {
    if (sb.updating) {
      await sleep(10);
      return recur();
    }

    const chunk = chunks.shift();
    if (chunk == null) {
      await sleep(10);
      return recur();
    }

    sb.appendBuffer(chunk);
    console.info("appendBuffer:", chunk.byteLength, "B");

    await waitEvent(sb, "updateend");

    return recur();
  })();

  setTimeout(() => {
    mediaRecorder.stop();
  }, 60 * 1000);
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

function waitEvent<EV extends Event>(
  target: EventTarget,
  event: string,
  error?: string
): Promise<EV> {
  return new Promise<EV>((resolve, reject) => {
    target.addEventListener(event, _resolve);
    if (typeof error === "string") {
      target.addEventListener(error, _reject);
    }
    function _removeListener() {
      target.removeEventListener(event, _resolve);
      if (typeof error === "string") {
        target.removeEventListener(error, _reject);
      }
    }
    function _resolve(ev: EV) {
      _removeListener();
      resolve(ev);
    }
    function _reject(ev: EV) {
      _removeListener();
      reject(ev);
    }
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

export async function recordLoopD(cb: (blob: any) => void, second: number) {
  console.log("start record");
  const stream = await getStream();
  console.log({ stream });
  if (stream) {
    setInterval(async () => {
      const buffer = await record(stream, second);
      cb(buffer);
    }, 1000);
    setTimeout(() => {
      setInterval(async () => {
        const buffer = await record(stream, second);
        cb(buffer);
      }, 1000);
    }, 500);
  }
}

function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> | any {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob);
  return waitEvent(reader, "loadend", "error").then(() => reader.result);
}
