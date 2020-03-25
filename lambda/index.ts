import * as awsServerlessExpress from 'aws-serverless-express';
import { Application } from 'express';
import { App, ExpressReceiver } from '@slack/bolt';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

const EMOJI = 'grinning';
const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!
});
export const expressApp: Application = expressReceiver.app;
expressApp.use(awsServerlessExpressMiddleware.eventContext());
const app: App = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

app.event('app_home_opened', async ({ event, context }) => {
  try {
    console.log('app_home_opened invoked', context.botToken);

    const conversations = await app.client.conversations.history({
      token: context.botToken,
      channel: 'CN89G5ZTL'
    });

    console.log('conversations', conversations);

    if (!conversations.ok) {
      throw new Error('Request Failed');
    }

    const messages = conversations.messages as any[];
    const items = messages
      .filter(message => message.files)
      .sort((a: any, b: any) => {
        const aReaction = a.reactions.find(
          (reaction: any) => reaction.name === EMOJI
        );
        const bReaction = b.reactions.find(
          (reaction: any) => reaction.name === EMOJI
        );

        if (aReaction.count > bReaction.count) return 1;
        if (aReaction.count < bReaction.count) return -1;

        const aOther = a.reactions
          .filter((reaction: any) => reaction.name !== EMOJI)
          .reduce((sum: number, reaction: any) => sum + reaction.count, 0);

        const bOther = b.reactions
          .filter((reaction: any) => reaction.name !== EMOJI)
          .reduce((sum: number, reaction: any) => sum + reaction.count, 0);

        if (aOther > bOther) return 1;
        if (aOther < bOther) return -1;
        return 0;
      })
      .map(message => {
        const voteReaction = message.reactions.find(
          (reaction: any) => reaction.name === EMOJI
        );

        const other = message.reactions
          .filter((reaction: any) => reaction.name !== EMOJI)
          .reduce((sum: number, reaction: any) => sum + reaction.count, 0);

        return {
          user: message.user,
          text: message.text,
          voteCount: voteReaction.count,
          otherCount: other
        };
      });

    console.log(items);

    const blocks: any[] = [];

    for (let item of items) {
      const userResult = await app.client.users.info({
        token: context.botToken,
        user: item.user
      });
      const user = userResult.user as any;
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${user.profile.real_name}*\n ${item.text}\n votes: ${item.voteCount}\n other: ${item.otherCount}`
        }
      });
    }

    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await app.client.views.publish({
      /* retrieves your xoxb token from context */
      token: context.botToken,

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view payload that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// Check the details of the error to handle cases where you should retry sending a message or stop the app
app.error(error => {
  console.error(error);
});

const server = awsServerlessExpress.createServer(expressApp);

if (process.env.NODE_ENV === 'development') {
  (async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
  })();
}

exports.handler = (event: any = {}, context: any = {}) => {
  awsServerlessExpress.proxy(server, event, context);
};
