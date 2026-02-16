const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

const playerColors = [
  "#e53935",
  "#1e88e5",
  "#43a047",
  "#fdd835",
  "#8e24aa",
  "#fb8c00",
  "#00acc1",
  "#6d4c41"
];

function getAvailableColor(players){
  const usedColors = Object.values(players).map(p=>p.color);
  const freeColor = playerColors.find(c=>!usedColors.includes(c));
  return freeColor || "#000000";
}

/* ===== งูและบันได ===== */

const ladders = {
  3:24,
  12:26,
  28:55,
  59:78,
  76:84,
  50:90
};

const snakes = {
  17:4,
  63:16,
  49:8,
  88:20,
  95:34,
  98:80
};

const questions = [
  { question: "5 + 3 = ?", choices: ["6","7","8","9"], answer: "8" },
  { question: "10 - 4 = ?", choices: ["5","6","7","8"], answer: "6" },
  { question: "6 x 2 = ?", choices: ["10","12","14","16"], answer: "12" }
];

function getRandomQuestion(){
  return questions[Math.floor(Math.random()*questions.length)];
}

const WIN_POSITION = 100;

/* ================= CONNECTION ================= */

io.on("connection",(socket)=>{

  /* ===== ผู้เล่นใหม่ ===== */
  socket.on("newPlayer",(data)=>{

    const { name, room } = data;

    socket.join(room);
    socket.roomName = room;   // ✅ เพิ่มบรรทัดนี้

    if(!rooms[room]){
      rooms[room] = {
        players:{}
      };
    }

    rooms[room].players[socket.id] = {
      name:name,
      position:1,
      color:getAvailableColor(rooms[room].players),
      finished:false
    };

    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  /* ===== ขอคำถาม ===== */
  socket.on("getQuestion",()=>{
    const q = getRandomQuestion();
    socket.currentQuestion = q;
    socket.emit("showQuestion", q);
  });

  /* ===== ตอบคำถาม ===== */
  socket.on("answer",(selectedChoice)=>{

  const room = socket.roomName;   // ✅ ใช้อันนี้แทน

    if(!room) return;

    const roomData = rooms[room];
    if(!roomData) return;

    const player = roomData.players[socket.id];
    if(!player) return;

    if(player.finished) return;   // 🔥 คนที่ชนะแล้วกดไม่ได้

    if(!socket.currentQuestion) return;

    const correctAnswer = socket.currentQuestion.answer;
    const dice = Math.floor(Math.random()*6)+1;

    let start = player.position;
    let afterDice = start;

    if(selectedChoice === correctAnswer){
      afterDice += dice;
    } else {
      afterDice -= dice;
    }

    if(afterDice > 100) afterDice = 100;
    if(afterDice < 1)afterDice = 1;

    // 🔥 เช็คงู/บันได
    let finalPosition = afterDice;
    

    if(ladders[afterDice]){
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

const playerColors = [
  "#e53935",
  "#1e88e5",
  "#43a047",
  "#fdd835",
  "#8e24aa",
  "#fb8c00",
  "#00acc1",
  "#6d4c41"
];

function getAvailableColor(players){
  const usedColors = Object.values(players).map(p=>p.color);
  const freeColor = playerColors.find(c=>!usedColors.includes(c));
  return freeColor || "#000000";
}

/* ===== งูและบันได ===== */

const ladders = {
  3:24,
  12:26,
  28:55,
  59:78,
  76:84,
  50:90
};

const snakes = {
  17:4,
  63:16,
  49:8,
  88:20,
  95:34,
  98:80
};

const questions = [
  { question: "5 + 3 = ?", choices: ["6","7","8","9"], answer: "8" },
  { question: "10 - 4 = ?", choices: ["5","6","7","8"], answer: "6" },
  { question: "6 x 2 = ?", choices: ["10","12","14","16"], answer: "12" }
];

function getRandomQuestion(){
  return questions[Math.floor(Math.random()*questions.length)];
}

const WIN_POSITION = 100;

/* ================= CONNECTION ================= */

io.on("connection",(socket)=>{

  /* ===== ผู้เล่นใหม่ ===== */
  socket.on("newPlayer",(data)=>{

    const { name, room } = data;

    socket.join(room);
    socket.roomName = room;

    if(!rooms[room]){
      rooms[room] = { players:{} };
    }

    rooms[room].players[socket.id] = {
      name:name,
      position:1,
      color:getAvailableColor(rooms[room].players),
      finished:false
    };

    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  /* ===== ขอคำถาม ===== */
  socket.on("getQuestion",()=>{
    const q = getRandomQuestion();
    socket.currentQuestion = q;
    socket.emit("showQuestion", q); // ส่งเฉพาะคนที่กด
  });

  /* ===== ตอบคำถาม ===== */
  socket.on("answer",(selectedChoice)=>{

    const room = socket.roomName;
    if(!room) return;

    const roomData = rooms[room];
    if(!roomData) return;

    const player = roomData.players[socket.id];
    if(!player) return;
    if(player.finished) return;
    if(!socket.currentQuestion) return;

    const correctAnswer = socket.currentQuestion.answer;
    const isCorrect = selectedChoice === correctAnswer;

    const dice = Math.floor(Math.random()*6)+1;

    let start = player.position;
    let afterDice = start;

    if(isCorrect){
      afterDice += dice;
    } else {
      afterDice -= dice;
    }

    if(afterDice > 100) afterDice = 100;
    if(afterDice < 1) afterDice = 1;

    let finalPosition = afterDice;

    if(ladders[afconst express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

const playerColors = [
  "#e53935",
  "#1e88e5",
  "#43a047",
  "#fdd835",
  "#8e24aa",
  "#fb8c00",
  "#00acc1",
  "#6d4c41"
];

function getAvailableColor(players){
  const usedColors = Object.values(players).map(p=>p.color);
  const freeColor = playerColors.find(c=>!usedColors.includes(c));
  return freeColor || "#000000";
}

const ladders = {
  3:24,
  12:26,
  28:55,
  59:78,
  76:84,
  50:90
};

const snakes = {
  17:4,
  63:16,
  49:8,
  88:20,
  95:34,
  98:80
};

const questions = [
  { question: "5 + 3 = ?", choices: ["6","7","8","9"], answer: "8" },
  { question: "10 - 4 = ?", choices: ["5","6","7","8"], answer: "6" },
  { question: "6 x 2 = ?", choices: ["10","12","14","16"], answer: "12" }
];

function getRandomQuestion(){
  return questions[Math.floor(Math.random()*questions.length)];
}

const WIN_POSITION = 100;

io.on("connection",(socket)=>{

  socket.on("newPlayer",(data)=>{
    const { name, room } = data;

    socket.join(room);
    socket.roomName = room;

    if(!rooms[room]){
      rooms[room] = { players:{} };
    }

    rooms[room].players[socket.id] = {
      name:name,
      position:1,
      color:getAvailableColor(rooms[room].players),
      finished:false
    };

    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  socket.on("getQuestion",()=>{
    const q = getRandomQuestion();
    socket.currentQuestion = q;
    socket.emit("showQuestion", q);
  });

  socket.on("answer",(selectedChoice)=>{

    const room = socket.roomName;
    if(!room) return;

    const roomData = rooms[room];
    if(!roomData) return;

    const player = roomData.players[socket.id];
    if(!player) return;
    if(player.finished) return;
    if(!socket.currentQuestion) return;

    const correctAnswer = socket.currentQuestion.answer;
    const isCorrect = selectedChoice === correctAnswer;

    const dice = Math.floor(Math.random()*6)+1;

    let start = player.position;
    let afterDice = start;

    if(isCorrect){
      afterDice += dice;
    } else {
      afterDice -= dice;
    }

    if(afterDice > 100) afterDice = 100;
    if(afterDice < 1) afterDice = 1;

    let finalPosition = afterDice;

    if(ladders[afterDice]){
      finalPosition = ladders[afterDice];
    }

    if(snakes[afterDice]){
      finalPosition = snakes[afterDice];
    }

    player.position = finalPosition;

    if(finalPosition >= WIN_POSITION){
      player.position = 100;
      player.finished = true;

      io.to(room).emit("playerFinished",{
        id: socket.id,
        name: player.name,
        color: player.color
      });
    }

    io.to(room).emit("answerResult",{
      playerId: socket.id,
      correct: isCorrect,
      dice: dice,
      start: start,
      afterDice: afterDice,
      finalPosition: finalPosition
    });

    io.to(room).emit("updatePlayers", roomData.players);

    socket.currentQuestion = null;
  });

  socket.on("disconnect",()=>{
    const room = socket.roomName;
    if(!room) return;

    if(rooms[room] && rooms[room].players[socket.id]){
      delete rooms[room].players[socket.id];

      if(Object.keys(rooms[room].players).length === 0){
        delete rooms[room];
      } else {
        io.to(room).emit("updatePlayers", rooms[room].players);
      }
    }
  });

});

server.listen(3000, "0.0.0.0", ()=>{
  console.log("Server running on port 3000");
});
