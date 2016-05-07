const restify = require('restify');
const builder = require('botbuilder');
const moment = require('moment');

const bot = new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });

const dialog = new builder.CommandDialog();

bot.add('/', dialog);

// Install First Run middleware and dialog
bot.use(function (session, next) {
  if (!session.userData.firstRun) {
    session.userData.firstRun = true;
    session.beginDialog('/firstRun');
  } else {
    next();
  }
});

bot.add('/firstRun', [
  function (session) {
    session.send('Welcome the WeekBot!\n\nWrite week to get the current week number.\n\nWrite week <week number> to display another week.');
    session.replaceDialog('/');
  }
]);

function weekNumber (session, args) {
  if (args.matches.length >= 2 && parseInt(args.matches[1], 10)) {
    const weekNumber = parseInt(args.matches[1], 10);
    const startDate = moment().isoWeeks(weekNumber).startOf('isoweek');
    const endDate = moment().isoWeeks(weekNumber).endOf('isoweek');
    session.send(`These are the dates for Week: ${weekNumber}\n\n${startDate.format('dddd Do')} - ${endDate.format('dddd Do, MMM YYYY')}`);
  } else {
    const weekNumber = moment().isoWeek();
    const startDate = moment().isoWeeks(weekNumber).startOf('isoweek');
    const endDate = moment().isoWeeks(weekNumber).endOf('isoweek');

    session.send(`The current Week number is ${weekNumber}\n\n${startDate.format('dddd Do')} - ${endDate.format('dddd Do, MMM YYYY')}`);
  }
}

dialog.matches('^(?:week|weeknumber|week_number)(?: (.+))?', weekNumber);

function help (session, args) {
  session.send('Write week to get the current week number.\n\nWrite week <week number> to display another week.');
}

dialog.matches('^help', help);

dialog.onDefault(function (session) {
  session.send('I\'m sorry I don\'t support this command. Say `help` to see my commands.');
});

const server = restify.createServer();

server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

server.listen(process.env.port || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});
