     // Set Global Configurations

     // var botName = sendMessage("getbotname")
        var urlSend = getUrlParameter('send');
        var debugMode = false;
        var botSpeech = false;
        var recogLanguage = "en-US";
        var outputLanguage = "en-US";
        var speechVoice = "UK English Male";
        var success = new Audio('bleep.mp3');
        var error = new Audio('error.mp3');
        var lastmsg = "";

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
         "brain/speechlanguage.rive",
         "brain/speechtoggle.rive",
         "brain/search.rive",
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

       function handleDirection(argument) {
        var direction; 
        (argument == "output") ?
        direction = "en-" + outputLanguage.toString().substring(0,2):
        direction = recogLanguage.toString().substring(0,2) + "-en";
        return direction.toString();
       }
      
        function sendMessage(something) {
         try {
          var reply = rs.reply("Trevor", something);
          if (outputLanguage != "en-US") {
                reply = translate(reply, handleDirection("output"));
          }
       
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

        function removeCommands() {
         annyang.removeCommands();
        }

        function addCommandsBack() {
         annyang.addCommands(botCommand);
         annyang.addCommands(commandBot);
         annyang.addCommands(commandToggle);
         annyang.addCommands(consoleDebug);
        }

        function showReply(reply) {

         function voiceStartCallback() {
          // console.log("Started");
          // removeCommands();
          // pauseAnnyang();
          annyang.pause();
         }

         function voiceEndCallback() {
          // console.log("Ended");
          // addCommandsBack();
          // resumeAnnyang();
          annyang.resume();
         }

         var rvParameters = {
          onstart: voiceStartCallback,
          onend: voiceEndCallback
         }
         
         if (botSpeech && responsiveVoice.voiceSupport()) {
          executeSamaritan("[speaking]");
          responsiveVoice.speak(reply.toString(), speechVoice, rvParameters);
         } else {
          executeSamaritan(reply)
         }
        }

        function translate(something, direction) {

         var trsapi = new XMLHttpRequest();
         var trsreply;

         var key = "trnsl.1.1.20160209T133106Z.3dc9bb19cc139b13.f1065a13645d8992a5b7357812a092551edb338a";
         var text = something;
         var lang = direction;
         var args = key + "&text=" + text + "&lang=" + lang;

         trsapi.onreadystatechange = function() {
          if (trsapi.readyState == 4 && trsapi.status == 200) {
           trsreply = JSON.parse(trsapi.responseText);
          } else {
           console.log(trsapi.status);
          }
         };

         trsapi.open("GET", "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + args, false);
         trsapi.send();

         // console.log(trsapi.status);
         // console.log(trsapi.statusText);

         //  return reply.text;
         //  console.log(trsreply);
         //  console.log(trsreply.text);
         return trsreply.text;
        }

        function receiveReply(something) {
         console.log("You: " + something);
         (recogLanguage != "en-US") ? lastmsg = translate(something, handleDirection("input")): lastmsg = something;
         reply = sendMessage(lastmsg);
         showReply(reply);
        }
        
   
   
    if (urlSend !== undefined)
    {
     urlSend = urlSend.split('%20').join(' ').split('%22').join('').split('%27').join("'");
     xhr = new XMLHttpRequest();
     var url = "url";
     xhr.setRequestHeader("Content-type", "application/json");
     var data = sendMessage(urlSend);
     xhr.send(data);
    }
    
