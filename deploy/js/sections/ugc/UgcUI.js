var UgcUI = function (shared) {

  var _this = this;

  var ANIMAL_CONTAINER_HEIGHT = 165;
  var SIZE_SMALL = 1;
  var SIZE_MED = 3;
  var SIZE_LARGE = 5;

  var numAnimals = 10; // TODO
  var animalSlideTarget = 0;
  var animalSlide = 0;

  var css = getCSS();

  var svgLeftContents = getSvgLeftContents();

  var domElement = document.createElement('div');

  var styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(styleSheet);

  domElement.innerHTML = svgLeftContents;
  var svgLeft = domElement.firstChild;

  var tooltip = document.createElement('div');
  tooltip.style.position = 'fixed';
  tooltip.style.font = '12px/0px FuturaBT-Medium';
  tooltip.style.padding = '13px 7px 10px 7px';
  tooltip.style.display = 'none';
  tooltip.style.backgroundColor = '#fff';
  tooltip.style.boxShadow = '-1px 1px 0px rgba(0,0,0,0.4)';
  tooltip.style.textTransform = 'uppercase';
  tooltip.style.color = '#000';
  tooltip.innerHTML = 'CREATE';

  domElement.appendChild(tooltip);

  var animalContainerDiv = classedElement('div', 'animal-container');
  animalContainerDiv.setAttribute('id', 'animal-container');
  animalContainerDiv.style.overflow = 'hidden';
  animalContainerDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
  animalContainerDiv.style.width = '100%';
  animalContainerDiv.style.height = ANIMAL_CONTAINER_HEIGHT + 'px';
  animalContainerDiv.style.position = 'fixed';
  animalContainerDiv.style.top = '100%';
  animalContainerDiv.style.left = 0;
  animalContainerDiv.style.marginTop = -ANIMAL_CONTAINER_HEIGHT + 'px';

  var animalInnerDiv = classedElement('div', 'animal-inner');
  var animalInnerDivWidth = ((numAnimals) * 220);
  animalInnerDiv.style.padding = '10px';
  animalInnerDiv.style.width = animalInnerDivWidth + 'px';
  animalInnerDiv.style.height = '100%';
  animalInnerDiv.style.position = 'absolute';
  animalContainerDiv.appendChild(animalInnerDiv);

  for (var i = 0; i < numAnimals; i++) {
    animalInnerDiv.appendChild(makeAnimalDiv());
  }

  domElement.appendChild(animalContainerDiv);

  this.updateCapacity = function (i) {
    document.getElementById('capacity').textContent = ( Math.round(i * 100) + '%' );
  };

  this.addListeners = function() {

    // Make the tooltip follow
    domElement.addEventListener('mousemove', function(e) {
      tooltip.style.top = e.pageY - 40 + 'px';
      tooltip.style.left = e.pageX + 20 + 'px';
    }, true);

    // Scroll the animal container div
    animalContainerDiv.addEventListener('mousemove', function(e) {
      var padding = window.innerWidth / 5;
      animalSlideTarget = -((e.pageX - padding / 2) / (window.innerWidth - padding)) * (animalInnerDivWidth - window.innerWidth);
    });

//    animalContainerDiv.addEventListener('mouseover', function() {
//      shared.ugcSignals.ui_mouseover.dispatch();
//    }, false);
//
//    svgLeft.addEventListener('mouseover', function() {
//      shared.ugcSignals.ui_mouseover.dispatch();
//    }, false);
//
//    animalContainerDiv.addEventListener('mouseout', function() {
//      shared.ugcSignals.ui_mouseout.dispatch();
//    }, false);
//
//    svgLeft.addEventListener('mouseout', function() {
//      shared.ugcSignals.ui_mouseout.dispatch();
//    }, false);

    var menus = svgLeft.getElementsByClassName('menu');

    /**
     * Hover behavior
     */

    for (var i = 0; i < menus.length; i++) {
      var open = makeOpenMenuFunction(menus[i]);
      menus[i].open = open;
      menus[i].addEventListener('click', open, false);
    }


    var named = document.getElementsByName('hover');
    for (var i = 0; i < named.length; i++) {
      named[i].addEventListener('mouseover', function() {
        tooltip.style.display = 'inline-block';
        tooltip.innerHTML = this.getAttribute('title');
      }, false);
      named[i].addEventListener('mouseout', function() {
        tooltip.style.display = 'none';
      }, false);
    }

    onClick('main', closeAnimals);

    onClick('animals', function() {
      document.getElementById('animal-container').style.opacity = 1;
    }, false);

    /**
     * Signal dispatching
     */

    onClick('smoother-up', function() {
      shared.ugcSignals.object_smoothup.dispatch();
    });

    onClick('smoother-down', function() {
      shared.ugcSignals.object_smoothdown.dispatch();
    });

    onClick('icon-size-small', function() {
      shared.ugcSignals.object_changesize.dispatch(SIZE_SMALL);
    });

    onClick('icon-size-med', function() {
      shared.ugcSignals.object_changesize.dispatch(SIZE_MED);
    });

    onClick('icon-size-large', function() {
      shared.ugcSignals.object_changesize.dispatch(SIZE_LARGE);
    });

    onClick('undo', function() {
      shared.ugcSignals.object_undo.dispatch();
      shared.ugcSignals.submit.dispatch(); // TODO Give this its own button
    });

    onClick('create', function() {
      shared.ugcSignals.object_createmode.dispatch();
    });

    onClick('erase', function() {
      shared.ugcSignals.object_erasemode.dispatch();
    });

    /**
     * Color dispatching
     */

      // TODO separate dispatch from response

    var colorOptions = document.getElementById('color').getElementsByClassName('options')[0].getElementsByTagName('polygon');
    for (var i = 0; i < colorOptions.length; i++) {

      onClick(colorOptions[i], function() {
        var hex = parseInt(this.getAttribute('fill').substr(1), 16);
        for (var j = 0; j < colorOptions.length; j++) {
          colorOptions[j].setAttribute('class', '');
        }
        this.setAttribute('class', 'selected');
        shared.ugcSignals.object_changecolor.dispatch(hex);

      });
    }

    onClick('life', function() {
      document.getElementById('life').setAttribute('class', 'active');
      document.getElementById('dark').setAttribute('class', '');
      // TODO
    });

    onClick('dark', function() {
      document.getElementById('dark').setAttribute('class', 'active');
      document.getElementById('life').setAttribute('class', '');
      // TODO
    });

    onClick('reflect', function(e) {
      //e.stopPropagation();
      //e.stopImmediatePropagation();
      if (this.getAttribute('class') == 'toggle') {
        this.setAttribute('class', 'toggle active');
        shared.ugcSignals.object_symmetrymode.dispatch(true);
      } else {
        this.setAttribute('class', 'toggle');
        shared.ugcSignals.object_symmetrymode.dispatch(false);
      }
    });

    /**
     * Signal response
     */

    shared.ugcSignals.object_changesize.add(function(size) {
      findBG('icon-size-small').setAttribute('class', 'bg');
      findBG('icon-size-med').setAttribute('class', 'bg');
      findBG('icon-size-large').setAttribute('class', 'bg');
      switch (size) {
        case SIZE_SMALL:
          findBG('icon-size-small').setAttribute('class', 'active bg');
          break;
        case SIZE_MED:
          findBG('icon-size-med').setAttribute('class', 'active bg');
          break;
        case SIZE_LARGE:
          findBG('icon-size-large').setAttribute('class', 'active bg');
          break;
      }
    });

    shared.ugcSignals.object_erasemode.add(function() {
      document.getElementById('erase').setAttribute('class', 'active');
      document.getElementById('create').setAttribute('class', '');
    })

    shared.ugcSignals.object_createmode.add(function() {
      document.getElementById('create').setAttribute('class', 'active');
      document.getElementById('erase').setAttribute('class', '');
    });

  };

  this.scale = function(s) {
    svgLeft.firstChild.setAttribute('transform', 'translate(10, 0) scale(' + s + ')');
  };

  this.update = function() {
    animalSlide += (animalSlideTarget - animalSlide) * 0.5;
    animalInnerDiv.style.left = Math.round(animalSlide) + 'px';
  };

  this.getDomElement = function () {
    return domElement;
  };

  function closeAnimals() {
    document.getElementById('animal-container').style.opacity = 0;
  }

  function closeAllMenus() {
    var menus = svgLeft.getElementsByClassName('menu');
    for (var i = 0; i < menus.length; i++) {
      showHideMenuButtons(menus[i], false);
    }
  }

  function makeOpenMenuFunction(menu) {
    return function() {
      closeAllMenus();
      showHideMenuButtons(menu, true);
    };
  }

  function showHideMenuButtons(menu, show) {
    var buttons = menu.getElementsByClassName('menu-buttons');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].style.display = show ? 'block' : 'none';
    }
  }

  function classedElement(nodeType, clazz) {
    var div = document.createElement(nodeType);
    div.setAttribute('class', clazz);
    return div;
  }

  function onClick(id, fnc, stopPropagation) {
    stopPropagation = stopPropagation || true;
    var elem;
    if (typeof id == 'string') {
      elem = document.getElementById(id);
    } else {
      elem = id;
    }
    if (stopPropagation) {
      elem.addEventListener('mousedown', function(e) {
        // better safe than sorry ....
        e.stopPropagation();
        e.stopImmediatePropagation();
      }, false);
    }
    elem.addEventListener('mouseup', function(e) {
      if (stopPropagation) {
        // better safe than sorry ....
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      fnc.call(elem);
    }, false);
  }

  function findBG(containerId) {
    var c = document.getElementById(containerId);
    return c.getElementsByClassName('bg')[0];
  }

  function makeAnimalDiv() {

    var div = classedElement('div', 'animal');
    var img = classedElement('img', 'animal-thumb');
    img.src = '/files/soupthumbs/test.png';
    img.style.position = 'absolute';

    var controls = classedElement('div', 'animal-controls');

    var count = classedElement('div', 'animal-count');
    count.style.font = '12px/22px FuturaBT-Bold';
    count.innerHTML = '0';

    var add = classedElement('div', 'animal-add');
    add.style.font = '12px/22px FuturaBT-Bold';
    add.innerHTML = '+';

    var remove = classedElement('div', 'animal-remove');
    remove.style.font = '12px/22px FuturaBT-Bold';
    remove.innerHTML = '-';

    div.appendChild(img);
    controls.appendChild(remove);
    controls.appendChild(count);
    controls.appendChild(add);
    div.appendChild(controls);

    return div;

  }

  function getSvgLeftContents() {
    return [
      '<svg class="ugcui" ',
      '		version="1.1"',
      '     xmlns="http://www.w3.org/2000/svg"',
      '     xmlns:xlink="http://www.w3.org/1999/xlink"',
      '     xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"',
      '  	 width="800px" ',
      '  	 height="2000px"',
      '     xml:space="preserve"><g>',
      '<g id="main" class="menu">',

      '<polygon class="hex main" fill="#282828"',
      '         points="13.128,45.47 0.002,22.735 13.128,0 39.379,0 52.505,22.735 39.379,45.47 "></polygon>',

      '<polygon fill="#ED957A"',
      '         points="26.747,35.233 15.912,28.403 15.912,15.66 26.747,22.488 	"></polygon>',
      '<polygon fill="#EA7B59"',
      '         points="37.583,15.66 26.747,22.49 26.747,35.233 37.583,28.405 	"></polygon>',
      '<polygon fill="#F15C22"',
      '         points="15.912,15.66 26.75,22.49 37.583,15.66 26.75,9.119 	"></polygon>',

      '<polygon opacity="0" class="hitbox" points="140.184,',
      '    72.916 126.007,48.362 98.374,48.362 84.558,24.432 56.924,24.432',
      '	43.107,0.5 14.756,0.5 0.58,25.054 14.397,48.985 0.58,72.917 14.397,96.847 0.58,120.779 14.756,145.332 42.389,145.332',
      '	56.206,169.263 84.556,169.263 98.373,145.332 126.007,145.332 140.184,120.778 126.366,96.847 "></polygon>',

      '<g class="menu-buttons">',

      '<g id="reflect" name="hover" title="mirror mode" class="toggle">',

      '  <polygon class="hex" fill="rgba(255, 255, 255,',
      '      0.4)" points="13.128,',
      '      93.332 0.002,70.598 13.128,47.862 39.379,47.862 52.505,70.598',
      '39.379,93.332 "></polygon>',


      '<path fill="#404040" d="M26.031,77.49c-0.428,0-0.771,0.345-0.771,0.771v1.158c0,0.428,0.343,0.772,0.771,0.772',
      's0.771-0.345,0.771-0.772v-1.158C26.802,77.835,26.459,77.49,26.031,77.49 M26.031,74.017c-0.428,0-0.771,0.344-0.771,0.771v1.158',
      'c0,0.425,0.343,0.771,0.771,0.771s0.771-0.346,0.771-0.771v-1.158C26.802,74.361,26.459,74.017,26.031,74.017 M20.066,64.992',
      'l-4.149-4.594c-0.238-0.262-0.61-0.351-0.939-0.224c-0.327,0.125-0.545,0.441-0.545,0.794v9.187v9.188',
      'c0,0.351,0.218,0.667,0.545,0.793c0.1,0.039,0.203,0.057,0.306,0.057c0.235,0,0.467-0.098,0.633-0.28l4.149-4.594l4.149-4.593',
      'c0.293-0.324,0.293-0.817,0-1.142L20.066,64.992z M18.804,74.178l-2.667,2.952v-6.976v-6.976l2.667,2.955l3.632,4.021L18.804,74.178',
      'z M27.847,69.584c-0.292,0.324-0.292,0.817,0,1.142l4.149,4.593l4.149,4.594c0.165,0.183,0.397,0.28,0.633,0.28',
      'c0.103,0,0.205-0.018,0.306-0.057c0.327-0.126,0.544-0.442,0.544-0.793v-9.188v-9.187c0-0.353-0.216-0.669-0.544-0.794',
      'c-0.33-0.127-0.702-0.038-0.938,0.224l-4.149,4.594L27.847,69.584z M29.626,70.154l3.634-4.021l2.667-2.955v6.976v6.976',
      'l-2.667-2.952L29.626,70.154z M26.031,70.541c-0.428,0-0.771,0.345-0.771,0.772v1.159c0,0.427,0.343,0.772,0.771,0.772',
      's0.771-0.345,0.771-0.772v-1.159C26.802,70.886,26.459,70.541,26.031,70.541 M26.031,60.118c-0.428,0-0.771,0.346-0.771,0.772v1.158',
      'c0,0.427,0.343,0.773,0.771,0.773s0.771-0.347,0.771-0.773V60.89C26.802,60.464,26.459,60.118,26.031,60.118 M26.031,63.593',
      'c-0.428,0-0.771,0.345-0.771,0.772v1.158c0,0.428,0.343,0.771,0.771,0.771s0.771-0.343,0.771-0.771v-1.158',
      'C26.802,63.938,26.459,63.593,26.031,63.593 M26.031,67.066c-0.428,0-0.771,0.346-0.771,0.772v1.158',
      'c0,0.426,0.343,0.772,0.771,0.772s0.771-0.346,0.771-0.772v-1.158C26.802,67.412,26.459,67.066,26.031,67.066"></path>',
      '</g>',

      '<g id="create" name="hover" title="draw"  class="active">',
      '  <polygon class="hex" fill="rgba(255, 255, 255,',
      '      0.4)" points="54.578,',
      '      69.401 41.452,46.666 54.578,23.932 80.83,23.932 93.956,46.666',
      '	80.829,69.401 "></polygon>',

      '	<path fill="#404040" d="M67.756,32.3l-12.121,7.29l-0.154-0.098v13.47l12.256,7.661l12.258-7.661V40.317L67.756,32.3z',
      '		 M67.719,34.201l9.991,6.543l-9.978,6.405l-10.564-6.602L67.719,34.201z M57.091,42.398l9.842,6.151v9.673l-9.842-6.151V42.398z',
      '		 M78.384,52.071l-9.842,6.15v-9.679l9.842-6.318V52.071z"></path>',
      '</g>',

      '<g id="erase" name="hover" title="erase" >',

      '  <polygon class="hex" fill="rgba(255, 255, 255, 0.4)" points="96.028,',
      '  93.332 82.902,',
      '  70.598 96.028,47.862 122.279,47.862 135.406,70.597',
      '	122.279,93.332 "></polygon>',
      '	<path fill="#404040" d="M111.564,61.336l-13.493,7.131v5.163l9.462,5.387l13.086-7.798V66.25L111.564,61.336z M113.314,69.774',
      '		l-5.788,3.394l-7.658-4.416l6.083-3.215L113.314,69.774z M108.074,74.114l5.928-3.477v3.252l-5.928,3.534V74.114z M99.164,69.608',
      '		l7.817,4.509v3.328l-7.817-4.45V69.608z"></path>',
      '</g>',

      '<g id="undo" name="hover" title="undo" >',
      '  <polygon class="hex" fill="rgba(255, 255, 255, 0.4)" points="54.578,',
      '  117.263 41.452,',
      '  94.528 54.578,71.794 80.829,71.794 93.955,94.528',
      '	80.829,117.263 "></polygon>',
      '	<path fill="#404040" d="M66.79,84.794v-0.083v-0.826c0-0.561-0.399-0.79-0.885-0.51l-0.716,0.414',
      '		c-0.485,0.281-1.281,0.738-1.768,1.021l-0.714,0.413c-0.486,0.281-0.486,0.739,0,1.02l0.714,0.414',
      '		c0.487,0.281,1.283,0.741,1.768,1.02l0.716,0.415c0.486,0.28,0.885,0.051,0.885-0.509v-0.827v-0.152',
      '		c4.616,0.128,8.316,3.893,8.325,8.539c-0.008,4.722-3.829,8.542-8.551,8.549v0.001v-0.001c-0.414,0-0.822-0.027-1.219-0.084',
      '		c-0.491-0.071-0.947,0.272-1.016,0.763c-0.07,0.493,0.271,0.948,0.762,1.017c0.482,0.07,0.974,0.104,1.473,0.105v0.001',
      '		c5.717-0.002,10.351-4.635,10.352-10.352C76.914,89.499,72.401,84.916,66.79,84.794"></path>',
      '</g>',

      '<g class="folder" id="size">',

      '  <polygon opacity="0" class="folder-hitbox" fill="#FFFFFF"',
      '           stroke="#000000"',
      '           points="126.366,',
      '144.709 140.184,120.778 126.007,96.225 97.656,96.225 83.48,120.779',
      '	97.297,144.71 83.48,168.642 97.297,192.572 83.479,216.504 97.655,241.057 126.006,241.057 140.182,216.504 126.366,192.573',
      '	140.183,168.642 "></polygon>',

      '  <g class="size" name="hover" title="1 x 1"  id="icon-size-small">',
      '    <g>',
      '      <polygon class="active bg" fill="rgba(255, 255, 255, 0.4)" points="96.028,',
      '  141.194 82.902,',
      '  118.46 96.028,95.725 122.279,95.725 135.406,118.459',
      '	122.279,141.194 "></polygon>',

      '	<path fill="#404040" d="M114.923,113.88v-6.316l-6.006-3.258l-6.285,3.118v6.456l-12.364,7.334l18.509,11.5l18.509-11.5',
      '		L114.923,113.88z M103.259,121.247l5.477-3.378l5.539,3.391l-5.497,3.367L103.259,121.247z M108.257,124.945l-5.517,3.378',
      '		l-5.457-3.391l5.457-3.367L108.257,124.945z M111.739,116.016l2.936-1.65l5.515,3.272l-5.395,3.304l-5.541-3.393L111.739,116.016z',
      '		 M102.949,114.324l5.266,3.226l-5.476,3.378l-5.374-3.29L102.949,114.324z M114.795,121.579l5.477,3.354l-5.457,3.39l-5.517-3.378',
      '		L114.795,121.579z M115.316,121.26l5.403-3.309l5.52,3.274l-5.45,3.386L115.316,121.26z M96.836,117.951l5.384,3.297l-5.454,3.364',
      '		l-5.45-3.386L96.836,117.951z M103.258,128.646l5.521-3.381l5.52,3.38l-5.52,3.43L103.258,128.646z"></path>',
      '    </g>',
      '  </g>',

      '  <g class="options">',

      '    <g class="size" name="hover" title="3 x 3" id="icon-size-med">',
      '      <!-- Hex -->',
      '      <polygon class="bg" fill="rgba(255, 255, 255, 0.4)"',
      '               points="96.028,189.057 82.902,166.323 96.028,143.588 122.28,143.588 135.405,166.323 122.279,189.057 "></polygon>',

      '      <!-- Med icon -->				<path fill="#404040" d="M117.967,164.776v-9.757l-8.837-4.797l-9.248,4.927v9.452l-9.613,5.704l18.509,11.5l18.509-11.5',
      '								L117.967,164.776z M103.258,170.335l2.864-1.765l2.803,1.666l2.609-1.564l2.74,1.678l-5.496,3.367L103.258,170.335z',
      '								 M108.257,174.035l-5.517,3.378l-5.459-3.391l5.458-3.367L108.257,174.035z M117.472,165.114l2.718,1.612l-5.395,3.305l-2.734-1.674',
      '								L117.472,165.114z M105.594,168.255l-2.856,1.761l-5.373-3.291l2.832-1.68L105.594,168.255z M114.795,170.668l5.478,3.354',
      '								l-5.458,3.391l-5.517-3.378L114.795,170.668z M115.315,170.349l5.404-3.31l5.52,3.276l-5.45,3.386L115.315,170.349z M96.836,167.04',
      '								l5.383,3.297l-5.454,3.364l-5.449-3.385L96.836,167.04z M103.258,177.734l5.52-3.381l5.519,3.381l-5.519,3.43L103.258,177.734z"></path>',
      '    </g>',

      '    <g class="size" name="hover" title="5 x 5" id="icon-size-large">',
      '      <!-- Hex -->',
      '      <polygon class="bg" fill="rgba(255, 255, 255, 0.4)"',
      '               points="96.027,236.919 82.901,214.186 96.027,191.451 122.279,191.451 135.404,214.186 122.278,236.919 "></polygon>',
      '      <!-- Big icon -->',
      '      <path fill="#404040" d="M120.976,215.299v-13.17l-11.994-5.938l-12.195,6.058v12.926l-6.519,3.868l18.509,11.499l18.509-11.499',
      '				L120.976,215.299z M108.257,222.772l-5.517,3.379l-5.459-3.392l5.458-3.365L108.257,222.772z M114.795,219.406l5.478,3.354',
      '				l-5.458,3.392l-5.517-3.379L114.795,219.406z M115.315,219.087l5.404-3.31l5.52,3.275l-5.45,3.387L115.315,219.087z M96.836,215.777',
      '				l5.383,3.299l-5.454,3.363l-5.449-3.387L96.836,215.777z M103.258,226.473l5.52-3.382l5.519,3.382l-5.519,3.43L103.258,226.473z"></path>',
      '    </g>',

      '  </g>',

      '</g>',

      '<g class="folder"   id="smoother">',
      '  <polygon opacity="0" class="folder-hitbox" fill="#FFFFFF"',
      '           stroke="#000000"',
      '           points="84.916,',
      '168.64 98.732,',
      '144.71 84.556,120.157 56.206,120.157 42.029,144.71',
      '	55.847,168.641 42.029,192.573 55.846,216.503 42.029,240.435 56.206,264.988 84.556,264.988 98.732,240.435 84.916,216.503',
      '	98.732,192.573 "></polygon>',
      '<g name="hover" title="smooth">  <!--hex -->',
      '  <polygon class="hex" fill="rgba(255, 255, 255, 0.4)" points="54.578,',
      '  165.125 41.452,',
      '  142.391 54.578,119.657 80.829,119.657 93.955,142.391',
      '	80.829,165.125 "></polygon>',

      '  <!--icon-->',
      '  <polygon fill="#575759"',
      '           points="68.279,159.028 62.1,155.134 62.1,147.868 68.279,151.761 	"></polygon>',
      '  <polygon fill="#3A3A3A"',
      '           points="74.458,147.868 68.279,151.762 68.279,159.028 74.458,155.135 	"></polygon>',
      '  <polygon fill="#282828"',
      '           points="62.1,147.868 68.28,151.762 74.458,147.868 68.28,144.138 	"></polygon>',
      '  <circle fill="#575759" cx="68.167" cy="134.167" r="5"></circle></g>',


      '  <g class="options">',

      '    <g id="smoother-up">',
      '      <polygon class="bg" fill="rgba(255, 255, 255, 0.4)"',
      '               points="54.578,212.988 41.452,190.254 54.578,167.519 80.829,167.519 93.955,190.254 80.829,212.988 "></polygon>',
      '							<polygon fill="#404040" points="74.25,189.179 69.071,189.179 69.071,184 66.929,184 66.929,189.179 61.75,189.179 61.75,191.321 ',
      '								66.929,191.321 66.929,196.5 69.071,196.5 69.071,191.321 74.25,191.321 "></polygon>',
      '    </g>',

      '    <g id="smoother-down">',
      '      <polygon class="bg" fill="rgba(255, 255, 255, 0.4)"',
      '               points="54.578,260.85 41.452,238.116 54.578,215.381 80.829,215.381 93.955,238.116 80.829,260.85 "></polygon>',
      '						<rect x="61.75" y="236.5" fill="#404040" width="12.5" height="2.143"></rect>',
      '    </g>',
      '  </g>',

      '</g>',

      '<g class="folder" id="color">',

      '<polygon class="hex" fill="rgba(255, 255, 255, 0.4)" points="13.128,',
      '  141.194 0.002,',
      '  118.46 13.128,95.725 39.379,95.725 52.505,118.46',
      '	39.379,141.194 "></polygon>',

      '  <!-- Paint Bucket --><path fill="#404040" d="M38.662,114.453c-2.85-3.684-8.097-1.808-8.097-1.808s3.946,3.913,5.455,5.42',
      '		c1.633,1.633,2.081,10.199,3.058,8.201C40.606,123.139,40.855,117.29,38.662,114.453 M27.774,110.481v2.259l6.309,6.309',
      '		L24.01,129.12l-8.699-8.697l10.074-10.073l0.27,0.271v-2.149c-0.084-0.031-0.176-0.049-0.27-0.049c-0.213,0-0.414,0.082-0.565,0.233',
      '		l-11.202,11.204c-0.312,0.311-0.312,0.817,0,1.129l9.827,9.828c0.152,0.151,0.352,0.235,0.565,0.235',
      '		c0.211,0,0.413-0.084,0.565-0.235l11.202-11.203c0.151-0.152,0.235-0.353,0.235-0.565c0-0.214-0.084-0.413-0.236-0.563',
      '		L27.774,110.481z M18.961,107.69c0.001-0.733,0.593-1.325,1.324-1.326h4.543c0.729,0.001,1.322,0.593,1.323,1.324v8.447',
      '		c-0.212,0.081-0.41,0.205-0.579,0.374c-0.321,0.32-0.485,0.748-0.483,1.17c-0.001,0.421,0.163,0.85,0.484,1.172',
      '		c0.322,0.323,0.749,0.487,1.173,0.485h0.004c0.419,0,0.844-0.162,1.167-0.484l-0.396-0.397l0.398,0.396',
      '		c0.321-0.322,0.484-0.75,0.484-1.172s-0.163-0.85-0.485-1.171c-0.186-0.186-0.407-0.313-0.642-0.391v-8.429',
      '		c0-1.353-1.095-2.449-2.448-2.449h-4.543c-1.353,0-2.45,1.096-2.45,2.451v7.208l1.126-1.126V107.69z M26.369,117.305',
      '		c0.107-0.107,0.239-0.156,0.378-0.158c0.137,0.001,0.271,0.051,0.374,0.156c0.107,0.106,0.155,0.239,0.155,0.376',
      '		c0,0.136-0.049,0.271-0.155,0.378c-0.104,0.104-0.239,0.153-0.374,0.153c-0.139,0-0.272-0.051-0.377-0.154',
      '		c-0.104-0.105-0.155-0.24-0.155-0.377C26.216,117.541,26.266,117.409,26.369,117.305"></path>',
      ' <polygon opacity="0" class="folder-hitbox" fill="#FFFFFF"',
      '           stroke="#000000"',
      '           points="140.182,',
      '        216.504 126.007,',
      '191.951 98.373,191.951 84.557,168.019 56.923,168.019',
      '	43.466,144.709 57.283,120.779 43.107,96.225 14.756,96.225 0.58,120.779 14.396,144.709 0.579,168.642 14.396,192.572',
      '	0.579,216.505 14.396,240.435 0.578,264.368 14.395,288.298 0.578,312.232 14.754,336.784 43.104,336.784 56.924,312.85',
      '	84.557,312.85 98.373,288.919 126.006,288.919 140.182,264.367 126.365,240.434 "></polygon>',
      '  <g class="options">',
      '    <polygon fill="#80C5D8"',
      '             points="54.578,212.988 41.452,190.254 54.578,167.519 80.829,167.519 93.955,190.254 80.829,212.988 	"></polygon>',

      '    <polygon fill="#2EA8CE" points="96.027,236.919 82.901,214.186 96.027,191.451 122.279,191.451 135.404,214.186 122.278,236.919',
      '		"></polygon>',

      '    <polygon fill="#3F2249" points="96.027,284.782 82.901,262.048 96.027,239.313 122.279,239.313 135.404,262.048 122.278,284.782',
      '		"></polygon>',

      '    <polygon fill="#EF7B1B"',
      '             points="54.578,260.85 41.452,238.116 54.578,215.381 80.829,215.381 93.955,238.116 80.829,260.85 	"></polygon>',

      '    <polygon fill="#FF066C"',
      '             points="54.578,308.713 41.452,285.979 54.578,263.244 80.829,263.244 93.954,285.979 80.829,308.713 	"></polygon>',

      '    <polygon fill="#FFF200"',
      '             points="13.126,332.646 0,309.913 13.126,287.176 39.377,287.176 52.503,309.913 39.377,332.646 	"></polygon>',

      '    <polygon id="white" class="selected" fill="#FFFFFF"',
      '             points="13.127,189.057 0.001,166.323 13.127,143.588 39.379,143.588 52.504,166.323 39.378,189.057 	"></polygon>',

      '    <polygon fill="#DBCE9A"',
      '             points="13.127,236.92 0.001,214.186 13.127,191.451 39.378,191.451 52.504,214.186 39.378,236.92 	"></polygon>',

      '    <polygon fill="#458C65"',
      '             points="13.126,284.783 0,262.049 13.126,239.313 39.378,239.313 52.503,262.049 39.377,284.783 	"></polygon>',
      '  </g>',
      '</g>',

      '</g>',

      '</g>',


      '<g id="animals" class="menu" transform="translate(0, -85)">',
      '  <polygon fill="#282828" points="13.128,508.477 0.002,485.742 13.128,',
      '  463.007 39.379,463.007 52.505,485.742',
      '  39.379,508.477 "></polygon>',

      '	<polygon fill="#F15C22" points="16.651,481.812 15.914,484.478 17.082,486.813 17.082,487.183 20.013,488.679 18.824,484.211 ',
      '		20.115,480.439 "></polygon>',
      '	<polygon fill="#F15C22" points="35.652,480.172 36.308,480.029 38.501,481.792 39.238,481.423 39.628,481.361 39.158,478.492 ',
      '		39.137,478.083 38.788,476.936 39.198,476.319 39.628,475.355 38.419,476.218 38.316,476.545 34.874,476.218 36.124,477.057 ',
      '		33.971,478.656 32.618,481.505 34.095,482.694 "></polygon>',
      '	<polygon fill="#CC481F" points="38.071,482.242 38.071,482.694 38.46,483.063 38.931,483.063 39.424,482.879 39.875,481.792 ',
      '		39.628,481.361 39.239,481.423 38.501,481.792 36.308,480.029 35.653,480.172 36.759,480.891 "></polygon>',
      '	<path fill="#EA7B59" d="M37.764,488.946l-0.677-1.107l-2.788-2.398H34.3l0.041-1.536l-0.246-1.21l-1.477-1.189l1.354-2.849',
      '		l2.152-1.6l-1.25-0.839l-2.726,1.394l-2.829,2.254l-2.768,1.148l-3.709-0.41l-2.726-0.164l-1.291,3.771l1.188,4.468l0.656,0.268',
      '		l0.758-1.292l2.009,0.287l0,0l3.812,0.737l4.284-1.496l2.972,1.087l1.619,0.677l0.84,0.573l2.356,2.726l0.411,0.021l0.144,0.47',
      '		v0.493l0.492,0.349h0.923l0.389-0.175L37.764,488.946z"></path>',
      '	<polygon fill="#F15C22" points="28.334,490.258 29.441,489.52 30.262,490.483 33.828,489.135 33.828,488.843 31.532,487.183 ',
      '		34.504,488.27 34.709,489.314 33.766,490.053 30.589,491.16 "></polygon>',
      '	<polygon fill="#CC481F" points="13.905,488.822 14.397,494.623 15.114,495.423 15.114,496.037 15.217,496.264 16.262,496.264 ',
      '		16.672,496.119 15.289,494.295 14.91,489.868 17.02,489.847 20.669,488.946 17.082,487.183 16.345,487.941 "></polygon>',
      '	<polygon fill="#F15C22" points="25.526,494.828 25.096,493.987 20.833,491.16 20.115,490.236 20.669,488.946 21.427,487.654 ',
      '		23.437,487.941 22.658,489.048 21.469,490.011 21.571,490.483 25.855,493.578 26.695,494.274 "></polygon>',
      '	<polygon fill="#F15C22" points="16.945,481.696 15.771,481.546 15.012,481.792 13.7,481.792 9.908,484.107 9.765,484.313 ',
      '		9.232,484.907 11.897,484.293 15.176,482.837 15.914,482.223 16.557,482.157 16.651,481.812 "></polygon>',


      '  <polygon opacity="0" class="hitbox" fill="#FFFFFF" stroke="#000000"',
      '           points="98.732,',
      '    464.13 84.556,',
      '  439.577 56.924,439.577 43.106,415.645 14.756,415.645',
      '  0.58,440.199 14.396,464.129 0.58,488.061 14.756,512.614 42.388,512.614 56.206,536.545 84.556,536.545 98.732,511.993',
      '  84.916,488.061 "></polygon>',

      '  <g class="menu-buttons">',

      '    <g class="active" name="hover" title="life"  id="life">',

      '      <polygon class="hex" fill="rgba(255, 255, 255, 0.4)" points="54.578,',
      '    484.546 41.452,461.812 54.578,439.076 80.829,439.076 93.955,461.812',
      '  80.829,484.546 "></polygon>',

      '	<path fill="#404040" d="M76.445,455.355c0.048-0.254,0.076-0.519,0.076-0.787c0-2.188-1.681-3.963-3.756-3.963',
      '		c-0.558,0-1.082,0.136-1.557,0.365c-0.594-1.382-1.965-2.351-3.564-2.351c-1.177,0-2.223,0.538-2.934,1.37',
      '		c-0.549-0.222-1.149-0.347-1.781-0.347c-2.605,0-4.717,2.062-4.717,4.606c0,0.582,0.122,1.137,0.326,1.651',
      '		c-1.942,0.353-3.396,1.81-3.396,3.555c0,1.494,1.066,2.773,2.592,3.336c-0.007,0.071-0.025,0.136-0.025,0.207',
      '		c0,1.421,1.358,2.572,3.031,2.572c1.187,0,2.202-0.584,2.699-1.426c1.352,1.293,3.396,2.136,5.715,2.136',
      '		c2.936,0,5.45-1.332,6.633-3.249c0.17,0.035,0.345,0.065,0.525,0.065c1.748,0,3.165-1.736,3.165-3.878',
      '		C79.478,457.13,78.131,455.442,76.445,455.355"></path>',
      '	<path fill="#404040" d="M63.33,465.571l-0.651,0.415l3.015,3.845c0,0,0.889,1.064,1.067,1.95c0.176,0.889,0,2.486,0,2.486',
      '		l-0.179,0.77c0,0,0.414,0.412,1.953,0.412c1.539,0,1.479-0.531,1.479-0.531s-0.948-2.13-0.858-3.608c0,0,0.326-1.953,1.686-3.195',
      '		l0.679-1.124l-0.5-0.236l-2.012,2.013c0,0-0.413,0.117-0.65-0.473c-0.236-0.592-0.713-0.889-0.713-0.889l-0.546,0.236l0.254,0.945',
      '		c0,0-0.119,0.828-0.888,0.12C65.694,467.996,63.981,466.754,63.33,465.571"></path>',

      '    </g>',

      '    <g id="dark" name="hover" title="dark" >',

      '      <polygon class="hex" fill="rgba(255, 255, 255, 0.4)" points="54.578,',
      '    532.408 41.452,509.674 54.578,486.938 80.829,486.938 93.955,509.674',
      '  80.829,532.408 "></polygon>',

      '	<path fill="#404040" d="M78.214,506.532c-0.465-7.85-9.32-8.604-10.63-8.673v-0.007c0,0-0.033,0-0.083,0.004',
      '		c-0.05-0.004-0.083-0.004-0.083-0.004v0.007c-1.31,0.069-10.165,0.823-10.632,8.673c0,0-0.202,3.329,1.514,5.046',
      '		c0,0,0.605,1.109,0.202,2.422c0,0-0.605,3.229,1.311,3.936c0,0,2.826,0.807,2.826,1.615c0,0,0.204,1.615,1.919,1.716',
      '		c1.367,0.08,2.466,0.287,2.86,0.367v0.036c0,0,0.034-0.007,0.083-0.018c0.05,0.011,0.083,0.018,0.083,0.018v-0.036',
      '		c0.394-0.08,1.493-0.287,2.86-0.367c1.716-0.101,1.917-1.716,1.917-1.716c0-0.809,2.825-1.615,2.825-1.615',
      '		C77.104,517.229,76.5,514,76.5,514c-0.404-1.312,0.202-2.422,0.202-2.422C78.417,509.861,78.214,506.532,78.214,506.532',
      '		 M64.814,514.231c-1.02,1.268-2.725,1.586-3.811,0.715c-1.086-0.873-1.138-2.608-0.119-3.876s2.727-1.586,3.811-0.713',
      '		C65.781,511.229,65.834,512.964,64.814,514.231 M67.63,517.499c-2,0-1.49-1.25-1.49-1.25s0.588-0.293,0.516-1.134',
      '		c-0.076-0.838,0.974-1.217,0.974-1.217s1.049,0.379,0.974,1.217c-0.074,0.841,0.514,1.134,0.514,1.134S69.632,517.499,67.63,517.499',
      '		 M74.083,514.953c-1.085,0.876-2.799,0.555-3.82-0.717c-1.022-1.271-0.97-3.013,0.119-3.886c1.089-0.876,2.799-0.557,3.823,0.715',
      '		C75.226,512.338,75.174,514.078,74.083,514.953"></path>',
      '		',
      '    </g>',

      '    <text id="capacity" x="27" y="438" text-anchor="middle"',
      '          font-family="FuturaBT-Medium"',
      '          font-size="11" dominant-baseline="middle"',
      '          fill="#000">',
      '    </text>',
      '  </g>',
      '</g></g>',


      '</svg>'].join("\n");

  }

  function getCSS() {
    return [
      '.ugcui g {',
      '  cursor: pointer;',
      '}',
      '.ugcui g.menu polygon.hitbox {',
      '  display: none;',
      '}',
      '.ugcui g.menu:hover polygon.hitbox {',
      '  display: inherit;',
      '}',
      '.ugcui g.folder polygon.folder-hitbox {',
      '  display: none;',
      '}',
      '.ugcui g.folder:hover polygon.folder-hitbox {',
      '  display: inherit;',
      '}',
      '.ugcui g.menu g.menu-buttons {',
      '  display: none;',
      '}',
      //'.ugcui g.menu:hover g.menu-buttons {',
      //'  display: block;',
      //'}',
      '.ugcui g.active polygon.hex {',
      '  fill: #f65824;',
      '}',
      '.ugcui g#color g.options polygon.selected {',
      '  stroke: #fff;',
      '  stroke-width: 4; z-index: 100',
      '}',
      '.ugcui g#color g.options polygon#white.selected {',
      '  stroke: #000;',
      '}',
      '.ugcui g#color g.options polygon:not(.selected):hover {',
      '  stroke: #fff;',
      '  stroke-width: 4; z-index: 200',
      '}',
      '.ugcui g#color g.options polygon#white:not(.selected):hover {',
      '  stroke: #000;',
      '}',
      '.ugcui g.menu-buttons g:hover:not(.active) .hex {',
      '  fill: #fff;',
      '}',
      '.ugcui g.folder g.options {',
      '  display: none;',
      '}',
      '.ugcui g.folder:hover g.options {',
      '  display: block;',
      '}',
      '.ugcui g#size g g:hover polygon.bg {',
      '  fill: #fff;',
      '}',
      '.ugcui g#size:hover g g polygon.bg.active {',
      '  fill: #f65824;',
      '}',
      '.ugcui g#smoother g.options g:hover polygon.bg {',
      '  fill: #fff;',
      '}',
      '.animal-container { opacity: 0; -webkit-transition: opacity 0.3s linear; }',
      '.animal { text-align: center; -webkit-transition: all 0.1s linear; float: left; height: ' + (ANIMAL_CONTAINER_HEIGHT - 22) + 'px; background: url(/files/soupthumbs/shadow.png); border: 1px solid rgba(0,0,0,0); width: 200px; margin-right: 10px; }',
      '.animal:hover { background-color: rgba(255, 255, 255, 0.4); border: 1px solid #fff; }',
      '.animal-controls { height: 21px; overflow:hidden; line-height: 0px; border-right: 1px solid #fff; opacity: 0; display: inline-block; position: relative; margin-top: 122px; }',
      '.animal:hover .animal-controls { opacity: 1; }',
      '.animal-controls div { display: none; text-align: center; border: 1px solid #fff; border-right: 0; border-bottom: 0; display: inline-block; width: 20px;}',
      '.animal-controls div.animal-add:hover, .animal-controls div.animal-remove:hover { cursor: pointer; background-color: #f65824; }',
      '.animal-controls div.animal-count { background-color: #fff; color: #777; width: 25px; }'
    ].join("\n");
  }

}