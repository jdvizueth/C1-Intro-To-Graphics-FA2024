import {Polygon2DView} from "../../../anigraph/starter/nodes/polygon2D";
import {ASerializable, AView} from "../../../anigraph";
import {Collision} from "./Collision";

@ASerializable("CollisionView")
export class CollisionView extends Polygon2DView {
    get model(): Collision {
        return this._model as Collision;
    }

    init(): void {
        super.init();
    }

    update(): void {
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
