

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
                    autoRestart: false
                });
            }
        
        
           function addCommandsBack() {
                    annyang.addCommands(botCommand);
                    annyang.addCommands(commandBot);
                    annyang.addCommands(commandToggle);
                    annyang.addCommands(consoleDebug);
                } 
