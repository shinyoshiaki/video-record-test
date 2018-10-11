import * as React from "react";
import { recordLoop } from "./domain/media";

class App extends React.Component<{}, { videoSrc: any; videoBuffer: any }> {
  constructor(props: any) {
    super(props);
    this.state = { videoSrc: undefined, videoBuffer: undefined };
  }

  public componentDidMount() {
    recordLoop(blob => {
      this.setState({ videoSrc: window.URL.createObjectURL(blob) });
    }, 1000);    
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
