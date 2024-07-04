import React, { Component } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import '../../../util/analytics';
import CountUp from 'react-countup';

import './style.css';

var Filter = require('bad-words'),
  filter = new Filter();
export default class Lane extends Component {
  constructor(props) {
    super(props);

    this.state = {
      countdown: (+props.waitAt + 1) || 30,
      secondsLeft: 60,
      score: 0,
      submittedUsername: props.isAuth,
      loading: true,
      username: props.username,
      previousMultiplier: 0,
      previousHeldScore: 0,
      multiplier: 0,
      heldScore: 0,
      previousScore: 0,
      audioActive: false,
      clicks: 0,
      isMobile: props.isMobile
    }
  }

  updateUsername(e) {
    this.setState({
      username: filter.clean(e.target.value)
    })
  }

  _fmtMSS(s) { return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s }

  _getSecondsLeft() {
    let t1 = new Date()
    let t2 = new Date(this.props.endTime)
    let dif = t2.getTime() - t1.getTime()
    let seconds = Math.floor(dif / 1000)
    if (seconds <= 0) {
      clearInterval(this.secondsLeftInterval)
    }
    this.setState({
      secondsLeft: this._fmtMSS(seconds)
    })
  }

  componentDidMount() {
    /*
    firestore.analyticsRunner.logEvent('user_started_game', {
      dateStarted: new Date().toString(),
      name: this.props.username
    });
    */
    ga('send', 'event', 'Game', 'user_started_game', 'started_game');
    var scoreBoard = document.getElementById('scoreText')
    var score = 0
    const _this = this // need to hold a reference for the inner functions
    // this.startTimeInterval = setInterval(() => {
    //   const { countdown } = this.state;
    //   this.setState({ countdown: countdown - 1})
    //   if (countdown <= 0) clearInterval(this.startTimeInterval)
    // }, 1000)

    this.secondsLeftInterval = setInterval(() => {
      this._getSecondsLeft()
    }, 1000)

    //########################
    // code start

    var sphereShape,
      audioActive = false,
      endTime = this.props.endTime,
      startTime = this.props.startTime,
      light,
      sphereBody,
      bullets = 9,
      world,
      physicsMaterial,
      walls = [],
      balls = [],
      ballMeshes = [],
      boxes = [],
      boxMeshes = [],
      targets = [],
      targetMeshes = [];
    var loader = new THREE.TextureLoader();
    var camera, scene, renderer;
    var geometry, material, mesh;
    var clock = new THREE.Clock();
    var controls, time = Date.now();
    var targetGeometry = new THREE.PlaneGeometry(1, 1);
    var headGeometry = new THREE.PlaneGeometry(0.2, 0.2);
    var stemGeometry = new THREE.PlaneGeometry(0.2, 0.6);
    var targetTextures = {
      green: loader.load('carnival_assets/target_green.png'),
      red: loader.load('carnival_assets/target_red.png'),
      yellow: loader.load('carnival_assets/target_yellow.png'),
      stem: loader.load('carnival_assets/target_stem.png')
    }
    var spark, sparkMesh;

    // target data 
    const targetLocations = {
      1: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: -1,
          y: -0.85,
          z: -6
        },
        meshData: {},
        texture: targetTextures.red
      },
      2: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 1,
          y: 1.24,
          z: -10
        },
        meshData: {},
        texture: targetTextures.yellow
      },
      3: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: -1,
          y: 1.24,
          z: -10
        },
        meshData: {},
        texture: targetTextures.green
      },
      4: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 0,
          y: -0.09,
          z: -8
        },
        meshData: {},
        texture: targetTextures.red
      },
      5: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: -2.5,
          y: 2.8,
          z: -12
        },
        meshData: {},
        texture: targetTextures.yellow
      },
      6: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 1,
          y: -0.85,
          z: -6
        },
        meshData: {},
        texture: targetTextures.green
      },
      7: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 1.8,
          y: 2.8,
          z: -12
        },
        meshData: {},
        texture: targetTextures.red
      },
      8: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 0,
          y: 2.8,
          z: -12
        },
        meshData: {},
        texture: targetTextures.yellow
      },
      9: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 0,
          y: 8.4,
          z: -22
        },
        meshData: {},
        texture: targetTextures.green
      },
      10: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 3,
          y: 8.4,
          z: -22
        },
        meshData: {},
        texture: targetTextures.red
      },
      11: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: -3,
          y: 8.4,
          z: -22
        },
        meshData: {},
        texture: targetTextures.yellow
      },
      12: {
        active: true,
        alreadyShot: false,
        points: 50,
        location: {
          x: 4.5,
          y: 8.4,
          z: -22
        },
        meshData: {},
        texture: targetTextures.green
      },
    }



    function rRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const containerDiv = this.containerDiv
    init();
    animate();

    function init() {
      // set audio to off by default
      /* old
      document.getElementById("shotAudio").volume = 0
      document.getElementById("hitAudio").volume = 0
      document.getElementById("reloadAudio").volume = 0
      document.getElementById("oomAudio").volume = 0
      document.getElementById("headshotAudio").volume = 0
      */

      camera = new THREE.PerspectiveCamera(70, containerDiv.offsetWidth / containerDiv.offsetHeight, 1, 1000);

      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000000, 0, 500);

      var ambient = new THREE.AmbientLight(0xffffff);
      scene.add(ambient);

      light = new THREE.SpotLight(0xffffff);
      light.position.set(10, 30, 20);
      light.target.position.set(0, 0, 0);
      if (true) {
        light.castShadow = true;

        light.shadow.camera.near = 20;
        light.shadow.camera.far = 50;//camera.far;
        light.shadow.camera.fov = 40;

        light.shadowMapBias = 0.1;
        light.shadowMapDarkness = 0.7;
        light.shadow.mapSize.width = 2 * 512;
        light.shadow.mapSize.height = 2 * 512;

        //light.shadowCameraVisible = true;
      }
      scene.add(light);

      // background
      loader.load(
        "carnival_assets/SG_Cartoon_bg_1.png",
        //use texture as material Double Side
        texture => {
          scene.background = texture;
        }
      );

      var sparkTexture = loader.load('carnival_assets/shot.png');
      //  spark = new TextureAnimator(sparkTexture, 6, 2, 12, 8)
      var sparkMaterial = new THREE.MeshBasicMaterial({
        map: sparkTexture,
        transparent: true, opacity: 1, color: 0xffffff
      });
      var sparkGeometry = new THREE.PlaneGeometry(1, 1)
      sparkMesh = new THREE.Mesh(sparkGeometry, sparkMaterial);

      scene.add(sparkMesh)

      renderer = new THREE.WebGLRenderer({ antialias: true });

      renderer.setSize(containerDiv.offsetWidth, containerDiv.offsetHeight);

      containerDiv.appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize, false);

      createTargets()

      // random target popup
      setInterval(() => {
        let availableTargets = []
        for (let key in targetLocations) {
          if (!targetLocations[key].active) availableTargets.push(targetLocations[key])
        }
        if (availableTargets && availableTargets.length > 2) {
          let randNumber = Math.floor(rRange(0, availableTargets.length))
          let rand = availableTargets[randNumber] // get random target with isactive to false
          let randMesh = rand.meshData
          let randStem = rand.stem
          let randHead = rand.head
          rand.active = true
          rand.alreadyShot = false
          let scaleT = new TWEEN.Tween(randMesh.scale)
            .to({ y: 1 }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          let scaleHead = new TWEEN.Tween(randHead.scale)
            .to({ y: 1 }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          let scaleStem = new TWEEN.Tween(randStem.scale)
            .to({ y: 1 }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          let positionT = new TWEEN.Tween(randMesh.position)
            .to({ y: rand.location.y }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          let headPosition = new TWEEN.Tween(randHead.position)
            .to({ y: rand.location.y }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          let stemPosition = new TWEEN.Tween(randStem.position)
            .to({ y: rand.location.y - 0.78 }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          positionT.onComplete(() => {
            let time = 500
            setTimeout(() => {
              scaleBackDown(randHead, rand, true)
              scaleBackDown(randMesh, rand)
              scaleBackDown(randStem, rand, false, true)
            }, time)
          })
        }
      }, 350)


    }

    function scaleBackDown(randMesh, rand, isHead, isStem) {
      let down = 1.05
      if (isHead) down = 1.05
      if (isStem) down = 0.3
      let scaleT = new TWEEN.Tween(randMesh.scale)
        .to({ y: 0.0001 }, 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      let positionT = new TWEEN.Tween(randMesh.position)
        .to({ y: randMesh.position.y - down }, 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
      if (!isHead && !isStem) {
        positionT.onComplete(() => {
          rand.active = false
        })
      }
    }

    function createTargets() {
      for (let key in targetLocations) {
        var x = targetLocations[key].location.x;
        var y = targetLocations[key].location.y;
        var z = targetLocations[key].location.z;

        var targetMaterial = new THREE.MeshBasicMaterial({
          map: targetLocations[key].texture,
          transparent: true, opacity: 1, color: 0xffffff
        });
        var stemMaterial = new THREE.MeshBasicMaterial({
          map: targetTextures.stem,
          transparent: true, opacity: 1, color: 0xffffff
        });
        var headMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 })


        var targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
        var stemMesh = new THREE.Mesh(stemGeometry, stemMaterial)
        var headMesh = new THREE.Mesh(headGeometry, headMaterial)
        headMesh.name = `${key}|head` // split to tell
        headMesh.position.set(x, y, z + 0.01)

        stemMesh.position.set(x, y - 0.78, z + 0.01)
        targetLocations[key].head = headMesh // store a reference to the head
        targetLocations[key].stem = stemMesh // and the stem

        scene.add(stemMesh)
        scene.add(headMesh)
        targetMesh.name = key
        targetMesh.position.set(x, y, z);
        targetMesh.castShadow = true;
        targetMesh.receiveShadow = true;
        targetLocations[key].meshData = targetMesh
        targetMeshes.push(targetMesh);
        targetMeshes.push(headMesh) // store head in raycast targets
        scene.add(targetMesh);

        scaleBackDown(targetMesh, targetLocations[key]) // hide initially
        scaleBackDown(headMesh, targetGeometry[key], true)
        scaleBackDown(stemMesh, targetGeometry[key], false, true)
      }
    }

    function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
      this.tilesHorizontal = tilesHoriz;
      this.tilesVertical = tilesVert;
      this.numberOfTiles = numTiles;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

      this.tileDisplayDuration = tileDispDuration;

      this.currentDisplayTime = 0;

      this.currentTile = 0;

      this.update = function (milliSec) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
          this.currentDisplayTime -= this.tileDisplayDuration;
          this.currentTile++;
          if (this.currentTile == this.numberOfTiles)
            this.currentTile = 0;
          var currentColumn = this.currentTile % this.tilesHorizontal;
          texture.offset.x = currentColumn / this.tilesHorizontal;
          var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
          texture.offset.y = currentRow / this.tilesVertical;
        }
      };
    }

    function onWindowResize() {
      camera.aspect = containerDiv.offsetWidth / containerDiv.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerDiv.offsetWidth, containerDiv.offsetHeight);
    }

    var dt = 1 / 60;
    function animate() {
      requestAnimationFrame(animate);

      TWEEN.update()
      renderer.render(scene, camera);
      time = Date.now();
      var delta = clock.getDelta();
      // spark.update(500 * delta)
    }

    var shootDirection = new THREE.Vector3();
    var raycaster = new THREE.Raycaster();


    // handle hitting target
    function scoreAndDestroy(item) {
      let wasHeadshot = false
      let keyName = item.object.name
      let splitName = item.object.name.split('|')
      if (item.object.name && splitName && splitName.length >= 2) {
        keyName = splitName[0]
        wasHeadshot = true
      }
      if (targetLocations[keyName].alreadyShot) return
      let points = targetLocations[keyName].points
      if (wasHeadshot) points += 100
      let pos2d = getScreenPosition(item.point)
      if (wasHeadshot && audioActive) {
        let headshotaudio = new Audio('carnival_assets/SG_C_headshot.wav');
        headshotaudio.play();
      }
      else if (audioActive) {
        let hitaudio = new Audio('carnival_assets/SG_C_hit.wav');
        hitaudio.play();
      }
      let floatingScore = document.createElement('div')
      floatingScore.setAttribute('class', 'floatingScore')
      floatingScore.textContent = points
      document.body.appendChild(floatingScore)
      floatingScore.style.top = (pos2d.y - 30).toString() + 'px'
      floatingScore.style.left = (pos2d.x + 10).toString() + 'px'

      sparkMesh.position.x = item.point.x
      sparkMesh.position.y = item.point.y
      sparkMesh.position.z = item.point.z + 1

      setTimeout(() => {
        sparkMesh.position.x = 0
        sparkMesh.position.y = 0
        sparkMesh.position.z = 0
      }, 200)
      setTimeout(() => {
        floatingScore.remove()
      }, 1000)
      // targetLocations[keyName].active = false
      targetLocations[keyName].alreadyShot = true
      let { heldScore, multiplier, score } = _this.state
      if (multiplier >= 1) {
        _this.setState({
          previousHeldScore: heldScore,
          previousMultiplier: multiplier,
          heldScore: heldScore + points,
          multiplier: multiplier + 1
        })
      } else {
        _this.setState({
          previousMultiplier: multiplier,
          multiplier: multiplier + 1,
          previousScore: score,
          score: score + points
        })
        _this.props.updateStateGame({ score: score + points, nickname: _this.state.username });
      }

    }

    function setBulletImages(bullets) {
      document.getElementById(`bullet${bullets}`).src = "carnival_assets/bullet_empty.png";
    }

    function getScreenPosition(position) {
      var vector = new THREE.Vector3(position.x, position.y, position.z);
      var canvas = renderer.domElement
      let boundingRect = canvas.getBoundingClientRect()

      // world to view and view to NDC
      vector.project(camera);

      // NDC to pixel
      vector.x = Math.round((vector.x + 1) * containerDiv.offsetWidth / 2);
      vector.y = Math.round((- vector.y + 1) * containerDiv.offsetHeight / 2);
      vector.x += boundingRect.left
      vector.y += boundingRect.top
      return vector;
    }


    _this.reload = (event) => {
      bullets = 10
      for (let i = 1; i <= 9; i++) {
        document.getElementById(`bullet${i}`).src = "carnival_assets/bullet_full.png";
      }
      if (audioActive) {
        let reloadaudio = new Audio('carnival_assets/SG_C_reload.wav');
        reloadaudio.play();
        // document.getElementById("reloadAudio").play()
      }

      if (event.targetTouches) {
        let { multiplier, heldScore } = this.state
        let currentScore = this.state.score
        this.setState({
          previousScore: currentScore,
          score: currentScore + (heldScore * multiplier),
          previousMultiplier: 0,
          previousHeldScore: 0,
          multiplier: 0,
          heldScore: 0
        })
        _this.props.updateStateGame({ score: currentScore + (heldScore * multiplier), nickname: _this.state.username });
      }

      let oom = document.getElementById("outOfAmmo")
      oom.style.display = "none"
    }

    _this.audioToggle = (event) => {
      event.preventDefault()
      audioActive = !audioActive
      this.setState({ audioActive })
      if (audioActive) {
        ga('send', 'event', 'Game', 'user_audio_on', 'audio_on');
        document.getElementById("audioToggle").src = "carnival_assets/sound_on.png"
        return
      }
      document.getElementById("audioToggle").src = "carnival_assets/sound_off.png"
    }

    _this.cursorMouseMove = (event) => {

      if ((event.offsetX)&&(event.offsetY)) {
        let customCursor = document.getElementById('customCursor')
        customCursor.style.left = (event.clientX - 50).toString() + 'px';
        customCursor.style.top = (event.clientY - 50).toString() + 'px';
      } else if (event.targetTouches) {
        let customCursor = document.getElementById('customCursor')
        customCursor.style.left = (event.targetTouches[0].clientX - 50).toString() + 'px';
        customCursor.style.top = (event.targetTouches[0].clientY - 50).toString() + 'px';
      }
    }

    _this.windowClick = (event) => {
      this.setState({ clicks: this.state.clicks + 1})
      if (_this.state.countdown > 0) return
      var mouse = { x: 0, y: 0 }

      if (bullets <= 0) {
        if (audioActive) {
          let oomaudio = new Audio('carnival_assets/SG_C_outofammo.wav');
          oomaudio.play();
        }
        let oom = document.getElementById("outOfAmmo")
        oom.style.display = "block"
        return
      }
      if (bullets <= 9) setBulletImages(bullets) // work around for false fire
      bullets--

      let canvas = document.querySelector('canvas');

      if ((event.offsetX)&&(event.offsetY)) {
        mouse.x = (event.offsetX / canvas.clientWidth) * 2 - 1; // to offset custom cursor size + 0.05
        mouse.y = -(event.offsetY / canvas.clientHeight) * 2 + 1; // to offset custom cursor size - 0.04
      } else if (event.targetTouches) {
        mouse.x = ((event.targetTouches[0].clientX - canvas.offsetLeft) / canvas.clientWidth) * 2 - 1; // to offset custom cursor size + 0.05
        mouse.y = -(event.targetTouches[0].clientY / canvas.clientHeight) * 2 + 1; // to offset custom cursor size - 0.04
      }

      raycaster.setFromCamera(mouse, camera);

      var intersects = raycaster.intersectObjects(targetMeshes);

      let didHit = false;
      for (var i = 0; i < intersects.length; i++) {
        if (intersects[i]) {
          didHit = true;
          scoreAndDestroy(intersects[i])
        }
      }

      if (!didHit) {
        let { multiplier, heldScore } = this.state
        let currentScore = this.state.score
        this.setState({
          previousScore: currentScore,
          score: currentScore + (heldScore * multiplier),
          previousMultiplier: 0,
          previousHeldScore: 0,
          multiplier: 0,
          heldScore: 0
        })
        _this.props.updateStateGame({ score: currentScore + (heldScore * multiplier), nickname: _this.state.username });
      }

      if (audioActive && !didHit) {
        let missaudio = new Audio('carnival_assets/SG_C_miss.wav');
        missaudio.play();
      }
    }


    this.state.isMobile ? document.getElementById("bulletContainer").addEventListener("touchstart", _this.reload) : document.getElementById("bulletContainer").addEventListener("click", _this.reload);
    document.getElementById("audioToggle").addEventListener("click", _this.audioToggle)
    window.addEventListener('mousemove', _this.cursorMouseMove)
    this.state.isMobile ? document.querySelector('canvas').addEventListener("touchstart", _this.windowClick) : window.addEventListener("click", _this.windowClick);

    setTimeout(() => {
      
      this.setState({
        loading: false
      })
    }, 1000)
  }

  componentWillUnmount() {
    this.state.isMobile ? document.querySelector('canvas').removeEventListener("touchstart", this.windowClick) : window.removeEventListener("click", this.windowClick);
    window.removeEventListener('mousemove', this.cursorMouseMove)
    this.state.isMobile ? document.getElementById("bulletContainer").addEventListener("touchstart", this.reload) : document.getElementById("bulletContainer").addEventListener("click", this.reload);
    document.getElementById("audioToggle").removeEventListener('click', this.audioToggle)
    clearInterval(this.secondsLeftInterval)
    if (this.startTimeInterval) clearInterval(this.startTimeInterval)
    let username = this.state.username
    if (!this.state.submittedUsername) username = null
    let { multiplier, heldScore, score } = this.state
    if (heldScore > 0) {
      score += heldScore * multiplier
    }
  }

  saveUsername() {
    this.setState({ countdown: 0 })
  }

  render() {

    return (
      <div
        onDoubleClick={(e) => e.preventDefault()}
        // id="containerDiv" ref={ref => (this.containerDiv = ref)} style={{ height: "80vh", width: "40vh" }}>
        id="containerDiv" ref={ref => (this.containerDiv = ref)}>
        <div id="bulletContainer">
          <div className="indi-bullet-container">
            <img id="bullet1" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet2" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet3" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet4" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet5" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet6" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet7" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet8" src="carnival_assets/bullet_full.png" className="bullet" />
            <img id="bullet9" src="carnival_assets/bullet_full.png" className="bullet" />
          </div>
          <p className="bullet-text">
            Tap to Reload
          </p>
        </div>
        <div id="scoreContainer" style={{ alignItems: 'flex-start' }}>
          <div className="time-container">
            <img id="audioToggle" src="carnival_assets/sound_off.png" className="icon-set" />
            <p style={{ color: 'white', fontSize: '0.8rem' }}>SOUND {this.state.audioActive ? 'ON' : 'OFF'}</p>
          </div>
          <div className="time-container">
            {/* <p className="time-text">TIME</p>
            <p id="timeText" className="time-numbers">{this.state.secondsLeft}</p> */}
          </div>
          <div className="score-container">
            <p id="scoreHead" className="score-text">SCORE</p>
            <CountUp id="scoreText" className="score-numbers" end={this.state.score} start={this.state.previousScore}/>
            {
              this.state.multiplier > 1 ?
                <div className="multiplier-score-container">
                  <p className="score-numbers multiplier-text">{this.state.multiplier}x{this.state.heldScore}</p>
                  <p className="score-numbers multiplier-text" style={{ fontSize: '1rem' }}>MULTIPLIER!</p>
                </div>
                :
                <div />
            }

          </div>
        </div>
        <div id="smallLogoContainer">
          <img id="smallLogo" src="assets_full/logo300.png" />
        </div>


        <p id="outOfAmmo">OUT OF AMMO</p>
        <img src="assets_full/cursor.png" id="customCursor" />
        {this.state.countdown > 0 ?
          <div>
            <div className="countdown-overlay">
              {/*
              <div id="audioPrompt" className="sound-on-prompt loop-left">
                <img className="audio-arrow-left" src="carnival_assets/left-black-arrow.png" />
                <p id="audioText" className="score-text">TURN SOUND ON</p>
              </div>
              */}
              <p style={{ marginTop: '20%' }} className="middle-size-text">TURN SOUND ON?</p>
              {
                this.state.audioActive ?
                  <div id="audioPrompt" className="audio-button-container">
                    <img
                      className="audio-button-rectangle"
                      src="carnival_assets/btn_yes_selected.png"
                    />
                    <img
                      className="audio-button-rectangle"
                      src="carnival_assets/btn_no_idle.png"
                      onMouseEnter={e => (e.currentTarget.src = "carnival_assets/btn_no_hover.png")}
                      onMouseLeave={e => (e.currentTarget.src = "carnival_assets/btn_no_idle.png")}
                      onClick={(e) => this.audioToggle(e)}
                    />
                  </div>
                  :
                  <div id="audioPrompt" className="audio-button-container">
                    <img
                      className="audio-button-rectangle"
                      src="carnival_assets/btn_yes_idle.png"
                      onMouseEnter={e => (e.currentTarget.src = "carnival_assets/btn_yes_hover.png")}
                      onMouseLeave={e => (e.currentTarget.src = "carnival_assets/btn_yes_idle.png")}
                      onClick={(e) => this.audioToggle(e)}
                    />
                    <img
                      className="audio-button-rectangle"
                      src="carnival_assets/btn_no_selected.png"
                    />
                  </div>
              }
              {!this.state.submittedUsername ?
                <div id="usernameContainer">
                  <button id="submitNameButton" onClick={() => this.saveUsername()}>START</button>
                </div>
                :
                <div />
              }
            </div>
            <div className="countdown-overlay-background">

            </div>
          </div>
          :
          null
        }
        {
          this.state.loading ?
            <div className="countdown-overlay black-overlay">
              <div className="loader-container">
                <div className="loader">LOADING...</div>
              </div>
            </div>
            :
            null
        }
      </div>

    )
  }
}
