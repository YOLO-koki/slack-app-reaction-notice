require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000,
});

app.event("reaction_added", async ({ event, say, client }) => {
    const reactionItem = event.item;
    const channel = reactionItem.channel;
    const messageTimestamp = reactionItem.ts;

    // リアクションが付与されたメッセージの詳細情報の取得
    const messageInfo = await client.conversations.history({
        channel,
        latest: messageTimestamp,
        inclusive: true,
        limit: 1,
    });

    // リアクションされたメッセージのリンク情報の取得
    const messageLink = await client.chat.getPermalink({
        channel: channel,
        message_ts: messageTimestamp,
    });

    if (messageInfo.messages.length > 0 && !!messageInfo.messages[0].pinned_info) {
        const reactedMessage = messageInfo.messages[0];
        console.log("リアクションが付与されたメッセージ: ", reactedMessage);
        console.log("メッセージのテキスト: ", reactedMessage.text);
        await say({
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `> <@${event.user}>: :${reactedMessage.reactions.slice(-1)[0].name}:`,
                    },
                    accessory: {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Link here",
                        },
                        url: messageLink.permalink,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `${reactedMessage.text}`,
                    },
                },
            ],
            text: "This is a message you were gived reaction stamp. :fallback",
        });
    }
});

(async () => {
    // Start your app
    await app.start();

    console.log("⚡️ Bolt app is running!");
})();
