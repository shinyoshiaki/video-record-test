import Kademlia from "kad-rtc";
import toArrayBuffer from 'to-array-buffer'
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

// function toArrayBuffer(buffer: Buffer) {
//   const ab = new ArrayBuffer(buffer.length);
//   const view = new Uint8Array(ab);
//   for (let i = 0; i < buffer.length; ++i) {
//     view[i] = buffer[i];
//   }
//   return ab;
// }

export default class Media {
  chunks: ArrayBuffer[] = [];

  async update(sb: SourceBuffer) {
    for (;;) {
      if (sb.updating || !this.chunks || this.chunks.length === 0) {
        await sleep(10);
        continue;
      }
      console.log("chunks", this.chunks);
      const chunk = this.chunks.shift();
      if (!chunk) {
        await sleep(10);
        continue;
      }
      sb.appendBuffer(chunk);
      console.info("appendBuffer:", chunk.byteLength, "B");
      await waitEvent(sb, "updateend");
    }
  }

  async recordInterval(cb: {
    ms?: (ms: MediaSource) => void;
    chunk?: (chunk: Buffer) => void;
  }) {
    const stream = await getStream();
    if (!stream) {
      return;
    }

    const mimeType = `video/webm; codecs="opus,vp8"`;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType
    });
    const ms = new MediaSource();
    if (cb.ms) cb.ms(ms);

    await waitEvent(ms, "sourceopen");
    console.log("opend");

    const sb = ms.addSourceBuffer(mimeType);

    mediaRecorder.ondataavailable = async ({ data: blob }) => {
      const buf = await readAsArrayBuffer(blob);
      this.chunks.push(buf);
      if (cb.chunk) cb.chunk(Buffer.from(buf));
    };

    mediaRecorder.start(1000);

    this.update(sb);

    setTimeout(() => {
      mediaRecorder.stop();
    }, 60 * 1000 * 10);
  }

  async getVideo(
    magnetUrl: string,
    kad: Kademlia,
    cb: (ms: MediaSource) => void
  ) {
    const mimeType = `video/webm; codecs="opus,vp8"`;
    const ms = new MediaSource();
    cb(ms);
    await waitEvent(ms, "sourceopen");
    const sb = ms.addSourceBuffer(mimeType);
    this.update(sb);

    let url = magnetUrl;
    for (;;) {
      await new Promise(r => setTimeout(r, 1000));
      const value: IvideoChunk = await kad.findValue(url);
      url = value.next;
      console.log(value);
      const ab = toArrayBuffer(value.chunk);
      console.log({ ab });
      this.chunks.push(ab);
    }
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
