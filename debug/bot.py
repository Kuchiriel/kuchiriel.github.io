from rivescript import RiveScript

bot = RiveScript()
bot.load_directory("../brain")
bot.sort_replies()

while True:
    msg = input('You> ')
    if msg == '/quit':
        quit()

    reply = bot.reply("localuser", msg)
    print ('Bot>', reply)