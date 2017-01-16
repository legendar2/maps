
var clickListener;
var poly;
var count = 0;
var points = new Array();
var markers = new Array();
var map;

// Define the LatLng coordinates for the outer path.
var outerCoords = [
  { lat: -32.364, lng: 153.207 }, // north west
  { lat: -35.364, lng: 153.207 }, // south west
  { lat: -35.364, lng: 158.207 }, // south east
  { lat: -32.364, lng: 158.207 }  // north east
];

// Define the LatLng coordinates for an inner path.
var innerCoords1 = [
  { lat: -33.364, lng: 154.207 },
  { lat: -34.364, lng: 154.207 },
  { lat: -34.364, lng: 155.207 },
  { lat: -33.364, lng: 155.207 }
];

// Define the LatLng coordinates for another inner path.
var innerCoords2 = [
  { lat: -33.364, lng: 156.207 },
  { lat: -34.364, lng: 156.207 },
  { lat: -34.364, lng: 157.207 },
  { lat: -33.364, lng: 157.207 }
];



function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: { lat: -33.872, lng: 151.252 },
  });

  map.data.add({
    geometry: new google.maps.Data.Polygon([outerCoords,
      innerCoords1,
      innerCoords2])
  })

  var polygonId = 1;
  var zoomLevel = 5;

  get_ajax_points(polygonId, zoomLevel);
}


function drawShape(zLevel, shapePoints) {
  var pointArr = new Array();
  if (shapePoints)
    pointArr = shapePoints.split(',');
  // reset map
  clearMap();
  // position map at first point
  map.setCenter(new google.maps.LatLng(pointArr[0], pointArr[1]), zLevel);
  // create shape (points and markers)
  for (var i = 0, len = pointArr.length; i < len; ++i) {
    if (i % 2 == 0) {
      createSimpleMarker(new google.maps.LatLng(pointArr[i], pointArr[(i + 1)]));
    }
  }
  google.maps.event.removeListener(clickListener);
}

function setShape() {
  var shapeString = '';
  if (points.length > 2) {
    for (var n = 0; n < points.length; n++) {
      shapeString = shapeString + ',' + points[n].y + ',' + points[n].x;
    }
    shapeString = shapeString.substr(1);
    $x_Value('P11_SHAPE', shapeString);
    $x_Value('P11_ZOOM_LEVEL', map.getZoom());
    doSubmit('SUBMIT');
  } else {
    alert('There must be at least three points to a polygon.');
  }
}

function drawOverlay() {
return;

  if (poly) { map.removeOverlay(poly); }

  if (editing == true) {
    if (markers.length > 0) {
      for (i = 0; i < markers.length; i++) {
        map.removeOverlay(markers[i]);
      }
    }
    markers.length = 0;
  } else if (editMode == 'Create') {
    // remove all overlays
    points.length = 0;

    // redraw all overlays
    for (i = 0; i < markers.length; i++) {
      points.push(markers[i].getLatLng());
    }
    // Polygon mode
    points.push(markers[0].getLatLng());
  }
  poly = new GPolygon(points, lineColor, lineWeight, lineOpacity, fillColor, fillOpacity);
  map.addOverlay(poly);
}


function clearMap() {

  // Clear current map and reset arrays
  google.maps.event.removeListener(clickListener);
  if (poly) { map.removeOverlay(poly); }
  // while (overlays[0]) {
  //   overlays.pop().setMap(null);
  // }
  points.length = 0;
  markers.length = 0;
  count = 0;
  editMode = 'Create';
  clickListener = google.maps.event.addListener(map, "click", leftClick);
}

function leftClick(overlay, point) {
  if (point) {
    count++;
    createMarker(point);
  }
}

function createMarker(point) {
  if (point) {

    var icon = new GIcon();
    addIcon(icon);

    // Make markers draggable
    var marker = new GMarker(point, { icon: icon, draggable: true, bouncy: false, dragCrossMove: true });
    map.addOverlay(marker);
    marker.content = count;
    markers.push(marker);
    marker.tooltip = "Point " + count;

    GEvent.addListener(marker, "mouseover", function () {
      showTooltip(marker);
    });

    GEvent.addListener(marker, "mouseout", function () {
      tooltip.style.display = "none";
    });

    // Drag listener
    GEvent.addListener(marker, "drag", function () {
      tooltip.style.display = "none";
      drawOverlay();
    });

    // Second click listener
    GEvent.addListener(marker, "click", function () {
      tooltip.style.display = "none";

      // Find out which marker to remove
      for (var n = 0; n < markers.length; n++) {
        if (markers[n] == marker) {
          map.removeOverlay(markers[n]);
          break;
        }
      }

      // Shorten array of markers and adjust counter
      markers.splice(n, 1);
      if (markers.length == 0) {
        count = 0;
      }
      else {
        count = markers[markers.length - 1].content;
        drawOverlay();
      }
    });
    drawOverlay();
  }
}


function get_ajax_points(polygonId, zoomLevel) {
  var l_shape;
  var retx;
  var rety;
  var polyName;
  var polyDesc;
  var get = new htmldb_Get(null, $v('pFlowId'), 'APPLICATION_PROCESS=getPoints', 2);
  get.addParam('x01', polygonId);
  //l_Return = get.get(null,'<getPointVals>','</getPointVals>');
  l_Return = get.get('XML');
  get = null;
  retx = l_Return.getElementsByTagName("getPointVals")[0];
  rety = retx.childNodes[0];
  l_shape = rety != null ? rety.nodeValue : null;
  //alert('zoomLevel: ' + zoomLevel);
  //alert(l_shape);
  drawShape(zoomLevel, l_shape);
}
