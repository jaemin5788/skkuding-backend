import express from 'express'; //이게 ES6 import 쓰라는 말 같은데
// 근데 이걸 쓰려면 package.json에 "type": "module" 추가 하라고 함.
import fs from 'fs/promises'; 

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_PATH = './data/restaurants.json';
const USER_DATA_PATH = './data/users.json';

app.get('/restaurants', async(req, res) => {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error){
        res.status(500).json({error: "해당 맛집 정보가 존재하지 않습니다."});
    }
});

app.post('/restaurants', async(req, res) => {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        const restaurants = JSON.parse(data).restaurants;

        const newRestaurant = req.body;

        const exists = restaurants.find(r => r.name === newRestaurant.name);
        if (exists) {
            return res.status(400).json({error: "이미 해당 맛집 정보가 존재합니다."});
        }

        restaurants.push(newRestaurant);

        await fs.writeFile(DATA_PATH, JSON.stringify({restaurants}, null, 2));

        res.status(201).json(newRestaurant);
    } catch (error){
        console.error(error);
        res.status(500).json({error: "서버 오류가 발생했습니다."});
    }
});

app.post('/signup', async (req, res) => {
    try{
        const data = await fs.readFile(USER_DATA_PATH, 'utf-8');
        const users = JSON.parse(data).users;
        const { id, password } = req.body;

        if (users.find(u => u.id === id)) {
            return res.status(400).json({error: "서버 오류가 발생했습니다."});
        }

        users.push({id, password});
        await fs.writeFile(USER_DATA_PATH, JSON.stringify({users}, null, 2));
        
        res.status(201).json({message: "회원가입 성공!"});
    } catch (error) {
        res.status(500).json({message: "회원가입 중 오류 발생"});
    }
});


app.delete('/restaurants', async(req, res) => {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        let restaurants = JSON.parse(data).restaurants;

        const targetName = req.query.name;
        const targetIndex = restaurants.findIndex(r => r.name === targetName);

        if (targetIndex === -1) {
            return res.status(404).json({error: "해당 맛집 정보가 존재하지 않습니다."});
        }
        
        const deleted = restaurants.splice(targetIndex, 1);
        await fs.writeFile(DATA_PATH, JSON.stringify({restaurants}, null, 2));

        res.json(deleted[0]);
    } catch (error){
        res.status(500).json({error: "해당 맛집 정보가 존재하지 않습니다."});
    }
});

app.patch('/restaurants', async(req, res) => {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        const json = JSON.parse(data);
        const restaurants = json.restaurants;

        const {name, address, phone} = req.body;

        const target = restaurants.find(r => r.name === name);

        if (!target) {
            return res.status(404).json({error: "해당 맛집 정보가 존재하지 않습니다."});
        }

        if (address) target.address = address;
        if (phone) target.phone = phone;

        await fs.writeFile(DATA_PATH, JSON.stringify({restaurants}, null, 2));

        res.json(target);
    } catch (error) {
        res.status(500).json({error: "해당 맛집 정보가 존재하지 않습니다."});
    }
});

// 미들웨어는 요청이 들어오고 응답이 나가기 전, 중간에 거쳐가는 함수임. 
app.use((req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`[${now}] IP: ${req.ip} | Method: ${req.method} | URL: ${req.url}`);
    next();
});

app.use((req, res) => {
    res.status(404).json({ error: "찾으시는 페이지가 없습니다. 주소를 확인해주세요!" });
});


app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});



