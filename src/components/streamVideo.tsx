import * as React from "react";
import Media from "../modules/media";
import sha1 from "sha1";
import { Button } from "@material-ui/core";
import Kademlia from "kad-rtc";

interface Iprops {
  kad: Kademlia;
}

class StreamVideo extends React.Component<
  Iprops,
  { videoSrc: any; videoMagnet: string }
> {
  media: Media;
  buffer: Buffer;
  constructor(props: any) {
    super(props);
    this.state = {
      videoSrc: undefined,
      videoMagnet: ""
    };
    this.media = new Media();
    console.log("construct", this.media);

    this.props.kad.callback.onConnect = () => {
      console.log("onconnect");
    };
  }

  async record() {
    console.log("media", this.media);
    await this.media.recordInterval({
      ms: ms => {
        this.setState({ videoSrc: window.URL.createObjectURL(ms) });
      },
      chunk: chunk => {
        if (this.buffer) {
          const key = sha1(this.buffer).toString();
          const next = sha1(chunk).toString();
          const data: IvideoChunk = {
            chunk: this.buffer,
            next
          };
          this.props.kad.store(this.props.kad.nodeId, key, data);
        } else {
          const key = sha1(chunk).toString();
          this.setState({ videoMagnet: key });
        }
        this.buffer = chunk;
      }
    });
  }

  public render() {
    return (
      <div>
        {this.state.videoMagnet}
        <br />
        <video src={this.state.videoSrc} autoPlay={true} />
        <Button onClick={async () => this.record()}>onclick</Button>
      </div>
    );
  }
}

export default StreamVideo;
