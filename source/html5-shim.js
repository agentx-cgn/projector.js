
//
// requestAnimationFrame
// https://gist.github.com/1579671

// (function () {
//   for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c) {
//     window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"];
//     window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"]
//   }
//   if (!window.requestAnimationFrame) window.requestAnimationFrame = function (b) {
//     var c = Date.now(),
//       g = Math.max(0, 16 - (c - a)),
//       h = window.setTimeout(function () {
//         b(c + g);
//       }, g);
//     a = c + g;
//     return h;
//   };
//   if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (a) {
//     clearTimeout(a);
//   }:
// })();

// CancelAnimationFrame

window.requestAnimationFrame = window.requestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.oRequestAnimationFrame;

window.AudioContext =
  window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext;

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.oGetUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.msGetUserMedia;

window.URL =
  window.URL ||
  window.webkitURL;

document.IsFullScreen =
  (typeof document.IsFullScreen !== "undefined")       ? () => document.IsFullScreen :
  (typeof document.webkitIsFullScreen !== "undefined") ? () => document.webkitIsFullScreen :
  (typeof document.mozFullScreen !== "undefined")      ? () => document.mozFullScreen :
  () => !!document.fullscreenElement;


// http://www.html5rocks.com/en/tutorials/file/filesystem/

window.requestFileSystem = window.requestFileSystem ||
  window.webkitRequestFileSystem;

