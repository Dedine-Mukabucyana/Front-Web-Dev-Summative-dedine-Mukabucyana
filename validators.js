export const patterns = {
  description: /^\S(?:.*\S)?$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  duplicateWord: /\b(\w+)\s+\1\b/ // advanced backreference
};

export function validate(field, value){
  const re = patterns[field];
  return re ? re.test(value) : true;
}
