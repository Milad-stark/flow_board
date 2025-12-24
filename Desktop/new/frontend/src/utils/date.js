// Utility functions for displaying dates in Persian (Jalali / Shamsi) calendar.
// Internally we still use JavaScript Date (Gregorian), but ALL user-facing
// formatting goes through the Persian calendar via Intl.

const getLocaleForLanguage = (language) => {
  // Persian calendar, Farsi digits vs Latin digits based on language
  if (language === 'fa') {
    return 'fa-IR-u-ca-persian';
  }
  return 'en-u-ca-persian';
};

export function formatJalaliDate(isoOrDate, language = 'en', withWeekday = false) {
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  const locale = getLocaleForLanguage(language);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  if (withWeekday) {
    options.weekday = 'long';
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatJalaliDateTime(isoOrDate, language = 'en') {
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  const locale = getLocaleForLanguage(language);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat(locale, options).format(date);
}




