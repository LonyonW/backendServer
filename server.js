const express = require("express");
const app = express();
const port = 3001;

const pgp = require('pg-promise')();
const db = pgp({
  user: "postgres",
  password: "12345678",
  host: "192.168.80.16",
  port: "5432",
  database: "distridb"
});

module.exports = db;

app.use(express.json());


app.use(function (_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

function getFormattedDate() {
  const now = new Date();
  return `[${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}:${now.getHours()}/${now.getMinutes()}/${now.getSeconds()}]`;
}

function getIsoDate() {
  const fecha = new Date();
  return fecha.toISOString();
}

app.get("/cars", async (_req, res) => {
  try {
    const cars = await db.any('SELECT photo, license_plate, color, fecha_carro as time, retired FROM car WHERE retired = false');
    res.json(cars);
    console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}]`);
  }
  catch (error) {
    console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] [${error.message}]`);
    res.status(500).json({ message: error.message });
  }
 
  
});

app.post("/cars", async (_req, res) => {
  try {
    const carPhoto = _req.body.photo;
    const carLicensePlate = _req.body.license_plate;
    const carColor = _req.body.color;
    const carTime = getIsoDate();
    const carRetired = false;
    const newCar = {
      photo: carPhoto,
      license_plate: carLicensePlate,
      color: carColor,
      time: carTime,
      retired: carRetired
    };

    if(!validateLicensePlateFormat(carLicensePlate)) {
      console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] [${'Error: invalid license plate format. Correct format: "AAA-000" '}]`);
      res.status(400).json({ message: 'invalid license plate format. Correct format: "AAA-000" ' });
    } else if(await !carExist(carLicensePlate)) {
      console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] [${'Error: car already exist'}]`);
      res.status(409).json({ message: 'car already exist' });
    } else {
      await db.one(
        'INSERT into car (photo, license_plate, color, fecha_carro, retired) VALUES($1, $2, $3, $4, $5) RETURNING *',
         [carPhoto, carLicensePlate, carColor, carTime, carRetired]);
  
      console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${JSON.stringify(newCar)}]`);
  
      res.status(200).json("Car registered successfully");
    }

    

    
  } catch (error) {
    console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] [${error.message}]`);

    res.status(500).json({ message: error.message });
  }

});

async function carExist(plate) {
  try {
    const result = await db.oneOrNone('SELECT * FROM car WHERE license_plate = $1', [plate]);
    return result !== null;
  } catch (error) {
    console.error('Error checking if car exists:', error);
    return false;
  }
}

function validateLicensePlateFormat(licensePlate) {
  const regex = /^[A-Z]{3}-\d{3}$/;
  return regex.test(licensePlate);
}

app.patch('/cars', async(_req, res) => {
  try {
    const { license_plate } = _req.body;

    const car = await db.oneOrNone('SELECT EXISTS (SELECT 1 FROM car WHERE license_plate = $1)', license_plate);

    if (!car.exists) {
      res.status(404).json({ message: 'Car not found with: ' + license_plate });
    }
      await db.one('UPDATE car SET retired = true WHERE license_plate  = $1 RETURNING *', license_plate);
      console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${JSON.stringify(car)}]`);
      res.status(200).json("Car retired successfully: car name " + license_plate);
  }catch (error) {
    console.log(`[${_req.ip.split(':').pop()}] ${getFormattedDate()} [${_req.method}] [${_req.url}] [${error.message}]`);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Good app listening on port ${port}`);
});
