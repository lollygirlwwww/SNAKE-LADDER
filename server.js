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

{
  question: "อวัยวะขับถ่ายแขนงข่ายที่สุด คือ",
  choices: ["contractile vacuole", "flame cell", "nephridia", "green gland"],
  answer: "contractile vacuole"
},

{
  question: "nephridia ของไส้เดือนดินแตกต่างจาก flame cell ของพลานาเรีย คือ",
  choices: [
    "nephridia มีท่อ ส่วน flame cell ไม่มี",
    "nephridia สกัดของเสียได้ดีกว่า",
    "nephridia มีเส้นเลือดอยู่รอบๆ ส่วน flame cell ไม่มี",
    "nephridia ไม่มี cilia ส่วน flame cell มี cilia"
  ],
  answer: "nephridia มีเส้นเลือดอยู่รอบๆ ส่วน flame cell ไม่มี"
},

{
  question: "nephridia คล้าย nephron มาก ต่างกันที่",
  choices: [
    "nephron ใหญ่กว่า",
    "nephron ดูดน้ำกลับได้",
    "nephron สกัดยูเรีย",
    "nephron มี glomerulus แต่ nephridia ไม่มี"
  ],
  answer: "nephron มี glomerulus แต่ nephridia ไม่มี"
},

{
  question: "สัตว์จำพวกนกและสัตว์เลื้อยคลานขับของเสียไนโตรเจนเป็นรูปใด",
  choices: ["ยูเรีย", "กรดยูริก", "แอมโมเนีย", "แอมโมเนียม"],
  answer: "กรดยูริก"
},

{
  question: "การขับของเสียแบบกรดยูริก มีข้อดีคือ",
  choices: [
    "สูญเสียน้ำน้อยมาก",
    "ไม่ละลายน้ำ",
    "ขับง่าย",
    "ถูกทั้ง ก และ ข"
  ],
  answer: "สูญเสียน้ำน้อยมาก"
},

{
  question: "สัตว์ที่ต้องการสงวนน้ำในร่างกายมาก มักกำจัดของเสียเป็นรูปใด",
  choices: [
    "กรดยูริกและยูเรีย",
    "แอมโมเนียและยูเรีย",
    "แอมโมเนียและกรดยูริก",
    "กรดยูริกและกรดอะมิโน"
  ],
  answer: "แอมโมเนียและกรดยูริก"
},

{
  question: "อวัยวะขับถ่ายของสัตว์ใดมีหน้าที่คล้ายกัน",
  choices: [
    "ท่อมาลพิเกียน และ เมตาเนฟริเดีย",
    "เมตาเนฟริเดีย และ flame cell",
    "contractile vacuole และ ท่อมาลพิเกียน",
    "flame cells และ contractile vacuole"
  ],
  answer: "flame cells และ contractile vacuole"
},

{
  question: "nephron ประกอบด้วย",
  choices: [
    "Bowman’s capsule และ glomerulus",
    "Bowman’s capsule, glomerulus และ renal tubule",
    "Bowman’s capsule, glomerulus และ proximal tubule",
    "Bowman’s capsule, glomerulus, proximal tubule และ loop of Henle"
  ],
  answer: "Bowman’s capsule, glomerulus และ renal tubule"
},

{
  question: "Loop of Henle เป็นบริเวณที่",
  choices: [
    "สร้างฮอร์โมน",
    "ดูดสารกลับมากที่สุด",
    "ดูดน้ำกลับมากที่สุด",
    "สร้างสารบางอย่าง"
  ],
  answer: "ดูดน้ำกลับมากที่สุด"
},

{
  question: "บริเวณใดดูดกลับน้ำและสารที่เป็นประโยชน์มากที่สุด",
  choices: [
    "Loop of Henle",
    "collecting tubule",
    "distal convoluted tubule",
    "proximal convoluted tubule"
  ],
  answer: "proximal convoluted tubule"
},

{
  question: "ไตของสัตว์ทะเลทรายปรับตัวอย่างไร",
  choices: [
    "ขับปัสสาวะเจือจาง",
    "ขับปัสสาวะเท่าเลือด",
    "ท่อหน่วยไตยาวกว่าปกติ",
    "glomerulus ใหญ่มาก"
  ],
  answer: "ท่อหน่วยไตยาวกว่าปกติ"
},

{
  question: "กรดยูริกในมูลจิ้งจกมีลักษณะอย่างไร",
  choices: [
    "ช่วยลดการสูญเสียน้ำ",
    "ไม่ละลายน้ำ",
    "เป็นส่วนสีดำ",
    "ถูกทั้ง a และ b"
  ],
  answer: "ถูกทั้ง a และ b"
},

{
  question: "ในปัสสาวะคนปกติไม่ควรพบ",
  choices: [
    "กำมะถันกับโปรตีน",
    "คลอไรด์กับโซเดียม",
    "กลูโคสกับซัลเฟต",
    "โปรตีนกับกลูโคส"
  ],
  answer: "โปรตีนกับกลูโคส"
},

{
  question: "เมื่อดื่มน้ำมาก ปัสสาวะออกมากเพราะ",
  choices: [
    "แรงดันออสโมติกต่ำ ADH ออกน้อย ดูดน้ำกลับน้อย",
    "แรงดันออสโมติกต่ำ ADH มาก",
    "แรงดันออสโมติกสูง ADH มาก",
    "แรงดันออสโมติกสูง ADH มาก ดูดน้ำมาก"
  ],
  answer: "แรงดันออสโมติกต่ำ ADH ออกน้อย ดูดน้ำกลับน้อย"
},

