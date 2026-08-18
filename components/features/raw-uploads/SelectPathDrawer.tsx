import React, { useState } from "react";
import { FileItem } from "./BatchTable";
import { ArrowLeft, X } from "lucide-react";

interface SelectPathDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onMoveCompleted?: (file: FileItem) => void;
}

type Course = {
  id?: string;
  course_name: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Lỗi không xác định";

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (!response.ok || result.error) {
    const detail =
      typeof result.detail === "string"
        ? result.detail
        : result.detail
          ? JSON.stringify(result.detail)
          : result.error;
    throw new Error(detail || `HTTP ${response.status}`);
  }

  return result;
};

export default function SelectPathDrawer({
  isOpen,
  onClose,
  file,
  onMoveCompleted,
}: SelectPathDrawerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [semester, setSemester] = useState("Học kỳ 1");
  const [year, setYear] = useState("2024-2025");
  const [mainContent, setMainContent] = useState("Bài giảng");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const DRIVE_ROOT_FOLDER_ID = "1QCtQ_o2dOxgTUWlZ8Avnrnnr5q4Jcgzc";
  const DRIVE_ROOT_FOLDER_LINK = `https://drive.google.com/drive/folders/${DRIVE_ROOT_FOLDER_ID}`;

  // Fetch courses when drawer opens
  React.useEffect(() => {
    if (isOpen && courses.length === 0) {
      const fetchCourses = async () => {
        setIsLoadingCourses(true);
        try {
          const response = await fetch("/api/appwrite", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "fetch course information",
            }),
          });
          const result = await response.json();
          if (!response.ok || result.error) {
            throw new Error(result.detail || result.error || `HTTP ${response.status}`);
          }
          if (result.data) {
            setCourses(result.data);
            if (result.data.length > 0) {
              setSubject(result.data[0].course_name);
            } else {
              setSubject("");
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

  // Format các giá trị thành đường dẫn chuẩn
  const selectedSubject = (customSubject.trim() || subject).trim();
  const shortSemester =
    semester === "Học kỳ 1" ? "HK1" : semester === "Học kỳ 2" ? "HK2" : "HK Hè";
  const basePath = selectedSubject
    ? `${selectedSubject}/${mainContent}/${shortSemester} ${year}`
    : "";
  const destinationPath = file && selectedSubject ? `${basePath}/${file.name}` : "";

  const handleSubmit = async () => {
    if (!file || !selectedSubject) return;

    if ([selectedSubject, mainContent, shortSemester, year].some((part) => part.includes("/"))) {
      alert("Tên folder không được chứa ký tự /.");
      return;
    }

    try {
      setIsSubmitting(true);
      setDriveLink("");

      const trimmedCustomSubject = customSubject.trim();
      const subjectExists = courses.some(
        (course) => course.course_name.trim().toLowerCase() === selectedSubject.toLowerCase()
      );

      if (trimmedCustomSubject && !subjectExists) {
        await postJson("/api/appwrite", {
          action: "add course",
          course_name: trimmedCustomSubject,
        });

        setCourses((prev) => {
          const exists = prev.some(
            (course) => course.course_name.trim().toLowerCase() === trimmedCustomSubject.toLowerCase()
          );

          if (exists) return prev;
          return [...prev, { course_name: trimmedCustomSubject }];
        });
        setSubject(trimmedCustomSubject);
        setCustomSubject("");
      }

      const canMoveImmediately =
        file.status === "approved" || file.submissionFileCount === 1;

      const result = await postJson("/api/appwrite", {
          action: "insert file path",
          new_path: destinationPath,
          approver: "path-selector",
          is_approved: canMoveImmediately,
          file_id: file.id,
          subject: selectedSubject,
          folder_path: basePath,
          parent_folder_id: DRIVE_ROOT_FOLDER_ID,
          parent_folder_link: DRIVE_ROOT_FOLDER_LINK,
      });

      if (canMoveImmediately) {
        await postJson("/api/appwrite", {
          action: "approve submission",
          submission_id: file.submissionId,
        });

        await postJson("/api/appwrite-move", {});
        onMoveCompleted?.(file);
      }

      const updatedFile = Array.isArray(result.data) ? result.data[0] : undefined;
      const returnedLink =
        updatedFile?.web_view_link ||
        updatedFile?.web_link_view ||
        result.drive_link ||
        result.web_view_link ||
        result.folder_link ||
        result.gdrive_folder_link ||
        result.link ||
        result.path ||
        file.url ||
        `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`;
      setDriveLink(returnedLink);

      console.log("Response từ API khi Submit:", result);
      alert(canMoveImmediately
        ? `Đã đưa tác vụ tạo folder và chuyển file vào hàng đợi. Appwrite đang xử lý nền.\n\n${destinationPath}`
        : `Đã lưu đường dẫn. Submission có nhiều file nên cần chọn path cho tất cả file trước khi duyệt và chuyển.\n\n${destinationPath}`
      );
    } catch (err: unknown) {
      console.error("Lỗi khi submit:", err);
      alert(`Đã xảy ra lỗi: ${getErrorMessage(err)}`);
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
      <div className="fixed inset-0 sm:left-auto sm:right-0 w-full sm:w-[400px] h-full bg-white shadow-2xl z-50 p-6 sm:p-8 flex flex-col overflow-y-auto transform transition-transform duration-300">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 sm:border-none sm:pb-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-gray-100"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold">Quay lại</span>
          </button>
          <span className="text-gray-900 font-bold text-base sm:hidden">Chọn đường dẫn</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="hidden sm:block text-blue-600 text-3xl font-extrabold text-center mb-8 tracking-tight">
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
                  courses.map((course) => (
                    <option key={course.id ?? course.course_name} value={course.course_name}>
                      {course.course_name}
                    </option>
                  ))
                ) : (
                  <option value="">
                    Chưa có môn trong Drive, nhập môn mới bên dưới
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

          <div>
            <label className="block text-gray-600 font-semibold mb-2 text-sm">
              Môn mới (nếu muốn tạo)
            </label>
            <input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Nhập tên môn mới để tạo folder"
              className="w-full bg-[#dbdbdb] rounded-md p-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <p className="mt-2 text-sm text-gray-500">
              Nếu nhập môn mới, đường dẫn sẽ dùng tên này và Drive sẽ tự tạo folder tương ứng.
            </p>
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
              disabled={isSubmitting || !file || !selectedSubject}
              className="w-full bg-[#cccccc] hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-bold py-3 rounded-md transition-colors text-[15px]"
            >
              {isSubmitting ? "Đang xử lý..." : "Submit"}
            </button>
          </div>

          {driveLink && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              <div className="font-semibold mb-1">Mở file trên Google Drive</div>
              <p className="mb-2 text-xs text-green-800">
                Mở link rồi xem mục “Vị trí” trong phần chi tiết của Drive để biết file đang nằm trong folder nào.
              </p>
              <a
                href={driveLink}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-700 underline break-all"
              >
                {driveLink}
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-blue-600 font-bold text-xl tracking-wide">
          SVUIT - MMTT
        </div>
      </div>
    </>
  );
}
