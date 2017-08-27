import React from 'react'
import { render } from 'react-dom'
import store from './store/store'
import { Provider } from 'react-redux'
import App from './components/app'
import injectTapEventPlugin from 'react-tap-event-plugin';
require('react-grid-layout/css/styles.css')
require('react-resizable/css/styles.css')

injectTapEventPlugin();

render((
    <Provider store={ store }>
        <App />
    </Provider>
    ), document.getElementById('main'))
