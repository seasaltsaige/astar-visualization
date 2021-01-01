export default class Node {
    public walkable: boolean;
    public x: number;
    public y: number;

    public gCost: number = 0;
    public hCost: number = 0;
    public parent: Node | null = null;
    public space: string = "";

    constructor(public _walkable: boolean, public _x: number, public _y: number) {
        this.walkable = _walkable;
        this.x = _x;
        this.y = _y;
    }
    
    
    public get fCost(): number {
        return this.hCost + this.gCost;
    }

    
}