/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import Bootcamp from './Bootcamp';

export interface IReview extends mongoose.Document {
  title: string;
  text: string;
  rating: number;
  createdAt: Date;
  bootcamp: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Prevent user from submitting multiple reviews for the same bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average rating and count of reviews for a bootcamp
ReviewSchema.statics.getAverageRating = async function (
  bootcampId: string,
  excludeReviewId?: string
) {
  const matchStage: any = { bootcamp: bootcampId };

  // Exclude the review being deleted if reviewId is provided
  if (excludeReviewId) {
    matchStage._id = { $ne: new mongoose.Types.ObjectId(excludeReviewId) };
  }

  const obj = await this.aggregate([
    { $match: matchStage },
    { $group: { _id: '$bootcamp', averageRating: { $avg: '$rating' } } },
  ]);

  try {
    const averageRating =
      obj.length > 0 ? Math.round(obj[0].averageRating * 10) / 10 : 0;
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function (this: any) {
  const Review = mongoose.model('Review');
  await (Review as any).getAverageRating(this.bootcamp);
});

// Call getAverageRating before delete
ReviewSchema.pre('deleteOne', async function (this: any) {
  const review = await this.model.findById(this.getQuery()._id);
  if (review) {
    const Review = mongoose.model('Review');
    await (Review as any).getAverageRating(review.bootcamp, review._id);
  }
});

export default mongoose.model('Review', ReviewSchema);
