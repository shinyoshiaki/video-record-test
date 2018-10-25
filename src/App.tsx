import * as React from "react";
import Media from "./modules/media";
import Node from "kad-rtc/lib/node/node";
import sha1 from "sha1";

class App extends React.Component<{}, { videoSrc: any; videoBuffer: any }> {
  media: Media;
  node: Node;
  buffer: Buffer;
  constructor(props: any) {
    super(props);
    this.state = { videoSrc: undefined, videoBuffer: undefined };
    this.media = new Media();
    this.node = new Node("localhost", "20000");

    this.node.kad.callback.onConnect = () => {
      console.log("onconnect");
      this.record();
    };
  }
  async record() {
    await this.media.recordInterval({
      ms: ms => {
        this.setState({ videoSrc: window.URL.createObjectURL(ms) });
      },
      chunk: chunk => {
        if (this.buffer) {
          // this.node.kad.store(
          //   this.node.kad.nodeId,
          //   sha1(chunk).toString(),
          //   this.buffer
          // );
        }
        this.buffer = chunk;
      }
    });
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <video src={this.state.videoSrc} autoPlay={true} />
      </div>
    );
  }
}

export default App;
