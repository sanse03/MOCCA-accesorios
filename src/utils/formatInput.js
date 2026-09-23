// Da formato de pesos colombianos (punto de miles) a un input de texto
// mientras el usuario escribe, guardando el valor numérico real por dentro.

export function attachCurrencyInput(input, onChange) {
  input.addEventListener('input', () => {
    const num = getCurrencyValue(input);
    const caretAtEnd = input.selectionStart === input.value.length;
    input.value = num ? num.toLocaleString('es-CO') : '';
    if (caretAtEnd) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
    if (onChange) onChange(num);
  });
}

export function getCurrencyValue(input) {
  const raw = input.value.replace(/\D/g, '');
  return raw ? parseInt(raw, 10) : 0;
}

export function setCurrencyValue(input, num) {
  input.value = num ? Number(num).toLocaleString('es-CO') : '';
}
