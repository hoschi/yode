import React from 'react'
import { render } from 'react-dom'
import store from './store/store'
import { Provider } from 'react-redux'
import App from './components/app'
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

render((
    <Provider store={ store }>
        <App />
    </Provider>
    ), document.getElementById('main'))
