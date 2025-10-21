import express, { Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());


//MIDDLEWARES

app.use(express.json());

//Controllers


app.listen(PORT, () =>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    }
)