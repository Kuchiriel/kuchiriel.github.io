        // Set Global Configurations

       

        // Create our RiveScript interpreter.
        var rs = new RiveScript({
            debug: debugMode
        });
        
        // Load our files from the brain/ folder.
        rs.loadFile([
            "brain/begin.rive",
            "brain/admin.rive",
            "brain/clients.rive",
            "brain/samaritan.rive",
            "brain/myself.rive",
            "brain/rpg.rive",
            "brain/javascript.rive",
            "brain/eastereggs.rive",
            "brain/recoglanguage.rive",
            "brain/speechtoggle.rive",
            "brain/getvars.rive"
        ], on_load_success, on_load_error);

        function on_load_success() {
            // Now to sort the replies!
            rs.sortReplies();
            console.log("Engine: Replies Sorted");
        }

        function on_load_error(err) {
            console.log("Engine: Loading error: " + err);
        }
          
      
        
        
 
                

                
        function sendMessage(something) {
            try {
                var reply = rs.reply("Trevor", something);
                console.log("Samaritan: " + reply);
                success.play();
            } catch (e) {
                window.alert(e.message + "\n" + e.line);
                console.log("Engine: " + e);
                executeSamaritan(e.message);
                error.play();
            }
            return reply;
        }
        
        
        
         // var botName = sendMessage("getbotname")
        var debugMode = false;
        var botSpeech = true;
        var recogLanguage = "en-US";
        var success = new Audio('bleep.mp3');
        var error = new Audio('error.mp3');
        
        
        
        
        function showReply(reply) {
            
            function voiceStartCallback() {
                annyang.removeCommands();
                annyang.pause();
                console.log("Started");
                }

            function voiceEndCallback() {
                addCommandsBack();
                annyang.resume();
                console.log("Ended");
                }
                
            var rvParameters = {
                onstart: voiceStartCallback,
                onend: voiceEndCallback
                }
                
            if (botSpeech && responsiveVoice.voiceSupport()) {
                executeSamaritan("[speaking]");
                responsiveVoice.speak(reply, "UK English Male", rvParameters);
            } 
            else {
                executeSamaritan(reply)
            }
        }        
        function receiveReply(something) {
            console.log("You: " + something);
            reply = sendMessage(something);
            showReply(reply);
        }
        
        
        
        
               function setShits() {
            
                annyang.setLanguage(recogLanguage);
                addCommandsBack();
                
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
                }

                function addCommandsBack() {
                    annyang.addCommands(botCommand);
                    annyang.addCommands(commandBot);
                    annyang.addCommands(commandToggle);
                    annyang.addCommands(consoleDebug);
                }           

            
            console.log("Engine: Loaded Speech Recognition");
        }
        
        
    window.onload = function() {
            if (annyang) {
                setShits();
                annyang.start({
                    autoRestart: true
                });
            }
        }
