// Small, escaped HTML templates. These produce strings on the server;
// there is no virtual DOM, JSX, hydration, or browser framework.
const template = Symbol('html');
const trusted = Symbol('trusted');
const deferred = Symbol('partial');

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function html(strings, ...values) { return { [template]: true, strings, values }; }
export function partial(callback) { return { [deferred]: callback }; }
const raw = value => ({ [trusted]: value });
const names = { className: 'class', htmlFor: 'for', tabIndex: 'tabindex',
  strokeWidth: 'stroke-width', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin',
  fillRule: 'fill-rule', clipRule: 'clip-rule', defaultValue: 'value' };
const booleanAttributes = new Set(['disabled', 'required', 'checked', 'selected', 'multiple', 'autofocus', 'novalidate', 'readonly', 'hidden', 'open']);

export function attrs(properties) {
  const values = { ...properties };
  if (values.fill === true) {
    values.className = `${values.className || ''} image-fill`;
    // A separate data attribute avoids replacing a static class attribute.
    delete values.className;
    values['data-fill'] = 'true';
    delete values.fill;
  }
  let result = '';
  for (let [name, value] of Object.entries(values)) {
    if (value === null || value === undefined || name === 'key' || name === 'ref' || /^on/i.test(name)) continue;
    name = names[name] || name.toLowerCase();
    if (!/^[a-z][a-z0-9:_-]*$/.test(name)) throw new Error('Invalid HTML attribute');
    if (typeof value === 'function') {
      if (name !== 'action' || value.name !== 'signOut') throw new Error('Invalid form action');
      value = '/actions/signOut';
    }
    if (booleanAttributes.has(name)) { if (value) result += ` ${name}`; continue; }
    if (name === 'href' || name === 'src' || name === 'action') {
      if (/^\s*(?:javascript|data|vbscript):/i.test(String(value))) value = '#';
    }
    result += ` ${name}="${escapeHtml(value)}"`;
  }
  return raw(result);
}

export async function render(value) {
  value = await value;
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (Array.isArray(value)) {
    let result = '';
    for (const child of value) result += await render(child);
    return result;
  }
  if (value[deferred]) return render(value[deferred]());
  if (value[trusted] !== undefined) return value[trusted];
  if (value[template]) {
    let result = value.strings[0];
    for (let index = 0; index < value.values.length; index++) {
      result += await render(value.values[index]) + value.strings[index + 1];
    }
    return result;
  }
  return escapeHtml(value);
}
