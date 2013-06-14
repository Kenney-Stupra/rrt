###
The Rapidly-Exploring Random Tree
By wikipedia: A Rapidly exploring random tree (RRT) is a data structure and algorithm designed for efficiently searching nonconvex, high-dimensional search spaces. The tree is constructed in such a way that any sample in the space is added by connecting it to the closest sample already in the tree.

MIT Release by Fourdesire, 2013
fourdesire.com
###

$(document).ready ->

  $container = $('#container')

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer()
  renderer.setSize window.innerWidth, window.innerHeight

  camera = new THREE.PerspectiveCamera 60, window.innerWidth / window.innerHeight, 1, 10000
  camera.position.x = 200
  camera.position.y = 200
  camera.position.z = 200
  camera.lookAt new THREE.Vector3 0, 0, 0
  scene.add camera

  $container.append renderer.domElement

  rrt = new Rrt(camera, scene, renderer)

  $(document).on 'mousemove', {camera: camera}, onDocumentMouseMove

onDocumentMouseMove = (event) ->
  camera = event.data.camera
  mouseX = event.clientX - window.innerWidth / 2
  mouseY = event.clientY - window.innerHeight / 2
  camera.position.x += ( mouseX - camera.position.x ) * 0.05
  camera.position.y += ( - mouseY - camera.position.y ) * 0.05
  camera.lookAt new THREE.Vector3 0, 0, 0

class Rrt
  ticker: 1
  nodes: new Array()

  # Basic setting of rrt tree
  rrtRadius: 200
  threshold: 3

  # Basic setting of material
  sphereMaterial: new THREE.MeshLambertMaterial
  lineMaterial: new THREE.LineBasicMaterial
    color: 0x000000
    linewidth: 2
    opacity: 0.5

  # Basic setting of sphere
  radius: 0.5
  segments: 16
  rings: 16

  constructor: (@camera, @scene, @renderer) ->
    @nodes[0] =
      x : 0
      y : 0
      z : 0

    @animate()

  animate: ->
    requestAnimationFrame @animate.bind(@)
    @addNode() if @ticker++ % 5 == 0
    @render()

  render: -> @renderer.render @scene, @camera

  addNode: ->
    edge = @nextNode()
    newNode = edge[1]
    nearest = edge[0]
    @nodes.push newNode

    # draw line
    geometry = new THREE.Geometry()
    geometry.vertices.push(new THREE.Vector3(newNode.x, newNode.y, newNode.z))
    geometry.vertices.push(new THREE.Vector3(nearest.x, nearest.y, nearest.z))
    line = new THREE.Line geometry, @lineMaterial
    @scene.add line

    #draw sphere
    sphereGeometry = new THREE.SphereGeometry( @radius, @segments, @rings )
    sphere = new THREE.Mesh( sphereGeometry, @sphereMaterial )
    sphere.position = new THREE.Vector3(newNode.x, newNode.y, newNode.z)
    @scene.add sphere

  nextNode: ->
    newNode = @randomNode()

    minD = Number.MAX_VALUE

    for node in @nodes
      d = @distanceBetween(node, newNode)
      if d < minD
        minD = d
        nearestNode = node

    if minD <= @threshold
      return [nearestNode, newNode]
    else
      vx = newNode.x - nearestNode.x
      vy = newNode.y - nearestNode.y
      vz = newNode.z - nearestNode.z
      vd = Math.sqrt(vx * vx + vy * vy + vz * vz)
      vx = vx / vd
      vy = vy / vd
      vz = vz / vd

    [ nearestNode,
      {
        x: vx * @threshold + nearestNode.x
        y: vy * @threshold + nearestNode.y
        z: vz * @threshold + nearestNode.z
      }
    ]

  randomNode: ->
    u = Math.random();
    v = Math.random();
    theta = 2 * Math.PI * u;
    phi = Math.acos(2 * v - 1);
    {
      x: 0 + (@rrtRadius * Math.sin(phi) * Math.cos(theta))
      y: 0 + (@rrtRadius * Math.sin(phi) * Math.sin(theta))
      z: 0 + (@rrtRadius * Math.cos(phi))
    }

  distanceBetween: (nodeA, nodeB) ->
    xs = nodeA.x - nodeB.x
    ys = nodeA.y - nodeB.y
    zs = nodeA.z - nodeB.z
    xs * xs + ys * ys + zs * zs