const name = Component.createComponent(
  'h1',
  'name apple',
  Component.createComponent('h2', 'new', 'Nice')
);
console.log(name);
Rendering.render('root', name);
