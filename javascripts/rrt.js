
/*
The Rapidly-Exploring Random Tree
By wikipedia: A Rapidly exploring random tree (RRT) is a data structure and algorithm designed for efficiently searching nonconvex, high-dimensional search spaces. The tree is constructed in such a way that any sample in the space is added by connecting it to the closest sample already in the tree.

MIT Release by Fourdesire, 2013
fourdesire.com
*/


(function() {
  var Rrt, onDocumentMouseMove;

  $(document).ready(function() {
    var $container, camera, renderer, rrt, scene;
    $container = $('#container');
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = 200;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
    $container.append(renderer.domElement);
    rrt = new Rrt(camera, scene, renderer);
    return $(document).on('mousemove', {
      camera: camera
    }, onDocumentMouseMove);
  });

  onDocumentMouseMove = function(event) {
    var camera, mouseX, mouseY;
    camera = event.data.camera;
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    return camera.lookAt(new THREE.Vector3(0, 0, 0));
  };

  Rrt = (function() {

    Rrt.prototype.ticker = 1;

    Rrt.prototype.nodes = new Array();

    Rrt.prototype.rrtRadius = 200;

    Rrt.prototype.threshold = 3;

    Rrt.prototype.sphereMaterial = new THREE.MeshLambertMaterial;

    Rrt.prototype.lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
      opacity: 0.5
    });

    Rrt.prototype.radius = 0.5;

    Rrt.prototype.segments = 16;

    Rrt.prototype.rings = 16;

    function Rrt(camera, scene, renderer) {
      this.camera = camera;
      this.scene = scene;
      this.renderer = renderer;
      this.nodes[0] = {
        x: 0,
        y: 0,
        z: 0
      };
      this.animate();
    }

    Rrt.prototype.animate = function() {
      requestAnimationFrame(this.animate.bind(this));
      if (this.ticker++ % 5 === 0) {
        this.addNode();
      }
      return this.render();
    };

    Rrt.prototype.render = function() {
      return this.renderer.render(this.scene, this.camera);
    };

    Rrt.prototype.addNode = function() {
      var edge, geometry, line, nearest, newNode, sphere, sphereGeometry;
      edge = this.nextNode();
      newNode = edge[1];
      nearest = edge[0];
      this.nodes.push(newNode);
      geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(newNode.x, newNode.y, newNode.z));
      geometry.vertices.push(new THREE.Vector3(nearest.x, nearest.y, nearest.z));
      line = new THREE.Line(geometry, this.lineMaterial);
      this.scene.add(line);
      sphereGeometry = new THREE.SphereGeometry(this.radius, this.segments, this.rings);
      sphere = new THREE.Mesh(sphereGeometry, this.sphereMaterial);
      sphere.position = new THREE.Vector3(newNode.x, newNode.y, newNode.z);
      return this.scene.add(sphere);
    };

    Rrt.prototype.nextNode = function() {
      var d, minD, nearestNode, newNode, node, vd, vx, vy, vz, _i, _len, _ref;
      newNode = this.randomNode();
      minD = Number.MAX_VALUE;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        d = this.distanceBetween(node, newNode);
        if (d < minD) {
          minD = d;
          nearestNode = node;
        }
      }
      if (minD <= this.threshold) {
        return [nearestNode, newNode];
      } else {
        vx = newNode.x - nearestNode.x;
        vy = newNode.y - nearestNode.y;
        vz = newNode.z - nearestNode.z;
        vd = Math.sqrt(vx * vx + vy * vy + vz * vz);
        vx = vx / vd;
        vy = vy / vd;
        vz = vz / vd;
      }
      return [
        nearestNode, {
          x: vx * this.threshold + nearestNode.x,
          y: vy * this.threshold + nearestNode.y,
          z: vz * this.threshold + nearestNode.z
        }
      ];
    };

    Rrt.prototype.randomNode = function() {
      var phi, theta, u, v;
      u = Math.random();
      v = Math.random();
      theta = 2 * Math.PI * u;
      phi = Math.acos(2 * v - 1);
      return {
        x: 0 + (this.rrtRadius * Math.sin(phi) * Math.cos(theta)),
        y: 0 + (this.rrtRadius * Math.sin(phi) * Math.sin(theta)),
        z: 0 + (this.rrtRadius * Math.cos(phi))
      };
    };

    Rrt.prototype.distanceBetween = function(nodeA, nodeB) {
      var xs, ys, zs;
      xs = nodeA.x - nodeB.x;
      ys = nodeA.y - nodeB.y;
      zs = nodeA.z - nodeB.z;
      return xs * xs + ys * ys + zs * zs;
    };

    return Rrt;

  })();

}).call(this);
