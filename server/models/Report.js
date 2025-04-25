// c:\Users\HP ENVY\Loginhrs\server\models\Report.js
// NO CHANGES NEEDED - structureUnit is kept and required
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      required: true,
    },
    reportCode: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    structureUnit: {
      // <<< Correctly kept
      type: String,
      required: true, // <<< Correctly required (backend provides it)
    },
    reportDate: {
      type: Date,
      required: true,
    },
    reportPeriodStart: {
      // <<< Correctly added
      type: Date,
      required: true,
    },
    reportPeriodEnd: {
      // <<< Correctly added
      type: Date,
      required: true,
    },
    reportingFrequency: {
      type: String,
      required: true,
    },
    uploadReport: {
      type: String,
      default: null,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // <<< Correctly references User model
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report; // <<< Correctly uses ES Module export
