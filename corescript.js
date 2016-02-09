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
        var botSpeech = false;
        var recogLanguage = "en-US";
        var success = new Audio('bleep.mp3');
        var error = new Audio('error.mp3');
        
        
        
        
        function showReply(reply) {
            
            function voiceStartCallback() {
                console.log("Started");
                }

            function voiceEndCallback() {
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
        
        
     $(document).ready(function(){
    $.ajax({
            
        var key = "trnsl.1.1.20160209T133106Z.3dc9bb19cc139b13.f1065a13645d8992a5b7357812a092551edb338a";    
        url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key='
            + key + '&text=' + something + '&lang=en';

        dataType: 'jsonp',
        success: function(json) {
            rates = json.rates;
            base = json.base;
            console.log("Translated: " + rates);
        }
    });
});
        
        function receiveReply(something) {
            console.log("You: " + something);
           
           
            

          
            reply = sendMessage(something);
            showReply(reply);
        }
        
        
        
        
        
