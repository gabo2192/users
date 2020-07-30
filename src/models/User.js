const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    requred: true,
  },
  password: String,
  social: {
    facebookProvider: {
      id: String,
      token: String,
    },
    googleProvider: {
      id: String,
      token: String,
    },
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  address: {
    address: String,
    city: String,
    country: String,
    zipCode: String,
  },
  identification: {
    type: String,
    number: Number,
  },
  phone: String,
  linkedin: String,
  company: {
    companyId: String,
    comanyName: String,
    comapanySlogan: String,
    companyEmail: String,
    companyAddress: {
      address: String,
      city: String,
      country: String,
      zipCode: String,
    },
    companyRating: String,
  },
  moneyBalance: {
    moneyType: String,
    moneyAmount: Number,
    moneyAvailable: Number,
    withdraws: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Withdraws',
      },
    ],
  },
  workExperiences: [
    {
      companyName: String,
      position: String,
      details: String,
      city: String,
      country: String,
      startDate: Date,
      endDate: Date,
    },
  ],
  listEducation: [
    {
      institution: String,
      educationType: String,
      educationTitle: String,
      city: String,
      country: String,
      startDate: Date,
      endDate: Date,
    },
  ],
  applications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  projectsWorked: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  projectsOwned: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
  ],
});

UserSchema.methods.generateJWT = function (user) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    'somesupersecretkey',
    { expiresIn: '1h' }
  );
  return token;
};

UserSchema.statics.upsertFbUser = async function ({
  accessToken,
  refreshToken,
  profile,
}) {
  const User = this;

  const user = await User.findOne({ 'social.facebookProvider.id': profile.id });

  // no user was found, lets create a new one
  if (!user) {
    const newUser = await User.create({
      firstName: profile.familyName || profile.displayName,
      lastName: profile.givenName || profile.displayName,
      email: profile.emails[0].value,
      'social.facebookProvider': {
        id: profile.id,
        token: accessToken,
      },
    });

    return newUser;
  }
  return user;
};

UserSchema.statics.upsertGoogleUser = async function ({
  accessToken,
  refreshToken,
  profile,
}) {
  const User = this;

  const user = await User.findOne({ 'social.googleProvider.id': profile.id });

  // no user was found, lets create a new one
  if (!user) {
    const newUser = await User.create({
      firstName: profile.familyName || profile.displayName,
      lastName: profile.givenName || profile.displayName,
      email: profile.emails[0].value,
      'social.googleProvider': {
        id: profile.id,
        token: accessToken,
      },
    });

    return newUser;
  }
  return user;
};

module.exports = mongoose.model('User', UserSchema);
