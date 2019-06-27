export function getFromStorage(key) {
  return sessionStorage.getItem(key);
}

export function checkStorage(key) {
  return sessionStorage.getItem(key) !== null ? true : false;
}

export function setInStorage(key, value) {
  sessionStorage.setItem(key, value);
}