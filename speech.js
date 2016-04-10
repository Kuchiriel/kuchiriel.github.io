            if (annyang) {

             annyang.setLanguage(recogLanguage);

             var botCommand = {
              '(hey) Samaritan *something': recogFunction
             };
             var commandBot = {
              '(hey) *something Samaritan': recogFunction
             };
             var commandToggle = {
              '(hey) Samaritan (hey)': tempRec
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
              annyang.removeCommands();
              receiveReply("Samaritan");
              annyang.addCommands(tempCommand);
             }

             function tempSend(something) {
              annyang.removeCommands();
              receiveReply(something);
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
             document.body.innerHTML = receiveReply(urlSend.toString());
            }
