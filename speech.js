            if (annyang) {

               annyang.setLanguage(recogLanguage);
      
                var botCommand = {
                    '(hey) Kia *something': recogFunction
                };
                var commandBot = {
                    '(hey) *something Kia': recogFunction
                };
                var commandToggle = {
                    '(hey) Kia (hey)': tempRec
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
                
                 var urlSend = getUrlParameter('send');

    if (urlSend !== undefined)
    {
     urlSend = urlSend.split('%20').join(' ').split('%22').join('').split('%27').join("'").toString();
     document.body.innerHTML = receiveReply(urlSend);
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
     
