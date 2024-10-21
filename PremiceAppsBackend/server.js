const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'votre_clé_secrète_très_sécurisée'; // À remplacer par une vraie clé secrète

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');
const BACKUP_PATH = path.join(__dirname, 'db_backup.json');

// Fonction pour lire le fichier JSON
async function readJSONFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return null;
  }
}

// Fonction pour écrire dans le fichier JSON
async function writeJSONFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans le fichier ${filePath}:`, error);
  }
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  const data = await readJSONFile(DB_PATH);

  if (!data) {
    return res.status(500).json({ message: "Erreur lors de la lecture des données" });
  }

  if (data.users.some(user => user.email === email)) {
    return res.status(400).json({ message: "Cet email est déjà utilisé" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: data.users.length + 1, username, email, password: hashedPassword };

  data.users.push(newUser);
  await writeJSONFile(DB_PATH, data);

  res.status(201).json({ message: "Utilisateur enregistré avec succès" });
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const data = await readJSONFile(DB_PATH);

  if (!data) {
    return res.status(500).json({ message: "Erreur lors de la lecture des données" });
  }

  const user = data.users.find(user => user.email === email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ message: "Email ou mot de passe incorrect" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Route pour obtenir tous les articles (protégée)
app.get('/api/articles', authenticateToken, async (req, res) => {
  const data = await readJSONFile(DB_PATH);
  if (data) {
    res.json(data.articles);
  } else {
    res.status(500).json({ message: "Erreur lors de la lecture des données" });
  }
});

// Autres routes CRUD pour les articles...

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
app.get('/api/clients', authenticateToken, async (req, res) => {
  const data = await readJSONFile(DB_PATH);
  if (data) {
    const userClients = data.clients.filter(client => client.createdBy === req.user.id);
    res.json(userClients);
  } else {
    res.status(500).json({ message: "Erreur lors de la lecture des données" });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  const { name, email, phone, address } = req.body;
  const data = await readJSONFile(DB_PATH);
  if (data) {
    const newClient = {
      id: data.clients.length + 1,
      name,
      email,
      phone,
      address,
      createdBy: req.user.id
    };
    data.clients.push(newClient);
    await writeJSONFile(DB_PATH, data);
    res.status(201).json(newClient);
  } else {
    res.status(500).json({ message: "Erreur lors de la création du client" });
  }
});

app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const data = await readJSONFile(DB_PATH);
  if (data) {
    const client = data.clients.find(c => c.id === parseInt(id) && c.createdBy === req.user.id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: "Client non trouvé ou non autorisé" });
    }
  } else {
    res.status(500).json({ message: "Erreur lors de la lecture des données" });
  }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const data = await readJSONFile(DB_PATH);
  if (data) {
    const clientIndex = data.clients.findIndex(c => c.id === parseInt(id) && c.createdBy === req.user.id);
    if (clientIndex !== -1) {
      data.clients[clientIndex] = { ...data.clients[clientIndex], name, email, phone, address };
      await writeJSONFile(DB_PATH, data);
      res.json(data.clients[clientIndex]);
    } else {
      res.status(404).json({ message: "Client non trouvé ou non autorisé" });
    }
  } else {
    res.status(500).json({ message: "Erreur lors de la mise à jour du client" });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const data = await readJSONFile(DB_PATH);
  if (data) {
    const clientIndex = data.clients.findIndex(c => c.id === parseInt(id) && c.createdBy === req.user.id);
    if (clientIndex !== -1) {
      data.clients.splice(clientIndex, 1);
      await writeJSONFile(DB_PATH, data);
      res.json({ message: "Client supprimé avec succès" });
    } else {
      res.status(404).json({ message: "Client non trouvé ou non autorisé" });
    }
  } else {
    res.status(500).json({ message: "Erreur lors de la suppression du client" });
  }
});

app.get('/api/clients/search', authenticateToken, async (req, res) => {
  const { query } = req.query;
  const data = await readJSONFile(DB_PATH);
  if (data) {
    const userClients = data.clients.filter(client =>
      client.createdBy === req.user.id &&
      (client.name.toLowerCase().includes(query.toLowerCase()) ||
       client.email.toLowerCase().includes(query.toLowerCase()))
    );
    res.json(userClients);
  } else {
    res.status(500).json({ message: "Erreur lors de la recherche des clients" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${3000}`);
});

