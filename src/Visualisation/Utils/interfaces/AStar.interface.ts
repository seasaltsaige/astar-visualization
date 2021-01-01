export default interface IAstar {

    boardSize: { x: number, y: number };
    neighborSpeed: number;
    searchedNodeSpeed: number;
    retraceSpeed: number;

    walkable?: string;
    wall?: string;
    createMaze?: boolean;
    searchingNode?: string;
    neighbors?: string;
    pathBack?: string;
    startPos?: { x: number; y: number };
    endPos?: { x: number; y: number };
}