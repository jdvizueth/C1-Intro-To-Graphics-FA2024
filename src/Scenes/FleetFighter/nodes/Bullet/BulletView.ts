import {TexturedPolygon2DView} from "../../../../anigraph/starter/nodes/textured";
import {
    ALineGraphic,
    ALineMaterialModel,
    ASceneView,
    AView,
    Color,
    Mat3,
    V2,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {Bullet} from "./Bullet";

export class BulletView extends TexturedPolygon2DView{
    get model():Bullet {
        return this._model as Bullet;
    }
    init() {
        super.init();
    }

    update() {
        super.update();
    }

    setParentView(newParent:AView){
        if (this.threejs.parent){
            throw new Error("Tried to parent view that already had parent");
        }
        if(newParent !== undefined){
            newParent.threejs.add(this.threejs);
        }
    }
}


