const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = 8080; // 포트 번호 설정

// multer 설정: 업로드된 파일을 메모리에 저장
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST 요청 처리
app.post('/test', upload.array('photos'), (req, res) => {
    console.log('받은 데이터:', req.body.dto); // dto 객체 로그 출력
    const photos = req.files;
    console.log(`업로드된 파일 수: ${photos.length}`);

    photos.forEach((file, index) => {
        console.log(`파일 ${index}: 이름 - ${file.originalname}, 타입 - ${file.mimetype}`);
    });

    res.status(200).send({ message: '데이터를 성공적으로 받았습니다.' });
});

app.listen(port, () => {
    console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
