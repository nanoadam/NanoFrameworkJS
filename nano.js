import { render } from 'jsx-to-html';
class Nano {
  constructor(root, render) {
    this.root = root;
    this.render = render;
  }

  display() {
    this.root.innerHTML = this.render;
  }
}

export class Component {
  constructor(componentName) {
    this.componentName = componentName;
  }

  render(jsx) {
    const content = render(<h1>Hello World</h1>);
    console.log(content);
  }

  define({ template }) {
    html = template.innerHTML;
    console.log(html);
  }
}

export default Nano;
