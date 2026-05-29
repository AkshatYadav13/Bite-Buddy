import './corns'
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv"
import connectDB from "./db/connectDB";
import cookieParser from "cookie-parser";
import cors from 'cors'
import userRoute from './routes/user.route'
import restaurantRoute from './routes/restaurant.route'
import dishRoute from './routes/dish.route'
import ordersRoute from './routes/orders.route'
import deliveryRoute from './routes/delivery.route'
import adminRoute from './routes/admin.route'
import applicationRoute from './routes/application.route'
import transactionRoute from './routes/transaction.route'
import multer from "multer";
import dns from "node:dns/promises";
import path from 'path'
import http from "http";

dns.setServers(["1.1.1.1"]);
dotenv.config()
connectDB()

const PORT = process.env.PORT || 3000

const DIRNAME = path.resolve();

export const app = express();
export const server = http.createServer(app);

const corsOptions = {
    origin:process.env.FRONTEND_URL,
    credentials:true
}

app.use(express.urlencoded({extended:true})) // Allows server to read data sent from HTML forms.
app.use(express.json()) // Server, accept JSON data.
app.use(cookieParser())  // Lets your server read cookies from the browser.
app.use(cors(corsOptions))

app.use('/api/v1/user',userRoute)
app.use('/api/v1/restaurant',restaurantRoute)
app.use('/api/v1/deliveryAgent',deliveryRoute)
app.use('/api/v1/admin',adminRoute)
app.use('/api/v1/dish',dishRoute)
app.use('/api/v1/order',ordersRoute)
app.use('/api/v1/application',applicationRoute)
app.use('/api/v1/transaction',transactionRoute)

app.use(express.static(path.join(DIRNAME,"/Frontend/dist")))
app.use("/*splat",(_,res)=>{
  res.sendFile(path.resolve(DIRNAME,"Frontend","dist","index.html"))
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File too large. Max allowed size is 5MB.' });
      return
    }
    res.status(400).json({ message: err.message });
    return
  }

  res.status(500).json({
    message: 'Something went wrong.',
    details: err.message || 'Unknown error',
  });
  return
});


server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

