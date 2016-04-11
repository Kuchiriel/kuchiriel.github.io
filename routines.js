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
        
    rs.setSubroutine('webSearch', function(rs, args) {
        var search = "https://www.google.com.br/#q=";
        OpenIn("_blank", search + args.join(" "));
    //  executeQuery(args.join(" "), "search");
        console.log("Engine: Searching for " + args.join(" "))
    }); 
    

     rs.setSubroutine('luckySearch', function(rs, args) {
        var search = "https://www.google.com.br/#q=" + "&btnI";
        OpenIn("_blank", search + args.join(" "));
    //  executeQuery(args.join(" "), "search");
        console.log("Engine: Searching for " + args.join(" "))
    }); 
    
      rs.setSubroutine('picSearch', function(rs, args) {
       var search = "https://kuchiriel.github.io/?q=";
        OpenIn("_blank", search +  args.join(" "));
    //  executeQuery(args.join(" "), "pic");
        console.log("Engine: Searching for " + args.join(" ") + " pictures.")
    }); 

    function OpenIn(target, url) {
        var win = window.open(url, target);
        win.focus();
    }
    
    function setSpeechVoice() {
        if (outputLanguage == "pt-BR") {
        speechVoice = "Brazilian Portuguese Female";
        } else if (outputLanguage == "de") {
        speechVoice = "Deutsch Female";       
        } else {
        speechVoice = "UK English Male";         
        }
    }
