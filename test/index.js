/* global pageshot */
console.log('Pageshot ready!');

setInterval(function() {
  var d = (new Date());
  var name = d;
  var allFormats = ['png','gif','jpeg','pdf'];
  var format = allFormats[Math.floor(Math.random() * allFormats.length)];
  pageshot.shoot(name, format);
}, 1000);

setTimeout(function() {

  pageshot.shoot('promises').then(function() {
    console.log('Success!');
    pageshot.quit();
  }, function() {
    console.log('Fail');
    pageshot.quit();
  });
}, 5000);
