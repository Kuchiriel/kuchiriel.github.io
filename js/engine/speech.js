             if (annyang) {
               
             //var opt = "(hey|hello|hi)";

             annyang.setLanguage(recogLanguage);
  

             var botCommand = {
              '(hey|hello|hi) Samaritan *something': recogFunction
             };
             var commandBot = {
              '(hey|hello|hi) *something Samaritan': recogFunction
             };
             var commandToggle = {
              '(hey|hello|hi) Samaritan (hey|hello|hi)': tempRec
             };
             var tempCommand = {
              '*something': tempSend
             };
             var consoleDebug = {
              '*debug': function(debug) {
               console.log("Debug: " + debug);
              }
             };

             function recogFunction(something) {
              receiveReply(something);
             }

             function tempRec() {
              receiveReply(agentName);
              annyang.removeCommands();
              annyang.addCommands(tempCommand);
             }

             function tempSend(something) {
              receiveReply(something);
              annyang.removeCommands();
              addCommandsBack();
             }

             addCommandsBack();
              console.log("Engine: Loaded Speech Recognition");
              annyang.start({
              autoRestart: true
             });
            }

            var urlSend = getUrlParameter('send');

            if (urlSend !== undefined) {
             urlSend = urlSend.split('%20').join(' ').split('%22').join('').split('%27').join("'").toString();
             receiveReply(urlSend.toString());
            }
