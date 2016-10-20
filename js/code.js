var scene, camera, renderer;
var geometry, material, mesh, monkey;
var controls;
var cameraInside;
var inside;
var readyToAnimate = false;
var bufferTex1;
var bufferTex2;
var envSphere;
var diamondMat;
var diamondInsideMat;
var stats;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    cameraInside = new THREE.PerspectiveCamera( 500, window.innerWidth / window.innerHeight, 1, 10000 );

    var bufferSize = 1024;
    bufferTex1 = new THREE.WebGLRenderTarget( bufferSize, bufferSize, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      format: THREE.RGBFormat } );

    bufferTex2 = new THREE.WebGLRenderTarget( bufferSize, bufferSize, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        format: THREE.RGBFormat } );

    diamondMat = new THREE.ShaderMaterial({
      uniforms: {
        tMatCap: {
          type: 't',
          value: bufferTex1.texture
        },
        ratio: {
          type: 'float',
          value: 1.0
        },
        normalMul: {
          type: 'float',
          value: 1.0
        }
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
                value: THREE.ImageUtils.loadTexture( 'tex/matcapGold.jpg' )
            },
        },
        vertexShader: document.getElementById( 'sem-vs' ).textContent,
        fragmentShader: document.getElementById( 'sem-fs' ).textContent,
        shading: THREE.SmoothShading

      } );


      dae.traverse ( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          if (child.material.name == "Material #12")
            child.material = diamondMat;
          else if (child.material.name == "Material #11")
            child.material = goldMat;
        }
        if (child.name == "Inside") {
          inside = child;
        }
      } );
      //dae.position.set(0, 500, 0);
      scene.add(dae);
      readyToAnimate = true;

      // geometry = new THREE.BoxGeometry( 200, 200, 200 );
      //
      //
      // mesh = new THREE.Mesh( geometry, diamondMat );
      // scene.add( mesh );
      mesh = dae;
    });


    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff);


    //env sphere
    var geometry = new THREE.SphereGeometry( 5000, 60, 40 );
		geometry.scale( - 1, 1, 1 );

		var material = new THREE.MeshBasicMaterial( {
			map: new THREE.TextureLoader().load( 'tex/umbrella.jpg' )
		} );

		mesh = new THREE.Mesh( geometry, material );

		scene.add( mesh );
    envSphere = mesh;

    document.body.appendChild( renderer.domElement );
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    stats = new Stats();
		document.body.appendChild( stats.dom );
}

function animate() {
    stats.update();
    requestAnimationFrame( animate );
    if (!readyToAnimate) return;

    //  mesh.rotation.x += 0.01;
    //  mesh.rotation.y += 0.02;
    mesh.rotation.y += 0.002;
    //renderer.clear(0xffffff);

    envSphere.visible = true;
    cameraInside.lookAt(cameraInside.getWorldPosition().multiplyScalar(2).sub(camera.getWorldPosition()));
    cameraInside.position.copy( inside.getWorldPosition() );
    var l,b,w,h;
    l = 0;
    b = 0;
    w = window.innerWidth*0.5;
    h = window.innerHeight;
    cameraInside.aspect = w/h;
    cameraInside.updateProjectionMatrix();
    renderer.setClearColor(0xffffff);
    renderer.setViewport(l,b,w,h);
    renderer.setScissor(l,b,w,h)
    renderer.setScissorTest(true);
    renderer.setClearColor(0xffffaa);
    //renderer.render( scene, cameraInside );

    diamondMat.visible = false;
    renderer.render( scene, cameraInside, bufferTex1);
    diamondMat.visible = true;

    diamondMat.uniforms.tMatCap.value = bufferTex1.texture;
    diamondMat.uniforms.ratio.value = 0.8;
    diamondMat.uniforms.normalMul.value = -1.0;
    diamondMat.side = THREE.BackSide;
    diamondMat.needsUpdate = true;

    renderer.render( scene, cameraInside, bufferTex2);

    diamondMat.uniforms.tMatCap.value = bufferTex2.texture;
    // diamondMat.uniforms.ratio.value = 0.7;
    diamondMat.uniforms.normalMul.value = 1.0;
     diamondMat.side = THREE.FrontSide;
     //diamondMat.needsUpdate = true;
    // diamondMat.visible = false;
    //
     l = w;
     camera.aspect = w/h;
     camera.updateProjectionMatrix();
    // renderer.setViewport(l,b,w,h);
    // renderer.setScissor(l,b,w,h);
    // renderer.setScissorTest(true);
    // renderer.setClearColor(0xffffff);
    envSphere.visible = true;
    renderer.render( scene, camera );

}
