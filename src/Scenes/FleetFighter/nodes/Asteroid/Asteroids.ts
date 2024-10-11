import {ASerializable, Color, Mat3, Transformation2DInterface} from "../../../../anigraph";
import {GameObject2DModel} from "../GameObject2DModel";
import {Collision, collisionType} from "../Collision";

/**
 * The class Asteroid, extending from GameObject2DModel.
 */
@ASerializable("Asteroid")
export class Asteroid extends GameObject2DModel{
    /**
     * Wrapper that interprets the Transformation2DInterface as a Mat3
     * @returns {Mat3}
     */
    get transform(): Mat3 {
        return this._transform as Mat3;
    }

    /**
     * Sets the transform to an identity Mat3
     */
    setTransformToIdentity(){
        this._transform = new Mat3();
    }

    /**
     * If the input transform is not a Mat3, it will be converted to one.
     * Note that this can throw away information! E.g., there are different combinations of position and anchor that map to the same Mat3 object.
     * @param transform
     */
    setTransform(transform:Transformation2DInterface){
        return this.setTransformMat3(transform);
    }

    clone(): Asteroid{
        return new Asteroid(this.verts, this.transform);
    }

    gotHit(): void {
        // console.log("GotHit");
        this.setUniformColor(new Color(150,0,0,1))
    }

    /**
     * Activates the collision circle for this asteroid. By default, radius is 1.
     * @param radius
     */
    activateCircleCollisions(radius: number = 1) {
        super.activateCircleCollisions(radius, collisionType.asteroid);
    }
}