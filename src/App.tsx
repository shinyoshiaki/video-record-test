import * as React from "react";
import Media from "./modules/media";

class App extends React.Component<{}, { videoSrc: any; videoBuffer: any }> {
  media: Media;
  constructor(props: any) {
    super(props);
    this.state = { videoSrc: undefined, videoBuffer: undefined };
    this.media = new Media();
  }

  public async componentDidMount() {
    await this.media.recordInterval(ms => {
      this.setState({ videoSrc: window.URL.createObjectURL(ms) });
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
