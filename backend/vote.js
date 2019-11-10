const express = require("express");
const cookieParser = require("cookie-parser");
const sqlite = require("sqlite");
const http = require("http");
const session = require("express-session");
const md5 = require("md5")
const path = require("path")
const dbp = sqlite.open(path.join(__dirname, "./db/vote-site.sqlite3"));
const multer = require("multer");
const mime = require('mime');
const Jimp = require("jimp");
const fs = require("fs");
const fsp = fs.promises;
const morgan = require("morgan");
const socketio = require("socket.io");
const _ = require("lodash")


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 10010;

//记录请求
app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use(express.static(__dirname + "/static/"));
app.use("/uploads", express.static(__dirname + "/uploads/"))

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}))

//设置cookieparser中间件。
app.use(cookieParser("secret"));
//解析json中间件
app.use(express.json());
//设置解码url解码中间件，并且选项设置为扩展
app.use(express.urlencoded({
  extended: true
}));

let db;
(async function () {
  dbp.then(p => {
    db = p
  })
})();



//登录页面
app.post("/login", (async (req, res, next) => {
  let userinfo = req.body;
  // if (req.body.identyfiCode != req.session.captcha) {
  //   res.json({
  //     code: -1,
  //     msg: "验证码错误！"
  //   });
  //   return;
  // }
  //数据库中查询判断用户名和密码。
  console.log(db);
  
  let user = await db.get("SELECT * FROM users WHERE password=? AND username=?", md5(md5(userinfo.password)), userinfo.username);
  if (user) {
    res.cookie("userid", user.id, {
      signed: true
    });
    res.json({
      code: 1,
      msg: "登录成功！"
    })
  } else {
    res.json({
      code: 0,
      msg: "用户名或密码错误！"
    });
  }
}));

//处理上传头像文件
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "." + mime.getExtension(file.mimetype));
  }
})
let upload = multer({ storage: storage });

//注册
app.post("/register", upload.single("avatar"), async (req, res, next) => {

  console.log(req.file);

  let registerInfo = req.body;
  //数据库检验是否已经注册过了
  let user = await db.get("SELECT * FROM users WHERE username=?", registerInfo.username);
  if (user) {
    await fsp.unlink("./uploads/" + req.file.filename);
    res.json({
      code: 0,
      msg: "用户名已存在"
    })
  } else {
    await Jimp.read("./uploads/" + req.file.filename).then(lenna => {
      return lenna.resize(256, 256).quality(60).write("./uploads/" + req.file.filename);
    })
    //将注册信息插入导数据库中
    await db.run("INSERT INTO users (username,email,password,avatar) VALUES(?,?,?,?)", registerInfo.username, registerInfo.email, md5(md5(registerInfo.password)), req.file.filename); //为密码加密   真正产品中还会加入盐值（随机字符拼接）
    res.json({
      code: 1,
      msg: "注册成功"
    })
  }
})



//获取用户信息
app.get("/userinfo", async (req, res, next) => {
  let id = req.signedCookies.userid;
  let user = await db.get("SELECT username,avatar FROM users WHERE id=?", id);
  if (user) {
    let votesInfo = await db.all("SELECT * FROM votes WHERE userid=?", id);
    res.json({
      code: 1,
      user,
      votesInfo,
    })
  } else {
    res.json({
      code: 0,
      msg: "没有登录"
    })
  }
})


//创建投票
app.post("/create", async (req, res, next) => {
  let userid = req.signedCookies.userid;
  let voteinfo = req.body;
  await db.run("INSERT INTO votes (votename,description,userid,issingle,deadline,isanonymous) VALUES (?,?,?,?,?,?)",
    voteinfo.title, voteinfo.description, userid, voteinfo.issingle, new Date(voteinfo.deadline).getTime(), 0);
  let voteid = (await db.get("SELECT id from votes ORDER BY id DESC LIMIT 1")).id; // 获取最近一次插入的投票id
  let optionsP = voteinfo.options.map(option => {
    return db.run("INSERT INTO options (content,voteid) VALUES (?,?)", option, voteid);
  })
  Promise.all(optionsP).then(() => {
    res.json({
      code: 1,
      voteid: voteid
    })
  })
})


