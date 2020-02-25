# Nano UI Framework

**`NOTE`: CURRENT CODE IS BROKEN. FRAMEWORK MAY NOT WORK AS EXPECTED**

**`NOTE`: Please submit a `issue` for every issue that is found so I can be aware of it as soon as possible.**

**`FEATURE REQUEST`: If you want a feature request, submit an issue with the title saying: `FEATURE` so I know that the issue is regarding a feature.**

## Installation

1. Clone the Repo
2. Run `npm i` or `yarn` to install depencies
3. Run `npm start` or `yarn start` to start up the live server.

### Render Content on Page

```html
<body>
  <div id="root"></div>
</body>
```

```js
const component = Component.createComponent(
  'h1',
  'text-large-class',
  'This is some content'
);
Rendering.render('root', component);
```

### The Create Component Function

The Create Component function takes in three params.

1. Type of Element
2. Any Classes
3. The Content

`Example`:

```js
Component.createComponent('h1', 'text-large-class', 'This is some content');
```
