import {Polygon2DModel} from "../../../anigraph/starter/nodes/polygon2D";
import {
    ANodeModel,
    AObjectNode,
    AShaderMaterial, ATexture,
    TransformationInterface,
    Vec2,
    Vec3,
    VertexArray
} from "../../../anigraph";
import {GameObject2DModel} from "./GameObject2DModel";
export enum collisionType {
    ship = "ship",
    bullet = "bullet",
    asteroid = "asteroid",
}

export class CollisionModel extends Polygon2DModel {
    static BulletMaterial:AShaderMaterial|undefined=undefined;
    static BulletTexture:ATexture;
    localPositionX: number;
    localPositionY: number;
    // worldPositionX: number;
    // worldPositionY: number;
    radius: number;
    collisionType: collisionType;

    // constructor(WorldPositionX: number, WorldPositionY: number, radius: number, collisionType: collisionType, localPositionX = 0, localPositionY = 0) {
    constructor(radius: number, collisionType: collisionType, localPositionX = 0, localPositionY = 0) {
        super();
        // this.worldPositionX = WorldPositionX;
        // this.worldPositionY = WorldPositionY;
        this.radius = radius;
        this.localPositionX = localPositionX;
        this.localPositionY = localPositionY;
        this.collisionType = collisionType;
    }

    // isCollidingWithWorld(otherCircle: CollisionModel): boolean {
    //     const dx = this.worldPositionX - otherCircle.worldPositionX;
    //     const dy = this.worldPositionY - otherCircle.worldPositionY;
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //
    //     return distance <= (this.radius + otherCircle.radius);
    // }

    isCollidingWith(parentCoords: Vec3, otherParentCoords: Vec3, otherCircle: CollisionModel): collisionType | null {
        const dx = (parentCoords.x + this.localPositionX) - (otherParentCoords.x + otherCircle.localPositionX);
        const dy = (parentCoords.y + this.localPositionY) - (otherParentCoords.y + otherCircle.localPositionY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // return distance <= (this.radius + otherCircle.radius);
        if (distance <= (this.radius + otherCircle.radius)) {
            return otherCircle.collisionType;
        }
        return null;
    }

    timeUpdate(t: number) {
        super.timeUpdate(t);
    }
}