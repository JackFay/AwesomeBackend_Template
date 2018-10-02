import mongoose from "mongoose";

//User Schema
export default mongoose.Schema({
  dob: {
    type: String,
    required: false
  },
  height: {
    type: String,
    required: false
  },
  weight: {
    type: Number,
    required: false
  },
  medicalConditions: [{ name: String }]
});

// export default mongoose.model('ehr', ehrSchema);
