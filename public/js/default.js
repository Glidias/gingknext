if (!window.Touch) {
  window.Touch = {};
}
document.ontouchstart = function(e){
  var n = ""+e.target.nodeName;
  n = n.toLowerCase();
  if (n !== "a" && n !== "input" && n!== "label" && n !== "textarea" && n !=="button" && n!=="select")  {
      e.preventDefault();
  }
}
document.ontouchmove = function(e){
  e.preventDefault();
}