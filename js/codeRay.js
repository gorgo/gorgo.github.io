var scene, camera, renderer;
var geometry, material, mesh, monkey;
var controls;
var cubeCamera;
var cubeCameraRefracted;
var inside;
var readyToAnimate = false;
var bufferTex1;
var bufferTex2;
var envSphere;
var diamondMat;
var diamondInsideMat;
var stats;
var envProbe;
var diamondCube;
var diamondSphere;
var diamondMesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    cubeCamera = new THREE.CubeCamera( 1, 100000, 512 );
    scene.add( cubeCamera );

    cubeCameraRefracted = new THREE.CubeCamera( 1, 100000, 512 );
    scene.add( cubeCameraRefracted );


    var goodCube = new THREE.CubeTextureLoader()
					.setPath( 'tex/cube/pisa/' )
					.load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
    diamondCube = new THREE.CubeTextureLoader()
      					.setPath( 'tex/' )
      					.load( [ 'diamond.jpg', 'diamond.jpg', 'diamond.jpg', 'diamond.jpg', 'diamond.jpg', 'diamond.jpg' ] );
    //
    //
    //
    // var bufferSize = 1024;
    // bufferTex1 = new THREE.WebGLRenderTargetCube( bufferSize, bufferSize, {
    //   minFilter: THREE.LinearFilter,
    //   magFilter: THREE.LinearFilter,
    //   wrapS: THREE.RepeatWrapping,
    //   wrapT: THREE.RepeatWrapping,
    //   format: THREE.RGBFormat } );
    //
    // bufferTex2 = new THREE.WebGLRenderTarget( bufferSize, bufferSize, {
    //     minFilter: THREE.LinearFilter,
    //     magFilter: THREE.NearestFilter,
    //     wrapS: THREE.RepeatWrapping,
    //     wrapT: THREE.RepeatWrapping,
    //     format: THREE.RGBFormat } );

    diamondMat = new THREE.ShaderMaterial({
      uniforms: {
        tRefractMap: {
          type: 't',
          value: null
        },
        ratio: {
          type: 'float',
          value: 1.0
        },
        normalMul: {
          type: 'float',
          value: 1.0
        },
        tReflectMap: {
          type: 't',
          value: null
        },
        refPower: {
          type: 'float',
          value: 0.0
        },
        rayVertices: {
          type: 'v3v',
          value: [new THREE.Vector3(0,0,0)]
        },
        rayNormals: {
          type: 'v3v',
          value: [new THREE.Vector3(0,0,0)]
        },

      },
      vertexShader: document.getElementById( 'diamond-vs' ).textContent,
      fragmentShader: document.getElementById( 'diamond-fs' ).textContent,
    })




    // model
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load( './collada/ring.dae', function ( collada ) {

      dae = collada.scene;



      var goldMat = new THREE.ShaderMaterial({
        uniforms: {
            tMatCap: {
                type: 't',
                value: new THREE.TextureLoader().load( 'tex/matcapGold.jpg' )
            },
        },
        vertexShader: document.getElementById( 'sem-vs' ).textContent,
        fragmentShader: document.getElementById( 'sem-fs' ).textContent,
        shading: THREE.SmoothShading

      } );
      //goldMat.visible = false;

      dae.traverse ( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          if (child.material.name == "Material #12")
            child.material = diamondMat;
          else if (child.material.name == "Material #11")
            child.material = goldMat;
          if (child.parent.name == "Shape01")
            diamondMesh = child;
        }
        if (child.name == "Inside") {
          inside = child;
        }
      } );
      //dae.position.set(0, 500, 0);
      scene.add(dae);
      readyToAnimate = true;


      mesh = dae;

      diamondMesh.geometry.computeFaceNormals();
      var normals = [];
      var vertices = [];
      for (var i = 0; i < diamondMesh.geometry.faces.length; ++i) {
        var face = diamondMesh.geometry.faces[i];
        normals.push(face.normal);
        vertices.push(diamondMesh.geometry.vertices[face.a]);
        vertices.push(diamondMesh.geometry.vertices[face.b]);
        vertices.push(diamondMesh.geometry.vertices[face.c]);
        //console.log("push vind ", face.a, face.b, face.c, face.normal);
      }
      //diamondMat.uniforms.rayTriangles.value = triangles;

      diamondMat.uniforms.rayVertices.value = vertices;
      diamondMat.uniforms.rayNormals.value = normals;

      diamondMat.defines = {
        RAY_VERTS_COUNT: ''+vertices.length,
        RAY_TRIS_COUNT: ''+normals.length,
      };
      //diamondMat.uniforms.rayTriangleCount.value = diamondMesh.geometry.faces.length;
    });


    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff);


    //env sphere
    var geometry = new THREE.SphereGeometry( 5000, 60, 40 );
		geometry.scale( - 1, 1, 1 );

		var material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load( 'tex/interior.jpg' )
		} );

		mesh = new THREE.Mesh( geometry, material );

		scene.add( mesh );
    envSphere = mesh;

    geometry = new THREE.SphereGeometry( 100, 60, 40 );
    material = new THREE.ShaderMaterial({
      uniforms: {
        tReflectMap: {
          type: 't',
          value: cubeCameraRefracted.renderTarget.texture
        },
      },
      vertexShader: document.getElementById( 'reflective-vs' ).textContent,
      fragmentShader: document.getElementById( 'reflective-fs' ).textContent,
    })

    // material = new THREE.MeshBasicMaterial({'envMap' : cubeCamera.renderTarget.texture});

    // mesh = new THREE.Mesh( geometry, material );
    // scene.add(mesh);
    // mesh.position.set(0,0,0);
    // envProbe = mesh;
    //
    // geometry.computeFaceNormals();
    // //geometry.computeFlatVertexNormals();
    diamondSphere = new THREE.Mesh( geometry, diamondMat );
    scene.add(diamondSphere);
    diamondSphere.position.set(-200,0,0);


    document.body.appendChild( renderer.domElement );
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.05;
    // stats = new Stats();
		// document.body.appendChild( stats.dom );
}

