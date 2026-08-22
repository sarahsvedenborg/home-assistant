import { BOARD_STATUS_VALUES } from "@/lib/board";
import { EVENT_CATEGORY_VALUES } from "@/lib/event-categories";
import { SINGLE_EVENT_CATEGORY_VALUES } from "@/lib/single-event-categories";
import type { BoardIssueStatus } from "@/lib/types";
import { WEEKDAY_VALUES } from "@/lib/weekdays";

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

// Converts a date-picker value (e.g. "2026-08-21") or an ISO string into a full
// ISO datetime for Sanity's datetime field. Returns undefined for empty input
// and null for an unparseable value so callers can distinguish the two.
function toIsoDateTime(value: string): string | undefined | null {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function validateCommonFields(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Prøv å sende skjemaet på nytt." } as const;
  }

  const record = payload as Record<string, unknown>;
  const honeypot = normalizeText(record.website);

  if (honeypot) {
    return { success: false, error: "Dette skjemaet så ikke gyldig ut." } as const;
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
    return { success: false, error: "Velg navnet ditt." };
  }

  if (!title) {
    return { success: false, error: "Legg til et ønske." };
  }

  if (title.length > 100) {
    return { success: false, error: "Ønsket må være under 100 tegn." };
  }

  if (description.length > 280) {
    return { success: false, error: "Kommentaren må være under 280 tegn." };
  }

  if (!isValidOptionalUrl(link)) {
    return { success: false, error: "Lenker må starte med http:// eller https://." };
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
  suitableFor: string[];
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const link = normalizeText(common.record.link);
  const posterUrl = normalizeText(common.record.posterUrl);
  const suggestedByName = normalizeText(common.record.suggestedByName);
  const suitableFor = Array.isArray(common.record.suitableFor)
    ? common.record.suitableFor.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)
    : [];

  if (!suggestedByName) {
    return { success: false, error: "Velg hvem som foreslo filmen." };
  }

  if (!title) {
    return { success: false, error: "Legg til en filmtittel." };
  }

  if (title.length > 120) {
    return { success: false, error: "Filmtittelen må være under 120 tegn." };
  }

  if (!isValidOptionalUrl(link) || !isValidOptionalUrl(posterUrl)) {
    return { success: false, error: "Lenker må starte med http:// eller https://." };
  }

  return {
    success: true,
    data: {
      title,
      link: link || undefined,
      posterUrl: posterUrl || undefined,
      suggestedByName,
      suitableFor,
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
  url?: string;
  ingredients?: string;
  steps?: string;
  comments?: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const url = normalizeText(common.record.url);
  const ingredients = normalizeText(common.record.ingredients);
  const steps = normalizeText(common.record.steps);
  const comments = normalizeText(common.record.comments);

  if (!title) {
    return { success: false, error: "Legg til en tittel paa oppskriften." };
  }

  if (url && !isValidOptionalUrl(url)) {
    return { success: false, error: "URL maa starte med http:// eller https://." };
  }

  const hasIngredients = Boolean(ingredients);
  const hasSteps = Boolean(steps);
  const hasLocalRecipeContent = hasIngredients || hasSteps;

  if (!url && !hasLocalRecipeContent) {
    return { success: false, error: "Legg til en URL eller skriv ingredienser og steg." };
  }

  if (hasIngredients !== hasSteps) {
    return { success: false, error: "Fyll ut baade ingredienser og steg for lokale oppskrifter." };
  }

  return {
    success: true,
    data: {
      title,
      url: url || undefined,
      ingredients: ingredients || undefined,
      steps: steps || undefined,
      comments: comments || undefined,
    },
  };
}

export function validateFeatureSuggestionSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  text?: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const text = normalizeText(common.record.text);

  if (!title) {
    return { success: false, error: "Legg til en tittel på forslaget." };
  }

  if (title.length > 120) {
    return { success: false, error: "Tittelen må være under 120 tegn." };
  }

  if (text.length > 1000) {
    return { success: false, error: "Beskrivelsen må være under 1000 tegn." };
  }

  return {
    success: true,
    data: {
      title,
      text: text || undefined,
    },
  };
}

export function validateShortMessageSubmission(
  payload: unknown,
  familyMemberNames: string[],
): ValidationResult<{
  recipients: string[];
  text: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const text = normalizeText(common.record.text);
  const submittedRecipients = Array.isArray(common.record.recipients)
    ? common.record.recipients
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (!text) {
    return { success: false, error: "Skriv en kort melding." };
  }

  if (text.length > 240) {
    return { success: false, error: "Meldingen må være under 240 tegn." };
  }

  const memberNamesByLowerCase = new Map(
    familyMemberNames.map((name) => [name.toLowerCase(), name]),
  );
  const recipients = submittedRecipients.map((recipient) => {
    const lowerRecipient = recipient.toLowerCase();

    if (lowerRecipient === "all" || lowerRecipient === "parents") {
      return lowerRecipient;
    }

    return memberNamesByLowerCase.get(lowerRecipient);
  });

  if (recipients.some((recipient) => !recipient)) {
    return { success: false, error: "En av mottakerne er ikke gyldig." };
  }

  const uniqueRecipients = [...new Set(recipients as string[])];

  return {
    success: true,
    data: {
      recipients: uniqueRecipients,
      text,
    },
  };
}

export function validateBoardIssueSubmission(
  payload: unknown,
  familyMemberNames: string[],
): ValidationResult<{
  title?: string;
  text?: string;
  assigned?: string;
  status: BoardIssueStatus;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const text = normalizeText(common.record.text);
  const submittedAssigned = normalizeText(common.record.assigned);
  const submittedStatus = normalizeText(common.record.status) || "todo";

  if (title.length > 120) {
    return { success: false, error: "Tittelen må være under 120 tegn." };
  }

  if (text.length > 500) {
    return { success: false, error: "Teksten må være under 500 tegn." };
  }

  if (!BOARD_STATUS_VALUES.includes(submittedStatus as BoardIssueStatus)) {
    return { success: false, error: "Velg en gyldig status." };
  }

  const assigned = submittedAssigned
    ? familyMemberNames.find(
        (name) => name.toLowerCase() === submittedAssigned.toLowerCase(),
      )
    : undefined;

  if (submittedAssigned && !assigned) {
    return { success: false, error: "Velg et gyldig familiemedlem." };
  }

  return {
    success: true,
    data: {
      title: title || undefined,
      text: text || undefined,
      assigned,
      status: submittedStatus as BoardIssueStatus,
    },
  };
}

export function validateBoardIssueStatus(
  payload: unknown,
): ValidationResult<{ status: BoardIssueStatus }> {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Prøv å oppdatere statusen på nytt." };
  }

  const status = normalizeText((payload as Record<string, unknown>).status);

  if (!BOARD_STATUS_VALUES.includes(status as BoardIssueStatus)) {
    return { success: false, error: "Velg en gyldig status." };
  }

  return {
    success: true,
    data: { status: status as BoardIssueStatus },
  };
}

