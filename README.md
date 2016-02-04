Project K.I.A
===
**K.I.A**, recursive acronym for "**K.I.A** **i**sn't **a**live" is an intelligent **personal assistant** under development. It uses [**RiveScript**](https://www.rivescript.com) as natural language processor, and attempt to make I/O and other third parts interchangeable according to the [**Unix Philosophy**](https://en.wikipedia.org/wiki/Unix_philosophy).

"*The goal is to follow Unix Philosophy much as possible, and keep everything simple and clean.*"

#### Why do K.I.A?

A clear reason is that, there is no usable [**IPA**](https://en.wikipedia.org/wiki/Intelligent_personal_assistant) for *nix based systems. 

We will humble try to fix some standardization and protocols to write a good one, and keep it simple so, everyone could port and rewrite **K.I.A** in every single language no matter paradigm.

Later we will have a more ambitious goal, make it platform independent, and stand some basis to create a framework for self service softwares for kioskis and smart agents for automated help desk systems.

#### Interessting tell me more...
Well, **K.I.A** must be small and low cost enough to fit cheap computers like Raspberry Pi or Smartphones, and robust and flexibile enough to fit in a full-stack DOM environment without compromising the previous one. 

All at the same time and stand-alone also.

But don't worry, we have all the technology available at our favor.

Again, a more ambitious goal, is to make **K.I.A** accessible by almost everything as an **API**. Imagine you have a smart house, everything connected by the internet of things, **K.I.A** must be able to manage things by natural language communication.

**K.I.A** must coexist as.

* Desktop Personal Assistant
* Mobile Personal Assistant
* Web Browser Personal Assistant
* Smart Search Engine
* Basis for some even more A.I ambitious projects

It will answer us when we ask something, do things as we ask for. It will assist us and bring us usefull informations even if we didn't ask.

The start point will be:

* Natural Language Processor: RiveScript
* Backend Programming Language: Python
* Base Operating System: Arch Linux
* Speech Recognition API: [annyang! SpeechRecognition](https://www.talater.com/annyang/)
* Text to Speech Technologies for Desktop: SVOX
* Text to Speech Technologies for Web: For testing we will use [ResponsiveVoice](http://responsivevoice.org/)

**Note:** all of this must me interchangeable, able to replace, change between, easy to rewrite and well doccumented. We must have multiple technologies for each task, and redundant and non intrusive/verbose functions to glue it all together.

Imagine you didn't have svox avaible for you system, you could just switch to festival, or other tts that is available, or just don't use tts instead. You must be able to choose between Google Speech API or something like pocketsphinx, or even interact with KIA via some persistent chat based interactive mode. 

We will distribute each part of the project working out of the box independently, as well as the whole project. Also, later we could try build a custom project oriented and optimized linux distribution to run a desktop version of **K.I.A**.

We will try to glue things using some "as server approach".

This document is specific to the Web Version of K.I.A we will serve assistant as agents, each with its own personality. Now we are working on an agent named Samaritan, based in the A.I Samaratian of the Person of Interest series. If you want to know the currently available commands see [this document](https://github.com/Kuchiriel/kuchiriel.github.io/blob/master/COMMANDS.md).



