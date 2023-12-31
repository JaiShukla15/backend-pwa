const { Op } = require("sequelize");
const { db } = require("../db");

module.exports = {
    getChats: async (req, res) => {
        const userId = req.session['user'].userId;
        if (!userId) {
            return res.status(401).json({
                message: 'Session exprired'
            });
        }

        const chats = await db.chats.findAll({
            where: {
                [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
            },
            include:{
             model:db.user
            },
            group:['chats.id','chats.sender_id','chats.receiver_id','user.id']
        });
        if (!chats) {
            return res.json({
                message: 'No chats available'
            })
        }
        res.json({
            data: chats
        });
    },
    sendMessage: async (req, res) => {
        console.log('REQUEST CAME #####',req.url);
        const userId = req.session['user'].userId;
        const {receiver_id, message } = req.body;
        if (!receiver_id || !message) return res.json({ message: 'details missing' })
        const addedMessage = await db.chats.create({
            sender_id:userId,
            receiver_id,
            message
        });
        if (!addedMessage) {
            return res.status(400).json({ message: 'Something went wrong' });
        }
        const payload = {
            "notification":{
              "data":{message:'You have received New Message !'},
              "title":"You Have New Message !",
              "vibrate":[100,50,100]
            }
          }
          
        //   webPush.sendNotification(sub, JSON.stringify(payload));
        return res.status(201).json({ message: 'Sent successfully' });
    },
    getChatMessages: async (req, res) => {
        const { id: chatUserId } = req.params;
        const userId = req.session['user'].userId;


        if (!chatUserId) return res.status(400).json({ message: 'Plese select the user to continue ' });
        const chats = await db.chats.findAll({
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { receiver_id: userId },
                            { sender_id: chatUserId }
                        ]
                    },
                    {
                        [Op.and]: [
                            { receiver_id: chatUserId },
                            { sender_id: userId }
                        ]
                    }

                ]
            },
            include:{
               model:db.user
            }
        });
        if (!chats) {
            return res.json({
                message: 'No chats available'
            })
        }
        res.json({
            data: chats
        });

    }
};