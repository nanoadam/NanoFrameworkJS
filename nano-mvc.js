// Rendering
class Rendering {
  static render = (div, content) => {
    document.getElementById(div).appendChild(content);
  };
}

// Components
class Component extends Rendering {
  static createComponent(type, className, content) {
    const element = document.createElement(type);
    element.setAttribute('class', className);

    if (typeof element == 'object') {
      console.log('ITS AN OBJECT', element);
      console.log(Array(element));
    } else {
      console.log('ITS A NEWS', element);
      element.innerHTML = content;
    }

    return element;
  }
}

// Routing
class Routing {
  static createRoute(route) {}
}
