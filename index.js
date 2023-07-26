require("dotenv").config();
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const {Sequelize} = require("sequelize");
const express = require("express");
const app = express();
const {connection} = require('./db');
const cors = require('cors');
const session = require("express-session");
const swaggerJSON = require('./Swagger.json');
const ErrorHandler = require("./middlewares/errorHandler");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
app.use(express.json());
app.use(
  session({
    store: new SequelizeStore({
      db: connection,
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  })
);
app.use(cors());
const webPush = require('web-push');


// console.log(webPush.generateVAPIDKeys());


const publicKey = 'BN69bTRuil6wT1gdV_daOX6usqgVZofjaFUDFz-2WtKeC2YlUGEMz8vvVbqhuA-cp8IwBFfrde6Dp3QhiEwgyfc';
const privateKey = 'mLVmbk81MabnJN3UETnwbV-4LdMsSEmqVey7QqRFogI';


const sub = {"endpoint":"https://fcm.googleapis.com/fcm/send/dxW1nTP8cp8:APA91bFk75BXSjh5WB6FCJjhiiuDd8CFgD5am8bZRuzmdSm0Cgr48QfRqogD037l2cNa2OjIt-QgOyOB0-gKBKppWHT5JDe5Iaj1pPFxTFQUwGKJLkuQMUwwQp1XUG_4qA5FFJ_TW3oi","expirationTime":null,"keys":{"p256dh":"BKXWSFDWvuLIL4aBuIVSue2rLhCUPFBE8KiQm3aqYudg15pagMo6simLk6DDONQXAGr-YGgd_pS9ecZ9deipzWg","auth":"rEUZnC9TCCFEMgLYARo7xg"}}

webPush.setVapidDetails('mailto:example@yopmail.com', publicKey, privateKey);


app.get('/api/notification',(req,res)=>{
  const payload = {
    "notification":{
      "data":{message:'You have received New Message !'},
      "title":"You Have New Message !",
      "vibrate":[100,50,100]
    }
  }
  webPush.sendNotification(sub,JSON.stringify(payload));
   res.send('<h1>Notification sent !</h1>')
});

app.use('/api/docs',swaggerUI.serve,swaggerUI.setup(swaggerJSON))
app.use("/api/users", require("./routes/user"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/posts", require("./routes/comment"));
app.use("/api/chats", require("./routes/chat"));
app.use(ErrorHandler);
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send('<h1>Server is working</h1>')
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
