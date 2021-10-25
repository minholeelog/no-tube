import 'dotenv/config';
import './db';
import './models/Video';
import './models/User';
import app from './server';

const PORT = 4999;

const handleListening = () =>
  console.log(`✅ Server listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);
