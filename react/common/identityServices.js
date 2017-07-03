/* global layer */
'use strict';

  // Synchronous load of the configuration
  var config;
  if (window.layerSampleConfig) {
    config = window.layerSampleConfig;
  } else {
    var request = new XMLHttpRequest();
    request.onload = function() {
      config = JSON.parse(this.responseText);
    };
    request.open('GET', 'common/LayerConfiguration.json', false);
    request.send();
  }

  if (!config[0].app_id) throw new Error("No app_id key found in LayerConfiguration.json");

  /**
   * layerSample global utility
   *
   * @param {String}    appId - Layer Staging Application ID
   * @param {String}    userId - User ID to log in as
   * @param {Function}  challenge - Layer Client challenge function
   * @param {Function}  dateFormat - Get a nice date string
   */
  window.layerSample = {
    appId: config[0].app_id,
    identityProviderUrl: config[0].identity_provider_url,
    userId: null,
    email: null,
    password: null,
    validateSetup: function(client) {
      var conversationQuery = client.createQuery({
        paginationWindow: 1,
        model: layer.Query.Conversation
      });
      conversationQuery.on('change:data', function() {
        if (conversationQuery.data.length === 0) {
          var identityQuery = client.createQuery({
            paginationWindow: 5,
            model: layer.Query.Identity
          });
          identityQuery.on('change:data', function() {
            // if (identityQuery.data.length === 0) {
            //   alert("There are no other users to talk to; please use your Identity Server to register new users");
            // } else {
              console.log(client, client.createConversation, "CLIENT")
              var conversation = client.createConversation({
                participants: identityQuery.data.map(function(user) {
                  return user.id;
                }),
                metadata: {
                  conversationName: "Sample Conversation"
                }
              });
              conversation.createMessage("Welcome to the new Conversation").send();
            // }
          });
        }
      });
    },
    getIdentityToken: function(nonce, callback) {
        let headers = {
            'Authorization': 'Bearer ' + accessTok,
            'content-type': 'application/json'
        };

        fetch('https://backend-staging.airy.co/communication/layer-identity-token?nonce=' + nonce, {
            method: 'GET',
            mode: 'cors',
            headers: headers
        })
            .then(res => {
                if (res.status === 201 || res.ok) {
                    return res.json()
                }
            }).then((response) => {
            identityToken = response.token;
            var node = window.document && document.getElementById('identity');
            if (node) node.parentNode.removeChild(node);
            console.log(response.token, '<<<--identityToken')
            callback(response.token)
        });
    },
    dateFormat: function(date) {
      var now = new Date();
      if (!date) return now.toLocaleDateString();

      if (date.toLocaleDateString() === now.toLocaleDateString()) return date.toLocaleTimeString();
      else return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    onLogin: function(callback) {
      this.loginCallback = callback;
    }
  };

window.document && document.addEventListener('DOMContentLoaded', function() {
  /**
   * Dirty HTML dialog injection
   */
  var form = document.createElement('form');
  form.innerHTML += '<img src="http://static.layer.com/logo-only-blue.png" />';
  form.innerHTML += '<h1>Welcome to Layer sample app!</h1>';
  form.innerHTML += '<div class="login-group"><label for="email">Email</label><input type="text" id="email" /></div>';
  form.innerHTML += '<div class="login-group"><label for="password">Password</label><input type="password" id="password" /></div>';

  var button = document.createElement('button');
  button.type = 'button';
  button.appendChild(document.createTextNode('Login'));

  form.appendChild(button);

  var container = document.createElement('div');
  container.setAttribute('id', 'identity');
  container.appendChild(form);
  document.body.insertBefore(container, document.querySelectorAll('.main-app')[0]);

  function submit() {
      sendToServer()
      window.layerSample.myClient.connect('de14b061-c976-478b-87df-c97e49a025de'); //""


      /*   window.layerSample.email = 'lukas@airy.co';
         window.layerSample.password = 'hallo123';
         if (window.layerSample.email && window.layerSample.password) {
           window.layerSample.loginCallback(window.layerSample.userId);
         } else {
           alert("Please fill in an email address and password");
         }*/
  }

  button.addEventListener('click', submit);
  // form.addEventListener('submit', submit);
});



let identityToken;
let sessionTok;
let organizationID;
let accessTok;
let memberId;



function sendToServer() {
    let data = {
        'email': 'lukas@airy.co',
        'password': 'hallo123'
    };

    let headers = {
        'Authorization': 'Bearer client_key',
        'content-type': 'application/json'
    };

    fetch('https://backend-staging.airy.co/identity/log-in/', { //beim server ==> die API route muss d'accord sein
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(data)
    }).then(res => {
            if (res.status === 200 || res.ok) {
                return res.json()
            }
        }
    )
        .catch((error) => {
            console.log(error)

        })
        .then(response => {
            console.log(response)
            accessTok = response.accessToken;
            memberId = response.member.id;
            console.log(memberId)
            console.log(window.layerSample.myClient, "SI HERE")
            // getNonce()
            // window.layerSample.myClient.connect("de14b061-c976-478b-87df-c97e49a025de");

        })

}

function getNonce() {
    let headers = {
        "accept": "application/vnd.layer+json; version=2.0",
        "Content-Type": "application/json"
    }
    fetch('https://api.layer.com/nonces', {
        method: "POST",
        headers: headers
    })
        .then(res => {
            console.log(res, 'res outside if in getNonce')
            if (res.status === 201 || res.ok) {
                return res.json()
            }
        }).then((response) => {
        console.log(response.nonce, '<<<--Nonce')
        getIdentityToken(response.nonce);
    })

}


// function getIdentityToken(nonce) {
//     let headers = {
//         'Authorization': 'Bearer ' + accessTok,
//         'content-type': 'application/json'
//     };
//
//     fetch('https://backend-staging.airy.co/communication/layer-identity-token?nonce=' + nonce, {
//         method: 'GET',
//         mode: 'cors',
//         headers: headers
//     })
//         .then(res => {
//             if (res.status === 201 || res.ok) {
//                 return res.json()
//             }
//         }).then((response) => {
//       console.log(response, "RESPONSEOSOOEOE")
//         identityToken = response.token;
//         console.log(response.token, '<<<--identityToken')
//         getSessionToken(response.token)
//     });
// }



function getSessionToken(identityToken) {
    let headers = {
        "accept": "application/vnd.layer+json; version=2.0",
        "Content-Type": "application/json"
    }
    let data = {
        identity_token: identityToken,
        app_id: "4dc3c5e2-79bc-11e6-bae2-181cf8060647"
    }
    fetch('https://api.layer.com/sessions', {
        method: "POST",
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(data)

    }).then(res => {
        return res.json()

    }).then((response) => {
        sessionTok = response.session_token;
        console.log(sessionTok, '<<<--Sessiontoken')
        // let sessionToken = response.session_token;
        // this.props.layerSessionTokenCreated(sessionToken);
        // browserHistory.push('/layerHome')
        console.log(memberId, '<====== MEMBERID');
        // console.log(window.layerSample.myClient, window.layerSample.myClient.connectWithSession, "<----myCleint")
        // window.layerSample.myClient.connectWithSession("de14b061-c976-478b-87df-c97e49a025de", sessionTok);

        // client.connectWithSession(memberId, sessionTok);
        window.layerSample.validateSetup(window.layerSample.myClient);
        console.log('asdsas', "<<<-Store");

    })
};

