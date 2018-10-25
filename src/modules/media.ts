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

export default class Media {
  chunks: ArrayBuffer[];
  sourceBuffer: SourceBuffer;

  recur: () => Promise<any> = async () => {
    if (this.sourceBuffer.updating) {
      await sleep(10);
      return this.recur();
    }

    const chunk = this.chunks.shift();
    if (chunk == null) {
      await sleep(10);
      return this.recur();
    }

    this.sourceBuffer.appendBuffer(chunk);
    console.info("appendBuffer:", chunk.byteLength, "B");

    await waitEvent(this.sourceBuffer, "updateend");

    return this.recur();
  };

  async recordInterval(cb: {
    ms?: (ms: MediaSource) => void;
    chunk?: (chunk: Buffer) => void;
  }) {
    const stream = await getStream();
    if (!stream) {
      return;
    }
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs="opus,vp8"'
    });
    const ms = new MediaSource();
    if (cb.ms) cb.ms(ms);

    await waitEvent(ms, "sourceopen");

    this.sourceBuffer = ms.addSourceBuffer(mediaRecorder.mimeType);
    this.chunks = [];

    mediaRecorder.ondataavailable = async ({ data: blob }) => {
      const buf = await readAsArrayBuffer(blob);
      this.chunks.push(buf);
      if (cb.chunk) cb.chunk(Buffer.from(buf));
    };

    mediaRecorder.start(1000);

    this.recur();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 60 * 1000);
  }
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

function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> | any {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob);
  return waitEvent(reader, "loadend", "error").then(() => reader.result);
}
