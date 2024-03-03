export const getItem = (name) => {
  const data = window.localStorage.getItem(name);
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
};

export const setItem = (name, value) => {
  let data = value;
  if (typeof value === 'object') {
    data = JSON.stringify(value);
  }
  window.localStorage.setItem(name, data);
};

export const removeItem = (name) => {
  window.localStorage.removeItem(name);
};
