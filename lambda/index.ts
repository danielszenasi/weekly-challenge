import * as awsServerlessExpress from 'aws-serverless-express';
import { Application } from 'express';
import { App, ExpressReceiver } from '@slack/bolt';

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!
});
export const expressApp: Application = expressReceiver.app;

const app: App = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

app.event('app_home_opened', async ({ event, context }) => {
  try {
    const conversations = await app.client.conversations.history({
      token: context.botToken,
      channel: 'CN89G5ZTL'
    });

    if (conversations.ok && conversations.response_metadata) {
      console.log(conversations.response_metadata);
      // conversations.response_metadata.messages.map(
      //   message => message.reactions
      // );
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
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: "*Welcome to your _App's Home_* :tada:"
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text:
                "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Click me!'
                }
              }
            ]
          }
        ]
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

exports.handler = (event: any = {}, context: any = {}) => {
  awsServerlessExpress.proxy(server, event, context);
};
