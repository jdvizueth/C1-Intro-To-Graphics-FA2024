import {Color, Particle2D, V2, Vec2} from "../../../../anigraph";
import {Particle} from "../Particle";
import {Flame2DParticle} from "./Flame2DParticle";

/**
 * Our custom 2D particle class. It must implement the Particle2D interface, which means it has `position`, `depth`, and `visible` properties.
 * You can customize your particle class with additional properties and functions.
 */
export class Smoke2DParticle extends Flame2DParticle{
    visible:boolean=true;
    depth:number=0;
    color:Color;
    iColor:Color;
    // darkenedColor:Color;
    startDarkness:number = 80;

    /**
     * You can show or hide particles by setting their `visible` parameter.
     * This is important, because with instanced particles, you will need to create all the particles you plan to use up front so that the GPU can allocate the appropriate resources. This means that if you want fewer than this maximum number, you just hide the particles you aren't using.
     */
    show(){
        this.visible = true;
    }
    hide(){
        this.visible = false;
    }

    constructor(position?:Vec2, startPosition?:Vec2, velocity?:Vec2, mass?:number, radius?:number, lifespan?:number){
        super(position, startPosition, velocity, mass, radius, lifespan, Color.Red());
        let colorB = new Color(1,1,1,0.6);
        let darkenedColor = colorB.GetDarkened(100);
        this.color = darkenedColor;
        this.iColor = darkenedColor;
        this.visible = true;
        this.iRadius = 0.5;
        this.speed = this.speed = Math.random() * 2 + 4;
        this.lifeSpan = 1.5;

        // let sign = Math.random() < 0.5 ? -1 : 1;
        // this.amplitude = sign * Math.random() * 0.4 + 0.3;
        // this.speed = Math.random() * 2 + 4;
    }
}

