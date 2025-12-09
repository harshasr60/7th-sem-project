"use client";
import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function AiAtsChecker() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [summary, setSummary] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please upload a PDF first!");

    setLoading(true);
    setScore(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setScore(data.score);
        setSummary(data.summary);
      } else {
        alert(data.error || "Error calculating ATS score");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while calculating ATS score.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
      <h1 className="text-2xl font-semibold mb-4">AI ATS Resume Checker</h1>

      <div className="bg-muted/50 p-6 rounded-xl shadow-md space-y-4">
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/80 transition">
          <div className="flex flex-col items-center justify-center p-6">
            <Upload className="h-6 w-6 mb-2 text-gray-500" />
            <p className="text-gray-600">
              {file ? file.name : "Click to upload your resume (PDF only)"}
            </p>
          </div>
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
        </label>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full"
        >
          {loading ? "Analyzing..." : "Check ATS Score"}
        </Button>

        {score !== null && (
          <div className="mt-6 space-y-2">
            <h2 className="text-lg font-medium">Your ATS Score: {score}%</h2>
            <Progress value={score} className="w-full h-3" />
            <p className="text-sm text-gray-400 mt-2">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
