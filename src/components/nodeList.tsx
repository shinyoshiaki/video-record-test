import * as React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-ui/core";

interface Iprops {
  kbuckets?: any[];
}

export default class NodeList extends React.Component<Iprops, {}> {
  public render() {
    const { kbuckets } = this.props;
    const arr = {};
    console.log({ kbuckets });
    if (kbuckets) {
      kbuckets.forEach((kbucket, i) => {
        if (kbucket.length > 0) {
          let line = "";
          kbucket.forEach((node: any) => {
            line += node.nodeId + " , ";
          });
          arr[i] = line;
        }
      });
    }
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>index</TableCell>
              <TableCell>nodes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(arr).map((key, i) => {
              const kbucket = arr[key];
              return (
                <TableRow key={i}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{kbucket}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export function createNodeList(kbuckets: any) {
  return <NodeList kbuckets={kbuckets} />;
}
