var scene, camera, renderer;
var geometry, material, mesh, monkey;
var controls;


init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    // geometry = new THREE.BoxGeometry( 200, 200, 200 );
     material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
    //
    // mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

    // model
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load( './collada/ring.dae', function ( collada ) {

      dae = collada.scene;

      var diamondMat = new THREE.ShaderMaterial({
        uniforms: {
          tMatCap: {
            type: 't',
            value: THREE.ImageUtils.loadTexture( 'tex/diamond.jpg')
          }
        },
        vertexShader: document.getElementById( 'diamond-vs' ).textContent,
        fragmentShader: document.getElementById( 'diamond-fs' ).textContent,
      })

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
      } );
      scene.add(dae);



    });


    var light = new THREE.DirectionalLight( 0xffffff, 1.0);
    light.position.set(-1, 1, -0.5);
    scene.add( light );
    var lightAm = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( lightAm );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff);

    document.body.appendChild( renderer.domElement );
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {

    requestAnimationFrame( animate );

    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;
    //renderer.clear(0xffffff);
    renderer.render( scene, camera );

}
