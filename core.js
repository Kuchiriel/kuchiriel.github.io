        var botName = "Samaritan"
        var debugMode = false;
        var botSpeech = false;
        var recogLanguage = "en-US";
        var success = new Audio('bleep.mp3');
        var error = new Audio('error.mp3');
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
            "brain/test.rive"
        ], on_load_success, on_load_error);

        function on_load_success() {
            // Now to sort the replies!
            rs.sortReplies();
            console.log("Engine: Replies Sorted");
        }

        function on_load_error(err) {
            console.log("Engine: Loading error: " + err);
        }
        rs.setSubroutine('toggleSpeech', function(rs, args) {
            (args == "enable") ? botSpeech = true: botSpeech = false;
            (botSpeech) ? console.log("Engine: Speech Enabled"): console.log("Engine: Speech Disabled");
        });
        rs.setSubroutine('toggleRecogLanguage', function(rs, args) {
            recogLanguage = args;
            annyang.setLanguage(recogLanguage);
            console.log("Engine: Recognition Language Set To " + recogLanguage)
        });

        

        function setShits() {
            
                annyang.setLanguage(recogLanguage);
                console.log("Engine: Loaded Speech Recognition");
                
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
            
            addCommandsBack();
        }
                

        function beginShit() {
            
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
            translated = 'https://translate.yandex.net/api/v1.5/tr.json/detect?key=trnsl.1.1.20160209T133106Z.3dc9bb19cc139b13.f1065a13645d8992a5b7357812a092551edb338a&text=' + something;
            console.log("Translated: " + translated);
            reply = sendMessage(something);
            showReply(reply);
        }
        
         window.onload = function() {
            if (annyang) {
                setShits();
                beginShit();
                annyang.start({
                    autoRestart: true
                });
            }
        }
