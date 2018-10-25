import * as React from "react";
import StreamVideo from "./components/streamVideo";
import WatchVideo from "./components/watchVideo";
import Node from "kad-rtc/lib/node/node";
import NodeList from "./components/nodeList";

class App extends React.Component<{}, { kbuckets: any }> {
  node: Node;
  constructor(props: any) {
    super(props);
    this.node = new Node("localhost", "20000");
    this.state = { kbuckets: undefined };
    this.node.kad.callback.onAddPeer = data => {
      this.setState({ kbuckets: this.node.kad.kbuckets });
    };
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <StreamVideo kad={this.node.kad} />
        <WatchVideo kad={this.node.kad} />
        <NodeList kbuckets={this.state.kbuckets} />
      </div>
    );
  }
}

export default App;
