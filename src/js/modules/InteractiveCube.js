import * as THREE from 'three';
export default class InteractiveCube{
    constructor(_id, x=0, y=0, z=0, color=0xffffff){
        const geometry = new THREE.BoxGeometry(1,1,1);  
        const _texture = new THREE.TextureLoader().load('/examples/textures/yes.jpg');  
        const material = new THREE.MeshStandardMaterial({map:_texture});//or a MeshBasicMaterial if lights are not needed
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(x, y, z);
        this.mesh.userData = this;
        this.id = _id;
        this.bouncing = false;
        this.kicked = false;
        return this;
    }
    bounce(){
        if(this.bouncing) return;
        this.bouncing = true;//sørger for at animationen ikke kører konstant, men kun 1 gang
        console.log("Bounce", this.id);

        gsap.to(this.mesh.position, .8, {y:5, ease: "cubic"});
        gsap.to(this.mesh.position, 1.6, {y:.5, ease:"bounce", delay: .8, onComplete:() => {this.bounceover()}});
    }
    bounceover(){
        this.bouncing = false;  
    }

    kick(_direction){
        if(this.kicked) return;
        this.kicked = true; //eksekvere animationen 1 gang
        console.log("kick", this.id);

        //move the cube 20 away on both z and x axis
        var _x = this.mesh.position.x - Math.sin(_direction) * 40;
        var _z = this.mesh.position.z - Math.cos(_direction) * 40;

        gsap.to(this.mesh.position, 1.5, {x:_x, z:_z, ease:"cubic"});
        gsap.to(this.mesh.rotation, 1.5, {x:this.dtr(180), z:this.dtr(180), ease:"cubic", onComplete:() => {this.kickover()}});

    }
    kickover(){
        this.kicked = false;
    }
    //degree to radius - omregner til radian
    dtr(d) {
    return d * (Math.PI/180);
}
};