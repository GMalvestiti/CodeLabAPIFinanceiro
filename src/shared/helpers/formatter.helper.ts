export const idFormat = (value: number): string => {
  return value.toString().padStart(6, '0');
};

export const monetaryFormat = (value: number, decimal: number): string => {
  return Number(value).toFixed(decimal).replace(',', '').replace('.', ',');
};

export const mobilePhoneFormat = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');

  if (numericValue.length === 11) {
    return numericValue.replace(/(\d{2})(\d{9})/, '($1) $2');
  } else if (numericValue.length === 10) {
    return numericValue.replace(/(\d{2})(\d{8})/, '($1) $2');
  } else {
    return value;
  }
};
