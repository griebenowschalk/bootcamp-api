import fs from 'node:fs';
import mongoose from 'mongoose';
import 'colors';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: './config/config.env' });

import Bootcamp from './src/models/Bootcamp';

mongoose.connect(process.env.MONGO_URI as string);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`./_data/bootcamps.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log('Data imported successfully'.green.inverse);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log('Data deleted successfully'.red.inverse);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.argv[2] === 'import') {
  importData();
} else if (process.argv[2] === 'delete') {
  deleteData();
}
