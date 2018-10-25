import * as React from "react";
import { TextField, Button } from "@material-ui/core";
import Kademlia from "kad-rtc";
import Media from "src/modules/media";

interface Iprops {
  kad: Kademlia;
}

let magnetUrl: string | undefined;

class WatchVideo extends React.Component<Iprops, { videoSrc: any }> {
  media: Media;
  constructor(props: Iprops) {
    super(props);

    this.state = {
      videoSrc: undefined
    };
    this.media = new Media();
  }

  async watch() {
    if (magnetUrl) {
      console.log({ magnetUrl });
      await this.media.getVideo(magnetUrl, this.props.kad, ms => {
        console.log("watch start", { ms });
        this.setState({ videoSrc: window.URL.createObjectURL(ms) });
      });
    }
  }

  public render() {
    return (
      <div className="App">
        <TextField
          label="magnet"
          onChange={e => {
            magnetUrl = e.target.value;
          }}
        />
        <Button
          onClick={async () => {
            this.watch();
          }}
        >
          set
        </Button>
        <br />
        <video src={this.state.videoSrc} autoPlay={true} />
      </div>
    );
  }
}

export default WatchVideo;
