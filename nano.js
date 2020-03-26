const root = document.querySelector('nano-root');

if (!root) console.error('Root Element Not Found.');

// Component
const defineComponent = element => {
  if (!element) return console.error('No Element Defined');

  let elem = document.querySelector(element);
  elem.parentNode.removeChild(elem);

  return elem.innerHTML;
};
