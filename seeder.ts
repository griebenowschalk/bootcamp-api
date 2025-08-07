import fs from 'node:fs';
import mongoose from 'mongoose';
import 'colors';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: './config/config.env' });

import Bootcamp from './src/models/Bootcamp';
import Course from './src/models/Course';
import User from './src/models/User';

mongoose.connect(process.env.MONGO_URI as string);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`./_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(fs.readFileSync(`./_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`./_data/users.json`, 'utf-8'));
// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
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
    await Course.deleteMany();
    await User.deleteMany();
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
