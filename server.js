const express = require('express');
const { ObjectId } = require('mongodb');
const { client, connectDB, closeDB } = require('./src/mongodb');

const app = express();

app.use(express.json());

// Configuramos el puerto
const PORT = process.env.PORT || 3000;

// Middleware para inyectar la base de datos
app.use((req, res, next) => {
    req.db = client.db('MundialDB');
    req.collection = req.db.collection('equipos');
    next();
});

// GET /equipos
app.get('/equipos', async (req, res) => {
    const equipos = await req.collection.find().toArray();
    res.status(200).json(equipos);
});

// GET /equipos/buscar
app.get('/equipos/buscar', async (req, res) => {
    const { tecnico } = req.query;
    const equipos = await req.collection.find({
        tecnico: { $regex: tecnico, $options: 'i' }
    }).toArray();
    res.status(200).json(equipos);
});

// GET /equipos/:id
app.get('/equipos/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    const equipo = await req.collection.findOne({ _id: new ObjectId(id) });

    if (!equipo) {
        return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json(equipo);
});

// Iniciar el servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    });
}

// Exportamos 'app', 'closeDB', 'client' y 'connectDB' para poder hacer testing
module.exports = { app, closeDB, client, connectDB };