{
  question: "กลูโคสในปัสสาวะเกิดจาก",
  choices: [
    "Bowman’s capsule ผิดปกติ",
    "glomerulus ผิดปกติ",
    "หลอดหน่วยไตดูดกลับไม่หมด",
    "เอนไซม์สลายกลูโคสหมด"
  ],
  answer: "หลอดหน่วยไตดูดกลับไม่หมด"
},

{
  question: "ฮอร์โมน ADH มีผลต่อส่วนใดมากที่สุด",
  choices: [
    "convoluted tubules",
    "หลอดเลือดแดงเล็ก",
    "collecting tubule",
    "glomerulus และ Bowman’s capsule"
  ],
  answer: "convoluted tubules"
},

{
  question: "สารใดไม่ถูกดูดกลับใน convoluted tubule",
  choices: ["กลูโคส", "เกลือแร่", "น้ำ", "ยูเรีย"],
  answer: "ยูเรีย"
},

{
  question: "ของเหลวที่กรองผ่าน glomerulus คล้ายกับ",
  choices: [
    "น้ำเหลือง",
    "สารที่ถูกดูดออกจากหลอดเลือดดำ",
    "ของเหลวรอบเซลล์",
    "พลาสมาที่ไม่มีโปรตีน"
  ],
  answer: "พลาสมาที่ไม่มีโปรตีน"
},

{
  question: "คนขาดน้ำ 24 ชม. จะเกิดอะไร",
  choices: [
    "ปัสสาวะน้อยกว่าที่ดื่ม",
    "ปัสสาวะเท่าที่ดื่ม",
    "ปัสสาวะมากกว่า",
    "ไม่ปัสสาวะ"
  ],
  answer: "ปัสสาวะน้อยกว่าที่ดื่ม"
},

{
  question: "ศูนย์ควบคุมการกระหายน้ำอยู่ที่",
  choices: ["ทาลามัส", "ไฮโพทาลามัส", "เมดัลลา", "พอนส์"],
  answer: "ไฮโพทาลามัส"
},

{
  question: "อาการเริ่มแรกของโรคเบาหวานคือ",
  choices: [
    "หน่วยไตดูดกลูโคสกลับไม่หมด",
    "หน่วยไตดูดมากขึ้น",
    "Bowman’s capsule ผิดปกติ",
    "glomerulus ผิดปกติ"
  ],
  answer: "หน่วยไตดูดกลูโคสกลับไม่หมด"
},

{
  question: "ดื่มน้ำน้อย ปัสสาวะน้อย เพราะ",
  choices: [
    "ดูดน้ำกลับมาก เพราะฮอร์โมนมาก",
    "ดูดน้ำกลับน้อย",
    "ฮอร์โมนน้อย",
    "ไม่มี ADH"
  ],
  answer: "ดูดน้ำกลับมาก เพราะฮอร์โมนมาก"
},

{
  question: "อวัยวะที่พักปัสสาวะก่อนออกคือ",
  choices: ["ureter", "urethra", "pelvis", "urinary bladder"],
  answer: "urinary bladder"
},

{
  question: "สัตว์ที่ไม่มีกระเพาะปัสสาวะคือ",
  choices: ["แมว", "นก", "วัว", "ลิง"],
  answer: "นก"
},

{
  question: "กรณีใดทำให้ ADH ลดลง",
  choices: [
    "แรงดันออสโมติกสูง",
    "นอนกลางแดด",
    "ออกกำลังกาย",
    "ดื่มน้ำ 1-2 ลิตร"
  ],
  answer: "ดื่มน้ำ 1-2 ลิตร"
},

{
  question: "โครงสร้างเหมาะกับสิ่งมีชีวิตน้ำจืดขนาดเล็ก",
  choices: [
    "flame cells และ contractile vacuole",
    "contractile vacuole และ malpighian tubules",
    "malpighian tubules และ nephridium",
    "nephridium และ flame cells"
  ],
  answer: "flame cells และ contractile vacuole"
},

{
  question: "การกรองสารเพื่อขับถ่ายเกิดที่",
  choices: [
    "หน่วยไต",
    "ท่อของหน่วยไต",
    "glomerulus และ Bowman’s capsule",
    "glomerulus และ bladder"
  ],
  answer: "glomerulus และ Bowman’s capsule"
},

{
  question: "อาหารเค็มทำให้กระหายน้ำเพราะ",
  choices: [
    "แรงดันออสโมติกต่ำ",
    "กระตุ้นต่อมใต้สมอง",
    "แรงดันออสโมติกสูง กระตุ้นไฮโพทาลามัส",
    "ADH ลดลง"
  ],
  answer: "แรงดันออสโมติกสูง กระตุ้นไฮโพทาลามัส"
},

{
  question: "glomerulus รับเลือดจาก",
  choices: [
    "renal artery",
    "renal vein",
    "aorta",
    "posterior vena cava"
  ],
  answer: "renal artery"
},

{
  question: "ปริมาณสารในปัสสาวะมากไปน้อย",
  choices: [
    "ยูเรีย > โปรตีน > เกลือแร่ > กลูโคส",
    "ยูเรีย > เกลือแร่ > กลูโคส > โปรตีน",
    "เกลือแร่ > ยูเรีย > กลูโคส > โปรตีน",
    "เกลือแร่ > ยูเรีย > โปรตีน > กลูโคส"
  ],
  answer: "ยูเรีย > เกลือแร่ > กลูโคส > โปรตีน"
}

];

function getRandomQuestion(){
  return questions[Math.floor(Math.random()*questions.length)];
}

const WIN_POSITION = 100;

io.on("connection",(socket)=>{
  socket.on("leaveRoom", ()=>{

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
     socket.currentQuestion = q;   // เก็บคำถามแยกแต่ละคน
     socket.emit("showQuestion", q);  // ส่งเฉพาะคนนั้น
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

    socket.emit("answerResult",{
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




