const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

// Simulamos la persistencia con un valor inicials

let donations = { total: 2000 };
let cars = [
  {
    brand: "Toyota",
    license_plate: "fnk-055",
    color: "red",
    time: new Date().toISOString()
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

app.get("/donations", (_req, res) => {
  res.json(donations);
});

app.post("/donations", (req, res) => {
  const donationAmount = req.body.donationAmount;
  const newTotal = donations.total + donationAmount;
  donations = { total: newTotal };
  res.status(200).end();
});

// create a get function to get the car brand

app.get("/car", (_req, res) => {
  res.json(cars);
});

// create a post function To register a car by its brand


app.post("/car", (req, res) => {
  const carBrand = req.body.brand;
  const carLicensePlate = req.body.license_plate;
  const carColor = req.body.color;
  console.log(carBrand);
  console.log(carLicensePlate);
  const carTime = new Date().toISOString();
  cars.push({
    brand: carBrand,
    license_plate: carLicensePlate,
    color: carColor,
    time: carTime
  });
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
