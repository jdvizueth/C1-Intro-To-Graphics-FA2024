import {
    A2DMeshModelPRSA, AMaterialManager, ANodeModel, ANodeModel2D, AObjectNode, ASceneModel,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState, Mat3, Mat4,
    NodeTransform2D, Polygon2D,
    V2, V3,
    Vec2, Vec3,
    VertexArray2D
} from "../../../anigraph";
import {GameConfigs} from "../FleetFighterGameConfigs";
import {GameObject2DModel} from "./GameObject2DModel";
import {TexturedPolygon2DModel} from "../../../anigraph/starter/nodes/textured";

export enum collisionType {
    ship = "ship",
    bullet = "bullet",
    asteroid = "asteroid",
}

const DefaultTextureMatrix = Mat3.Translation2D(V2(0.5,0.5)).times(Mat3.Scale2D(5.2))

@ASerializable("Collision")
export class Collision extends TexturedPolygon2DModel {
    static BulletMaterial:AShaderMaterial|undefined=undefined;
    static BulletTexture:ATexture;

    localPositionX:number;
    localPositionY:number;
    radius:number;
    collisionType:collisionType;
    // _currentDestination:Vec2;

    /**
     * Initiates a new Collision. Radius and collisionType must be defined. localPositionX and Y define the position the
     * circle is in the current vector plane (parent); by default they are set to 0.
     * @param radius
     * @param collisionType
     * @param localPositionX
     * @param localPositionY
     * @param verts
     * @param transform
     * @param textureMatrix
     * @param args
     */
    constructor(radius:number, collisionType: collisionType, localPositionX = 0, localPositionY = 0, verts?:Polygon2D, transform?:Mat3, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform, textureMatrix??DefaultTextureMatrix, ...args);
        this.radius = radius;
        this.collisionType = collisionType;
        this.localPositionX = localPositionX;
        this.localPositionY = localPositionY;
        // this._currentDestination = new Vec2();
        this.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
    }

    // isCollidingWith(parentCoords: Vec3, otherParentCoords: Vec3, otherCircle: Collision): collisionType | null {
    //     const dx = (parentCoords.x + this.localPositionX) - (otherParentCoords.x + otherCircle.localPositionX);
    //     const dy = (parentCoords.y + this.localPositionY) - (otherParentCoords.y + otherCircle.localPositionY);
    //
    //     const squaredDistance = dx * dx + dy * dy;
    //     const squaredRadiusSum = (this.radius + otherCircle.radius) * (this.radius + otherCircle.radius);
    //
    //     // console.log('passes in isCollidingWith');
    //     if (squaredDistance <= squaredRadiusSum) {
    //         return otherCircle.collisionType;
    //     }
    //     return null;
    // }
    /**
     * Checks if this Collision circle collides with another Collision type. If the two collide, returns the
     * collisionType (ie asteroid, bullet, ship) from enum collisionType. Otherwise, return null.
     * Collision circles must have parents and parents must be in the same vector plane (parents share the same parent).
     * @param otherCircle
     */
    isCollidingWith(otherCircle: Collision): collisionType | null {
        if (this.parent instanceof ANodeModel2D && otherCircle.parent instanceof ANodeModel2D) {
            let parentCoords = this.parent.transform.getPosition();
            let otherParentCoords = otherCircle.parent.transform.getPosition();
            const dx = (parentCoords.x + this.localPositionX) - (otherParentCoords.x + otherCircle.localPositionX);
            const dy = (parentCoords.y + this.localPositionY) - (otherParentCoords.y + otherCircle.localPositionY);

            const squaredDistance = dx * dx + dy * dy;
            const squaredRadiusSum = (this.radius + otherCircle.radius) * (this.radius + otherCircle.radius);

            if (squaredDistance <= squaredRadiusSum) {
                return otherCircle.collisionType;
            }
        }
        return null;
    }

    timeUpdate(t:number) {
        super.timeUpdate(t);
    }
}