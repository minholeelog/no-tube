import express from 'express';

const PORT = 4040;

const app = express();

const handleListening = () =>
  console.log(`✅ Server listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);