export function validateSingleEventSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  familyMemberName: string;
  category: string;
  date: string;
  allDay: boolean;
  time?: string;
  endTime?: string;
  note?: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const familyMemberName = normalizeText(common.record.familyMemberName);
  const category = normalizeText(common.record.category);
  const dateRaw = normalizeText(common.record.date);
  const allDay = common.record.allDay === true;
  const time = normalizeText(common.record.time);
  const endTime = normalizeText(common.record.endTime);
  const note = normalizeText(common.record.note);

  if (!title) {
    return { success: false, error: "Legg til en tittel på hendelsen." };
  }

  if (title.length > 120) {
    return { success: false, error: "Tittelen må være under 120 tegn." };
  }

  if (!familyMemberName) {
    return { success: false, error: "Velg hvem hendelsen gjelder." };
  }

  if (!SINGLE_EVENT_CATEGORY_VALUES.includes(category as (typeof SINGLE_EVENT_CATEGORY_VALUES)[number])) {
    return { success: false, error: "Velg en kategori for hendelsen." };
  }

  const date = toIsoDateTime(dateRaw);
  if (!dateRaw || !date) {
    return { success: false, error: "Velg en gyldig dato for hendelsen." };
  }

  if (time.length > 40) {
    return { success: false, error: "Tidspunktet må være under 40 tegn." };
  }

  if (endTime.length > 40) {
    return { success: false, error: "Sluttidspunktet må være under 40 tegn." };
  }

  if (note.length > 500) {
    return { success: false, error: "Notatet må være under 500 tegn." };
  }

  return {
    success: true,
    data: {
      title,
      familyMemberName,
      category,
      date,
      allDay,
      time: allDay ? undefined : time || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      note: note || undefined,
    },
  };
}

export function validateRecurringEventSubmission(
  payload: unknown,
): ValidationResult<{
  title: string;
  familyMemberName: string;
  category: string;
  dayOfWeek: string;
  time?: string;
  endTime?: string;
  whatToBring?: string;
  startDate?: string;
  endDate?: string;
}> {
  const common = validateCommonFields(payload);

  if (!common.success) {
    return common;
  }

  const title = normalizeText(common.record.title);
  const familyMemberName = normalizeText(common.record.familyMemberName);
  const category = normalizeText(common.record.category);
  const dayOfWeek = normalizeText(common.record.dayOfWeek);
  const time = normalizeText(common.record.time);
  const endTime = normalizeText(common.record.endTime);
  const whatToBring = normalizeText(common.record.whatToBring);
  const startDateRaw = normalizeText(common.record.startDate);
  const endDateRaw = normalizeText(common.record.endDate);

  if (!title) {
    return { success: false, error: "Legg til en tittel på aktiviteten." };
  }

  if (title.length > 120) {
    return { success: false, error: "Tittelen må være under 120 tegn." };
  }

  if (!familyMemberName) {
    return { success: false, error: "Velg hvem aktiviteten gjelder." };
  }

  if (!EVENT_CATEGORY_VALUES.includes(category as (typeof EVENT_CATEGORY_VALUES)[number])) {
    return { success: false, error: "Velg om aktiviteten er skole eller fritid." };
  }

  if (!WEEKDAY_VALUES.includes(dayOfWeek as (typeof WEEKDAY_VALUES)[number])) {
    return { success: false, error: "Velg hvilken ukedag aktiviteten er på." };
  }

  if (time.length > 40) {
    return { success: false, error: "Tidspunktet må være under 40 tegn." };
  }

  if (endTime.length > 40) {
    return { success: false, error: "Sluttidspunktet må være under 40 tegn." };
  }

  if (whatToBring.length > 500) {
    return { success: false, error: "Listen over hva som skal tas med må være under 500 tegn." };
  }

  const startDate = toIsoDateTime(startDateRaw);
  if (startDateRaw && !startDate) {
    return { success: false, error: "Startdatoen er ugyldig." };
  }

  const endDate = toIsoDateTime(endDateRaw);
  if (endDateRaw && !endDate) {
    return { success: false, error: "Sluttdatoen er ugyldig." };
  }

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return { success: false, error: "Sluttdatoen kan ikke være før startdatoen." };
  }

  return {
    success: true,
    data: {
      title,
      familyMemberName,
      category,
      dayOfWeek,
      time: time || undefined,
      endTime: endTime || undefined,
      whatToBring: whatToBring || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  };
}
