type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  error: string;
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidOptionalUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateCommonFields(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Please try sending the form again." } as const;
  }

  const record = payload as Record<string, unknown>;
  const honeypot = normalizeText(record.website);

  if (honeypot) {
    return { success: false, error: "That submission did not look valid." } as const;
  }

  return {
    success: true,
    record,
  } as const;
}

export function validateWishListSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  description?: string;
  link?: string;
  submittedByName: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const submittedByName = normalizeText(common.record.submittedByName);
  const title = normalizeText(common.record.title);
  const description = normalizeText(common.record.description);
  const link = normalizeText(common.record.link);

  if (!submittedByName) {
    return { success: false, error: "Please choose your name." };
  }

  if (!title) {
    return { success: false, error: "Please add an item name." };
  }

  if (title.length > 100) {
    return { success: false, error: "Item names should stay under 100 characters." };
  }

  if (description.length > 280) {
    return { success: false, error: "Notes should stay under 280 characters." };
  }

  if (!isValidOptionalUrl(link)) {
    return { success: false, error: "Links must start with http:// or https://." };
  }

  return {
    success: true,
    data: {
      submittedByName,
      title,
      description: description || undefined,
      link: link || undefined,
    },
  };
}

export function validateMovieSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  link?: string;
  posterUrl?: string;
  suggestedByName: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const link = normalizeText(common.record.link);
  const posterUrl = normalizeText(common.record.posterUrl);
  const suggestedByName = normalizeText(common.record.suggestedByName);

  if (!suggestedByName) {
    return { success: false, error: "Please choose who suggested the movie." };
  }

  if (!title) {
    return { success: false, error: "Please add a movie title." };
  }

  if (title.length > 120) {
    return { success: false, error: "Movie titles should stay under 120 characters." };
  }

  if (!isValidOptionalUrl(link) || !isValidOptionalUrl(posterUrl)) {
    return { success: false, error: "Links and image URLs must start with http:// or https://." };
  }

  return {
    success: true,
    data: {
      title,
      link: link || undefined,
      posterUrl: posterUrl || undefined,
      suggestedByName,
    },
  };
}

export function validateShoppingListSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  quantity?: string;
  note?: string;
  addedBy?: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const quantity = normalizeText(common.record.quantity);
  const note = normalizeText(common.record.note);
  const addedBy = normalizeText(common.record.addedBy);

  if (!title) {
    return { success: false, error: "Legg til en vare du vil kjope." };
  }

  if (title.length > 100) {
    return { success: false, error: "Varenavnet maa vaere under 100 tegn." };
  }

  if (quantity.length > 60) {
    return { success: false, error: "Mengden maa vaere under 60 tegn." };
  }

  if (note.length > 200) {
    return { success: false, error: "Notatet maa vaere under 200 tegn." };
  }

  return {
    success: true,
    data: {
      title,
      quantity: quantity || undefined,
      note: note || undefined,
      addedBy: addedBy || undefined,
    },
  };
}

export function validateRecipeSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  url: string;
  content: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const url = normalizeText(common.record.url);
  const content = normalizeText(common.record.content);

  if (!title) {
    return { success: false, error: "Legg til en tittel paa oppskriften." };
  }

  if (!url || !isValidOptionalUrl(url)) {
    return { success: false, error: "Legg til en gyldig URL som starter med http:// eller https://." };
  }

  if (!content) {
    return { success: false, error: "Legg til innhold for oppskriften." };
  }

  return {
    success: true,
    data: {
      title,
      url,
      content,
    },
  };
}
