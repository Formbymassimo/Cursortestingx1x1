export type ParsedGoogleForm = {
  formId: string | null;
  publishedUrl: string | null;
};

const EDIT_PATTERN = /docs\.google\.com\/forms\/d\/([a-zA-Z0-9_-]+)/i;
const PUBLISHED_PATTERN = /docs\.google\.com\/forms\/d\/e\/([a-zA-Z0-9_-]+)/i;

export function parseGoogleFormUrl(raw: string): ParsedGoogleForm {
  const value = raw.trim();
  if (!value) return { formId: null, publishedUrl: null };

  const published = value.match(PUBLISHED_PATTERN);
  if (published) {
    return {
      formId: null,
      publishedUrl: `https://docs.google.com/forms/d/e/${published[1]}/viewform`,
    };
  }

  const edit = value.match(EDIT_PATTERN);
  if (edit) {
    return { formId: edit[1], publishedUrl: null };
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(value)) {
    return { formId: value, publishedUrl: null };
  }

  return { formId: null, publishedUrl: null };
}

export function googleFormEditUrl(formId: string) {
  return `https://docs.google.com/forms/d/${formId}/edit`;
}
