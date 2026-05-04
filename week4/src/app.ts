import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';

interface Restaurant {
  name: string;
  address?: string;
  phone?: string;
  [key: string]: unknown;
}


interface RestaurantData {
  restaurants: Restaurant[];
}


const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_PATH = './src/restaurants.ts';

app.get('/restaurants', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data) as RestaurantData;

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: '해당 맛집 정보가 존재하지 않습니다.' });
  }
});

app.post('/restaurants', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data) as RestaurantData;
    const restaurants = parsed.restaurants;

    const newRestaurant = req.body as Restaurant;

    const exists = restaurants.find((r: Restaurant) => r.name === newRestaurant.name);

    if (exists) {
      return res.status(400).json({ error: '이미 해당 맛집 정보가 존재합니다.' });
    }

    restaurants.push(newRestaurant);

    await fs.writeFile(DATA_PATH, JSON.stringify({ restaurants }, null, 2));

    return res.status(201).json(newRestaurant);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});


app.delete('/restaurants', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data) as RestaurantData;
    const restaurants = parsed.restaurants;

    const targetName = req.query.name as string;

    const targetIndex = restaurants.findIndex(
      (r: Restaurant) => r.name === targetName
    );

    if (targetIndex === -1) {
      return res.status(404).json({ error: '해당 맛집 정보가 존재하지 않습니다.' });
    }

    const deleted = restaurants.splice(targetIndex, 1);

    await fs.writeFile(DATA_PATH, JSON.stringify({ restaurants }, null, 2));

    return res.json(deleted[0]);
  } catch (error) {
    return res.status(500).json({ error: '해당 맛집 정보가 존재하지 않습니다.' });
  }
});

app.patch('/restaurants', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data) as RestaurantData;
    const restaurants = parsed.restaurants;

    const { name, address, phone } = req.body as Restaurant;

    const target = restaurants.find((r: Restaurant) => r.name === name);

    if (!target) {
      return res.status(404).json({ error: '해당 맛집 정보가 존재하지 않습니다.' });
    }

    if (address) target.address = address;
    if (phone) target.phone = phone;

    await fs.writeFile(DATA_PATH, JSON.stringify({ restaurants }, null, 2));

    return res.json(target);
  } catch (error) {
    return res.status(500).json({ error: '해당 맛집 정보가 존재하지 않습니다.' });
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const now = new Date().toLocaleString();

  console.log(`[${now}] IP: ${req.ip} | Method: ${req.method} | URL: ${req.url}`);

  next();
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: '찾으시는 페이지가 없습니다. 주소를 확인해주세요!'
  });
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});