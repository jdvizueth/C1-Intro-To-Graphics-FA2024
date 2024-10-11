import {
    AMaterialManager,
    ASerializable,
    AShaderMaterial,
    ATexture,
    GetAppState,
    Mat3,
    Mat4,
    Polygon2D,
    V2,
    V3,
    Vec2
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";
import {GameObject2DModel} from "../GameObject2DModel";
import {Collision, collisionType} from "../Collision";

const DefaultTextureMatrix = Mat3.Translation2D(V2(0.5,0.5)).times(Mat3.Scale2D(0.5))
const DefaultVerts = Polygon2D.Square();
const DefaultTransform = Mat3.Translation2D(V2(0,0));

@ASerializable("Bullet")
export class Bullet extends GameObject2DModel {
    static BulletMaterial:AShaderMaterial|undefined=undefined;
    static BulletTexture:ATexture;


    _currentDestination:Vec2;
    speed = 0;
    hasCollided: boolean=false;


    constructor(verts:Polygon2D=DefaultVerts, transform:Mat3=DefaultTransform, textureMatrix?:Mat3|Mat4, ...args:any[]) {
        super(verts, transform, textureMatrix??DefaultTextureMatrix, ...args);
        this._currentDestination = new Vec2();
        this.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER))
    }


    timeUpdate(t:number) {
        super.timeUpdate(t);
        this.transform.setPosition(this.transform.getPosition().plus(V3(0,this.speed,0)));

    }

    onMoveUp() {
        this.speed = GameConfigs.BULLET_MOVESPEED;
    }

    /**
     * Activates the collision circle for this bullet. By default, radius is 1.
     * @param radius
     */
    activateCircleCollisions(radius: number = 1) {
        super.activateCircleCollisions(radius, collisionType.bullet);
    }
}