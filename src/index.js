import Nano from '../nano';

import {} from './components/Navbar/navbar.component.js';

const instance = new Nano(document.getElementById('root'), 'Hello World');
instance.display();
