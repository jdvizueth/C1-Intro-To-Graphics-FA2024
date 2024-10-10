import {
    A2DMeshModelPRSA, ANodeModel, AObjectNode,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState, Mat3, Mat4,
    NodeTransform2D, Polygon2D,
    V2, V3,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";
import {Polygon2DModel} from "../../../../anigraph/starter/nodes/polygon2D";
import {GameObject2DModel} from "../GameObject2DModel";
import {TexturedPolygon2DModel} from "../../../../anigraph/starter/nodes/textured";
import {Collision} from "../Collision";

const DefaultTextureMatrix = Mat3.Translation2D(V2(0.5,0.5)).times(Mat3.Scale2D(5.2))

@ASerializable("Bullet")
export class Bullet extends GameObject2DModel {
    static BulletMaterial:AShaderMaterial|undefined=undefined;
    static BulletTexture:ATexture;


    _currentDestination:Vec2;
    // _orientation:Vec2;
    speed = 0;
    collisionCircle: Collision | null = null;
    hasCollided: boolean=false;


    constructor(verts?:Polygon2D, transform?:Mat3, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform, textureMatrix??DefaultTextureMatrix, ...args);
        this._currentDestination = new Vec2();
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
        this.transform.setPosition(this.transform.getPosition().plus(V3(0,this.speed,0)));
        // console.log(this.transform.getPosition())
        // if (this.hasCollided) {
        //     console.log('bullet has collided')
        //     // code that sends the bullet back to user
        //     this.speed = 0;
        //     this.hasCollided = false;
        // }
    }

    onMoveUp() {
        this.speed = GameConfigs.BULLET_MOVESPEED;
    }
}