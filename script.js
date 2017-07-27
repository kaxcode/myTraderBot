// set the focus to the input box
document.getElementById("wisdom").focus();

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// Provide your Pool Id here
  IdentityPoolId: "us-east-1:d1701b00-df64-41d9-b275-bf0e0e50c30e",
});

var lexruntime = new AWS.LexRuntime();
var lexUserId = 'chatbot-demo' + Date.now();
var sessionAttributes = {};

function pushChat() {

  // if there is text to be sent...
  var wisdomText = document.getElementById('wisdom');
  if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

    // disable input to show we're sending it
    var wisdom = wisdomText.value.trim();
    wisdomText.value = '...';
    wisdomText.locked = true;

    // send it to the Lex runtime
    var params = {
      botAlias: '$LATEST',
      botName: 'myTrader',
      inputText: wisdom,
      userId: lexUserId,
      sessionAttributes: sessionAttributes
    };
    showRequest(wisdom);
    lexruntime.postText(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        showError('Error:  ' + err.message + ' (see console for details)')
      }
      if (data) {
        // capture the sessionAttributes for the next cycle
        sessionAttributes = data.sessionAttributes;
        // show response and/or error/dialog status
        showResponse(data);
      }
      // re-enable input
      wisdomText.value = '';
      wisdomText.locked = false;
    });
  }
  // we always cancel form submission
  return false;
}

function showRequest(daText) {

  var conversationDiv = document.getElementById('conversation');
  var requestPara = document.createElement("P");
  requestPara.className = 'userRequest';
  requestPara.appendChild(document.createTextNode(daText));
  conversationDiv.appendChild(requestPara);
  conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function showError(daText) {

  var conversationDiv = document.getElementById('conversation');
  var errorPara = document.createElement("P");
  errorPara.className = 'lexError';
  errorPara.appendChild(document.createTextNode(daText));
  conversationDiv.appendChild(errorPara);
  conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function showResponse(lexResponse) {

  var conversationDiv = document.getElementById('conversation');
  var responsePara = document.createElement("P");
  responsePara.className = 'lexResponse';

  if (lexResponse.message) {
    var message = linkifyHtml(lexResponse.message);
    responsePara.appendChild(document.createTextNode(message));
    responsePara.appendChild(document.createElement('br'));
  }
  if (lexResponse.dialogState === 'ReadyForFulfillment') {
    responsePara.appendChild(document.createTextNode(
      'Ready for fulfillment'));
    // TODO:  show slot values
  } else {
    responsePara.appendChild(document.createTextNode(
      '(' + lexResponse.dialogState + ')'));
  }
  conversationDiv.appendChild(responsePara);
  conversationDiv.scrollTop = conversationDiv.scrollHeight;
}
