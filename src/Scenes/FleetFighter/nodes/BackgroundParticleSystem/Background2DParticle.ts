import {Color, Particle2D, V2, Vec2} from "../../../../anigraph";
import {Particle} from "../Particle";

/**
 * Our custom 2D particle class. It must implement the Particle2D interface, which means it has `position`, `depth`, and `visible` properties.
 * You can customize your particle class with additional properties and functions.
 */
export class Background2DParticle extends Particle{
    // mass:number;
    // velocity:Vec2;
    visible:boolean=true;
    depth:number=0;
    isBrightening:boolean=true;
    speed:number;

    /**
     * You can show or hide particles by setting their `visible` parameter.
     * This is important, because with instanced particles, you will need to create all the particles you plan to use up front so that the GPU can allocate the appropriate resources. This means that if you want fewer than this maximum number, you just hide the particles you aren't using.
     */
    // show(){
    //     this.visible = true;
    // }
    // hide(){
    //     this.visible = false;
    // }

    constructor(position?:Vec2, radius?:number, color?:Color, speed?:number){
        super(position, radius, color);
        this.speed = speed??1;
    }
}

