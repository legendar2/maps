
function drawShape(zLevel, shapePoints) {
  var pointArr = new Array();
  if (shapePoints !== undefined)
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



function drawOverlay() {
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
  //while(overlays[0])
  //{
  //  overlays.pop().setMap(null);
  //}
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