/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document } from 'mongoose';
import Bootcamp from './Bootcamp';

export interface ICourse extends Document {
  title: string;
  description: string;
  weeks: string;
  tuition: number;
  minimumSkill: string;
  scholarshipAvailable: boolean;
  createdAt: Date;
  bootcamp: string;
}

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
});

// Static method to get average cost of courses for a bootcamp
CourseSchema.statics.getAverageCost = async function (
  bootcampId: string,
  excludeCourseId?: string
) {
  // https://mongoosejs.com/docs/api/aggregate.html
  const matchStage: any = { bootcamp: bootcampId };

  // Exclude the course being deleted if courseId is provided
  if (excludeCourseId) {
    matchStage._id = { $ne: new mongoose.Types.ObjectId(excludeCourseId) };
  }

  const obj = await this.aggregate([
    { $match: matchStage },
    //https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
    { $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } },
  ]);
  try {
    // If no courses exist, set averageCost to 0
    const averageCost = obj.length > 0 ? Math.round(obj[0].averageCost) : 0;
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageCost,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post('save', async function (this: any) {
  const Course = mongoose.model('Course');
  await (Course as any).getAverageCost(this.bootcamp);
});

// Call getAverageCost before delete
CourseSchema.pre('deleteOne', async function (this: any) {
  // Get the course first to access its bootcamp ID
  const course = await this.model.findById(this.getQuery()._id);
  if (course) {
    const Course = mongoose.model('Course');
    await (Course as any).getAverageCost(course.bootcamp, course._id);
  }
});

export default mongoose.model<ICourse>('Course', CourseSchema);
