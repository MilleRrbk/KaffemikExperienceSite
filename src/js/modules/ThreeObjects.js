import * as THREE from 'three';

//Cube
class buildCube{
    constructor(x=0, y=0, z=0, color=0xFFFFFF){
        const geometry = new THREE.BoxGeometry(1,1,1);    
        const material = new THREE.MeshStandardMaterial({color:color});//or a MeshBasicMaterial if lights are not needed
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(x, y, z);
        return this.mesh;
    }
}

/*class buildCubeWithTexture{
    ...load texture similar to example 6
}*/

//Plane
class buildPlane{
    constructor(x=0, y=0, z=0, color=0xFFFFFF, side=THREE.DoubleSide){
        const geometry = new THREE.PlaneGeometry(1,1);    
        const material = new THREE.MeshStandardMaterial({color:color, side:side});//or a MeshBasicMaterial if lights are not needed
        //material.shadowSide = THREE.BackSide;
        //https://stackoverflow.com/questions/44989568/three-js-plane-doesnt-cast-shadow
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        //this.mesh.receiveShadow = true;
        this.mesh.position.set(x, y, z);
        return this.mesh;
    }
}

//Sphere
class buildSphere{
    constructor(x=0, y=0, z=0, color=0xFFFFFF){
        const geometry = new THREE.SphereGeometry(2,16,16);    
        const material = new THREE.MeshStandardMaterial({color:color});//or a MeshBasicMaterial if lights are not needed
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(x, y, z);
        return this.mesh;
    }
}

export{buildCube, buildPlane, buildSphere};