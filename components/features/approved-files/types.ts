export type ApiSubmittedFile = {
  gdrive_file_id?: string;
  file_id?: string;
  id?: string;
  $id?: string;
  name?: string;
  web_view_link?: string;
  web_link_view?: string;
  new_file_path?: string | null;
  destination_folder_link?: string | null;
  is_approved?: boolean | number | string;
  return_reason?: string;
};

export type ApprovedFile = ApiSubmittedFile & {
  gdrive_file_id: string;
  name: string;
};

export type GroupedSubmission = {
  submissionId: number;
  submissionName: string;
  files: ApprovedFile[];
};
