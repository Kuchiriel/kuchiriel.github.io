    rs.setSubroutine('toggleSpeech', function(rs, args) {
        (args == "enable") ? botSpeech = true: botSpeech = false;
        (botSpeech) ? console.log("Engine: Speech Enabled"): console.log("Engine: Speech Disabled");
    });
    
    rs.setSubroutine('toggleRecogLanguage', function(rs, args) {
        recogLanguage = args;
        annyang.setLanguage(recogLanguage);
        console.log("Engine: Recognition Language Set To " + recogLanguage)
        });