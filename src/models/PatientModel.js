import mongoose from "mongoose";
import EhrModel from "./EhrModel";

//User Schema
var patientSchema = mongoose.Schema({
  name: {
    type: String,
    unique: false,
    required: false,
    trim: false
  },
  isDependent: {
    type: Boolean,
    required: false
  },
  userId: {
    type: Number,
    unique: true,
    required: false
  },
  organizationInfo: {
    name: String,
    id: {
      type: Number,
      unique: false
    },
    schoolNurse: {
      id: {
        type: Number,
        default: 0
      },
      name: {
        type: String,
        default: ""
      }
    }
  },
  ehrInfo: [EhrModel],
  permissions: {
    type: Array,
    default: [
      {
        description: "Approve for strep testing",
        approved: false
      },
      {
        description: "Approve for flu testing",
        approved: false
      }
    ]
  }
});

export default mongoose.model("patient", patientSchema);
