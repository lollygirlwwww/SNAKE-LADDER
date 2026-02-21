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

// ===== ชุดที่ 1 =====
const question = [

{ question: "เหตุใดจึงเรียกว่า “หุ่นกระบอก”", choices: ["ทำจากกระดาษ","ใช้กระบอกไม้ไผ่เป็นแกนตัวหุ่น","มีเสียงคล้ายกระบอก","ใช้กล่องไม้เป็นฐาน"], answer: "ใช้กระบอกไม้ไผ่เป็นแกนตัวหุ่น" },

{ question: "เหตุใดสมัยรัชกาลที่ 5 จึงถือเป็นยุคทองของหุ่นกระบอก", choices: ["มีการนำเข้าเทคโนโลยีใหม่","ได้รับความนิยมแพร่หลายและมีหลายคณะเกิดขึ้น","มีการบันทึกเป็นภาพยนตร์","ได้รับการสนับสนุนจากต่างประเทศ"], answer: "ได้รับความนิยมแพร่หลายและมีหลายคณะเกิดขึ้น" },

{ question: "หุ่นกระบอกในกรุงเทพฯ ระยะแรกเรียกว่าอะไร", choices: ["หุ่นเมืองหลวง","หุ่นไทยประยุกต์","หุ่นเลียนอย่างเมืองเหนือ หรือ หุ่นคุณเถาะ","หุ่นสยาม"], answer: "หุ่นเลียนอย่างเมืองเหนือ หรือ หุ่นคุณเถาะ" },

{ question: "หุ่นกระบอกในระยะแรกนิยมเล่นในบริเวณใด", choices: ["ภาคใต้","ภาคตะวันออก","หัวเมืองฝ่ายเหนือ","กรุงเทพมหานคร"], answer: "หัวเมืองฝ่ายเหนือ" },

{ question: "หุ่นกระบอกของไทยเกิดขึ้นในสมัยใด", choices: ["รัชกาลที่ 3","รัชกาลที่ 4","รัชกาลที่ 5","รัชกาลที่ 6"], answer: "รัชกาลที่ 5" },

{ question: "หุ่นกระบอกไทยมีต้นแบบมาจากหุ่นชนชาติใด", choices: ["ญี่ปุ่น","จีนไหหลำ","อินเดีย","เขมร"], answer: "จีนไหหลำ" },

{ question: "ผู้ริเริ่มทำหุ่นกระบอกแบบไทยคนแรกคือใคร", choices: ["หม่อมราชวงศ์เถาะ พยัคฆเสนา","สมเด็จฯ กรมพระยาดำรงราชานุภาพ","นายเหน่ง","พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว"], answer: "หม่อมราชวงศ์เถาะ พยัคฆเสนา" },

{ question: "นายเหน่งมีอาชีพทำหุ่นเพื่ออะไร", choices: ["เพื่อความบันเทิงส่วนตัว","เพื่อใช้ในพิธีกรรม","เพื่อเลี้ยงชีพ","เพื่อถวายพระมหากษัตริย์"], answer: "เพื่อเลี้ยงชีพ" },

{ question: "ใครนำแบบอย่างหุ่นกระบอกไปตั้งคณะที่กรุงเทพฯ", choices: ["นายเหน่ง","หม่อมราชวงศ์เถาะ พยัคฆเสนา","สมเด็จฯ กรมพระยาดำรงราชานุภาพ","เจ้าพระยาศรีสุริยวงศ์"], answer: "หม่อมราชวงศ์เถาะ พยัคฆเสนา" },

{ question: "เจ้าของคณะหุ่นกระบอกไทยส่วนใหญ่มักเป็นใคร", choices: ["ขุนนาง","ชาวบ้าน","พระสงฆ์","พ่อค้าชาวจีน"], answer: "ชาวบ้าน" },

{ question: "คณะหุ่นกระบอกที่โดดเด่นและเป็นที่นิยมคือคณะของใคร", choices: ["นายเปียก ประเสริฐกุล","นางเสียบ","หม่อมราชวงศ์เถาะ พยัคฆเสนา","นายจักรพันธุ์ โปษยกฤต"], answer: "หม่อมราชวงศ์เถาะ พยัคฆเสนา" },

{ question: "ใครได้รับการยกย่องว่าเป็นปรมาจารย์ด้านการเชิดหุ่น", choices: ["นายเชือก ประเสริฐกุล","นายเปียก ประเสริฐกุล","ครูวงษ์ รวมสุข","นางสาหร่าย ช่วยสมบูรณ์"], answer: "นายเปียก ประเสริฐกุล" },

{ question: "ใครเป็นผู้สืบทอดคณะหุ่นของนายเปียก", choices: ["นางเสียบ","นางขึ้น สกุลแก้ว","นางสาหร่าย","แม่ครูเคลือบ"], answer: "นางขึ้น สกุลแก้ว" },

{ question: "แม่ครูเคลือบ คือใคร", choices: ["นางเสียบ","นางขึ้น","นางสาหร่าย","นางดรุณี"], answer: "นางเสียบ" }
// ===== ชุดที่ 2 =====

{ question: "องค์ประกอบพื้นฐานของการเล่นหุ่นกระบอกมีกี่ส่วน", choices: ["3 ส่วน","4 ส่วน","5 ส่วน","6 ส่วน"], answer: "5 ส่วน" },

{ question: "ข้อใดไม่ใช่องค์ประกอบพื้นฐานของการเล่นหุ่นกระบอก", choices: ["ตัวหุ่นกระบอก","โรงหุ่น","เครื่องแต่งกาย","สนามกีฬา"], answer: "สนามกีฬา" },

{ question: "ตัวหุ่นกระบอกประกอบด้วยส่วนสำคัญกี่ส่วน", choices: ["2 ส่วน","3 ส่วน","4 ส่วน","5 ส่วน"], answer: "4 ส่วน" },

{ question: "ลำตัวของหุ่นกระบอกมีลักษณะอย่างไร", choices: ["ทำจากผ้า","เป็นกระบอกไม้","ทำจากเหล็ก","ทำจากพลาสติก"], answer: "เป็นกระบอกไม้" },

{ question: "ลำตัวของหุ่นกระบอกทำจากวัสดุใด", choices: ["ไม้สักทั้งแท่ง","โลหะกลวง","กระบอกไม้ไผ่รวก","พลาสติก"], answer: "กระบอกไม้ไผ่รวก" },

{ question: "ศีรษะของหุ่นกระบอกนิยมทำจากวัสดุใด", choices: ["ผ้าไหม","โลหะ","ไม้เนื้อแข็ง","โฟม"], answer: "ไม้เนื้อแข็ง" },

{ question: "ส่วนใดของหุ่นกระบอกที่เลียนแบบอวัยวะของคนจริง", choices: ["ลำตัวและขา","ศีรษะและมือ","ลำตัวและศีรษะ","มือและลำตัว"], answer: "ศีรษะและมือ" },

{ question: "เรียวไม้ไผ่ที่ติดกับมือหุ่นทั้งสองข้างเรียกว่าอะไร", choices: ["ไม้เชิด","ตะเกียบ","ไม้จับ","แกนมือ"], answer: "ตะเกียบ" },

{ question: "เครื่องแต่งกายและเครื่องประดับของหุ่นกระบอกมีความสำคัญอย่างไร", choices: ["เพิ่มน้ำหนักให้หุ่น","เพิ่มความแข็งแรง","ทำให้หุ่นดูสวยงามและสมจริง","ทำให้หุ่นเคลื่อนไหวเร็วขึ้น"], answer: "ทำให้หุ่นดูสวยงามและสมจริง" },

{ question: "เหตุใดการเขียนดวงตาหุ่นจึงทำเป็นขั้นตอนสุดท้าย", choices: ["เพื่อให้สีแห้งก่อน","เพื่อรอการตกแต่งเครื่องแต่งกาย","ถือเป็นพิธีเบิกเนตรตามความเชื่อ","เพื่อทดสอบความสวยงาม"], answer: "ถือเป็นพิธีเบิกเนตรตามความเชื่อ" },

{ question: "โรงหุ่นกระบอกโดยทั่วไปมีลักษณะเป็นรูปใด", choices: ["วงกลม","สี่เหลี่ยมผืนผ้า","สามเหลี่ยม","สี่เหลี่ยมจัตุรัส"], answer: "สี่เหลี่ยมจัตุรัส" },

{ question: "ฉากของการแสดงหุ่นกระบอกแบ่งออกเป็นกี่ส่วน", choices: ["2 ส่วน","3 ส่วน","4 ส่วน","5 ส่วน"], answer: "3 ส่วน" },

{ question: "กระจกบังมือ มีหน้าที่สำคัญอย่างไร", choices: ["สะท้อนแสงให้เวทีสว่าง","ตกแต่งเวที","บังมือผู้เชิดไม่ให้ผู้ชมเห็น","ใช้เปลี่ยนฉาก"], answer: "บังมือผู้เชิดไม่ให้ผู้ชมเห็น" }
// ===== ชุดที่ 3 =====

{ question: "ข้อใดไม่ใช่เครื่องดนตรีสำคัญในวงปี่พาทย์สำหรับการแสดงหุ่นกระบอก", choices: ["กลองตะโพน","ซออู้","กลองยาว","ม้าล่อ"], answer: "กลองยาว" },

{ question: "เครื่องดนตรีใดเป็นเครื่องสำคัญในวงปี่พาทย์สำหรับหุ่นกระบอก", choices: ["กีตาร์","กลองตะโพน","เปียโน","ไวโอลิน"], answer: "กลองตะโพน" },

{ question: "เพลงที่ถือเป็นเอกลักษณ์ของการแสดงหุ่นกระบอกคือเพลงใด", choices: ["เพลงลาวดวงเดือน","เพลงเขมรไทรโยค","เพลงสังขารา","เพลงแขกบรเทศ"], answer: "เพลงสังขารา" },

{ question: "เครื่องดนตรีในการแสดงหุ่นกระบอกมีหน้าที่หลักคืออะไร", choices: ["ใช้ตกแต่งเวที","ใช้กำหนดแสง","สร้างบรรยากาศและประกอบการดำเนินเรื่อง","ใช้แทนเสียงพูดทั้งหมด"], answer: "สร้างบรรยากาศและประกอบการดำเนินเรื่อง" },

{ question: "หุ่นกระบอกเป็นศิลปะการแสดงประเภทใด", choices: ["การเต้นรำ","การเชิดหุ่น","การร้องเพลง","การแสดงละครใบ้"], answer: "การเชิดหุ่น" },

{ question: "ผู้ควบคุมหุ่นเรียกว่าอะไร", choices: ["นักร้อง","คนเชิดหุ่น","นักพากย์ข่าว","ผู้ชม"], answer: "คนเชิดหุ่น" },

{ question: "อุปกรณ์สำคัญในการเชิดหุ่นคืออะไร", choices: ["เชือกหรือไม้บังคับ","รีโมททีวี","เครื่องยนต์","จอยเกม"], answer: "เชือกหรือไม้บังคับ" },

{ question: "จุดเด่นของหุ่นกระบอกคืออะไร", choices: ["การเคลื่อนไหวตามบทพากย์","ใช้เครื่องยนต์","ไม่มีเสียง","ไม่มีเรื่องราว"], answer: "การเคลื่อนไหวตามบทพากย์" },

{ question: "การพากย์เสียงมีความสำคัญอย่างไร", choices: ["ทำให้การแสดงมีชีวิตชีวา","ทำให้เงียบ","ไม่จำเป็น","ทำให้สั้นลง"], answer: "ทำให้การแสดงมีชีวิตชีวา" },

{ question: "เนื้อเรื่องที่นิยมนำมาแสดงหุ่นกระบอกมักมาจากแหล่งใด", choices: ["ข่าวประจำวัน","วรรณคดีไทย","สารคดีต่างประเทศ","บทสัมภาษณ์บุคคลสำคัญ"], answer: "วรรณคดีไทย" },

{ question: "เรื่องที่นิยมแสดงมักเป็นเรื่องใด", choices: ["นิทานพื้นบ้าน","เกมออนไลน์","ข่าวด่วน","สภาพอากาศ"], answer: "นิทานพื้นบ้าน" },

{ question: "การแสดงหุ่นกระบอกมักพบในงานใด", choices: ["งานประเพณี","งานแข่งรถ","งานบริษัท","งานแฟชั่น"], answer: "งานประเพณี" },

{ question: "สถานที่จัดแสดงมักเป็นที่ใด", choices: ["วัดหรืองานชุมชน","สนามบิน","โรงงาน","ปั๊มน้ำมัน"], answer: "วัดหรืองานชุมชน" },

{ question: "หุ่นกระบอกสะท้อนสิ่งใดมากที่สุด", choices: ["เทคโนโลยี","กีฬา","วิถีชีวิตท้องถิ่น","การโฆษณา"], answer: "วิถีชีวิตท้องถิ่น" },

{ question: "หุ่นกระบอกช่วยส่งเสริมด้านใดของจังหวัด", choices: ["การท่องเที่ยว","การทำเหมือง","อุตสาหกรรมหนัก","การบิน"], answer: "การท่องเที่ยว" },

{ question: "การฝึกเชิดหุ่นต้องใช้ทักษะด้านใด", choices: ["ความชำนาญและความอดทน","การขับรถ","การว่ายน้ำ","การบิน"], answer: "ความชำนาญและความอดทน" },

{ question: "การอนุรักษ์หุ่นกระบอกมีความสำคัญเพราะอะไร", choices: ["เพื่อความสนุกอย่างเดียว","เพื่อสืบสานวัฒนธรรม","เพื่อการแข่งขัน","เพื่อโฆษณา"], answer: "เพื่อสืบสานวัฒนธรรม" },

{ question: "ใครมีบทบาทสำคัญในการสืบสานหุ่นกระบอก", choices: ["ชุมชน","นักบิน","นักกีฬา","นักธุรกิจต่างชาติ"], answer: "ชุมชน" },

{ question: "หากไม่มีการอนุรักษ์จะเกิดอะไรขึ้น", choices: ["ได้รับความนิยมมากขึ้น","สูญหาย","ทันสมัยขึ้น","มีผู้ชมเพิ่ม"], answer: "สูญหาย" },

{ question: "นักเรียนช่วยอนุรักษ์ได้อย่างไร", choices: ["ไม่สนใจ","เข้าร่วมกิจกรรม","ห้ามจัดแสดง","วิจารณ์อย่างเดียว"], answer: "เข้าร่วมกิจกรรม" },

{ question: "คนรุ่นใหม่ควรทำอย่างไรกับหุ่นกระบอก", choices: ["เรียนรู้และสืบสาน","ละทิ้ง","ห้ามแสดง","ไม่เกี่ยวข้อง"], answer: "เรียนรู้และสืบสาน" },

{ question: "การสนับสนุนจากหน่วยงานท้องถิ่นมีผลอย่างไร", choices: ["ทำให้การแสดงยั่งยืน","ทำให้ยกเลิก","ไม่มีผล","ลดผู้ชม"], answer: "ทำให้การแสดงยั่งยืน" },

{ question: "หุ่นกระบอกมีประโยชน์ทางการศึกษาอย่างไร", choices: ["ให้ความรู้และความบันเทิง","ทำให้เบื่อ","ไม่มีประโยชน์","ทำให้เสียเวลา"], answer: "ให้ความรู้และความบันเทิง" },

{ question: "เหตุผลที่ควรรักษาหุ่นกระบอกในสมุทรสงครามคืออะไร", choices: ["เป็นมรดกทางวัฒนธรรม","เป็นของเล่นสมัยใหม่","เป็นสินค้าอุตสาหกรรม","เป็นกีฬา"], answer: "เป็นมรดกทางวัฒนธรรม" }

]; 
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
      correctAnswer: correctAnswer,
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