function animate() {
    //stats.update();

    requestAnimationFrame( animate );
    if (!readyToAnimate) return;
    controls.update();
    //first, render regular cubemap from inside of big diamond
    diamondMat.visible = false;
    envSphere.visible = true;
    cubeCamera.position.copy(inside.getWorldPosition());
    cubeCamera.updateCubeMap(renderer, scene);




    //render whole scene, refract index 0.417
    diamondMat.visible = true;

    diamondMat.uniforms.tRefractMap.value = cubeCamera.renderTarget.texture;
    diamondMat.uniforms.tReflectMap.value = cubeCamera.renderTarget.texture;

    envSphere.visible = true;
    renderer.render( scene, camera );

    // //  mesh.rotation.x += 0.01;
    // //  mesh.rotation.y += 0.02;
    // mesh.rotation.y += 0.002;
    // //renderer.clear(0xffffff);
    //
    // envSphere.visible = true;
    // cameraInside.lookAt(cameraInside.getWorldPosition().multiplyScalar(2).sub(camera.getWorldPosition()));
    // cameraInside.position.copy( inside.getWorldPosition() );
    // // var l,b,w,h;
    // // l = 0;
    // // b = 0;
    // // w = window.innerWidth*0.5;
    // // h = window.innerHeight;
    //  cameraInside.aspect = 1;
    //  cameraInside.updateProjectionMatrix();
    // // renderer.setClearColor(0xffffff);
    // // renderer.setViewport(l,b,w,h);
    // // renderer.setScissor(l,b,w,h)
    // // renderer.setScissorTest(true);
    // // renderer.setClearColor(0xffffff);
    // //renderer.render( scene, cameraInside );
    //
    // diamondMat.visible = false;
    // renderer.render( scene, cameraInside, bufferTex1);
    // diamondMat.visible = true;
    //
    // diamondMat.uniforms.tMatCap.value = bufferTex1.texture;
    // diamondMat.uniforms.ratio.value = 0.7;
    // diamondMat.uniforms.normalMul.value = -1.0;
    // diamondMat.uniforms.refPower.value = 0.7;
    // diamondMat.side = THREE.BackSide;
    // diamondMat.needsUpdate = true;
    //
    // renderer.render( scene, cameraInside, bufferTex2);
    //
    // diamondMat.uniforms.tMatCap.value = bufferTex2.texture;
    // // diamondMat.uniforms.ratio.value = 0.7;
    // diamondMat.uniforms.normalMul.value = 1.0;
    // diamondMat.uniforms.refPower.value = 0.7;
    //  diamondMat.side = THREE.FrontSide;
    //  //diamondMat.needsUpdate = true;
    // // diamondMat.visible = false;
    // //
    // //  l = w;
    // //  camera.aspect = w/h;
    // //  camera.updateProjectionMatrix();
    // // renderer.setViewport(l,b,w,h);
    // // renderer.setScissor(l,b,w,h);
    // // renderer.setScissorTest(true);
    // // renderer.setClearColor(0xffffff);
    // envSphere.visible = false;
    // renderer.render( scene, camera );

}
