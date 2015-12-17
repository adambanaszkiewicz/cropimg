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


$background = new Imagick();
$background->newImage($w, $h, new ImagickPixel('none'));

// You can replace format for JPG, if you want
$background->setImageFormat('png');

$overlay = new Imagick($src);

$background->compositeImage($overlay, Imagick::COMPOSITE_OVER, $x, $y);
$background->resizeImage($destinationWidth, $destinationHeight, Imagick::FILTER_LANCZOS, 1);

// You can replace format for JPG, if you want
$background->setImageFormat('png');

// You can replace format for JPG, if you want
header('Content-Type: image/png');
echo $background->getImageBlob();

