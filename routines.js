    rs.setSubroutine('toggleSpeech', function(rs, args) {
        (args == "enable") ? botSpeech = true: botSpeech = false;
        (botSpeech) ? console.log("Engine: Speech Enabled"): console.log("Engine: Speech Disabled");
    });
    
    rs.setSubroutine('toggleRecogLanguage', function(rs, args) {
        recogLanguage = args;
        annyang.setLanguage(recogLanguage);
        console.log("Engine: Recognition Language Set To " + recogLanguage)
        });
        
     rs.setSubroutine('toggleSpeechLanguage', function(rs, args) {
        outputLanguage = args;
        setSpeechVoice();
        console.log("Engine: Speech Language Set To " + outputLanguage)
        });    


    function setSpeechVoice() {
                if (outputLanguage == "pt-BR") {
                speechVoice = "Brazilian Portuguese Female";
                } else if (outputLanguage == "de") {
                speechVoice = "Deutsch Female";       
                } else {
                speechVoice = "UK English Male";         
                }
        }
