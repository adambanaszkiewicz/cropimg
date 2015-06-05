<?php
/**
 * This is a demo, showing how crop image from data delivered by cropimg plugin.
 */

// Source image from we will crop
$src = 'cropimg.jpg';

// Destination sized of cropped image. Defined also in plugin options.
$destinationWidth  = 600;
$destinationHeight = 300;

// Data taken from plugin
$w = isset($_GET['w']) ? $_GET['w'] : die('$w parameter in $_GET required.');
$h = isset($_GET['h']) ? $_GET['h'] : die('$h parameter in $_GET required.');
$x = isset($_GET['x']) ? $_GET['x'] : die('$x parameter in $_GET required.');
$y = isset($_GET['y']) ? $_GET['y'] : die('$y parameter in $_GET required.');

// Create source resource image (crop from)
$resource    = imagecreatefromjpeg($src);

// Destination resource of sizes defined above.
$destination = imagecreatetruecolor($destinationWidth, $destinationHeight);

// Copy part of image, resize it and paste into destination.
// Remember add minus to X and Y coordinates delivered from plugin!
imagecopyresized($destination, $resource, 0, 0, -$x, -$y, $destinationWidth, $destinationHeight, $w, $h);

// Showing image
header('Content-Type: image/jpg');
imagepng($destination);
