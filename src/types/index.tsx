import React from "react";

export interface ButtonTypeProps {
  type?: "button" | "submit";
  loading?: boolean;
  title: string;
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  btnStyles: string;
  textStyle: string;
  icon?: string;
  rightarrow?: boolean;
  iconStyle?: string;
  disabled?: boolean;
}
export interface CardProps {
  id: number;
  img: string;
  topic: string;
  title: string;
  date: string;
  timeread: string;
}

export interface FormFieldTypeProps {
  type:
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time";
  formFieldType: "input" | "textarea";
  value: string;
  name?: string;
  title: string;
  inputstyle: string;
  placeholder: string;
  placeholderstyle: string;
  handleChange: (
    value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export interface UploadSegMentTypes {
  title: string;
  setOpen: () => void;
  data: Record<string, unknown>;
}

export interface UserPayload {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface BlogTypes {
  title: string;
  featured_image: File | null;
  post_content: string;
  tags: Array<string>;
  date_created: string;
  blog_excerpt: string;
}

export interface ContactInquiryType {
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  job_title: string;
  company_name: string;
  hear_about_us: string;
  inquiry: string;
  inquiry_type: string;
}
