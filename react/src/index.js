import React from 'react';
import { render } from 'react-dom';

import { Client, Query } from 'layer-websdk';
import configureStore from './store/configureStore';
import { ownerSet } from './actions/messenger';
import ChatView from './ChatView'

let appId = window.layerSample.appId;

/**
 * Initialize Layer Client with `appId`
 */
let client = new Client({
  appId: appId
});
window.layerSample.myClient = client;

// console.log(window.layerSample.myClient === client, "ASDS");

/**
 * Client authentication challenge.
 * Sign in to Layer sample identity provider service.
 *
 * See http://static.layer.com/sdk/docs/#!/api/layer.Client-event-challenge
 */
client.on('challenge', e => {
  console.log(e);
  console.log("CHALLENDGEDFE")
  window.layerSample.getIdentityToken(e.nonce, e.callback);
});

client.on('ready', () => {
  console.log("IM READY BITCH")
  store.dispatch(ownerSet(client.user.toObject()));
});

window.layerSample.onLogin(() => {
  client.connect() //"de14b061-c976-478b-87df-c97e49a025de"
  /**
   * Start authentication
   */
});



/**
 * Share the client with the middleware layer
 */
let store = configureStore(client);

/**
 * validate that the sample data has been properly set up
 */
window.layerSample.validateSetup(client);

// Render the Chat UI passing in the client and the store
render(
  <ChatView client={client} store={store} />,
  document.getElementById('root')
);