//socketio连接
// socket.join(roomid) 应该分出不同的房间  不同的投票页面。
io.on("connection", function (socket) {
  console.log("a user connected");
  socket.on("joinRoom", msg => {
    console.log(msg.roomId);
    console.log(typeof msg.roomId);
    socket.join(msg.roomId);
  })

  socket.on("disconnect", function () {
    console.log("a user disconnected");
  })
})


//处理投票相关
//删除 获取 投票
app.route("/vote/:id")
  .post(async (req, res, next) => {
    let userid = req.signedCookies.userid;
    let data = req.body;
    let voteid = req.params.id + "";
    let optionId = data.optionId;
    console.log(voteid);

    if (data.type === "singleChange") { // 单选改变选项。
      await db.run("UPDATE votesup SET optionid = ? WHERE userid = ? AND voteid = ?", optionId, userid, voteid);
      io.in(voteid).emit("singleChange", {
        type: "singleChange",
        optionId,
        userid,
      })
    }
    if (data.type === "singleNew") {//单选新增选项。
      await db.run("INSERT INTO votesup (optionid,userid,voteid) VALUES (?,?,?)", optionId, userid, voteid);
      let avatar = await db.get("SELECT avatar from users WHERE id = ?", userid);
      io.in(voteid).emit("singleNew", {
        type: "singleNew",
        optionId,
        userid,
        avatar,
      })
    }
    if (data.type === "multipleNew") {// 多选新增选项。
      await db.run("INSERT INTO votesup (optionid,userid,voteid) VALUES (?,?,?)", optionId, userid, voteid);
      let avatar = await db.get("SELECT avatar from users WHERE id = ?", userid);
      io.in(voteid).emit("multipleNew", {
        type: "multipleNew",
        optionId,
        userid,
        avatar,
      })
    }
    if (data.type === "multipleCancel") { //多选取消选项。
      await db.run("DELETE FROM votesup WHERE optionId = ? AND userid = ? AND voteid = ?", optionId, userid, voteid);
      io.in(voteid).emit("multipleCancel", {
        type: "multipleCancel",
        userid,
        optionId,
      })
    }
    res.json({
      code: 1,
    })
  })
  .get(async (req, res, next) => {
    let userid = req.signedCookies.userid;
    let voteid = req.params.id;
    let voteInfo = await db.get("SELECT * FROM votes WHERE id=?", voteid);
    let optionsInfo = await db.all("SELECT * FROM options WHERE voteid=?", voteid);
    let votesup = await db.all("SELECT users.avatar,votesup.userid,votesup.optionid FROM votesup INNER JOIN users ON users.id = votesup.userid  WHERE votesup.voteid = ?", voteid);
    res.json({
      userid,
      voteInfo,
      optionsInfo,
      votesup
    })
  })
  .delete(async (req, res, next) => {
    let launcher = req.signedCookies.userid;
    let voteid = req.params.id;
    let { userid } = await db.get("SELECT userid FROM votes WHERE id=?", voteid);
    if (userid == launcher) {
      try {
        await db.run("DELETE FROM votes WHERE id=?", voteid);
        await db.run("DELETE FROM options WHERE voteid=?", voteid);
        await db.run("DELETE FROM votesup WHERE voteid=?", voteid);
        res.json({
          code: 1,
          msg: "删除成功"
        })
      } catch (e) {
        console.log(e);
        res.json({
          code: 0,
          msg: "删除失败"
        })
      }
    } else {
      res.json({
        code: 0,
        msg: '无效操作'
      })
    }
  })

//获取参与投票信息
app.get("/participation", (req, res, next) => {
  let userid = req.signedCookies.userid;
  if (userid) {
    db.all("SELECT voteid from votesup where userid = ?", userid).then(votesIds => {
      let idsInfo = _.uniqBy(votesIds, "voteid");
      Promise.all(idsInfo.map(it => db.get("SELECT * FROM votes WHERE  id = ?", it.voteid))).then(votes => {
        res.json(votes);
      });
    })
  } else {
    res.status(403).json({
      msg: "没有登录"
    })
  }
})


//登出
app.delete("/signout", (req, res, next) => {
  res.clearCookie("userid");
  res.json({
    code: 1
  })
})

app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/static/index.html")
})

server.listen(port, () => {
  console.log(port);
})


