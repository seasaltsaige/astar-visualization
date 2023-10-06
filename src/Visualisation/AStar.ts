// import { stdin } from "process";
import IAstar from "./Utils/interfaces/AStar.interface";
import Node from "./Utils/Node";
// import rs from "readline-sync"

export default class AStar {

  private _boardSize: { x: number, y: number } = { x: 0, y: 0 };
  private _startPos: { x: number, y: number } = { x: 0, y: 0 };
  private _endPos: { x: number, y: number } = { x: 0, y: 0 };

  private _neighborSpeed: number = 0;
  private _searchedNodeSpeed: number = 0;
  private _retraceSpeed: number = 0;

  private _walkable: string = "⚫";
  private _wall: string = "🟫";

  private _searchingNode: string = "🟨";
  private _neighbors: string = "🟦";
  private _pathBack: string = "⚪";
  private _startPosString: string = "🔴";
  private _endPosString: string = "🟢";

  private _createMaze: boolean = true;

  private _maze: string[][] = [];

  constructor(astar: IAstar) {
    this._boardSize = astar.boardSize;
    this._neighborSpeed = astar.neighborSpeed;
    this._searchedNodeSpeed = astar.searchedNodeSpeed;
    this._retraceSpeed = astar.retraceSpeed;

    if (astar.walkable) this._walkable = astar.walkable;
    if (astar.wall) this._wall = astar.wall;
    if (astar.startPos) this._startPos = astar.startPos;

    if (astar.endPos) this._endPos = astar.endPos;
    else this._endPos = { x: this._boardSize.x, y: this._boardSize.y };
  }

  public Start() {
    this.CreateBoard();

    this.findPath([
      this._startPos.x,
      this._startPos.y,
    ],
      [
        this._endPos.x,
        this._endPos.y,
      ])

    this.showMaze();
  }

  private showMaze() {
    console.clear();
    console.log(this._maze.map(part => part.join("")).join("\n"));
    console.log(`${this._walkable} = Walkable Area   ${this._wall} = Unwalkable Area   ${this._searchingNode} = Searching Node   ${this._neighbors} = Neighbor to SN\n${this._startPosString} = Start Pos   ${this._endPosString} = End Pos   ${this._pathBack} = Retraced Path`);
  }

  private CreateBoard() {
    for (let i = 0; i < this._boardSize.y; i++) {
      const tempArr: string[] = [];
      for (let j = 0; j < this._boardSize.x; j++) {
        const math = Math.floor(Math.random() * 10) + 1;

        if (i === this._startPos.y && j === this._startPos.x) tempArr.push(this._startPosString);
        else if (i === (this._endPos.y) && j === (this._endPos.x)) tempArr.push(this._endPosString);
        else if (math < 4) tempArr.push(this._wall);
        else tempArr.push(this._walkable);
      }
      this._maze.push(tempArr);
    }
  }

  private sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }


  // -----------------------------PATHFINDING--------------------------


  private async findPath(startPos: [number, number], targetPos: [number, number]) {
    const startNode = this.nodeFromBoard(...startPos);
    let targetNode = this.nodeFromBoard(...targetPos);

    let openSet: Node[] = [];
    const closedSet: Node[] = [];

    openSet.push(startNode);

    while (openSet.length > 0) {

      let currentNode = openSet[0];

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost < currentNode.fCost || (openSet[i].fCost === currentNode.fCost && openSet[i].hCost < currentNode.hCost)) {
          currentNode = openSet[i];
        }
      }

      const removed = openSet.splice(openSet.findIndex(ob => ob.x === currentNode.x && ob.y === currentNode.y), 1);
      currentNode = removed[0];
      closedSet.push(removed[0]);

      this._maze[currentNode.y][currentNode.x] = this._searchingNode;
      this.showMaze();
      await this.sleep(this._searchedNodeSpeed);

      if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
        const path = this.retracePath(startNode, currentNode);
        for (const node of path) {
          if (node.x === this._startPos.x && node.y === this._startPos.y) this._maze[node.y][node.x] = this._startPosString;
          else if (node.x === this._boardSize.x - 1 && node.y === this._boardSize.y - 1) this._maze[node.y][node.x] = this._endPosString;
          else this._maze[node.y][node.x] = this._pathBack;
          this.showMaze();
          await this.sleep(this._retraceSpeed);
        }
        this.showMaze();
        return path;
      }

      for (const neighbor of this.getNeighbors(currentNode)) {
        if (!neighbor.walkable || closedSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) continue;

        const costToNeighbor = currentNode.gCost + this.getDistance(currentNode, neighbor);

        if (costToNeighbor < neighbor.gCost || !openSet.find(ob => ob.x === neighbor.x && ob.y === neighbor.y)) {

          neighbor.gCost = costToNeighbor;
          neighbor.hCost = this.getDistance(neighbor, targetNode);
          neighbor.parent = currentNode;

          this._maze[neighbor.y][neighbor.x] = this._neighbors;
          this.showMaze();
          await this.sleep(this._neighborSpeed);

          if (!openSet.find(ob => ob.x === neighbor.x && ob.y === neighbor.y)) {
            openSet.push(neighbor);
          }

          openSet = openSet.sort(
            (a, b) => b.hCost - a.hCost
          )

        }
      }
    }
  }

  private retracePath(startNode: Node, endNode: Node) {
    const path: Node[] = [];
    let currentNode = endNode;
    while (currentNode.x !== startNode.x || currentNode.y !== startNode.y) {
      path.push(currentNode);
      currentNode = <Node>currentNode.parent;
    }
    path.reverse();
    return path;
  }

  private getDistance(nodeA: Node, nodeB: Node): number {
    const distX = Math.abs(nodeA.x - nodeB.x);
    const distY = Math.abs(nodeA.y - nodeB.y);
    return (10 * distY) + (10 * (distX));
  }

  private getNeighbors(startNode: Node): Node[] {
    const neighbors: Node[] = [];
    const y = startNode.y;
    const x = startNode.x;

    if (this._maze[y - 1] && this._maze[y - 1][x]) neighbors.push(this.nodeFromBoard(x, y - 1));
    if (this._maze[y + 1] && this._maze[y + 1][x]) neighbors.push(this.nodeFromBoard(x, y + 1));
    if (this._maze[y] && this._maze[y][x - 1]) neighbors.push(this.nodeFromBoard(x - 1, y));
    if (this._maze[y] && this._maze[y][x + 1]) neighbors.push(this.nodeFromBoard(x + 1, y));

    return neighbors;
  }

  private nodeFromBoard(x: number, y: number): Node {

    let percentX: number = (x / (this._maze[0].length - 1));
    let percentY: number = (y / (this._maze.length - 1));

    const gridSizeX = Math.round(this._maze[0].length / 1);
    const gridSizeY = Math.round(this._maze.length / 1);

    const xNum: number = Math.round((gridSizeX - 1) * percentX);
    const yNum: number = Math.round((gridSizeY - 1) * percentY);

    const node = new Node(
      this._maze[yNum][xNum] !== this._wall,
      xNum,
      yNum,
    );

    return node;
  }

}