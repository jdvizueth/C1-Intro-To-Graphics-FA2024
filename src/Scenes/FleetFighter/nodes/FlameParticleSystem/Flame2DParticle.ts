import {Color, Particle2D, V2, Vec2} from "../../../../anigraph";
import {Particle} from "../Particle";

/**
 * Our custom 2D particle class. It must implement the Particle2D interface, which means it has `position`, `depth`, and `visible` properties.
 * You can customize your particle class with additional properties and functions.
 */
export class Flame2DParticle implements Particle{
    mass:number;
    position:Vec2;
    velocity:Vec2;
    visible:boolean=true;
    iRadius:number;
    radius:number;
    depth:number=0;
    color:Color;
    iColor:Color;
    lifeSpan:number;
    age:number;
    startPos:Vec2;
    amplitude:number;
    speed:number;

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

    constructor(position?:Vec2, startPosition?:Vec2, velocity?:Vec2, mass?:number, radius?:number, lifespan?:number, color?:Color){
        this.position = position??V2();
        this.velocity = velocity??V2();
        this.mass = mass??1;
        this.radius = radius??.4;
        this.iRadius = radius??.4;
        this.color = color??Color.FromRGBuintAfloat(255, 255, 0, .8);
        this.iColor = color??Color.FromRGBuintAfloat(255, 255, 0, .8);
        this.visible = true;
        this.lifeSpan = lifespan??.5;
        this.startPos = startPosition??new Vec2(0,0);
        this.age = 0;

        let sign = Math.random() < 0.5 ? -1 : 1;
        this.amplitude = sign * Math.random() * 0.4 + 0.3;
        this.speed = Math.random() * 2 + 4;
    }
}

