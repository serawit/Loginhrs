import React, { useState } from "react";

const SubmitReport = () => {
  const [report, setReport] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Report submitted:", report);
    // Add API call to submit the report
  };

  return (
    <div>
      <h1>Submit Report</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Write your report here..."
          rows="10"
          cols="50"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitReport;
