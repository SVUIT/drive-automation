"use client";

import { useState, useEffect } from "react";
import { File } from "lucide-react";
import BatchTable, {
  BatchItem,
} from "@/components/features/raw-uploads/BatchTable";

export default function RawUploadsPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/appwrite-func", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "fetch unapproved submissions" }),
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data) {
          const apiBatches = result.data.map((item: any) => {
            const files = item.submitted_files || [];

            return {
              form_submissions_id: String(item.form_submissions_id),
              name: `Submission #${item.form_submissions_id}`,
              docsCount: files.length,
              files: files.map((f: any) => ({
                id: f.file_id || f.id || f.$id || f.gdrive_file_id,
                name: f.name,
                url: f.web_view_link,
                icon: File,
              })),
            };
          });

          setBatches(apiBatches);
        } else {
          setBatches([]);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  return (
    <div>
      <h1 className="text-[28px] font-extrabold mt-8 mb-6 text-gray-900 tracking-tight">
        Raw Uploads
      </h1>

      {error && (
        <div className="text-red-500 mb-4 bg-red-50 p-3 rounded text-[14px]">
          Lỗi API: {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-8 text-center text-[14px] animate-pulse">
          Đang tải dữ liệu từ API...
        </div>
      ) : (
        <BatchTable data={batches} />
      )}
    </div>
  );
}
