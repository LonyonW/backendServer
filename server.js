const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

// Simulamos la persistencia con un valor inicials

let donations = { total: 2000 };
let cars = [
  {
    photo: "https://illustoon.com/photo/496.png",
    license_plate: "fnk-055",
    color: "red",
    time: new Date().toISOString(),
    retired: false
  }
]
app.use(function (_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/*
app.get("/donations", (_req, res) => {
  res.json(cars);
  console.log(cars);
});
*/
app.post("/donations", (req, res) => {
  const donationAmount = req.body.donationAmount;
  const newTotal = donations.total + donationAmount;
  donations = { total: newTotal };
  res.status(200).end();
});

// create a get function to get the car brand

app.get("/cars", (_req, res) => {
  let carsnew = cars.filter(cars => cars.retired === false);
  res.json(carsnew);
  console.log("cars listed");
});

// create a post function To register a car by its brand
app.post("/cars", (req, res) => {
  console.log("no debe entrar aca");
  try {
    const carPhoto = req.body.photo;
    const carLicensePlate = req.body.license_plate;
    const carColor = req.body.color;
    const carTime = new Date().toISOString();
    const carRetired = false;
    const newCar = {
      photo: carPhoto,
      license_plate: carLicensePlate,
      color: carColor,
      time: carTime,
      retired: carRetired
    };
    cars.push(newCar);

    console.log("Car registered successfully: ", newCar);

    res.status(200).json("Car registered successfully");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

});

app.patch('/cars', (req, res) => {
  const { license_plate } = req.body;
  console.log("busca borrar un carro")
  const car = cars.find(car => car.license_plate === license_plate);
  if (car) {
    car.retired = true;
    console.log(car);
    res.status(200).json("Car retired successfully: car name " + license_plate);
  } else {
    res.status(404).json({ message: 'Car not found with: ' + license_plate });
  }
});
/*
app.patch('/car/:license_plate', (req, res) => {
  const { license_plate } = req.params;

  const car = cars.find(car => car.license_plate === license_plate);

  if (car) {
    car.retired = true;
    console.log(car);
    res.status(200).json("Car retired successfully");
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
});
*/



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
