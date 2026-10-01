const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    trim: true,
    maxlength: [30, 'First name cannot be more than 30 characters'],
    match: [/^[A-Za-z]+$/, 'First name can only contain letters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    trim: true,
    maxlength: [30, 'Last name cannot be more than 30 characters'],
    match: [/^[A-Za-z]+$/, 'Last name can only contain letters']
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'visitor'],
    default: 'visitor'
  },
  birthDate: {
    type: Date,
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(value) {
        // Calculate age based on birth date
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        return age >= 18 && age <= 60;
      },
      message: 'Students must be between 18 and 60 years old'
    }
  },
  level: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    enum: {
      values: ['lmd1', 'lmd2', 'lmd3', 'ing1', 'ing2'],
      message: 'Level must be one of: lmd1, lmd2, lmd3, ing1, ing2'
    }
  },
  academicYear: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    default: function() {
      // Default to current academic year (e.g., 2024-2025)
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
  },
  fieldOfStudy: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    enum: {
      values: ['Computer Science'],
      message: 'Only Computer Science students are allowed'
    }
  },

  academicRank: {
    type: String,
    required: function() {
      return this.role === 'teacher';
    },
    enum: {
      values: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'],
      message: 'Please select a valid academic rank'
    }
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'visitor' || this.role === 'admin';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  securityQuestions: {
    question1: {
      type: String,
      default: null
    },
    answer1: {
      type: String,
      default: null
    },
    question2: {
      type: String,
      default: null
    },
    answer2: {
      type: String,
      default: null
    }
  }
});

// Generate username for approved students
UserSchema.pre('save', async function(next) {
  // If this is a student being approved for the first time
  if (this.role === 'student' && this.isModified('isApproved') && this.isApproved && !this.username) {
    // Generate username based on first name, last name and a random number
    const firstNamePart = this.firstName.toLowerCase().substring(0, 3);
    const lastNamePart = this.lastName.toLowerCase().substring(0, 3);
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    this.username = `${firstNamePart}${lastNamePart}${randomNum}`;
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Skip middleware if flagged
  if (this.$skipMiddleware) {
    return next();
  }

  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    // Basic validation
    if (!enteredPassword || !this.password) {
      return false;
    }

    // Use bcrypt to compare the passwords
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
