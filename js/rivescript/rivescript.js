(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RiveScript = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Brain, inherit_utils, utils;

utils = require("./utils");

inherit_utils = require("./inheritance");

Brain = (function() {
  function Brain(master) {
    this.master = master;
    this.strict = master._strict;
    this.utf8 = master._utf8;
    this._currentUser = null;
  }

  Brain.prototype.say = function(message) {
    return this.master.say(message);
  };

  Brain.prototype.warn = function(message, filename, lineno) {
    return this.master.warn(message, filename, lineno);
  };

  Brain.prototype.reply = function(user, msg, scope) {
    var begin, reply;
    this.say("Asked to reply to [" + user + "] " + msg);
    this._currentUser = user;
    msg = this.formatMessage(msg);
    reply = "";
    if (this.master._topics.__begin__) {
      begin = this._getReply(user, "request", "begin", 0, scope);
      if (begin.indexOf("{ok}") > -1) {
        reply = this._getReply(user, msg, "normal", 0, scope);
        begin = begin.replace(/\{ok\}/g, reply);
      }
      reply = begin;
      reply = this.processTags(user, msg, reply, [], [], 0, scope);
    } else {
      reply = this._getReply(user, msg, "normal", 0, scope);
    }
    this.master._users[user].__history__.input.pop();
    this.master._users[user].__history__.input.unshift(msg);
    this.master._users[user].__history__.reply.pop();
    this.master._users[user].__history__.reply.unshift(reply);
    this._currentUser = void 0;
    return reply;
  };

  Brain.prototype._getReply = function(user, msg, context, step, scope) {
    var allTopics, botside, bucket, choice, condition, e, eq, foundMatch, giveup, halves, i, isAtomic, isMatch, j, k, l, lastReply, left, len, len1, len2, len3, len4, len5, m, match, matched, matchedTrigger, n, name, nil, o, passed, pattern, potreply, q, r, redirect, ref, ref1, ref2, ref3, ref4, ref5, ref6, regexp, rep, reply, right, row, stars, thatstars, top, topic, trig, userSide, value, weight;
    if (!this.master._sorted.topics) {
      this.warn("You forgot to call sortReplies()!");
      return "ERR: Replies Not Sorted";
    }
    if (!this.master._users[user]) {
      this.master._users[user] = {
        "topic": "random"
      };
    }
    topic = this.master._users[user].topic;
    stars = [];
    thatstars = [];
    reply = "";
    if (!this.master._topics[topic]) {
      this.warn("User " + user + " was in an empty topic named '" + topic + "'");
      topic = this.master._users[user].topic = "random";
    }
    if (step > this.master._depth) {
      return "ERR: Deep Recursion Detected";
    }
    if (context === "begin") {
      topic = "__begin__";
    }
    if (!this.master._users[user].__history__) {
      this.master._users[user].__history__ = {
        "input": ["undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined"],
        "reply": ["undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined"]
      };
    }
    if (!this.master._topics[topic]) {
      return "ERR: No default topic 'random' was found!";
    }
    matched = null;
    matchedTrigger = null;
    foundMatch = false;
    if (step === 0) {
      allTopics = [topic];
      if (this.master._topics[topic].includes || this.master._topics[topic].inherits) {
        allTopics = inherit_utils.getTopicTree(this.master, topic);
      }
      for (j = 0, len = allTopics.length; j < len; j++) {
        top = allTopics[j];
        this.say("Checking topic " + top + " for any %Previous's");
        if (this.master._sorted.thats[top]) {
          this.say("There's a %Previous in this topic!");
          lastReply = this.master._users[user].__history__.reply[0];
          lastReply = this.formatMessage(lastReply, true);
          this.say("Last reply: " + lastReply);
          ref = this.master._sorted.thats[top];
          for (k = 0, len1 = ref.length; k < len1; k++) {
            trig = ref[k];
            pattern = trig[0];
            botside = this.triggerRegexp(user, pattern);
            this.say("Try to match lastReply (" + lastReply + ") to " + botside);
            match = lastReply.match(new RegExp("^" + botside + "$"));
            if (match) {
              this.say("Bot side matched!");
              thatstars = match;
              thatstars.shift();
              userSide = trig[1];
              regexp = this.triggerRegexp(user, userSide.trigger);
              this.say("Try to match \"" + msg + "\" against " + userSide.trigger + " (" + regexp + ")");
              isAtomic = utils.isAtomic(userSide.trigger);
              isMatch = false;
              if (isAtomic) {
                if (msg === regexp) {
                  isMatch = true;
                }
              } else {
                match = msg.match(new RegExp("^" + regexp + "$"));
                if (match) {
                  isMatch = true;
                  stars = match;
                  if (stars.length >= 1) {
                    stars.shift();
                  }
                }
              }
              if (isMatch) {
                matched = userSide;
                foundMatch = true;
                matchedTrigger = userSide.trigger;
                break;
              }
            }
          }
        }
      }
    }
    if (!foundMatch) {
      this.say("Searching their topic for a match...");
      ref1 = this.master._sorted.topics[topic];
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        trig = ref1[l];
        pattern = trig[0];
        regexp = this.triggerRegexp(user, pattern);
        this.say("Try to match \"" + msg + "\" against " + pattern + " (" + regexp + ")");
        isAtomic = utils.isAtomic(pattern);
        isMatch = false;
        if (isAtomic) {
          if (msg === regexp) {
            isMatch = true;
          }
        } else {
          match = msg.match(new RegExp("^" + regexp + "$"));
          if (match) {
            isMatch = true;
            stars = [];
            if (match.length > 1) {
              for (i = m = 1, ref2 = match.length; 1 <= ref2 ? m <= ref2 : m >= ref2; i = 1 <= ref2 ? ++m : --m) {
                stars.push(match[i]);
              }
            }
          }
        }
        if (isMatch) {
          this.say("Found a match!");
          matched = trig[1];
          foundMatch = true;
          matchedTrigger = pattern;
          break;
        }
      }
    }
    this.master._users[user].__lastmatch__ = matchedTrigger;
    if (matched) {
      ref3 = [1];
      for (n = 0, len3 = ref3.length; n < len3; n++) {
        nil = ref3[n];
        if (matched.redirect != null) {
          this.say("Redirecting us to " + matched.redirect);
          redirect = this.processTags(user, msg, matched.redirect, stars, thatstars, step, scope);
          this.say("Pretend user said: " + redirect);
          reply = this._getReply(user, redirect, context, step + 1, scope);
          break;
        }
        ref4 = matched.condition;
        for (o = 0, len4 = ref4.length; o < len4; o++) {
          row = ref4[o];
          halves = row.split(/\s*=>\s*/);
          if (halves && halves.length === 2) {
            condition = halves[0].match(/^(.+?)\s+(==|eq|!=|ne|<>|<|<=|>|>=)\s+(.*?)$/);
            if (condition) {
              left = utils.strip(condition[1]);
              eq = condition[2];
              right = utils.strip(condition[3]);
              potreply = utils.strip(halves[1]);
              left = this.processTags(user, msg, left, stars, thatstars, step, scope);
              right = this.processTags(user, msg, right, stars, thatstars, step, scope);
              if (left.length === 0) {
                left = "undefined";
              }
              if (right.length === 0) {
                right = "undefined";
              }
              this.say("Check if " + left + " " + eq + " " + right);
              passed = false;
              if (eq === "eq" || eq === "==") {
                if (left === right) {
                  passed = true;
                }
              } else if (eq === "ne" || eq === "!=" || eq === "<>") {
                if (left !== right) {
                  passed = true;
                }
              } else {
                try {
                  left = parseInt(left);
                  right = parseInt(right);
                  if (eq === "<" && left < right) {
                    passed = true;
                  } else if (eq === "<=" && left <= right) {
                    passed = true;
                  } else if (eq === ">" && left > right) {
                    passed = true;
                  } else if (eq === ">=" && left >= right) {
                    passed = true;
                  }
                } catch (_error) {
                  e = _error;
                  this.warn("Failed to evaluate numeric condition!");
                }
              }
              if (passed) {
                reply = potreply;
                break;
              }
            }
          }
        }
        if (reply !== void 0 && reply.length > 0) {
          break;
        }
        bucket = [];
        ref5 = matched.reply;
        for (q = 0, len5 = ref5.length; q < len5; q++) {
          rep = ref5[q];
          weight = 1;
          match = rep.match(/\{weight=(\d+?)\}/i);
          if (match) {
            weight = match[1];
            if (weight <= 0) {
              this.warn("Can't have a weight <= 0!");
              weight = 1;
            }
          }
          for (i = r = 0, ref6 = weight; 0 <= ref6 ? r <= ref6 : r >= ref6; i = 0 <= ref6 ? ++r : --r) {
            bucket.push(rep);
          }
        }
        choice = parseInt(Math.random() * bucket.length);
        reply = bucket[choice];
        break;
      }
    }
    if (!foundMatch) {
      reply = "ERR: No Reply Matched";
    } else if (reply === void 0 || reply.length === 0) {
      reply = "ERR: No Reply Found";
    }
    this.say("Reply: " + reply);
    if (context === "begin") {
      match = reply.match(/\{topic=(.+?)\}/i);
      giveup = 0;
      while (match) {
        giveup++;
        if (giveup >= 50) {
          this.warn("Infinite loop looking for topic tag!");
          break;
        }
        name = match[1];
        this.master._users[user].topic = name;
        reply = reply.replace(new RegExp("{topic=" + utils.quotemeta(name) + "}", "ig"), "");
        match = reply.match(/\{topic=(.+?)\}/i);
      }
      match = reply.match(/<set (.+?)=(.+?)>/i);
      giveup = 0;
      while (match) {
        giveup++;
        if (giveup >= 50) {
          this.warn("Infinite loop looking for set tag!");
          break;
        }
        name = match[1];
        value = match[2];
        this.master._users[user][name] = value;
        reply = reply.replace(new RegExp("<set " + utils.quotemeta(name) + "=" + utils.quotemeta(value) + ">", "ig"), "");
        match = reply.match(/<set (.+?)=(.+?)>/i);
      }
    } else {
      reply = this.processTags(user, msg, reply, stars, thatstars, step, scope);
    }
    return reply;
  };

  Brain.prototype.formatMessage = function(msg, botreply) {
    msg = "" + msg;
    msg = msg.toLowerCase();
    msg = this.substitute(msg, "sub");
    if (this.utf8) {
      msg = msg.replace(/[\\<>]+/, "");
      if (this.master.unicodePunctuation != null) {
        msg = msg.replace(this.master.unicodePunctuation, "");
      }
      if (botreply != null) {
        msg = msg.replace(/[.?,!;:@#$%^&*()]/, "");
      }
    } else {
      msg = utils.stripNasties(msg, this.utf8);
    }
    msg = msg.trim();
    msg = msg.replace(/\s+/g, " ");
    return msg;
  };

  Brain.prototype.triggerRegexp = function(user, regexp) {
    var giveup, i, j, k, l, len, len1, match, name, opts, p, parts, pipes, ref, rep, type;
    regexp = regexp.replace(/^\*$/, "<zerowidthstar>");
    regexp = regexp.replace(/\*/g, "(.+?)");
    regexp = regexp.replace(/#/g, "(\\d+?)");
    regexp = regexp.replace(/_/g, "(\\w+?)");
    regexp = regexp.replace(/\{weight=\d+\}/g, "");
    regexp = regexp.replace(/<zerowidthstar>/g, "(.*?)");
    if (this.utf8) {
      regexp = regexp.replace(/\\@/, "\\u0040");
    }
    match = regexp.match(/\[(.+?)\]/);
    giveup = 0;
    while (match) {
      if (giveup++ > 50) {
        this.warn("Infinite loop when trying to process optionals in a trigger!");
        return "";
      }
      parts = match[1].split("|");
      opts = [];
      for (j = 0, len = parts.length; j < len; j++) {
        p = parts[j];
        opts.push("(?:\\s|\\b)+" + p + "(?:\\s|\\b)+");
      }
      pipes = opts.join("|");
      pipes = pipes.replace(new RegExp(utils.quotemeta("(.+?)"), "g"), "(?:.+?)");
      pipes = pipes.replace(new RegExp(utils.quotemeta("(\\d+?)"), "g"), "(?:\\d+?)");
      pipes = pipes.replace(new RegExp(utils.quotemeta("(\\w+?)"), "g"), "(?:\\w+?)");
      pipes = pipes.replace(/\[/g, "__lb__").replace(/\]/g, "__rb__");
      regexp = regexp.replace(new RegExp("\\s*\\[" + utils.quotemeta(match[1]) + "\\]\\s*"), "(?:" + pipes + "|(?:\\b|\\s)+)");
      match = regexp.match(/\[(.+?)\]/);
    }
    regexp = regexp.replace(/__lb__/g, "[").replace(/__rb__/g, "]");
    regexp = regexp.replace(/\\w/, "[A-Za-z]");
    giveup = 0;
    while (regexp.indexOf("@") > -1) {
      if (giveup++ > 50) {
        break;
      }
      match = regexp.match(/\@(.+?)\b/);
      if (match) {
        name = match[1];
        rep = "";
        if (this.master._array[name]) {
          rep = "(?:" + this.master._array[name].join("|") + ")";
        }
        regexp = regexp.replace(new RegExp("@" + utils.quotemeta(name) + "\\b"), rep);
      }
    }
    giveup = 0;
    while (regexp.indexOf("<bot") > -1) {
      if (giveup++ > 50) {
        break;
      }
      match = regexp.match(/<bot (.+?)>/i);
      if (match) {
        name = match[1];
        rep = '';
        if (this.master._var[name]) {
          rep = utils.stripNasties(this.master._var[name]);
        }
        regexp = regexp.replace(new RegExp("<bot " + utils.quotemeta(name) + ">"), rep.toLowerCase());
      }
    }
    giveup = 0;
    while (regexp.indexOf("<get") > -1) {
      if (giveup++ > 50) {
        break;
      }
      match = regexp.match(/<get (.+?)>/i);
      if (match) {
        name = match[1];
        rep = 'undefined';
        if (typeof this.master._users[user][name] !== "undefined") {
          rep = this.master._users[user][name];
        }
        regexp = regexp.replace(new RegExp("<get " + utils.quotemeta(name) + ">", "ig"), rep.toLowerCase());
      }
    }
    giveup = 0;
    regexp = regexp.replace(/<input>/i, "<input1>");
    regexp = regexp.replace(/<reply>/i, "<reply1>");
    while (regexp.indexOf("<input") > -1 || regexp.indexOf("<reply") > -1) {
      if (giveup++ > 50) {
        break;
      }
      ref = ["input", "reply"];
      for (k = 0, len1 = ref.length; k < len1; k++) {
        type = ref[k];
        for (i = l = 1; l <= 9; i = ++l) {
          if (regexp.indexOf("<" + type + i + ">") > -1) {
            regexp = regexp.replace(new RegExp("<" + type + i + ">", "g"), this.master._users[user].__history__[type][i]);
          }
        }
      }
    }
    if (this.utf8 && regexp.indexOf("\\u") > -1) {
      regexp = regexp.replace(/\\u([A-Fa-f0-9]{4})/, function(match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
      });
    }
    return regexp;
  };

  Brain.prototype.processTags = function(user, msg, reply, st, bst, step, scope) {
    var args, botstars, content, data, formats, giveup, i, insert, j, k, l, lang, len, m, match, name, obj, output, parts, random, ref, ref1, replace, result, stars, subreply, tag, target, text, type, value;
    stars = [""];
    stars.push.apply(stars, st);
    botstars = [""];
    botstars.push.apply(botstars, bst);
    if (stars.length === 1) {
      stars.push("undefined");
    }
    if (botstars.length === 1) {
      botstars.push("undefined");
    }
    reply = reply.replace(/<person>/ig, "{person}<star>{/person}");
    reply = reply.replace(/<@>/ig, "{@<star>}");
    reply = reply.replace(/<formal>/ig, "{formal}<star>{/formal}");
    reply = reply.replace(/<sentence>/ig, "{sentence}<star>{/sentence}");
    reply = reply.replace(/<uppercase>/ig, "{uppercase}<star>{/uppercase}");
    reply = reply.replace(/<lowercase>/ig, "{lowercase}<star>{/lowercase}");
    reply = reply.replace(/\{weight=\d+\}/ig, "");
    reply = reply.replace(/<star>/ig, stars[1]);
    reply = reply.replace(/<botstar>/ig, botstars[1]);
    for (i = j = 1, ref = stars.length; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      reply = reply.replace(new RegExp("<star" + i + ">", "ig"), stars[i]);
    }
    for (i = k = 1, ref1 = botstars.length; 1 <= ref1 ? k <= ref1 : k >= ref1; i = 1 <= ref1 ? ++k : --k) {
      reply = reply.replace(new RegExp("<botstar" + i + ">", "ig"), botstars[i]);
    }
    reply = reply.replace(/<input>/ig, this.master._users[user].__history__.input[0]);
    reply = reply.replace(/<reply>/ig, this.master._users[user].__history__.reply[0]);
    for (i = l = 1; l <= 9; i = ++l) {
      if (reply.indexOf("<input" + i + ">") > -1) {
        reply = reply.replace(new RegExp("<input" + i + ">", "ig"), this.master._users[user].__history__.input[i]);
      }
      if (reply.indexOf("<reply" + i + ">") > -1) {
        reply = reply.replace(new RegExp("<reply" + i + ">", "ig"), this.master._users[user].__history__.reply[i]);
      }
    }
    reply = reply.replace(/<id>/ig, user);
    reply = reply.replace(/\\s/ig, " ");
    reply = reply.replace(/\\n/ig, "\n");
    reply = reply.replace(/\\#/ig, "#");
    match = reply.match(/\{random\}(.+?)\{\/random\}/i);
    giveup = 0;
    while (match) {
      if (giveup++ > this.master._depth) {
        this.warn("Infinite loop looking for random tag!");
        break;
      }
      random = [];
      text = match[1];
      if (text.indexOf("|") > -1) {
        random = text.split("|");
      } else {
        random = text.split(" ");
      }
      output = random[parseInt(Math.random() * random.length)];
      reply = reply.replace(new RegExp("\\{random\\}" + utils.quotemeta(text) + "\\{\\/random\\}", "ig"), output);
      match = reply.match(/\{random\}(.+?)\{\/random\}/i);
    }
    formats = ["person", "formal", "sentence", "uppercase", "lowercase"];
    for (m = 0, len = formats.length; m < len; m++) {
      type = formats[m];
      match = reply.match(new RegExp("{" + type + "}(.+?){/" + type + "}", "i"));
      giveup = 0;
      while (match) {
        giveup++;
        if (giveup >= 50) {
          this.warn("Infinite loop looking for " + type + " tag!");
          break;
        }
        content = match[1];
        if (type === "person") {
          replace = this.substitute(content, "person");
        } else {
          replace = utils.stringFormat(type, content);
        }
        reply = reply.replace(new RegExp(("{" + type + "}") + utils.quotemeta(content) + ("{/" + type + "}"), "ig"), replace);
        match = reply.match(new RegExp("{" + type + "}(.+?){/" + type + "}", "i"));
      }
    }
    reply = reply.replace(/<call>/ig, "{__call__}");
    reply = reply.replace(/<\/call>/ig, "{/__call__}");
    while (true) {
      match = reply.match(/<([^<]+?)>/);
      if (!match) {
        break;
      }
      match = match[1];
      parts = match.split(" ");
      tag = parts[0].toLowerCase();
      data = "";
      if (parts.length > 1) {
        data = parts.slice(1).join(" ");
      }
      insert = "";
      if (tag === "bot" || tag === "env") {
        target = tag === "bot" ? this.master._var : this.master._global;
        if (data.indexOf("=") > -1) {
          parts = data.split("=", 2);
          this.say("Set " + tag + " variable " + parts[0] + " = " + parts[1]);
          target[parts[0]] = parts[1];
        } else {
          insert = target[data] || "undefined";
        }
      } else if (tag === "set") {
        parts = data.split("=", 2);
        this.say("Set uservar " + parts[0] + " = " + parts[1]);
        this.master._users[user][parts[0]] = parts[1];
      } else if (tag === "add" || tag === "sub" || tag === "mult" || tag === "div") {
        parts = data.split("=");
        name = parts[0];
        value = parts[1];
        if (typeof this.master._users[user][name] === "undefined") {
          this.master._users[user][name] = 0;
        }
        value = parseInt(value);
        if (isNaN(value)) {
          insert = "[ERR: Math can't '" + tag + "' non-numeric value '" + value + "']";
        } else if (isNaN(parseInt(this.master._users[user][name]))) {
          insert = "[ERR: Math can't '" + tag + "' non-numeric user variable '" + name + "']";
        } else {
          result = parseInt(this.master._users[user][name]);
          if (tag === "add") {
            result += value;
          } else if (tag === "sub") {
            result -= value;
          } else if (tag === "mult") {
            result *= value;
          } else if (tag === "div") {
            if (value === 0) {
              insert = "[ERR: Can't Divide By Zero]";
            } else {
              result /= value;
            }
          }
          if (insert === "") {
            this.master._users[user][name] = result;
          }
        }
      } else if (tag === "get") {
        insert = typeof (this.master._users[user][data] !== "undefined") ? this.master._users[user][data] : "undefined";
      } else {
        insert = "\x00" + match + "\x01";
      }
      reply = reply.replace(new RegExp("<" + (utils.quotemeta(match)) + ">"), insert);
    }
    reply = reply.replace(/\x00/g, "<");
    reply = reply.replace(/\x01/g, ">");
    match = reply.match(/\{topic=(.+?)\}/i);
    giveup = 0;
    while (match) {
      giveup++;
      if (giveup >= 50) {
        this.warn("Infinite loop looking for topic tag!");
        break;
      }
      name = match[1];
      this.master._users[user].topic = name;
      reply = reply.replace(new RegExp("{topic=" + utils.quotemeta(name) + "}", "ig"), "");
      match = reply.match(/\{topic=(.+?)\}/i);
    }
    match = reply.match(/\{@(.+?)\}/);
    giveup = 0;
    while (match) {
      giveup++;
      if (giveup >= 50) {
        this.warn("Infinite loop looking for redirect tag!");
        break;
      }
      target = match[1];
      this.say("Inline redirection to: " + target);
      subreply = this._getReply(user, target, "normal", step + 1, scope);
      reply = reply.replace(new RegExp("\\{@" + utils.quotemeta(target) + "\\}", "i"), subreply);
      match = reply.match(/\{@(.+?)\}/);
    }
    reply = reply.replace(/\{__call__\}/g, "<call>");
    reply = reply.replace(/\{\/__call__\}/g, "</call>");
    match = reply.match(/<call>(.+?)<\/call>/i);
    giveup = 0;
    while (match) {
      giveup++;
      if (giveup >= 50) {
        this.warn("Infinite loop looking for call tag!");
        break;
      }
      text = utils.strip(match[1]);
      parts = text.split(/\s+/);
      obj = parts.shift();
      args = parts;
      output = "";
      if (this.master._objlangs[obj]) {
        lang = this.master._objlangs[obj];
        if (this.master._handlers[lang]) {
          output = this.master._handlers[lang].call(this.master, obj, args, scope);
        } else {
          output = "[ERR: No Object Handler]";
        }
      } else {
        output = "[ERR: Object Not Found]";
      }
      reply = reply.replace(new RegExp("<call>" + utils.quotemeta(match[1]) + "</call>", "i"), output);
      match = reply.match(/<call>(.+?)<\/call>/i);
    }
    return reply;
  };

  Brain.prototype.substitute = function(msg, type) {
    var cap, j, len, match, pattern, ph, pi, placeholder, qm, ref, result, subs, tries;
    result = "";
    if (!this.master._sorted[type]) {
      this.master.warn("You forgot to call sortReplies()!");
      return "";
    }
    subs = type === "sub" ? this.master._sub : this.master._person;
    ph = [];
    pi = 0;
    ref = this.master._sorted[type];
    for (j = 0, len = ref.length; j < len; j++) {
      pattern = ref[j];
      result = subs[pattern];
      qm = utils.quotemeta(pattern);
      ph.push(result);
      placeholder = "\x00" + pi + "\x00";
      pi++;
      msg = msg.replace(new RegExp("^" + qm + "$", "g"), placeholder);
      msg = msg.replace(new RegExp("^" + qm + "(\\W+)", "g"), placeholder + "$1");
      msg = msg.replace(new RegExp("(\\W+)" + qm + "(\\W+)", "g"), "$1" + placeholder + "$2");
      msg = msg.replace(new RegExp("(\\W+)" + qm + "$", "g"), "$1" + placeholder);
    }
    tries = 0;
    while (msg.indexOf("\x00") > -1) {
      tries++;
      if (tries > 50) {
        this.warn("Too many loops in substitution placeholders!");
        break;
      }
      match = msg.match("\\x00(.+?)\\x00");
      if (match) {
        cap = parseInt(match[1]);
        result = ph[cap];
        msg = msg.replace(new RegExp("\x00" + cap + "\x00", "g"), result);
      }
    }
    return msg;
  };

  return Brain;

})();

module.exports = Brain;

},{"./inheritance":2,"./utils":7}],2:[function(require,module,exports){
var getTopicTree, getTopicTriggers;

getTopicTriggers = function(rs, topic, thats, depth, inheritance, inherited) {
  var curTrig, i, inThisTopic, includes, inherits, j, len, len1, previous, ref, trigger, triggers;
  if (thats == null) {
    thats = false;
  }
  if (depth == null) {
    depth = 0;
  }
  if (inheritance == null) {
    inheritance = 0;
  }
  if (inherited == null) {
    inherited = 0;
  }
  if (depth > rs._depth) {
    rs.warn("Deep recursion while scanning topic inheritance!");
    return [];
  }
  rs.say(("Collecting trigger list for topic " + topic + " (depth=" + depth + "; ") + ("inheritance=" + inheritance + "; inherited=" + inherited + ")"));
  if (rs._topics[topic] == null) {
    rs.warn(("Inherited or included topic '" + topic + "' doesn't exist or ") + "has no triggers");
    return [];
  }
  triggers = [];
  inThisTopic = [];
  if (!thats) {
    if (rs._topics[topic] != null) {
      ref = rs._topics[topic];
      for (i = 0, len = ref.length; i < len; i++) {
        trigger = ref[i];
        inThisTopic.push([trigger.trigger, trigger]);
      }
    }
  } else {
    if (rs._thats[topic] != null) {
      for (curTrig in rs._thats[topic]) {
        if (!rs._thats[topic].hasOwnProperty(curTrig)) {
          continue;
        }
        for (previous in rs._thats[topic][curTrig]) {
          if (!rs._thats[topic][curTrig].hasOwnProperty(previous)) {
            continue;
          }
          inThisTopic.push([previous, rs._thats[topic][curTrig][previous]]);
        }
      }
    }
  }
  if (Object.keys(rs._includes[topic]).length > 0) {
    for (includes in rs._includes[topic]) {
      if (!rs._includes[topic].hasOwnProperty(includes)) {
        continue;
      }
      rs.say("Topic " + topic + " includes " + includes);
      triggers.push.apply(triggers, getTopicTriggers(rs, includes, thats, depth + 1, inheritance + 1, false));
    }
  }
  if (Object.keys(rs._inherits[topic]).length > 0) {
    for (inherits in rs._inherits[topic]) {
      if (!rs._inherits[topic].hasOwnProperty(inherits)) {
        continue;
      }
      rs.say("Topic " + topic + " inherits " + inherits);
      triggers.push.apply(triggers, getTopicTriggers(rs, inherits, thats, depth + 1, inheritance + 1, true));
    }
  }
  if (Object.keys(rs._inherits[topic]).length > 0 || inherited) {
    for (j = 0, len1 = inThisTopic.length; j < len1; j++) {
      trigger = inThisTopic[j];
      rs.say("Prefixing trigger with {inherits=" + inheritance + "} " + trigger);
      triggers.push.apply(triggers, [["{inherits=" + inheritance + "}" + trigger[0], trigger[1]]]);
    }
  } else {
    triggers.push.apply(triggers, inThisTopic);
  }
  return triggers;
};

getTopicTree = function(rs, topic, depth) {
  var includes, inherits, topics;
  if (depth == null) {
    depth = 0;
  }
  if (depth > rs._depth) {
    rs.warn("Deep recursion while scanning topic tree!");
    return [];
  }
  topics = [topic];
  for (includes in rs._topics[topic].includes) {
    if (!rs._topics[topic].includes.hasOwnProperty(includes)) {
      continue;
    }
    topics.push.apply(topics, getTopicTree(rs, includes, depth + 1));
  }
  for (inherits in rs._topics[topic].inherits) {
    if (!rs._topics[topic].inherits.hasOwnProperty(inherits)) {
      continue;
    }
    topics.push.apply(topics, getTopicTree(rs, inherits, depth + 1));
  }
  return topics;
};

exports.getTopicTriggers = getTopicTriggers;

exports.getTopicTree = getTopicTree;

},{}],3:[function(require,module,exports){
"use strict";
var JSObjectHandler;

JSObjectHandler = (function() {
  function JSObjectHandler(master) {
    this._master = master;
    this._objects = {};
  }

  JSObjectHandler.prototype.load = function(name, code) {
    var e, source;
    if (typeof code === "function") {
      return this._objects[name] = code;
    } else {
      source = "this._objects[\"" + name + "\"] = function(rs, args) {\n" + code.join("\n") + "}\n";
      try {
        return eval(source);
      } catch (_error) {
        e = _error;
        return this._master.warn("Error evaluating JavaScript object: " + e.message);
      }
    }
  };

  JSObjectHandler.prototype.call = function(rs, name, fields, scope) {
    var e, func, reply;
    if (!this._objects[name]) {
      return "[ERR: Object Not Found]";
    }
    func = this._objects[name];
    reply = "";
    try {
      reply = func.call(scope, rs, fields);
    } catch (_error) {
      e = _error;
      reply = "[ERR: Error when executing JavaScript object: " + e.message + "]";
    }
    if (reply === void 0) {
      reply = "";
    }
    return reply;
  };

  return JSObjectHandler;

})();

module.exports = JSObjectHandler;

},{}],4:[function(require,module,exports){
"use strict";
var Parser, RS_VERSION, utils;

utils = require("./utils");

RS_VERSION = "2.0";

Parser = (function() {
  function Parser(master) {
    this.master = master;
    this.strict = master._strict;
    this.utf8 = master._utf8;
  }

  Parser.prototype.say = function(message) {
    return this.master.say(message);
  };

  Parser.prototype.warn = function(message, filename, lineno) {
    return this.master.warn(message, filename, lineno);
  };

  Parser.prototype.parse = function(filename, code, onError) {
    var ast, cmd, comment, concatModes, curTrig, field, fields, halves, i, inobj, isThat, j, k, l, lang, lastcmd, left, len, len1, len2, len3, len4, li, line, lineno, lines, localOptions, lookCmd, lookahead, lp, m, mode, n, name, objBuf, objLang, objName, parts, ref, syntaxError, temp, topic, type, val, value;
    ast = {
      begin: {
        global: {},
        "var": {},
        sub: {},
        person: {},
        array: {}
      },
      topics: {},
      objects: []
    };
    topic = "random";
    lineno = 0;
    comment = false;
    inobj = false;
    objName = "";
    objLang = "";
    objBuf = [];
    curTrig = null;
    lastcmd = "";
    isThat = null;
    localOptions = {
      concat: "none"
    };
    concatModes = {
      none: "",
      newline: "\n",
      space: " "
    };
    lines = code.split("\n");
    for (lp = j = 0, len = lines.length; j < len; lp = ++j) {
      line = lines[lp];
      lineno = lp + 1;
      line = utils.strip(line);
      if (line.length === 0) {
        continue;
      }
      if (inobj) {
        if (line.indexOf("< object") > -1 || line.indexOf("<object") > -1) {
          if (objName.length > 0) {
            ast.objects.push({
              name: objName,
              language: objLang,
              code: objBuf
            });
          }
          objName = objLang = "";
          objBuf = [];
          inobj = false;
        } else {
          objBuf.push(line);
        }
        continue;
      }
      if (line.indexOf("//") === 0) {
        continue;
      } else if (line.indexOf("#") === 0) {
        this.warn("Using the # symbol for comments is deprecated", filename, lineno);
        continue;
      } else if (line.indexOf("/*") === 0) {
        if (line.indexOf("*/") > -1) {
          continue;
        }
        comment = true;
        continue;
      } else if (line.indexOf("*/") > -1) {
        comment = false;
        continue;
      }
      if (comment) {
        continue;
      }
      if (line.length < 2) {
        this.warn("Weird single-character line '" + line + "' found.", filename, lineno);
        continue;
      }
      cmd = line.substring(0, 1);
      line = utils.strip(line.substring(1));
      if (line.indexOf(" // ") > -1) {
        line = utils.strip(line.split(" // ")[0]);
      }
      syntaxError = this.checkSyntax(cmd, line);
      if (syntaxError !== "") {
        if (this.strict && typeof onError === "function") {
          onError.call(null, "Syntax error: " + syntaxError + " at " + filename + " line " + lineno + " near " + cmd + " " + line);
        } else {
          this.warn("Syntax error: " + syntaxError + " at " + filename + " line " + lineno + " near " + cmd + " " + line);
        }
      }
      if (cmd === "+") {
        isThat = null;
      }
      this.say("Cmd: " + cmd + "; line: " + line);
      ref = lines.slice(lp + 1);
      for (li = k = 0, len1 = ref.length; k < len1; li = ++k) {
        lookahead = ref[li];
        lookahead = utils.strip(lookahead);
        if (lookahead.length < 2) {
          continue;
        }
        lookCmd = lookahead.substring(0, 1);
        lookahead = utils.strip(lookahead.substring(1));
        if (lookCmd !== "%" && lookCmd !== "^") {
          break;
        }
        if (lookahead.length === 0) {
          break;
        }
        this.say("\tLookahead " + li + ": " + lookCmd + " " + lookahead);
        if (cmd === "+") {
          if (lookCmd === "%") {
            isThat = lookahead;
            break;
          } else {
            isThat = null;
          }
        }
        if (cmd === "!") {
          if (lookCmd === "^") {
            line += "<crlf>" + lookahead;
          }
          continue;
        }
        if (cmd !== "^" && lookCmd !== "%") {
          if (lookCmd === "^") {
            if (concatModes[localOptions.concat] !== void 0) {
              line += concatModes[localOptions.concat] + lookahead;
            } else {
              line += lookahead;
            }
          } else {
            break;
          }
        }
      }
      switch (cmd) {
        case "!":
          halves = line.split("=", 2);
          left = utils.strip(halves[0]).split(" ");
          value = type = name = "";
          if (halves.length === 2) {
            value = utils.strip(halves[1]);
          }
          if (left.length >= 1) {
            type = utils.strip(left[0]);
            if (left.length >= 2) {
              left.shift();
              name = utils.strip(left.join(" "));
            }
          }
          if (type !== "array") {
            value = value.replace(/<crlf>/g, "");
          }
          if (type === "version") {
            if (parseFloat(value) > parseFloat(RS_VERSION)) {
              this.warn("Unsupported RiveScript version. We only support " + RS_VERSION, filename, lineno);
              return false;
            }
            continue;
          }
          if (name.length === 0) {
            this.warn("Undefined variable name", filename, lineno);
            continue;
          }
          if (value.length === 0) {
            this.warn("Undefined variable value", filename, lineno);
            continue;
          }
          switch (type) {
            case "local":
              this.say("\tSet local parser option " + name + " = " + value);
              localOptions[name] = value;
              break;
            case "global":
              this.say("\tSet global " + name + " = " + value);
              ast.begin.global[name] = value;
              break;
            case "var":
              this.say("\tSet bot variable " + name + " = " + value);
              ast.begin["var"][name] = value;
              break;
            case "array":
              this.say("\tSet array " + name + " = " + value);
              if (value === "<undef>") {
                ast.begin.array[name] = "<undef>";
                continue;
              }
              parts = value.split("<crlf>");
              fields = [];
              for (l = 0, len2 = parts.length; l < len2; l++) {
                val = parts[l];
                if (val.indexOf("|") > -1) {
                  fields.push.apply(fields, val.split("|"));
                } else {
                  fields.push.apply(fields, val.split(" "));
                }
              }
              for (i = m = 0, len3 = fields.length; m < len3; i = ++m) {
                field = fields[i];
                fields[i] = fields[i].replace(/\\s/ig, " ");
              }
              ast.begin.array[name] = fields;
              break;
            case "sub":
              this.say("\tSet substitution " + name + " = " + value);
              ast.begin.sub[name] = value;
              break;
            case "person":
              this.say("\tSet person substitution " + name + " = " + value);
              ast.begin.person[name] = value;
              break;
            default:
              this.warn("Unknown definition type " + type, filename, lineno);
          }
          break;
        case ">":
          temp = utils.strip(line).split(" ");
          type = temp.shift();
          name = "";
          fields = [];
          if (temp.length > 0) {
            name = temp.shift();
          }
          if (temp.length > 0) {
            fields = temp;
          }
          switch (type) {
            case "begin":
            case "topic":
              if (type === "begin") {
                this.say("Found the BEGIN block.");
                type = "topic";
                name = "__begin__";
              }
              this.say("Set topic to " + name);
              curTrig = null;
              topic = name;
              this.initTopic(ast.topics, topic);
              mode = "";
              if (fields.length >= 2) {
                for (n = 0, len4 = fields.length; n < len4; n++) {
                  field = fields[n];
                  if (field === "includes" || field === "inherits") {
                    mode = field;
                  } else if (mode !== "") {
                    ast.topics[topic][mode][field] = 1;
                  }
                }
              }
              break;
            case "object":
              lang = "";
              if (fields.length > 0) {
                lang = fields[0].toLowerCase();
              }
              if (lang === "") {
                this.warn("Trying to parse unknown programming language", filename, lineno);
                lang = "javascript";
              }
              objName = name;
              objLang = lang;
              objBuf = [];
              inobj = true;
              break;
            default:
              this.warn("Unknown label type " + type, filename, lineno);
          }
          break;
        case "<":
          type = line;
          if (type === "begin" || type === "topic") {
            this.say("\tEnd the topic label.");
            topic = "random";
          } else if (type === "object") {
            this.say("\tEnd the object label.");
            inobj = false;
          }
          break;
        case "+":
          this.say("\tTrigger pattern: " + line);
          this.initTopic(ast.topics, topic);
          curTrig = {
            trigger: line,
            reply: [],
            condition: [],
            redirect: null,
            previous: isThat
          };
          ast.topics[topic].triggers.push(curTrig);
          break;
        case "-":
          if (curTrig === null) {
            this.warn("Response found before trigger", filename, lineno);
            continue;
          }
          this.say("\tResponse: " + line);
          curTrig.reply.push(line);
          break;
        case "*":
          if (curTrig === null) {
            this.warn("Condition found before trigger", filename, lineno);
            continue;
          }
          this.say("\tCondition: " + line);
          curTrig.condition.push(line);
          break;
        case "%":
          continue;
        case "^":
          continue;
        case "@":
          this.say("\tRedirect response to: " + line);
          curTrig.redirect = utils.strip(line);
          break;
        default:
          this.warn("Unknown command '" + cmd + "'", filename, lineno);
      }
    }
    return ast;
  };

  Parser.prototype.stringify = function(deparsed) {
    var _writeTriggers, begin, doneRandom, i, includes, inherits, j, k, key, l, len, len1, len2, pipes, ref, ref1, ref2, source, tagged, tagline, test, topic, topics, value;
    if (deparsed == null) {
      deparsed = this.master.deparse();
    }
    _writeTriggers = function(triggers, indent) {
      var c, id, j, k, l, len, len1, len2, output, r, ref, ref1, t;
      id = indent ? "\t" : "";
      output = [];
      for (j = 0, len = triggers.length; j < len; j++) {
        t = triggers[j];
        output.push(id + "+ " + t.trigger);
        if (t.previous) {
          output.push(id + "% " + t.previous);
        }
        if (t.condition) {
          ref = t.condition;
          for (k = 0, len1 = ref.length; k < len1; k++) {
            c = ref[k];
            output.push(id + "* " + c);
          }
        }
        if (t.redirect) {
          output.push(id + "@ " + t.redirect);
        }
        if (t.reply) {
          ref1 = t.reply;
          for (l = 0, len2 = ref1.length; l < len2; l++) {
            r = ref1[l];
            output.push(id + "- " + r);
          }
        }
        output.push("");
      }
      return output;
    };
    source = ["! version = 2.0", "! local concat = none", ""];
    ref = ["global", "var", "sub", "person", "array"];
    for (j = 0, len = ref.length; j < len; j++) {
      begin = ref[j];
      if ((deparsed.begin[begin] != null) && Object.keys(deparsed.begin[begin]).length) {
        ref1 = deparsed.begin[begin];
        for (key in ref1) {
          value = ref1[key];
          if (!deparsed.begin[begin].hasOwnProperty(key)) {
            continue;
          }
          if (begin !== "array") {
            source.push("! " + begin + " " + key + " = " + value);
          } else {
            pipes = " ";
            for (k = 0, len1 = value.length; k < len1; k++) {
              test = value[k];
              if (test.match(/\s+/)) {
                pipes = "|";
                break;
              }
            }
            source.push(("! " + begin + " " + key + " = ") + value.join(pipes));
          }
        }
        source.push("");
      }
    }
    if ((ref2 = deparsed.begin.triggers) != null ? ref2.length : void 0) {
      source.push("> begin\n");
      source.push.apply(source, _writeTriggers(deparsed.begin.triggers, "indent"));
      source.push("< begin\n");
    }
    topics = Object.keys(deparsed.topics).sort(function(a, b) {
      return a - b;
    });
    topics.unshift("random");
    doneRandom = false;
    for (l = 0, len2 = topics.length; l < len2; l++) {
      topic = topics[l];
      if (!deparsed.topics.hasOwnProperty(topic)) {
        continue;
      }
      if (topic === "random" && doneRandom) {
        continue;
      }
      if (topic === "random") {
        doneRandom = 1;
      }
      tagged = false;
      tagline = [];
      if (topic !== "random" || (Object.keys(deparsed.inherits[topic]).length > 0 || Object.keys(deparsed.includes[topic]).length > 0)) {
        if (topic !== "random") {
          tagged = true;
        }
        inherits = [];
        includes = [];
        for (i in deparsed.inherits[topic]) {
          if (!deparsed.inherits[topic].hasOwnProperty(i)) {
            continue;
          }
          inherits.push(i);
        }
        for (i in deparsed.includes[topic]) {
          if (!deparsed.includes[topic].hasOwnProperty(i)) {
            continue;
          }
          includes.push(i);
        }
        if (includes.length > 0) {
          includes.unshift("includes");
          tagline.push.apply(tagline, includes);
          tagged = true;
        }
        if (inherits.length > 0) {
          inherits.unshift("inherits");
          tagline.push.apply(tagline, inherits);
          tagged = true;
        }
      }
      if (tagged) {
        source.push(("> topic " + topic + " ") + tagline.join(" ") + "\n");
      }
      source.push.apply(source, _writeTriggers(deparsed.topics[topic], tagged));
      if (tagged) {
        source.push("< topic\n");
      }
    }
    return source.join("\n");
  };

  Parser.prototype.checkSyntax = function(cmd, line) {
    var angle, char, chars, curly, j, len, parens, parts, square;
    if (cmd === "!") {
      if (!line.match(/^.+(?:\s+.+|)\s*=\s*.+?$/)) {
        return "Invalid format for !Definition line: must be '! type name = value' OR '! type = value'";
      }
    } else if (cmd === ">") {
      parts = line.split(/\s+/);
      if (parts[0] === "begin" && parts.length > 1) {
        return "The 'begin' label takes no additional arguments";
      } else if (parts[0] === "topic") {
        if (line.match(/[^a-z0-9_\-\s]/)) {
          return "Topics should be lowercased and contain only letters and numbers";
        }
      } else if (parts[0] === "object") {
        if (line.match(/[^A-Za-z0-9\_\-\s]/)) {
          return "Objects can only contain numbers and letters";
        }
      }
    } else if (cmd === "+" || cmd === "%" || cmd === "@") {
      parens = square = curly = angle = 0;
      if (this.utf8) {
        if (line.match(/[A-Z\\.]/)) {
          return "Triggers can't contain uppercase letters, backslashes or dots in UTF-8 mode";
        }
      } else if (line.match(/[^a-z0-9(|)\[\]*_#@{}<>=\s]/)) {
        return "Triggers may only contain lowercase letters, numbers, and these symbols: ( | ) [ ] * _ # { } < > =";
      }
      chars = line.split("");
      for (j = 0, len = chars.length; j < len; j++) {
        char = chars[j];
        switch (char) {
          case "(":
            parens++;
            break;
          case ")":
            parens--;
            break;
          case "[":
            square++;
            break;
          case "]":
            square--;
            break;
          case "{":
            curly++;
            break;
          case "}":
            curly--;
            break;
          case "<":
            angle++;
            break;
          case ">":
            angle--;
        }
      }
      if (parens !== 0) {
        return "Unmatched parenthesis brackets";
      }
      if (square !== 0) {
        return "Unmatched square brackets";
      }
      if (curly !== 0) {
        return "Unmatched curly brackets";
      }
      if (angle !== 0) {
        return "Unmatched angle brackets";
      }
    } else if (cmd === "*") {
      if (!line.match(/^.+?\s*(?:==|eq|!=|ne|<>|<|<=|>|>=)\s*.+?=>.+?$/)) {
        return "Invalid format for !Condition: should be like '* value symbol value => response'";
      }
    }
    return "";
  };

  Parser.prototype.initTopic = function(topics, name) {
    if (topics[name] == null) {
      return topics[name] = {
        includes: {},
        inherits: {},
        triggers: []
      };
    }
  };

  return Parser;

})();

module.exports = Parser;

},{"./utils":7}],5:[function(require,module,exports){
"use strict";
var Brain, JSObjectHandler, Parser, RiveScript, VERSION, inherit_utils, sorting, utils;

VERSION = "1.2.1";

Parser = require("./parser");

Brain = require("./brain");

utils = require("./utils");

sorting = require("./sorting");

inherit_utils = require("./inheritance");

JSObjectHandler = require("./lang/javascript");

RiveScript = (function() {
  function RiveScript(opts) {
    if (opts == null) {
      opts = {};
    }
    this._debug = opts.debug ? opts.debug : false;
    this._strict = opts.strict ? opts.strict : true;
    this._depth = opts.depth ? parseInt(opts.depth) : 50;
    this._utf8 = opts.utf8 ? opts.utf8 : false;
    this._onDebug = opts.onDebug ? opts.onDebug : null;
    this.unicodePunctuation = new RegExp(/[.,!?;:]/g);
    this._node = {};
    this._runtime = this.runtime();
    this.parser = new Parser(this);
    this.brain = new Brain(this);
    this._pending = [];
    this._loadCount = 0;
    this._global = {};
    this._var = {};
    this._sub = {};
    this._person = {};
    this._array = {};
    this._users = {};
    this._freeze = {};
    this._includes = {};
    this._inherits = {};
    this._handlers = {};
    this._objlangs = {};
    this._topics = {};
    this._thats = {};
    this._sorted = {};
    if (typeof opts === "object") {
      if (opts.debug) {
        this._debug = true;
      }
      if (opts.strict) {
        this._strict = true;
      }
      if (opts.depth) {
        this._depth = parseInt(opts.depth);
      }
      if (opts.utf8) {
        this._utf8 = true;
      }
    }
    this._handlers.javascript = new JSObjectHandler(this);
    this.say("RiveScript Interpreter v" + VERSION + " Initialized.");
    this.say("Runtime Environment: " + this._runtime);
  }

  RiveScript.prototype.version = function() {
    return VERSION;
  };

  RiveScript.prototype.runtime = function() {
    if (typeof window === "undefined" && typeof module === "object") {
      this._node.fs = require("fs");
      return "node";
    }
    return "web";
  };

  RiveScript.prototype.say = function(message) {
    if (this._debug !== true) {
      return;
    }
    if (this._onDebug) {
      return this._onDebug(message);
    } else {
      return console.log(message);
    }
  };

  RiveScript.prototype.warn = function(message, filename, lineno) {
    if ((filename != null) && (lineno != null)) {
      message += " at " + filename + " line " + lineno;
    }
    if (this._onDebug) {
      return this._onDebug("[WARNING] " + message);
    } else if (console) {
      if (console.error) {
        return console.error(message);
      } else {
        return console.log("[WARNING] " + message);
      }
    } else if (window) {
      return window.alert(message);
    }
  };

  RiveScript.prototype.loadFile = function(path, onSuccess, onError) {
    var file, i, len, loadCount;
    if (typeof path === "string") {
      path = [path];
    }
    loadCount = this._loadCount++;
    this._pending[loadCount] = {};
    for (i = 0, len = path.length; i < len; i++) {
      file = path[i];
      this.say("Request to load file: " + file);
      this._pending[loadCount][file] = 1;
      if (this._runtime === "web") {
        this._ajaxLoadFile(loadCount, file, onSuccess, onError);
      } else {
        this._nodeLoadFile(loadCount, file, onSuccess, onError);
      }
    }
    return loadCount;
  };

  RiveScript.prototype._ajaxLoadFile = function(loadCount, file, onSuccess, onError) {
    return $.ajax({
      url: file,
      dataType: "text",
      success: (function(_this) {
        return function(data, textStatus, xhr) {
          _this.say("Loading file " + file + " complete.");
          _this.parse(file, data, onError);
          delete _this._pending[loadCount][file];
          if (Object.keys(_this._pending[loadCount]).length === 0) {
            if (typeof onSuccess === "function") {
              return onSuccess.call(void 0, loadCount);
            }
          }
        };
      })(this),
      error: (function(_this) {
        return function(xhr, textStatus, errorThrown) {
          _this.say("Ajax error! " + textStatus + "; " + errorThrown);
          if (typeof onError === "function") {
            return onError.call(void 0, textStatus, loadCount);
          }
        };
      })(this)
    });
  };

  RiveScript.prototype._nodeLoadFile = function(loadCount, file, onSuccess, onError) {
    return this._node.fs.readFile(file, (function(_this) {
      return function(err, data) {
        if (err) {
          if (typeof onError === "function") {
            onError.call(void 0, err, loadCount);
          } else {
            _this.warn(err);
          }
          return;
        }
        _this.parse(file, "" + data, onError);
        delete _this._pending[loadCount][file];
        if (Object.keys(_this._pending[loadCount]).length === 0) {
          if (typeof onSuccess === "function") {
            return onSuccess.call(void 0, loadCount);
          }
        }
      };
    })(this));
  };

  RiveScript.prototype.loadDirectory = function(path, onSuccess, onError) {
    var loadCount;
    if (this._runtime === "web") {
      this.warn("loadDirectory can't be used on the web!");
      return;
    }
    loadCount = this._loadCount++;
    this._pending[loadCount] = {};
    this.say("Loading batch " + loadCount + " from directory " + path);
    return this._node.fs.readdir(path, (function(_this) {
      return function(err, files) {
        var file, i, j, len, len1, results, toLoad;
        if (err) {
          if (typeof onError === "function") {
            onError.call(void 0, err);
          } else {
            _this.warn(err);
          }
          return;
        }
        toLoad = [];
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          if (file.match(/\.(rive|rs)$/i)) {
            _this._pending[loadCount][path + "/" + file] = 1;
            toLoad.push(path + "/" + file);
          }
        }
        results = [];
        for (j = 0, len1 = toLoad.length; j < len1; j++) {
          file = toLoad[j];
          _this.say("Parsing file " + file + " from directory");
          results.push(_this._nodeLoadFile(loadCount, file, onSuccess, onError));
        }
        return results;
      };
    })(this));
  };

  RiveScript.prototype.stream = function(code, onError) {
    this.say("Streaming code.");
    return this.parse("stream()", code, onError);
  };

  RiveScript.prototype.parse = function(filename, code, onError) {
    var ast, data, i, internal, j, len, len1, name, object, ref, ref1, ref2, ref3, results, topic, trigger, type, value, vars;
    this.say("Parsing code!");
    ast = this.parser.parse(filename, code, onError);
    ref = ast.begin;
    for (type in ref) {
      vars = ref[type];
      if (!ast.begin.hasOwnProperty(type)) {
        continue;
      }
      internal = "_" + type;
      for (name in vars) {
        value = vars[name];
        if (!vars.hasOwnProperty(name)) {
          continue;
        }
        if (value === "<undef>") {
          delete this[internal][name];
        } else {
          this[internal][name] = value;
        }
      }
      if (this._global.debug != null) {
        this._debug = this._global.debug === "true" ? true : false;
      }
      if (this._global.depth != null) {
        this._depth = parseInt(this._global.depth) || 50;
      }
    }
    ref1 = ast.topics;
    for (topic in ref1) {
      data = ref1[topic];
      if (!ast.topics.hasOwnProperty(topic)) {
        continue;
      }
      if (this._includes[topic] == null) {
        this._includes[topic] = {};
      }
      if (this._inherits[topic] == null) {
        this._inherits[topic] = {};
      }
      utils.extend(this._includes[topic], data.includes);
      utils.extend(this._inherits[topic], data.inherits);
      if (this._topics[topic] == null) {
        this._topics[topic] = [];
      }
      ref2 = data.triggers;
      for (i = 0, len = ref2.length; i < len; i++) {
        trigger = ref2[i];
        this._topics[topic].push(trigger);
        if (trigger.previous != null) {
          if (this._thats[topic] == null) {
            this._thats[topic] = {};
          }
          if (this._thats[topic][trigger.trigger] == null) {
            this._thats[topic][trigger.trigger] = {};
          }
          this._thats[topic][trigger.trigger][trigger.previous] = trigger;
        }
      }
    }
    ref3 = ast.objects;
    results = [];
    for (j = 0, len1 = ref3.length; j < len1; j++) {
      object = ref3[j];
      if (this._handlers[object.language]) {
        this._objlangs[object.name] = object.language;
        results.push(this._handlers[object.language].load(object.name, object.code));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  RiveScript.prototype.sortReplies = function() {
    var allTriggers, thatTriggers, topic;
    this._sorted.topics = {};
    this._sorted.thats = {};
    this.say("Sorting triggers...");
    for (topic in this._topics) {
      if (!this._topics.hasOwnProperty(topic)) {
        continue;
      }
      this.say("Analyzing topic " + topic + "...");
      allTriggers = inherit_utils.getTopicTriggers(this, topic);
      this._sorted.topics[topic] = sorting.sortTriggerSet(allTriggers, true);
      thatTriggers = inherit_utils.getTopicTriggers(this, topic, true);
      this._sorted.thats[topic] = sorting.sortTriggerSet(thatTriggers, false);
    }
    this._sorted.sub = sorting.sortList(Object.keys(this._sub));
    return this._sorted.person = sorting.sortList(Object.keys(this._person));
  };

  RiveScript.prototype.deparse = function() {
    var result;
    result = {
      begin: {
        global: utils.clone(this._global),
        "var": utils.clone(this._var),
        sub: utils.clone(this._sub),
        person: utils.clone(this._person),
        array: utils.clone(this._array),
        triggers: []
      },
      topics: utils.clone(this._topics),
      inherits: utils.clone(this._inherits),
      includes: utils.clone(this._includes)
    };
    if (result.topics.__begin__ != null) {
      result.begin.triggers = result.topics.__begin__;
      delete result.topics.__begin__;
    }
    if (this._debug) {
      result.begin.global.debug = this._debug;
    }
    if (this._depth !== 50) {
      result.begin.global.depth = this._depth;
    }
    return result;
  };

  RiveScript.prototype.stringify = function(deparsed) {
    return this.parser.stringify(deparsed);
  };

  RiveScript.prototype.write = function(filename, deparsed) {
    if (this._runtime === "web") {
      this.warn("write() can't be used on the web!");
      return;
    }
    return this._node.fs.writeFile(filename, this.stringify(deparsed), function(err) {
      if (err) {
        return this.warn("Error writing to file " + filename + ": " + err);
      }
    });
  };

  RiveScript.prototype.setHandler = function(lang, obj) {
    if (obj === void 0) {
      return delete this._handlers[lang];
    } else {
      return this._handlers[lang] = obj;
    }
  };

  RiveScript.prototype.setSubroutine = function(name, code) {
    if (this._handlers.javascript) {
      this._objlangs[name] = "javascript";
      return this._handlers.javascript.load(name, code);
    }
  };

  RiveScript.prototype.setGlobal = function(name, value) {
    if (value === void 0) {
      return delete this._global[name];
    } else {
      return this._global[name] = value;
    }
  };

  RiveScript.prototype.setVariable = function(name, value) {
    if (value === void 0) {
      return delete this._var[name];
    } else {
      return this._var[name] = value;
    }
  };

  RiveScript.prototype.setSubstitution = function(name, value) {
    if (value === void 0) {
      return delete this._sub[name];
    } else {
      return this._sub[name] = value;
    }
  };

  RiveScript.prototype.setPerson = function(name, value) {
    if (value === void 0) {
      return delete this._person[name];
    } else {
      return this._person[name] = value;
    }
  };

  RiveScript.prototype.setUservar = function(user, name, value) {
    if (!this._users[user]) {
      this._users[user] = {
        topic: "random"
      };
    }
    if (value === void 0) {
      return delete this._users[user][name];
    } else {
      return this._users[user][name] = value;
    }
  };

  RiveScript.prototype.setUservars = function(user, data) {
    var key, results;
    if (!this._users[user]) {
      this._users[user] = {
        topic: "random"
      };
    }
    results = [];
    for (key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }
      if (data[key] === void 0) {
        results.push(delete this._users[user][key]);
      } else {
        results.push(this._users[user][key] = data[key]);
      }
    }
    return results;
  };

  RiveScript.prototype.getVariable = function(user, name) {
    if (typeof this._var[name] !== "undefined") {
      return this._var[name];
    } else {
      return "undefined";
    }
  };

  RiveScript.prototype.getUservar = function(user, name) {
    if (!this._users[user]) {
      return "undefined";
    }
    if (typeof this._users[user][name] !== "undefined") {
      return this._users[user][name];
    } else {
      return "undefined";
    }
  };

  RiveScript.prototype.getUservars = function(user) {
    if (user === void 0) {
      return utils.clone(this._users);
    } else {
      if (this._users[user] != null) {
        return utils.clone(this._users[user]);
      }
      return void 0;
    }
  };

  RiveScript.prototype.clearUservars = function(user) {
    if (user === void 0) {
      return this._users = {};
    } else {
      return delete this._users[user];
    }
  };

  RiveScript.prototype.freezeUservars = function(user) {
    if (this._users[user] != null) {
      return this._freeze[user] = utils.clone(this._users[user]);
    } else {
      return this.warn("Can't freeze vars for user " + user + ": not found!");
    }
  };

  RiveScript.prototype.thawUservars = function(user, action) {
    if (action == null) {
      action = "thaw";
    }
    if (typeof action !== "string") {
      action = "thaw";
    }
    if (this._freeze[user] == null) {
      this.warn("Can't thaw user vars: " + user + " wasn't frozen!");
      return;
    }
    if (action === "thaw") {
      this.clearUservars(user);
      this._users[user] = utils.clone(this._freeze[user]);
      return delete this._freeze[user];
    } else if (action === "discard") {
      return delete this._freeze[user];
    } else if (action === "keep") {
      this.clearUservars(user);
      return this._users[user] = utils.clone(this._freeze[user]);
    } else {
      return this.warn("Unsupported thaw action!");
    }
  };

  RiveScript.prototype.lastMatch = function(user) {
    if (this._users[user] != null) {
      return this._users[user].__lastmatch__;
    }
    return void 0;
  };

  RiveScript.prototype.currentUser = function() {
    if (this.brain._currentUser === void 0) {
      this.warn("currentUser() is intended to be called from within a JS object macro!");
    }
    return this.brain._currentUser;
  };

  RiveScript.prototype.reply = function(user, msg, scope) {
    return this.brain.reply(user, msg, scope);
  };

  return RiveScript;

})();

module.exports = RiveScript;

},{"./brain":1,"./inheritance":2,"./lang/javascript":3,"./parser":4,"./sorting":6,"./utils":7,"fs":8}],6:[function(require,module,exports){
var initSortTrack, utils;

utils = require("./utils");

exports.sortTriggerSet = function(triggers, exclude_previous, say) {
  var cnt, highest_inherits, i, inherits, ip, j, k, kind, kind_sorted, l, len, len1, len2, len3, len4, len5, m, match, n, p, pattern, pound_sorted, prior, prior_sort, ref, ref1, running, sorted_by_length, star_sorted, track, track_sorted, trig, under_sorted, weight, wordcnt;
  if (say == null) {
    say = function(what) {};
  }
  if (exclude_previous == null) {
    exclude_previous = true;
  }
  prior = {
    "0": []
  };
  for (i = 0, len = triggers.length; i < len; i++) {
    trig = triggers[i];
    if (exclude_previous && (trig[1].previous != null)) {
      continue;
    }
    match = trig[0].match(/\{weight=(\d+)\}/i);
    weight = 0;
    if (match && match[1]) {
      weight = match[1];
    }
    if (prior[weight] == null) {
      prior[weight] = [];
    }
    prior[weight].push(trig);
  }
  running = [];
  prior_sort = Object.keys(prior).sort(function(a, b) {
    return b - a;
  });
  for (j = 0, len1 = prior_sort.length; j < len1; j++) {
    p = prior_sort[j];
    say("Sorting triggers with priority " + p);
    inherits = -1;
    highest_inherits = -1;
    track = {};
    track[inherits] = initSortTrack();
    ref = prior[p];
    for (k = 0, len2 = ref.length; k < len2; k++) {
      trig = ref[k];
      pattern = trig[0];
      say("Looking at trigger: " + pattern);
      match = pattern.match(/\{inherits=(\d+)\}/i);
      if (match) {
        inherits = parseInt(match[1]);
        if (inherits > highest_inherits) {
          highest_inherits = inherits;
        }
        say("Trigger belongs to a topic that inherits other topics. Level=" + inherits);
        pattern = pattern.replace(/\{inherits=\d+\}/ig, "");
        trig[0] = pattern;
      } else {
        inherits = -1;
      }
      if (track[inherits] == null) {
        track[inherits] = initSortTrack();
      }
      if (pattern.indexOf("_") > -1) {
        cnt = utils.word_count(pattern);
        say("Has a _ wildcard with " + cnt + " words.");
        if (cnt > 0) {
          if (track[inherits].alpha[cnt] == null) {
            track[inherits].alpha[cnt] = [];
          }
          track[inherits].alpha[cnt].push(trig);
        } else {
          track[inherits].under.push(trig);
        }
      } else if (pattern.indexOf("#") > -1) {
        cnt = utils.word_count(pattern);
        say("Has a # wildcard with " + cnt + " words.");
        if (cnt > 0) {
          if (track[inherits].number[cnt] == null) {
            track[inherits].number[cnt] = [];
          }
          track[inherits].number[cnt].push(trig);
        } else {
          track[inherits].pound.push(trig);
        }
      } else if (pattern.indexOf("*") > -1) {
        cnt = utils.word_count(pattern);
        say("Has a * wildcard with " + cnt + " words.");
        if (cnt > 0) {
          if (track[inherits].wild[cnt] == null) {
            track[inherits].wild[cnt] = [];
          }
          track[inherits].wild[cnt].push(trig);
        } else {
          track[inherits].star.push(trig);
        }
      } else if (pattern.indexOf("[") > -1) {
        cnt = utils.word_count(pattern);
        say("Has optionals with " + cnt + " words.");
        if (track[inherits].option[cnt] == null) {
          track[inherits].option[cnt] = [];
        }
        track[inherits].option[cnt].push(trig);
      } else {
        cnt = utils.word_count(pattern);
        say("Totally atomic trigger with " + cnt + " words.");
        if (track[inherits].atomic[cnt] == null) {
          track[inherits].atomic[cnt] = [];
        }
        track[inherits].atomic[cnt].push(trig);
      }
    }
    track[highest_inherits + 1] = track['-1'];
    delete track['-1'];
    track_sorted = Object.keys(track).sort(function(a, b) {
      return a - b;
    });
    for (l = 0, len3 = track_sorted.length; l < len3; l++) {
      ip = track_sorted[l];
      say("ip=" + ip);
      ref1 = ["atomic", "option", "alpha", "number", "wild"];
      for (m = 0, len4 = ref1.length; m < len4; m++) {
        kind = ref1[m];
        kind_sorted = Object.keys(track[ip][kind]).sort(function(a, b) {
          return b - a;
        });
        for (n = 0, len5 = kind_sorted.length; n < len5; n++) {
          wordcnt = kind_sorted[n];
          sorted_by_length = track[ip][kind][wordcnt].sort(function(a, b) {
            return b.length - a.length;
          });
          running.push.apply(running, sorted_by_length);
        }
      }
      under_sorted = track[ip].under.sort(function(a, b) {
        return b.length - a.length;
      });
      pound_sorted = track[ip].pound.sort(function(a, b) {
        return b.length - a.length;
      });
      star_sorted = track[ip].star.sort(function(a, b) {
        return b.length - a.length;
      });
      running.push.apply(running, under_sorted);
      running.push.apply(running, pound_sorted);
      running.push.apply(running, star_sorted);
    }
  }
  return running;
};

exports.sortList = function(items) {
  var bylen, cnt, count, i, item, j, len, len1, output, sorted, track;
  track = {};
  for (i = 0, len = items.length; i < len; i++) {
    item = items[i];
    cnt = utils.word_count(item, true);
    if (track[cnt] == null) {
      track[cnt] = [];
    }
    track[cnt].push(item);
  }
  output = [];
  sorted = Object.keys(track).sort(function(a, b) {
    return b - a;
  });
  for (j = 0, len1 = sorted.length; j < len1; j++) {
    count = sorted[j];
    bylen = track[count].sort(function(a, b) {
      return b.length - a.length;
    });
    output.push.apply(output, bylen);
  }
  return output;
};

initSortTrack = function() {
  return {
    atomic: {},
    option: {},
    alpha: {},
    number: {},
    wild: {},
    pound: [],
    under: [],
    star: []
  };
};

},{"./utils":7}],7:[function(require,module,exports){
exports.strip = function(text) {
  text = text.replace(/^[\s\t]+/, "").replace(/[\s\t]+$/, "").replace(/[\x0D\x0A]+/, "");
  return text;
};

exports.extend = function(a, b) {
  var attr, results, value;
  results = [];
  for (attr in b) {
    value = b[attr];
    if (!b.hasOwnProperty(attr)) {
      continue;
    }
    results.push(a[attr] = value);
  }
  return results;
};

exports.word_count = function(trigger, all) {
  var i, len, wc, word, words;
  words = [];
  if (all) {
    words = trigger.split(/\s+/);
  } else {
    words = trigger.split(/[\s\*\#\_\|]+/);
  }
  wc = 0;
  for (i = 0, len = words.length; i < len; i++) {
    word = words[i];
    if (word.length > 0) {
      wc++;
    }
  }
  return wc;
};

exports.stripNasties = function(string, utf8) {
  if (utf8) {
    string = string.replace(/[\\<>]+/g, "");
    return string;
  }
  string = string.replace(/[^A-Za-z0-9 ]/g, "");
  return string;
};

exports.quotemeta = function(string) {
  var char, i, len, unsafe;
  unsafe = "\\.+*?[^]$(){}=!<>|:".split("");
  for (i = 0, len = unsafe.length; i < len; i++) {
    char = unsafe[i];
    string = string.replace(new RegExp("\\" + char, "g"), "\\" + char);
  }
  return string;
};

exports.isAtomic = function(trigger) {
  var i, len, ref, special;
  ref = ["*", "#", "_", "(", "[", "<", "@"];
  for (i = 0, len = ref.length; i < len; i++) {
    special = ref[i];
    if (trigger.indexOf(special) > -1) {
      return false;
    }
  }
  return true;
};

exports.stringFormat = function(type, string) {
  var first, i, len, result, word, words;
  if (type === "uppercase") {
    return string.toUpperCase();
  } else if (type === "lowercase") {
    return string.toLowerCase();
  } else if (type === "sentence") {
    string += "";
    first = string.charAt(0).toUpperCase();
    return first + string.substring(1);
  } else if (type === "formal") {
    words = string.split(/\s+/);
    result = [];
    for (i = 0, len = words.length; i < len; i++) {
      word = words[i];
      first = word.charAt(0).toUpperCase();
      result.push(first + word.substring(1));
    }
    return result.join(" ");
  }
  return content;
};

exports.clone = function(obj) {
  var copy, key;
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  copy = obj.constructor();
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    copy[key] = exports.clone(obj[key]);
  }
  return copy;
};

},{}],8:[function(require,module,exports){

},{}]},{},[5])(5)
});
