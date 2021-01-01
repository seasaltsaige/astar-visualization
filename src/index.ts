import aStar from "./Visualisation/AStar";

const AStar = new aStar({
    boardSize: { x: 50, y: 50 },
    neighborSpeed: 0,
    retraceSpeed: 0,
    searchedNodeSpeed: 0,
    startPos: {
        x: 11,
        y: 3,
    },
    endPos: {
        x: 47,
        y: 32
    }
});

AStar.Start();