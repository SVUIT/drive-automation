import React, { useState } from "react";
import { FileItem } from "./BatchTable";

interface SelectPathDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export default function SelectPathDrawer({
  isOpen,
  onClose,
  file,
}: SelectPathDrawerProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("Học kỳ 1");
  const [year, setYear] = useState("2024-2025");
  const [mainContent, setMainContent] = useState("Bài giảng");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  React.useEffect(() => {
    if (isOpen && courses.length === 0) {
      const fetchCourses = async () => {
        setIsLoadingCourses(true);
        try {
          const response = await fetch("/api/appwrite-func", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "fetch course information",
            }),
          });
          const result = await response.json();
          if (result.data) {
            setCourses(result.data);
            if (result.data.length > 0) {
              setSubject(result.data[0].course_name);
            }
          }
        } catch (err) {
          console.error("Lỗi khi tải danh sách môn học:", err);
        } finally {
          setIsLoadingCourses(false);
        }
      };
      fetchCourses();
    }
  }, [isOpen, courses.length]);

  if (!isOpen) return null;

  const shortSemester =
    semester === "Học kỳ 1" ? "HK1" : semester === "Học kỳ 2" ? "HK2" : "HK Hè";
  const basePath = `${subject}/${mainContent}/${shortSemester} ${year}`;
  const destinationPath = file ? `${basePath}/${file.name}` : "";

  const handleSubmit = async () => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/appwrite-func", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "insert file path",
          new_path: destinationPath,
          approver: "none",
          is_approved: false,
          file_id: file.id,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      console.log("Response từ API khi Submit:", result);
      alert(`Đã cập nhật đường dẫn thành công!\n\n${destinationPath}`);
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi submit:", err);
      alert(`Đã xảy ra lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-100 bg-white shadow-2xl z-50 p-8 flex flex-col overflow-y-auto transform transition-transform duration-300">
        <h2 className="text-blue-600 text-3xl font-extrabold text-center mb-8 tracking-tight">
          Select path
        </h2>

        <div className="space-y-5 flex-1">
          <div>
            <label className="block text-gray-600 font-semibold mb-2 text-sm">
              Subject
            </label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#dbdbdb] border-none rounded-md p-3 pr-10 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
              >
                {isLoadingCourses ? (
                  <option value="">Đang tải...</option>
                ) : courses.length > 0 ? (
                  courses.map((course: any) => (
                    <option key={course.id} value={course.course_name}>
                      {course.course_name}
                    </option>
                  ))
                ) : (
                  <option value="IT001 - Nhập môn lập trình">
                    IT001 - Nhập môn lập trình
                  </option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-600 font-semibold mb-2 text-sm">
                Semester
              </label>
              <div className="relative">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-[#dbdbdb] border-none rounded-md p-3 pr-10 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Học kỳ Hè">Học kỳ Hè</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-gray-600 font-semibold mb-2 text-sm">
                Year
              </label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#dbdbdb] border-none rounded-md p-3 pr-10 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2 text-sm">
              Main content
            </label>
            <div className="relative">
              <select
                value={mainContent}
                onChange={(e) => setMainContent(e.target.value)}
                className="w-full bg-[#dbdbdb] border-none rounded-md p-3 pr-10 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
              >
                <option value="Thực hành">Thực hành</option>
                <option value="Bài giảng">Bài giảng</option>
                <option value="Đề thi">Đề thi</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="py-4">
            <hr className="border-gray-400 w-3/4 mx-auto" />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2 text-sm">
              Destination path
            </label>
            <div className="w-full bg-[#efefef] rounded-md p-4 text-gray-500 text-[13px] min-h-25 leading-relaxed wrap-break-word whitespace-pre-wrap">
              {destinationPath || "Chưa chọn file"}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !file}
              className="w-full bg-[#cccccc] hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-bold py-3 rounded-md transition-colors text-[15px]"
            >
              {isSubmitting ? "Đang xử lý..." : "Submit"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-blue-600 font-bold text-xl tracking-wide">
          SVUIT - MMTT
        </div>
      </div>
    </>
  );
}
