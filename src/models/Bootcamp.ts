import geocoder from '@/utils/geocoder';
import mongoose, { Document } from 'mongoose';
import slugify from 'slugify';
import Course from './Course';

export interface IBootcamp extends Document {
  name: string;
  slug: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  careers: string[];
  averageRating: number;
  averageCost: number;
  photo: string;
  createdAt: Date;
  housing: boolean;
  jobAssistance: boolean;
}

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      select: false, // Don't include in queries by default
    },
    location: {
      // GeoJSON Point https://mongoosejs.com/docs/geojson.html
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: [true, 'Please add at least one career'],
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must be at most 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name i.e. turn South Africa into south-africa
// https://mongoosejs.com/docs/api/schema.html#Schema.prototype.pre()
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode and create location field
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder().geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0]?.longitude ?? 0, loc[0]?.latitude ?? 0],
    formattedAddress: loc[0]?.formattedAddress ?? '',
    street: loc[0]?.streetName ?? '',
    city: loc[0]?.city ?? '',
    state: loc[0]?.stateCode ?? '',
    zipcode: loc[0]?.zipcode ?? '',
    country: loc[0]?.country ?? '',
  };

  // Do not save address in DB
  this.address = undefined as unknown as string;
  next();
});

// Cascade delete courses when a bootcamp is deleted
// eslint-disable-next-line @typescript-eslint/no-explicit-any
BootcampSchema.pre('findOneAndDelete', async function (this: any, next) {
  await Course.deleteMany({ bootcamp: this.getQuery()._id });
  next();
});

// https://mongoosejs.com/docs/api/virtualtype.html
// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

export default mongoose.model<IBootcamp>('Bootcamp', BootcampSchema);
