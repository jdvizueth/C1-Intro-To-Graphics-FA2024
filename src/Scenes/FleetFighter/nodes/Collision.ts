import {
    A2DMeshModelPRSA, ANodeModel, AObjectNode,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState, Mat3, Mat4,
    NodeTransform2D, Polygon2D,
    V2, V3,
    Vec2, Vec3,
    VertexArray2D
} from "../../../anigraph";
import {GameConfigs} from "../FleetFighterGameConfigs";
import {GameObject2DModel} from "./GameObject2DModel";

export enum collisionType {
    ship = "ship",
    bullet = "bullet",
    asteroid = "asteroid",
}

const DefaultTextureMatrix = Mat3.Translation2D(V2(0.5,0.5)).times(Mat3.Scale2D(5.2))

@ASerializable("Collision")
export class Collision extends GameObject2DModel {
    static BulletMaterial:AShaderMaterial|undefined=undefined;
    static BulletTexture:ATexture;

    localPositionX:number;
    localPositionY:number;
    radius:number;
    collisionType:collisionType;
    // _currentDestination:Vec2;

    constructor(radius:number, collisionType: collisionType, localPositionX = 0, localPositionY = 0, verts?:Polygon2D, transform?:Mat3, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform, textureMatrix??DefaultTextureMatrix, ...args);
        this.radius = radius;
        this.collisionType = collisionType;
        this.localPositionX = localPositionX;
        this.localPositionY = localPositionY;
        // this._currentDestination = new Vec2();
    }

    // isCollidingWith(parentCoords: Vec3, otherParentCoords: Vec3, otherCircle: Collision): collisionType | null {
    //     const dx = (parentCoords.x + this.localPositionX) - (otherParentCoords.x + otherCircle.localPositionX);
    //     const dy = (parentCoords.y + this.localPositionY) - (otherParentCoords.y + otherCircle.localPositionY);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //
    //     // return distance <= (this.radius + otherCircle.radius);
    //     console.log('passes in isCollidingWith');
    //     if (distance <= (this.radius + otherCircle.radius)) {
    //         return otherCircle.collisionType;
    //     }
    //     return null;
    // }
    isCollidingWith(parentCoords: Vec3, otherParentCoords: Vec3, otherCircle: Collision): collisionType | null {
        const dx = (parentCoords.x + this.localPositionX) - (otherParentCoords.x + otherCircle.localPositionX);
        const dy = (parentCoords.y + this.localPositionY) - (otherParentCoords.y + otherCircle.localPositionY);

        const squaredDistance = dx * dx + dy * dy;
        const squaredRadiusSum = (this.radius + otherCircle.radius) * (this.radius + otherCircle.radius);

        console.log('passes in isCollidingWith');
        if (squaredDistance <= squaredRadiusSum) {
            return otherCircle.collisionType;
        }
        return null;
    }



    timeUpdate(t:number) {
        // super.timeUpdate(t, ...args);
        // let appState = GetAppState();
        // appState.setState("LabCatScale", 5+Math.sin(t));

        // Update the react component that displays this value
        // appState.updateComponents()
        // this.transform.scale = appState.getState("LabCatScale");
        super.timeUpdate(t);
        // if (this.isLaunched) {
        // this.transform.setPosition(this.transform.getPosition().plus(V3(0,this.speed,0)));
        // console.log(this.transform.getPosition())
        // if (this.hasCollided) {
        //     console.log('bullet has collided')
        //     // code that sends the bullet back to user
        //     this.speed = 0;
        //     this.hasCollided = false;
        // }
    }
}