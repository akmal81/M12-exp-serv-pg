import express, { Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import config from "./config";


const app = express();
const port = config.port;


// config dotenv
dotenv.config({ path: path.join(process.cwd(), ".env") })
//parse middle ware
app.use(express.json());
app.use(express.urlencoded()); //from data

// Database 
const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STRING}`
})

const initDB = async () => {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            age INT,
            phone VARCHAR(15),
            address TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
        `);


    await pool.query(`
            CREATE TABLE IF NOT EXISTS todos(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200),
            description TEXT,
            completed BOOLEAN DEFAULT false,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `)
}

initDB();

// logger middleware

// const logger = (req, res, next) =>{

// }


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!!!!!!')
})


// users crud
app.post('/users', async (req: Request, res: Response) => {

    const { name, email } = req.body;

    try {

        const result = await pool.query(`INSERT INTO users(name,email) VALUES($1, $2) RETURNING *`, [name, email]);
        console.log(result.rows)
        res.status(201).json(
            {
                success: true,
                message: 'User created successfully',
                data: result.rows
            }
        )
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

})
// all user
app.get('/users', async (req: Request, res: Response) => {
    try {

        const result = await pool.query(`SELECT * FROM users`);
        res.status(200).json({
            success: true,
            message: 'user retrieved successfully',
            data: result.rows
        })
        console.log(result.rows)

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            datalist: error
        })

    }
})


// single user

app.get('/users/:id', async (req: Request, res: Response) => {

    // console.log(req.params.id);
    // res.send({ message: "working" });

    try {

        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id])
        console.log(result.rows)

        if (result.rows.length === 0) {
            res.status(404).json(
                {
                    success: false,
                    message: "User not found"
                }
            )
        } else {
            res.status(201).json(
                {
                    success: true,
                    message: "User fetched successfully",
                    data: result.rows[0]
                }
            )
        }

    } catch (error: any) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
})

// update user
app.put('/users/:id', async (req: Request, res: Response) => {

    const { name, email } = req.body;

    try {

        const result = await pool.query(`UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`, [name, email, req.params.id])
        console.log(result.rows)

        if (result.rows.length === 0) {
            res.status(404).json(
                {
                    success: false,
                    message: "User not found"
                }
            )
        } else {
            res.status(201).json(
                {
                    success: true,
                    message: "User fetched successfully",
                    data: result.rows[0]
                }
            )
        }

    } catch (error: any) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
})

// delete user

app.delete('/users/:id', async (req: Request, res: Response) => {
    try {

        const result = await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id])
        console.log(result.rows)

        if (result.rowCount === 0) {
            res.status(404).json(
                {
                    success: false,
                    message: "User not found"
                }
            )
        } else {
            res.status(201).json(
                {
                    success: true,
                    message: "User Deleted successfully",
                    data: null
                }
            )
        }

    } catch (error: any) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
})





// todo table

app.post('/todos', async (req: Request, res: Response) => {

    try {
        const { user_id, title } = req.body;
        const result = await pool.query(`INSERT INTO todos (user_id, title) VALUES($1, $2) RETURNING *`, [user_id, title]);
        res.status(201).json(
            {
                success: true,
                message: "Todo created successfully",
                data: result.rows
            }
        )

    } catch (error: any) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
})

app.get('/todos', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM todos`);
        res.status(200).json(
            {
                success: true,
                message: 'All data retrive',
                data: result.rows
            }
        )

    } catch (error: any) {
        res.status(500).json(
            {
                success: false,
                message: error.message

            }
        )
    }
})


app.use((req, res) => {
    res.status(404).json(
        {
            success: false,
            message: "Route not found",
            path: req.path,
        }
    )
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)

})
