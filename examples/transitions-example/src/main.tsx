import { render } from 'solid-js/web';
import App from './App';

import './style.css';

function Root() {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 w-screen h-screen flex overflow-hidden">
      <div className="flex flex-col items-center justify-center w-full">
        <App />
      </div>
    </div>
  );
}

const app = document.getElementById('app');

if (app) {
  render(() => <Root />, app);
}
